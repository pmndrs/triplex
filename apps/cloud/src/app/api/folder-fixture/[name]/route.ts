/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// Test-only endpoint used by scripts/verify-folder-spike.ts. Walks one of the
// repo's examples/{name} folders server-side and returns a payload shaped like
// what walkFolder() would produce in the browser. Lets headless Playwright
// drive the folder-spike pipeline without showDirectoryPicker (which requires
// a real user gesture).
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { type NextRequest } from "next/server";

const REPO_ROOT = resolve(process.cwd(), "../..");
const SKIP_DIRS = new Set([
  ".cache",
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  ".yarn",
  "dist",
  "node_modules",
  "out",
]);
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".frag",
  ".glsl",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".tsx",
  ".ts",
  ".txt",
  ".vert",
  ".vue",
]);
const BINARY_EXTENSIONS = new Set([".glb", ".png", ".jpg", ".jpeg", ".webp"]);

type FileEntry =
  | { contents: string; path: string }
  | { contentsBase64: string; path: string };

interface TreeFile {
  file: { contents: string | { base64: string } };
}
interface TreeDir {
  directory: Record<string, TreeFile | TreeDir>;
}

async function walk(
  abs: string,
  rel: string,
  files: FileEntry[],
  parent: Record<string, TreeFile | TreeDir>,
): Promise<void> {
  const entries = await readdir(abs, { withFileTypes: true });
  for (const entry of entries) {
    // Allow .triplex/ (project config + provider); skip every other hidden.
    if (entry.name.startsWith(".") && entry.name !== ".triplex") continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const childAbs = join(abs, entry.name);
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const sub: Record<string, TreeFile | TreeDir> = {};
      parent[entry.name] = { directory: sub };
      await walk(childAbs, childRel, files, sub);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (TEXT_EXTENSIONS.has(ext)) {
        const contents = await readFile(childAbs, "utf-8");
        parent[entry.name] = { file: { contents } };
        files.push({ contents, path: childRel });
      } else if (BINARY_EXTENSIONS.has(ext)) {
        const buf = await readFile(childAbs);
        const base64 = buf.toString("base64");
        parent[entry.name] = { file: { contents: { base64 } } };
        files.push({ contentsBase64: base64, path: childRel });
      }
    }
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return Response.json({ error: "bad name" }, { status: 400 });
  }
  const target = resolve(REPO_ROOT, "examples", name);
  if (!target.startsWith(resolve(REPO_ROOT, "examples"))) {
    return Response.json({ error: "out of bounds" }, { status: 400 });
  }
  try {
    await stat(target);
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const files: FileEntry[] = [];
  const tree: Record<string, TreeFile | TreeDir> = {};
  await walk(target, "", files, tree);
  return Response.json({ files, name, tree });
}
