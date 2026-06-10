/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, sep as pathSep } from "node:path";
import { type NextRequest } from "next/server";

type FileNode = { file: { contents: string | { base64: string } } };
type DirectoryNode = { directory: FileSystemTree };
type FileSystemTree = Record<string, FileNode | DirectoryNode>;

const PACKAGES_ROOT = resolve(process.cwd(), "../../packages");
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

async function walk(dir: string): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED.has(entry.name)) continue;
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
 * Build a synthetic package.json that maps every `./dist/*.js` to a subpath
 * export so Node ESM can resolve it. Original publishConfig is unreliable
 * (mixes src/dist), so we generate from what's actually on disk.
 */
function buildPackageJson(
  pkgJsonRaw: string,
  distFiles: string[],
): string {
  const original = JSON.parse(pkgJsonRaw);
  const exports: Record<string, string> = {};
  for (const file of distFiles) {
    if (!file.endsWith(".js")) continue;
    const base = file.slice(0, -3);
    const sub = base === "index" ? "." : `./${base}`;
    exports[sub] = `./dist/${file}`;
  }
  const out = {
    name: original.name,
    version: original.version,
    type: "module",
    main: "./dist/index.js",
    exports,
    dependencies: original.dependencies ?? {},
    peerDependencies: original.peerDependencies ?? {},
  };
  return JSON.stringify(out, null, 2);
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return Response.json({ error: "bad name" }, { status: 400 });
  }
  const target = join(PACKAGES_ROOT, name);
  const resolved = resolve(target);
  if (!resolved.startsWith(PACKAGES_ROOT)) {
    return Response.json({ error: "out of bounds" }, { status: 400 });
  }
  try {
    await stat(resolved);
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const tree = await walk(resolved);

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
