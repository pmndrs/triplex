/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import http from "node:http";
import { createRequire } from "node:module";

// Patch http.createServer so any call without a request listener gets a
// default "426 Upgrade Required" responder. The websocks-server attaches WS
// upgrade handling but doesn't handle plain HTTP requests; without this
// patch, WebContainer's port proxy sends an HTTP probe, gets nothing back,
// and returns malformed data to the browser ("Failed to parse http
// message"). The 426 makes the proxy happy and lets the upgrade handshake
// complete.
const origCreateServer = http.createServer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
http.createServer = function patchedCreateServer(this: unknown, ...args: any[]) {
  const hasListener = args.some((a) => typeof a === "function");
  if (!hasListener) {
    args.push((_req: http.IncomingMessage, res: http.ServerResponse) => {
      res.writeHead(426, { "Content-Type": "text/plain" });
      res.end("Upgrade required");
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return origCreateServer.apply(this, args as any);
} as typeof http.createServer;

import { createServer as createClientServer } from "@triplex/client";
import {
  createServer,
  getConfig,
  getRendererMeta,
} from "@triplex/server";

const require = createRequire(import.meta.url);

async function main() {
  const cwd = process.env.TRIPLEX_CWD ?? process.cwd();
  const ports = {
    client: parseInt(process.env.TRIPLEX_CLIENT_PORT ?? "5870", 10),
    server: parseInt(process.env.TRIPLEX_SERVER_PORT ?? "5871", 10),
    ws: parseInt(process.env.TRIPLEX_WS_PORT ?? "5872", 10),
  };

  console.log(
    `[triplex] booting cwd=${cwd} process.cwd=${process.cwd()} ports=${JSON.stringify(ports)}`,
  );

  let config: ReturnType<typeof getConfig>;
  try {
    config = getConfig(cwd);
  } catch (err) {
    console.error(`[triplex] getConfig failed:`, err);
    throw err;
  }
  console.log(`[triplex] config loaded renderer=${config.renderer}`);

  let renderer: Awaited<ReturnType<typeof getRendererMeta>>;
  try {
    renderer = await getRendererMeta({
      cwd,
      filepath: config.renderer,
      getTriplexClientPkgPath: () => {
        try {
          return require.resolve("@triplex/client");
        } catch {
          return cwd;
        }
      },
    });
  } catch (err) {
    console.error(`[triplex] getRendererMeta failed:`, err);
    throw err;
  }
  console.log(`[triplex] renderer meta resolved`);

  const args = {
    config,
    cwd,
    fgEnvironmentOverride: "local" as const,
    isTelemetryEnabled: false,
    ports,
    renderer,
    userId: "cloud-spike-user",
  };

  const server = await createServer(args);
  await server.listen(ports);
  console.log(`[triplex] server up on :${ports.server} ws :${ports.ws}`);

  const client = await createClientServer({
    ...args,
    onSyncEvent: () => {},
  });
  await client.listen(ports);
  console.log(`[triplex] client up on :${ports.client}`);

  console.log("[triplex] ready");
}

main().catch((err) => {
  console.error("[triplex] failed:", err);
  process.exit(1);
});
