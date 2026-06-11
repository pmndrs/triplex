/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { FileSystemTree } from "@webcontainer/api";

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

// Hard cap so a runaway pick (e.g. a home directory) doesn't try to mirror
// 100k files before the user notices.
const MAX_FILES = 4000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".frag",
  ".glb",
  ".gltf",
  ".glsl",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".png",
  ".svg",
  ".tsx",
  ".ts",
  ".txt",
  ".vert",
  ".vue",
]);

const BINARY_EXTENSIONS = new Set([".glb", ".png", ".jpg", ".jpeg", ".webp"]);

function getExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

export interface WalkedFile {
  contents: string | Uint8Array;
  path: string;
}

export interface WalkResult {
  files: WalkedFile[];
  skipped: string[];
  tree: FileSystemTree;
  truncated: boolean;
}

export async function walkFolder(
  root: FileSystemDirectoryHandle,
  onProgress?: (count: number) => void,
): Promise<WalkResult> {
  const files: WalkedFile[] = [];
  const skipped: string[] = [];
  const tree: FileSystemTree = {};
  let truncated = false;

  async function recur(
    dir: FileSystemDirectoryHandle,
    relPath: string,
    parent: FileSystemTree,
  ): Promise<void> {
    // Async iterator on FileSystemDirectoryHandle.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const entry of (dir as any).values() as AsyncIterable<
      FileSystemHandle
    >) {
      if (files.length >= MAX_FILES) {
        truncated = true;
        return;
      }
      const name = entry.name;
      const childRel = relPath ? `${relPath}/${name}` : name;
      if (entry.kind === "directory") {
        // Skip dot-prefixed dirs EXCEPT .triplex (the project config dir).
        // Without this carve-out the user's provider + config never make
        // it into the WebContainer and the runtime falls back to defaults.
        const isHidden = name.startsWith(".") && name !== ".triplex";
        if (SKIP_DIRS.has(name) || isHidden) {
          skipped.push(childRel);
          continue;
        }
        const sub: FileSystemTree = {};
        parent[name] = { directory: sub };
        await recur(entry as FileSystemDirectoryHandle, childRel, sub);
      } else if (entry.kind === "file") {
        const ext = getExtension(name);
        if (!TEXT_EXTENSIONS.has(ext) && !BINARY_EXTENSIONS.has(ext)) {
          skipped.push(childRel);
          continue;
        }
        try {
          const file = await (entry as FileSystemFileHandle).getFile();
          if (file.size > MAX_FILE_BYTES) {
            skipped.push(`${childRel} (>5MB)`);
            continue;
          }
          if (BINARY_EXTENSIONS.has(ext)) {
            const buf = new Uint8Array(await file.arrayBuffer());
            parent[name] = { file: { contents: buf } };
            files.push({ contents: buf, path: childRel });
          } else {
            const text = await file.text();
            parent[name] = { file: { contents: text } };
            files.push({ contents: text, path: childRel });
          }
          if (onProgress && files.length % 25 === 0) onProgress(files.length);
        } catch (err) {
          skipped.push(`${childRel} (${(err as Error).message})`);
        }
      }
    }
  }

  await recur(root, "", tree);
  if (onProgress) onProgress(files.length);
  return { files, skipped, tree, truncated };
}
