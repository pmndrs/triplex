/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type NextRequest } from "next/server";

const REPO_ROOT = resolve(process.cwd(), "../..");

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path || path.includes("..") || path.startsWith("/")) {
    return new Response("bad path", { status: 400 });
  }
  const abs = join(REPO_ROOT, path);
  try {
    await stat(abs);
  } catch {
    return new Response("not found", { status: 404 });
  }
  const contents = await readFile(abs, "utf-8");
  return new Response(contents, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
