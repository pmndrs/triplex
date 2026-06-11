/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir, stat } from "node:fs/promises";
import { watch, type FSWatcher } from "node:fs";
import { join, relative, sep as pathSep } from "node:path";
import { type NextRequest } from "next/server";
import {
  buildPkgFileSet,
  compileSingleSrcFile,
  PACKAGES_ROOT,
  toDistPath,
} from "../../../lib/pkg-jit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_EXT = /\.(tsx?|css|json|glsl|frag|vert|wgsl)$/i;

/**
 * Server-Sent Events stream that watches every `packages/*\/src/` directory.
 * On change/add/delete it pushes a JIT-compiled dist update so the cloud page
 * can write it straight into the WebContainer's mounted `node_modules`.
 *
 * Event shapes:
 *   event: hello   data: {time}
 *   event: update  data: {pkg, distPath, contents}
 *   event: delete  data: {pkg, distPath}
 *   event: error   data: {message}
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const watchers: FSWatcher[] = [];
  const fileSets = new Map<string, Set<string>>();
  let heartbeat: NodeJS.Timeout | undefined;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          // Client disconnected mid-write; teardown will run via the abort
          // handler. Swallow so we don't crash the watcher.
        }
      };

      const teardown = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        for (const w of watchers) {
          try {
            w.close();
          } catch {
            /* ignore */
          }
        }
        try {
          controller.close();
        } catch {
          /* ignore */
        }
      };

      request.signal.addEventListener("abort", teardown);

      send("hello", { time: Date.now() });

      // node:fs.watch debounces poorly under rapid editor saves, so coalesce
      // per-file changes for 50ms before recompiling.
      const pending = new Map<string, NodeJS.Timeout>();
      const schedule = (key: string, run: () => Promise<void>) => {
        const existing = pending.get(key);
        if (existing) clearTimeout(existing);
        pending.set(
          key,
          setTimeout(() => {
            pending.delete(key);
            run().catch((err) =>
              send("error", { message: (err as Error).message }),
            );
          }, 50),
        );
      };

      try {
        const pkgs = await readdir(PACKAGES_ROOT, { withFileTypes: true });
        for (const pkg of pkgs) {
          // packages/@triplex is a nested namespace dir — recurse one level.
          if (pkg.isDirectory() && pkg.name.startsWith("@")) {
            const nested = await readdir(join(PACKAGES_ROOT, pkg.name), {
              withFileTypes: true,
            });
            for (const inner of nested) {
              if (!inner.isDirectory()) continue;
              const pkgKey = `${pkg.name}/${inner.name}`;
              await registerPkg(pkgKey, join(PACKAGES_ROOT, pkg.name, inner.name));
            }
            continue;
          }
          if (!pkg.isDirectory()) continue;
          await registerPkg(pkg.name, join(PACKAGES_ROOT, pkg.name));
        }
      } catch (err) {
        send("error", { message: (err as Error).message });
      }

      async function registerPkg(pkgKey: string, pkgRoot: string) {
        const srcDir = join(pkgRoot, "src");
        try {
          const s = await stat(srcDir);
          if (!s.isDirectory()) return;
        } catch {
          return;
        }
        try {
          fileSets.set(pkgKey, await buildPkgFileSet(srcDir));
        } catch (err) {
          send("error", {
            message: `buildPkgFileSet ${pkgKey}: ${(err as Error).message}`,
          });
          return;
        }
        const watcher = watch(
          srcDir,
          { recursive: true },
          (eventType, filename) => {
            if (!filename) return;
            const norm = filename.split(pathSep).join("/");
            if (!ALLOWED_EXT.test(norm)) return;
            if (/(^|\/)__tests?__\//.test(norm)) return;
            if (/\.test\.(tsx?)$/.test(norm)) return;

            schedule(`${pkgKey}:${norm}`, async () => {
              const abs = join(srcDir, filename);
              let exists = true;
              let isFile = false;
              try {
                const st = await stat(abs);
                isFile = st.isFile();
              } catch {
                exists = false;
              }

              // Refresh the file set so directory-vs-file rewrites stay
              // correct after creates/deletes.
              try {
                fileSets.set(pkgKey, await buildPkgFileSet(srcDir));
              } catch {
                /* ignore — keep stale set */
              }

              if (!exists || !isFile) {
                const distPath = toDistPath(norm);
                if (distPath) {
                  send("delete", {
                    distPath: distPath.replace(/\\/g, "/"),
                    pkg: pkgKey,
                  });
                }
                return;
              }

              const fileSet =
                fileSets.get(pkgKey) ?? new Set<string>();
              try {
                const result = await compileSingleSrcFile(
                  srcDir,
                  abs,
                  fileSet,
                );
                if (!result) return;
                send("update", {
                  contents: result.contents,
                  distPath: result.distPath.replace(/\\/g, "/"),
                  pkg: pkgKey,
                });
              } catch (err) {
                send("error", {
                  message: `compile ${pkgKey}/${norm}: ${(err as Error).message}`,
                });
              }
            });
          },
        );
        watcher.on("error", (err) => {
          send("error", {
            message: `watch ${pkgKey}: ${err.message}`,
          });
        });
        watchers.push(watcher);
      }

      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* ignore */
        }
      }, 25_000);
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      for (const w of watchers) {
        try {
          w.close();
        } catch {
          /* ignore */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      // SSE behind Next's edge/dev pipeline needs this to avoid buffering.
      "X-Accel-Buffering": "no",
    },
  });
}

// Silence unused-import warning when relative() ends up unused.
void relative;
