/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@triplex/lib"],
  // esbuild ships platform-specific binary packages whose folders contain a
  // README.md that Turbopack tries to parse as a module. Keep it out of the
  // bundle and let Node resolve it at runtime.
  serverExternalPackages: ["esbuild"],
  // The /api/triplex-bundle + /api/pkg/[...name] routes read prebuilt files
  // from `packages/<n>/{dist,themes,package.json}` at runtime via fs.readdir.
  // Next's auto-tracing can't see those reads, so we point it at the
  // monorepo root and include the workspace pkgs explicitly. Without this,
  // Vercel ships an empty `packages/` tree and the prod-bundle endpoint
  // returns the unrewritten src-pointing package.json.
  outputFileTracingRoot: join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/api/triplex-bundle": [
      "../../packages/renderer/dist/**",
      "../../packages/renderer/themes/**",
      "../../packages/renderer/package.json",
      "../../packages/bridge/dist/**",
      "../../packages/bridge/package.json",
      "../../packages/lib/dist/**",
      "../../packages/lib/themes/**",
      "../../packages/lib/package.json",
    ],
    "/api/pkg/[...name]": [
      "../../packages/renderer/**",
      "../../packages/bridge/**",
      "../../packages/lib/**",
      "../../packages/@triplex/**",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // The Web Worker (`wss-worker.ts`) pulls in @triplex/lib/path which
  // imports node:path. path-browserify also works in the server runtime,
  // so a single global alias is fine. node:fs / node:os only get used by
  // server code paths — leaving them on the real module so API routes
  // (e.g. /api/pkg-watch's fs.watch) keep their behaviour.
  turbopack: {
    resolveAlias: {
      "node:path": "path-browserify",
    },
  },
  // The Web Worker (`wss-worker.ts`) pulls in @triplex/server + @triplex/lib
  // which use `node:path`, `node:fs`, and `node:os`. Webpack's prod build
  // doesn't know how to resolve `node:` URIs in browser bundles. Provide
  // browser-safe shims so the prod build succeeds; the worker only ever
  // calls `path`'s pure-string helpers — `fs` and `os` are imported but the
  // calls are guarded out of the browser code paths.
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // Webpack 5 rejects `node:*` URIs before they reach `resolve.alias`,
      // so we have to intercept them via NormalModuleReplacementPlugin and
      // rewrite the request to either a browser shim or an empty module.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:path$/,
          (resource: { request: string }) => {
            resource.request = "path-browserify";
          },
        ),
        new webpack.NormalModuleReplacementPlugin(
          /^node:(fs|os)$/,
          (resource: { request: string }) => {
            resource.request = require.resolve("./src/lib/empty-node-module");
          },
        ),
      );
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
