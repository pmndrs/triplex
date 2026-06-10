/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type NextRequest } from "next/server";

type FileNode = { file: { contents: string | { base64: string } } };
type DirectoryNode = { directory: FileSystemTree };
type FileSystemTree = Record<string, FileNode | DirectoryNode>;

const EXAMPLES_ROOT = resolve(process.cwd(), "../../examples");
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
]);
const IGNORED = new Set(["node_modules", ".git", "dist", "out", ".next"]);

async function walk(dir: string): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED.has(entry.name)) continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      tree[entry.name] = { directory: await walk(abs) };
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf("."));
      const buf = await readFile(abs);
      if (TEXT_EXTENSIONS.has(ext)) {
        tree[entry.name] = { file: { contents: buf.toString("utf8") } };
      } else {
        tree[entry.name] = {
          file: { contents: { base64: buf.toString("base64") } },
        };
      }
    }
  }
  return tree;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return Response.json({ error: "bad name" }, { status: 400 });
  }
  const target = join(EXAMPLES_ROOT, name);
  const resolved = resolve(target);
  if (!resolved.startsWith(EXAMPLES_ROOT)) {
    return Response.json({ error: "out of bounds" }, { status: 400 });
  }
  try {
    await stat(resolved);
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const tree = await walk(resolved);
  return Response.json({ tree });
}
