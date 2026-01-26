/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type Server } from "node:http";
import { createServer as createWebServer } from "@httptoolkit/httpolyglot";
import { loadingLogo } from "@triplex/lib/loader";
import { createForkLogger } from "@triplex/lib/log";
import { rootHTML } from "@triplex/lib/templates";
import { type FGEnvironment } from "@triplex/lib/types";
import type {
  ReconciledTriplexConfig,
  RendererManifest,
  TriplexPorts,
} from "@triplex/server";
import react from "@vitejs/plugin-react";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import resolvePackagePath from "resolve-package-path";
import { version } from "../package.json";
import triplexBabelPlugin from "./plugins/babel-plugin";
import { transformNodeModulesJSXPlugin } from "./plugins/node-modules-plugin";
import { remoteModulePlugin } from "./plugins/remote-module-plugin";
import { scenePlugin } from "./plugins/scene-plugin";
import { syncPlugin, type OnSyncEvent } from "./plugins/sync-plugin";
import { scripts } from "./templates";
import { type InitializationConfig } from "./types";
import { getCertificate } from "./util/cert-https";
import { depsToSkipOptimizing, optionalDeps } from "./util/modules";

const log = createForkLogger("client");

export async function createServer({
  config,
  fgEnvironmentOverride,
  onSyncEvent,
  ports,
  renderer,
  userId,
}: {
  config: ReconciledTriplexConfig;
  fgEnvironmentOverride: FGEnvironment;
  onSyncEvent?: OnSyncEvent;
  ports: TriplexPorts;
  renderer: {
    manifest: RendererManifest;
    path: string;
    root: string;
  };
  userId: string;
}) {
  const sslCert = await getCertificate("node_modules/.triplex/basic-ssl");
  const app = express();
  const webServer = createWebServer({ cert: sslCert, key: sslCert }, app);
  const {
    createServer: createViteServer,
    loadConfigFromFile,
    mergeConfig,
  } = await import("vite");
  const { default: glsl } = await import("vite-plugin-glsl");
  const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

  const initializationConfig: InitializationConfig = {
    config,
    fgEnvironmentOverride,
    fileGlobs: config.files.map((f) => `'${f.replace(config.cwd, "")}'`),
    pkgName: "triplex:renderer",
    ports,
    preload: {
      reactThreeFiber: !!resolvePackagePath("@react-three/fiber", config.cwd),
    },
    userId,
  };

  if (config.UNSAFE_viteConfig) {
    log.debug(`Loading custom vite config from "${config.UNSAFE_viteConfig}"`);
  }

  const unsafeUserViteConfig = config.UNSAFE_viteConfig
    ? await loadConfigFromFile(
        { command: "serve", mode: "development" },
        config.UNSAFE_viteConfig,
      ).then((result) => result?.config || {})
    : {};

  /**
   * We need to make sure Vite runs in development mode, even after being built
   * for production. This overrides NODE_ENV if it was set to production
   * earlier.
   */
  if (process.env.NODE_ENV === "production") {
    process.env.NODE_ENV = "development";
  }

  const vite = await createViteServer(
    mergeConfig(unsafeUserViteConfig, {
      appType: "custom",
      assetsInclude: renderer.manifest.bundler?.assetsInclude,
      cacheDir: `node_modules/.triplex-${version}`,
      configFile: false,
      define: config.define,
      logLevel: "error",
      /**
       * We need to make sure Vite runs in development mode to ensure HMR and
       * related capabilities are turned on.
       */
      mode: "development",
      optimizeDeps: {
        esbuildOptions: { plugins: [transformNodeModulesJSXPlugin()] },
        /**
         * If an optional dependency is not found in the project we need to stub
         * it out in the dependency graph AND exclude it from pre-bundling so
         * Vite doesn't throw an exception during pre-bundling.
         *
         * {@link ./scene-plugin.ts}
         */
        exclude: depsToSkipOptimizing(initializationConfig),
      },
      plugins: [
        syncPlugin({ onSyncEvent, ports }),
        remoteModulePlugin({ cwd: config.cwd, files: config.files, ports }),
        // ---------------------------------------------------------------
        // TODO: Vite plugins should be loaded from a renderer's manifest
        // instead of hardcoded. We'll cross this bridge to resolve later.
        react({
          babel: {
            plugins: [
              triplexBabelPlugin({
                cwd: config.cwd,
                exclude: [config.provider, renderer.root, "triplex:"],
              }),
            ],
          },
        }),
        glsl(),
        // ---------------------------------------------------------------
        scenePlugin(initializationConfig),
        tsconfigPaths({ root: config.cwd }),
      ],
      publicDir: config.publicDir,
      resolve: {
        alias: {
          "@triplex/bridge/client": require.resolve("@triplex/bridge/client"),
          "triplex:canvas": renderer.path,
          "triplex:renderer": renderer.path,
        },
        /**
         * These dependencies need to be deduped so they get picked up from
         * userland node_modules rather than @triplex package node_modules as
         * they won't be found when built for production.
         */
        dedupe: (renderer.manifest.bundler?.dedupe || []).concat(
          optionalDeps.map((dep) => dep.name),
        ),
      },
      root: config.cwd,
      server: {
        hmr: {
          overlay: false,
          path: "/__hmr_client__",
          server: webServer as unknown as Server,
        },
        middlewareMode: true,
      },
    }),
  );

  app.use((_, res, next) => {
    res.set({
      // These headers are needed to enable shared array buffers.
      // See: https://web.dev/articles/cross-origin-isolation-guide
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    next();
  });

  app.use(vite.middlewares);

  app.get("/scene", async (req, res, next) => {
    try {
      const template = rootHTML({
        loadingIndicator: loadingLogo({
          color: "white",
          position: "hint",
          variant: "stroke",
        }),
        script: scripts.init(initializationConfig),
        title: "Triplex Scene",
      });
      const html = await vite.transformIndexHtml(req.url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.get("/webxr", async (req, res, next) => {
    try {
      const template = rootHTML({
        css: `
          body {
            background-color: var(--x-bg-surface);
            color: var(--x-text);
          }
        `,
        loadingIndicator: loadingLogo({
          color: "currentColor",
          position: "splash",
          variant: "idle",
        }),
        script: scripts.initWebXR(initializationConfig),
        themes: ["base"],
        title: "Triplex WebXR",
      });
      const html = await vite.transformIndexHtml(req.url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.get("/screenshot", async (req, res, next) => {
    try {
      const { exportName, path } = req.query;
      if (typeof exportName !== "string" || typeof path !== "string") {
        res.status(404).end();
        return;
      }

      const template = rootHTML({
        script: scripts.thumbnail(initializationConfig, { exportName, path }),
        title: "Triplex Thumbnail",
      });

      const html = await vite.transformIndexHtml(req.url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
    const html = rootHTML({
      css: `
        body {
          background-color: var(--x-bg-surface);
          color: var(--x-text);
          padding: 1rem;
          font-family: -apple-system, "system-ui", sans-serif;
          height: auto;
        }

        * { 
          box-sizing: border-box;
        }
      `,
      loadingIndicator: `
        <h1 style="font-size:1rem;font-weight:600;">Could Not Load Component</h1>
        <div style="font-size:13px;margin-top:0.67rem;">An error occurred before your component could be loaded, there may be an issue with your config files.</div>
        <div style="font-size:13px;margin-top:0.67rem;">Make sure they're in the correct format and try again.</div>
        <code style="display:block;margin-top:1.25rem;margin-bottom:1.25rem;max-width:100%;">
          <pre style="background-color:var(--x-bg-neutral);padding:0.5rem;overflow:auto;">${err.message}</pre>
        </code>
        ${err.message.includes("postcss") ? '<div style="font-size:13px;">See <a target="_blank" href="https://github.com/postcss/postcss-load-config" style="color:var(--x-text-link)">postcss-load-config</a> for examples of correct configuration.</div>' : ""}
      `,
      themes: ["base"],
      title: "Could Not Load Component",
    });

    res.status(500).set({ "Content-Type": "text/html" }).end(html);
  });

  return {
    listen: async (ports: TriplexPorts) => {
      const server = await webServer.listen(ports.client, "0.0.0.0");

      async function close() {
        try {
          await Promise.all([server.close(), vite.close()]);
        } finally {
          process.exit(0);
        }
      }

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
  };
}
