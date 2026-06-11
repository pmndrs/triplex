/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type NextRequest } from "next/server";
import { getProdBundle } from "../../../lib/triplex-bundle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Single shot for every prebuilt @triplex/* workspace package the cloud page
 * needs in prod mode. Replaces the per-pkg JIT fetches at boot and bypasses
 * the SSE pkg-watch pipeline (which only exists for fast dev iteration).
 *
 * Memoised in-process against the union mtime of source files; honours
 * `If-None-Match` so repeat boots from the same WC re-use the snapshot.
 */
export async function GET(request: NextRequest) {
  const bundle = await getProdBundle();
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === `"${bundle.etag}"`) {
    return new Response(null, { status: 304 });
  }
  return new Response(bundle.json, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "application/json",
      ETag: `"${bundle.etag}"`,
    },
  });
}
