/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type InitializationConfig } from "./types";

const suffix = "ta.hot";
const import_meta_hot = "imp" + "ort.me" + suffix;
/**
 * We set aside a static amount of virtual modules to be used when creating new
 * files. If someone tries to create over this limit they won't see anything in
 * their scene until they save. We're choosing 10 as the arbitrary number for
 * now.
 */
const placeholderFileCount = 10;

export const scripts = {
  bootstrap: (template: InitializationConfig) => `
    import { send } from "@triplex/bridge/client";

    export async function bootstrap() {
      try {
        const providers = await import("triplex:global-provider.jsx");
        const { bootstrap: resolveRender } = await import("${template.pkgName}");
        const render = resolveRender(document.getElementById("root"));

        return async ({ config, files }) => {
          await render({
            config,
            fgEnvironmentOverride: ${template.fgEnvironmentOverride ? `"${template.fgEnvironmentOverride}"` : "undefined"},
            files,
            providers,
            userId: "${template.userId}",
          });
        };
      } catch (e) {
        // Notify the parent editor that we failed to bootstrap the renderer.
        send("error", {
          col: e.loc?.column,
          id: "renderer_bootstrap_failure",
          line: e.loc?.line,
          message: e.message,
          source: e.id,
          stack: e.stack,
          subtitle: "An error prevented Triplex for starting, check the editor for how to proceed.",
          title: "Triplex Could Not Start",
          type: "unrecoverable",
        });

        // Re-throw the error so any other code stops executing.
        throw e;
      }
    }

    export async function bootstrapWebXR() {
      const providers = await import("triplex:global-provider.jsx");
      const { bootstrapWebXR: resolveRender } = await import("${template.pkgName}");
      const render = resolveRender(document.getElementById("root"));

      return async ({ config, files }) => {
        await render({
          config,
          fgEnvironmentOverride: ${template.fgEnvironmentOverride ? `"${template.fgEnvironmentOverride}"` : "undefined"},
          files,
          providers,
          userId: "${template.userId}",
        });
      };
    }
  `,
  defaultProvider: `
    export function CanvasProvider({ children }) {
      return children;
    }

    export function GlobalProvider({ children }) {
      return children;
    }
  `,
  // Hides vite-ignored dynamic import so that Vite can skip analysis if no other
  // dynamic import is present (https://github.com/vitejs/vite/pull/12732)
  dynamicImportHMR: `export const __hmr_import = (url) => import(/* @vite-ignore */ url);`,
  init: (template: InitializationConfig) => `
    import { forwardKeyboardEvents, listenForStateChanges, on, send } from "@triplex/bridge/client";
    import { bootstrap } from "triplex:bootstrap.tsx";

    export const files = {
      ${Array.from({ length: placeholderFileCount }).map((_, i) => {
        const n = i || "";
        return `'/src/untitled${n}.tsx':() => import('triplex:/src/untitled${n}.tsx')`;
      })},
      ...import.meta.glob([${template.fileGlobs}]),
    };

    export const config = ${JSON.stringify(template.config)};

    async function initialize() {
      window.triplex = JSON.parse(\`${JSON.stringify({
        config: template.config,
        env: { mode: "default", state: "edit" },
        preload: template.preload,
      })}\`);

      const lastMessageTime = {};

      window.triplex.debug = (channel, data) => {
        if (!channel) {
          // Ignore invalid messages.
          return;
        }

        if (lastMessageTime[channel] && Date.now() - lastMessageTime[channel] < 1000) {
          // Only send messages that are 1 second apart preventing the editor from updating too quickly.
          return;
        } else {
          // Send the message!
          lastMessageTime[channel] = Date.now();

          // Remove non-serializable data from the object via JSON calls.
          try {
            const serializedData = JSON.parse(JSON.stringify(data));
            send("api-debug", { channel, data: serializedData });
          } catch (e) {
            console.warn(\`Triplex: Failed to send debug data to channel "\${channel}". Unserializable values are ignored.\`);
          }
        }

      };

      // Forward keydown events to the parent window to prevent the client iframe
      // from swallowing events and the parent document being none-the-wiser.
      forwardKeyboardEvents();

      // This updates the state property in the triplex object when requested.
      listenForStateChanges();

      // Listen to any requests from the parent editor to refresh the scene frame.
      on("request-refresh-scene", (opts) => {
        if (opts?.hard) {
          window.location.reload();
        }
      });

      // This is patched into the react-refresh runtime so we can be notified
      // on completion of a fast refresh. We need this as relying on the HMR
      // events alone come with incorrect timing as they're not guaranteed to
      // be fired after the refresh is complete.
      window.notifyRefreshComplete = () => {
        send("self:request-reset-error-boundary", undefined);
      };

      // Notify the parent editor of any unhandled errors.
      window.addEventListener("error", (e) => {
        if (
          ((error) =>
          error.stack && error.stack.indexOf("invokeGuardedCallbackDev") >= 0)(
          new Error()
        )) {
          // Ignore errors that will be processed a React error boundary.
          // See: https://github.com/facebook/react/issues/10474
          return true;
        }

        send("error", {
          col: e.colno,
          line: e.lineno,
          message: e.error.message,
          source: e.filename,
          stack: e.error.stack,
          subtitle: "An error was thrown which may affect how your scene behaves. Resolve the error and try again.",
          title: "Unhandled Error",
        });
      });

      // Grab hold of the resolved render function and keep it available across HMR updates.
      // We do this so we don't throw away the state of the renderer.
      // One caveat is the bootstrap function can't be HMRd during development.
      return bootstrap();
    }

    if (${import_meta_hot}) {
      // Notify error boundaries after a HMR event has completed. This has to be
      // orchestrated after React Fast Refresh otherwise we can rapidly trigger error
      // boundaries which is janky and unexpected by users.
      // NOTE: This is kept at the top module scope so it's reset every time a HMR event is fired.
      ${import_meta_hot}.on("vite:afterUpdate", (e) => {
        // We defer this to have a higher chance that a fast refresh has completed.
        // See: https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/src/refreshUtils.js#L17
        setTimeout(() => {
          send("self:request-reset-error-boundary", undefined);
        }, 96);

        const paths = e.updates.map((update) => update.path);
        paths.forEach((path) => {
          send("self:request-reset-file", { path });
        });
      });

      // Notify the parent editor of any module errors sourced from Vite.
      // NOTE: This is kept at the top module scope so it's reset every time a HMR event is fired.
      ${import_meta_hot}.on("vite:error", (e) => {
        send("error", {
          col: e.err.loc?.column,
          line: e.err.loc?.line,
          message: e.err.message,
          source: e.err.id,
          stack: e.err.stack,
          subtitle: "The scene could not be rendered as there was an error parsing its module. Resolve the error and try again.",
          title: "Module Error",
        });
      });

      if (!${import_meta_hot}.data.initialized) {
        // We only want to do a side-effect initialization once. Afterwards we rely
        // on accepting the new module through HMR to then re-bootstrap the renderer.
        ${import_meta_hot}.data.initialized = true;
        initialize().then((render) => {
          ${import_meta_hot}.data.render = render;
          ${import_meta_hot}.data.render({ config, files });
        });
      }

      ${import_meta_hot}.accept((mod) => {
        if (mod) {
          ${import_meta_hot}.data.render({ config: mod.config, files: mod.files });
        }
      });
    } else {
      initialize().then((render) => {
        render({ config, files });
      });
    }
  `,
  initWebXR: (template: InitializationConfig) => `
    import { send } from "@triplex/bridge/client";
    import { bootstrapWebXR } from "triplex:bootstrap.tsx";

    export const files = import.meta.glob([${template.fileGlobs}]);
    export const config = ${JSON.stringify(template.config)};

    async function initialize() {
      window.triplex = JSON.parse(\`${JSON.stringify({
        config: template.config,
        env: { mode: "webxr", state: "edit" },
        preload: template.preload,
      })}\`);
      window.triplex.debug = () => {};

      // This is patched into the react-refresh runtime so we can be notified
      // on completion of a fast refresh. We need this as relying on the HMR
      // events alone come with incorrect timing as they're not guaranteed to
      // be fired after the refresh is complete.
      window.notifyRefreshComplete = () => {
        send("self:request-reset-error-boundary", undefined);
      };

      window.addEventListener("error", (e) => {
       if (
          ((error) =>
          error.stack && error.stack.indexOf("invokeGuardedCallbackDev") >= 0)(
          new Error()
        )) {
          // Ignore errors that will be processed a React error boundary.
          // See: https://github.com/facebook/react/issues/10474
          return true;
        }

        ${import_meta_hot}.send("triplex:error", {
          col: e.colno,
          line: e.lineno,
          message: e.error.message,
          source: e.filename,
          stack: e.error.stack,
          subtitle: "An error was thrown which may affect how your scene behaves. Resolve the error and try again.",
          title: "Unhandled Error",
        });
      });

      ${import_meta_hot}.on("vite:error", (e) => {
        ${import_meta_hot}.send("triplex:error", {
          col: e.err.loc?.column,
          line: e.err.loc?.line,
          message: e.err.message,
          source: e.err.id,
          stack: e.err.stack,
          subtitle: "The scene could not be rendered as there was an error parsing its module. Resolve the error and try again.",
          title: "Module Error",
        });
      });

      // Grab hold of the resolved render function and keep it available across HMR updates.
      // We do this so we don't throw away the state of the renderer.
      // One caveat is the bootstrap function can't be HMRd during development.
      try {
        return bootstrapWebXR();
      } catch (e) {
        ${import_meta_hot}.send("triplex:error", {
          col: e.loc?.column,
          id: "renderer_bootstrap_failure",
          line: e.loc?.line,
          message: e.message,
          source: e.id,
          stack: e.stack,
          subtitle: "An error prevented Triplex for starting, check the editor for how to proceed.",
          title: "Triplex Could Not Start",
          type: "unrecoverable",
        });

        throw e;
      }
    }

    // Notify error boundaries after a HMR event has completed. This has to be
    // orchestrated after React Fast Refresh otherwise we can rapidly trigger error
    // boundaries which is janky and unexpected by users.
    // NOTE: This is kept at the top module scope so it's reset every time a HMR event is fired.
    ${import_meta_hot}.on("vite:afterUpdate", (e) => {
      // We defer this to have a higher chance that a fast refresh has completed.
      // See: https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/src/refreshUtils.js#L17
      setTimeout(() => {
        send("self:request-reset-error-boundary", undefined);
      }, 96);

      const paths = e.updates.map((update) => update.path);
      paths.forEach((path) => {
        send("self:request-reset-file", { path });
      });
    });

    if (!${import_meta_hot}.data.initialized) {
      // We only want to do a side-effect initialization once. Afterwards we rely
      // on accepting the new module through HMR to then re-bootstrap the renderer.
      ${import_meta_hot}.data.initialized = true;
      initialize().then((render) => {
        ${import_meta_hot}.data.render = render;
        ${import_meta_hot}.data.render({ config, files });
      });
    }

    ${import_meta_hot}.accept((mod) => {
      if (mod) {
        ${import_meta_hot}.data.render({ config: mod.config, files: mod.files });
      }
    });
  `,
  // If the exports change, or if triplex meta changes, invalidate HMR
  // and force parents up the chain to refresh flushing changes through the editor
  // when the provider has changed - we want to flush it through the whole app!
  invalidateHMRFooter: `
    if (${import_meta_hot}) {
      __hmr_import(import.meta.url).then((currentModule) => {
        ${import_meta_hot}.accept((nextModule) => {
          const currentKeys = globalThis.Object.entries(currentModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          const nextKeys = globalThis.Object.entries(nextModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          if (JSON.stringify(currentKeys) !== JSON.stringify(nextKeys)){${import_meta_hot}.invalidate();}
        });
      });
    }
  `,
  invalidateHMRHeader: `import { __hmr_import } from "triplex:hmr-import";`,
  providers: (template: InitializationConfig) => `
    import * as Providers from "${template.config.provider}";
    import { Fragment } from "react";

    export function CanvasProvider(props) {
      const Component = Providers.CanvasProvider || Providers.default || Fragment;
      return <Component {...props} />;
    }

    export function GlobalProvider(props) {
      const Component = Providers.GlobalProvider || Fragment;
      return <Component {...props} />;
    }
  `,
  thumbnail: (
    template: InitializationConfig,
    { exportName, path }: { exportName: string; path: string },
  ) =>
    [
      `import { thumbnail } from "${template.pkgName}";`,
      `import * as providers from "${template.config.provider}";`,
      `import {${exportName} as component} from "${path}";`,
      `thumbnail(document.getElementById('root'))({ component, providers });`,
    ].join(""),
};
