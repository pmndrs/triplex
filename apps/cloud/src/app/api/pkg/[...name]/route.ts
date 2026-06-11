/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, sep as pathSep } from "node:path";
import { type NextRequest } from "next/server";
import {
  buildPackageJson,
  compilePkgSrc,
  PACKAGES_ROOT,
  type FileSystemTree,
} from "../../../../lib/pkg-jit";

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
const IGNORED = new Set([
  "__examples__",
  "__tests__",
  ".git",
  "node_modules",
  "src",
]);

// Files that are only useful for local development tooling and would only
// cause noise (or warnings) for Vite if shipped into the WebContainer.
const SKIP_FILES = new Set([
  ".swcrc",
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "tsconfig.json",
  "tsconfig.tsbuildinfo",
]);

async function walk(dir: string): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED.has(entry.name)) continue;
    if (entry.isFile() && SKIP_FILES.has(entry.name)) continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      tree[entry.name] = { directory: await walk(abs) };
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      const ext = TEXT_EXTENSIONS.has(lower.slice(lower.indexOf(".")))
        ? lower.slice(lower.indexOf("."))
        : lower.slice(lower.lastIndexOf("."));
      const buf = await readFile(abs);
      // Themes ship as .ts source files but are pure-data
      // (`export default "<css>"`). Rename to .js so Node ESM can resolve them.
      const isThemeTs =
        entry.name.endsWith(".ts") && dir.endsWith(`${pathSep}themes`);
      const outName = isThemeTs ? entry.name.replace(/\.ts$/, ".js") : entry.name;
      if (TEXT_EXTENSIONS.has(ext) || isThemeTs) {
        tree[outName] = { file: { contents: buf.toString("utf8") } };
      } else {
        tree[outName] = {
          file: { contents: { base64: buf.toString("base64") } },
        };
      }
    }
  }
  return tree;
}

/**
 * SWC's output uses extensionless relative imports (`./foo`, `../themes/base`).
 * Node ESM requires explicit `.js`. Rewrite source on the fly.
 */
function addExtensions(source: string): string {
  return source.replace(
    /(from\s*|import\s+|import\s*\()["'](\.\.?\/[^"']*?)["']/g,
    (match, prefix, path) => {
      if (/\.(js|mjs|cjs|json|css)$/.test(path)) return match;
      return `${prefix}"${path}.js"`;
    },
  );
}

const SEGMENT = /^(@[a-z0-9._-]+|[a-z0-9._-]+)$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string[] }> },
) {
  const { name } = await params;
  if (!Array.isArray(name) || name.length < 1 || name.length > 2) {
    return Response.json({ error: "bad name" }, { status: 400 });
  }
  for (const seg of name) {
    if (!SEGMENT.test(seg)) {
      return Response.json({ error: "bad name" }, { status: 400 });
    }
  }
  // The page may send either layout:
  //   /api/pkg/bridge           → packages/bridge/         (top-level)
  //   /api/pkg/@triplex/client  → packages/@triplex/client (namespaced)
  // Some workspace packages (renderer, bridge, lib) sit at the top level
  // even though their npm name is `@triplex/<n>`. Probe both locations so
  // callers can be agnostic about source layout.
  const candidates: string[] = [];
  candidates.push(join(PACKAGES_ROOT, name.join("/")));
  if (name[0] === "@triplex" && name.length === 2) {
    candidates.push(join(PACKAGES_ROOT, name[1]));
  }
  let resolved: string | null = null;
  for (const candidate of candidates) {
    const r = resolve(candidate);
    if (!r.startsWith(PACKAGES_ROOT)) continue;
    try {
      await stat(r);
      resolved = r;
      break;
    } catch {
      /* try next candidate */
    }
  }
  if (!resolved) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const tree = await walk(resolved);

  // Dev JIT: if packages/<name>/src/ exists, compile every .ts/.tsx in
  // place and overwrite the tree's dist/ subtree with the compiled
  // outputs. This makes the workspace package mountable in the WC without
  // anyone having to run `pnpm --filter <name> build` first.
  const srcDir = join(resolved, "src");
  let hasSrc = false;
  try {
    const s = await stat(srcDir);
    hasSrc = s.isDirectory();
  } catch {
    hasSrc = false;
  }
  if (hasSrc) {
    tree.dist = { directory: await compilePkgSrc(srcDir) };
  }

  const distNode = tree.dist;
  let distFiles: string[] = [];
  if (distNode && "directory" in distNode) {
    distFiles = Object.entries(distNode.directory)
      .filter(([, n]) => "file" in n)
      .map(([fname]) => fname);
    for (const [fname, n] of Object.entries(distNode.directory)) {
      if ("file" in n && typeof n.file.contents === "string" && fname.endsWith(".js")) {
        n.file.contents = addExtensions(n.file.contents);
      }
    }
  }

  const pkgNode = tree["package.json"];
  if (pkgNode && "file" in pkgNode && typeof pkgNode.file.contents === "string") {
    pkgNode.file.contents = buildPackageJson(pkgNode.file.contents, distFiles);
  }
  return Response.json({ tree });
}
