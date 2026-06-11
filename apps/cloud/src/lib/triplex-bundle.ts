/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, sep as pathSep } from "node:path";
import {
  addExtensions,
  buildPackageJson,
  PACKAGES_ROOT,
  type FileSystemTree,
} from "./pkg-jit";

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".d.ts",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".map",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
]);
const IGNORED_DIRS = new Set([
  "__examples__",
  "__tests__",
  ".git",
  "node_modules",
  "src",
]);
const SKIP_FILES = new Set([
  ".swcrc",
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "tsconfig.json",
  "tsconfig.tsbuildinfo",
]);

interface PrebuiltPkg {
  /** npm name (`@triplex/renderer`). */
  name: string;
  /** Directory under `packages/` relative to PACKAGES_ROOT. */
  sourceDir: string;
}

/**
 * Workspace packages bundled into the prod payload. These are the @triplex/*
 * deps the runtime-bundle and the scene iframe import at runtime — we ship
 * their pre-built dists verbatim so the WebContainer can mount them in a
 * single shot instead of JIT-compiling per request.
 */
export const PROD_BUNDLE_PACKAGES: PrebuiltPkg[] = [
  { name: "@triplex/renderer", sourceDir: "renderer" },
  { name: "@triplex/bridge", sourceDir: "bridge" },
  { name: "@triplex/lib", sourceDir: "lib" },
];

async function walkPrebuilt(dir: string): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    if (entry.isFile() && SKIP_FILES.has(entry.name)) continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      tree[entry.name] = { directory: await walkPrebuilt(abs) };
      continue;
    }
    if (!entry.isFile()) continue;
    const lower = entry.name.toLowerCase();
    const ext = TEXT_EXTENSIONS.has(lower.slice(lower.indexOf(".")))
      ? lower.slice(lower.indexOf("."))
      : lower.slice(lower.lastIndexOf("."));
    const buf = await readFile(abs);
    const isThemeTs =
      entry.name.endsWith(".ts") && dir.endsWith(`${pathSep}themes`);
    const outName = isThemeTs
      ? entry.name.replace(/\.ts$/, ".js")
      : entry.name;
    if (TEXT_EXTENSIONS.has(ext) || isThemeTs) {
      tree[outName] = { file: { contents: buf.toString("utf8") } };
    } else {
      tree[outName] = {
        file: { contents: { base64: buf.toString("base64") } },
      };
    }
  }
  return tree;
}

interface CachedBundle {
  /** Stable across requests until any source mtime changes. */
  etag: string;
  json: string;
  /** Approximate byte size for callers that want to log it. */
  bytes: number;
}

let cached: { etag: string; bundle: CachedBundle } | null = null;

async function computeMtimeFingerprint(): Promise<string> {
  const h = createHash("sha256");
  for (const pkg of PROD_BUNDLE_PACKAGES) {
    const pkgRoot = resolve(PACKAGES_ROOT, pkg.sourceDir);
    async function visit(dir: string): Promise<void> {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        if (entry.isFile() && SKIP_FILES.has(entry.name)) continue;
        const abs = join(dir, entry.name);
        if (entry.isDirectory()) {
          await visit(abs);
          continue;
        }
        if (!entry.isFile()) continue;
        const s = await stat(abs);
        h.update(`${abs}|${s.size}|${s.mtimeMs}\n`);
      }
    }
    await visit(pkgRoot);
  }
  return h.digest("hex").slice(0, 32);
}

/**
 * Build (or retrieve cached) the prod bundle: a single JSON payload that
 * mirrors what the cloud page would otherwise fetch via several /api/pkg/<n>
 * requests. Includes pre-built dists only — no JIT, no src/ scanning.
 *
 * The response is memoised against the union mtime of every source file
 * involved; the cache flips immediately when a workspace pkg gets rebuilt.
 */
export async function getProdBundle(): Promise<CachedBundle> {
  const etag = await computeMtimeFingerprint();
  if (cached && cached.etag === etag) return cached.bundle;

  const packages: Record<
    string,
    { name: string; mountSegment: string; tree: FileSystemTree }
  > = {};
  for (const pkg of PROD_BUNDLE_PACKAGES) {
    const root = resolve(PACKAGES_ROOT, pkg.sourceDir);
    try {
      await stat(root);
    } catch {
      continue;
    }
    const tree = await walkPrebuilt(root);

    // The on-disk package.json points at `./src/*.ts(x)` for in-repo dev
    // convenience. The WC only has the prebuilt `dist/` files mounted, so
    // rewrite the exports map to surface `./dist/*.{js,mjs}` instead.
    // Reuse the same rebuilder the JIT route uses.
    const distNode = tree.dist;
    const distFiles: string[] = [];
    if (distNode && "directory" in distNode) {
      for (const [fname, node] of Object.entries(distNode.directory)) {
        if ("file" in node) distFiles.push(fname);
      }
    }
    const pkgNode = tree["package.json"];
    if (
      pkgNode &&
      "file" in pkgNode &&
      typeof pkgNode.file.contents === "string" &&
      distFiles.length > 0
    ) {
      pkgNode.file.contents = buildPackageJson(
        pkgNode.file.contents,
        distFiles,
      );
    }

    // swc emits extensionless relative imports (`./string`, `../foo`); Node
    // ESM resolves only when the .js extension is explicit. The JIT route
    // patches its compiled output the same way for the same reason.
    if (distNode && "directory" in distNode) {
      for (const [fname, node] of Object.entries(distNode.directory)) {
        if (
          "file" in node &&
          typeof node.file.contents === "string" &&
          fname.endsWith(".js")
        ) {
          node.file.contents = addExtensions(node.file.contents);
        }
      }
    }

    const mountSegment = pkg.name.replace(/^@triplex\//, "");
    packages[pkg.name] = { mountSegment, name: pkg.name, tree };
  }

  const json = JSON.stringify({ etag, packages });
  const bundle: CachedBundle = { bytes: Buffer.byteLength(json), etag, json };
  cached = { bundle, etag };
  return bundle;
}
