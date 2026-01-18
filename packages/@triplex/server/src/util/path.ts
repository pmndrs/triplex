/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";
import anymatch from "anymatch";

export function fromCwd(path: string): string {
  return join(process.cwd(), path);
}

export function matchFile(file: string, fileGlobs: string[]): boolean {
  const normalizedFiles = fileGlobs.map((file) => file);

  for (let i = 0; i < normalizedFiles.length; i++) {
    const glob = normalizedFiles[i];
    const match = anymatch(glob);

    if (match(file)) {
      return true;
    }
  }

  return false;
}

/**
 * Resolves a remote vscode URL to a local file path if it starts with
 * 'vscode-remote://'.
 *
 * @param path The file path or URL.
 * @returns The resolved local file path or the original path if not remote.
 */
export function resolveRemoteURL(path: string) {
  if (path.startsWith("vscode-remote://")) {
    // we hav a remote file drop!
    path = path.replace(/vscode-remote:\/\/[^/]*/, "file://");
    return path;
  }
  return path;
}

/**
 * Ensures that a given path is treated as a local path by adding a './' prefix
 * if it doesn't already start with './', '../', or '/'.
 *
 * @param path The file path.
 * @returns The modified file path with a './' prefix if necessary.
 */
export function prefixLocalPath(path: string) {
  if (
    !path.startsWith("./") &&
    !path.startsWith("../") &&
    !path.startsWith("/")
  ) {
    return `./${path}`;
  }
  return path;
}

/**
 * Removes the file extension from a given path.
 *
 * @param path The file path.
 * @returns The file path without its extension.
 */
export function omitFileExtension(path: string) {
  const lastDotIndex = path.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return path;
  } // No extension found
  return path.slice(0, Math.max(0, lastDotIndex));
}
