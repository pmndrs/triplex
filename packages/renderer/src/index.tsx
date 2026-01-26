/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/// <reference types="vite/client" />
import {
  init,
  type BootstrapFunction,
  type ThumbnailFunction,
} from "@triplex/bridge/client";
import { initFeatureGates } from "@triplex/lib/fg";
import { LoadingLogo } from "@triplex/lib/loader";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/app";
import { SceneElement } from "./features/scene-element";
import { SceneScreenshot } from "./features/scene-screenshot";
import { WebXRApp } from "./features/webxr";

init({ RendererElement: SceneElement });

export { Canvas } from "./features/canvas";

export const bootstrap: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return async (opts) => {
    // Parse VITE_FG_OVERRIDES for test environments
    const viteOverrides = JSON.parse(import.meta.env.VITE_FG_OVERRIDES || "{}");

    await initFeatureGates({
      environment: opts.fgEnvironmentOverride,
      overrides: {
        ...opts.config.experimental,
        ...viteOverrides,
      },
      userId: opts.userId,
    });

    root.render(
      <App
        files={opts.files}
        providerPath={opts.config.provider}
        providers={opts.providers}
      />,
    );
  };
};

export const bootstrapWebXR: BootstrapFunction = (container) => {
  WebXRApp.preload();

  const root = createRoot(container);

  return async (opts) => {
    // Parse VITE_FG_OVERRIDES for test environments
    const viteOverrides = JSON.parse(import.meta.env.VITE_FG_OVERRIDES || "{}");

    await initFeatureGates({
      environment: opts.fgEnvironmentOverride,
      overrides: {
        ...opts.config.experimental,
        ...viteOverrides,
      },
      userId: opts.userId,
    });

    const params = new URLSearchParams(window.location.search);
    const exportName = params.get("exportName") || "";
    const path = params.get("path") || "";

    root.render(
      <Suspense
        fallback={
          <LoadingLogo color="white" position="splash" variant="stroke" />
        }
      >
        <WebXRApp
          exportName={exportName}
          files={opts.files}
          path={path}
          providerPath={opts.config.provider}
          providers={opts.providers}
        />
      </Suspense>,
    );
  };
};

export const thumbnail: ThumbnailFunction = (container) => {
  const root = createRoot(container);

  return ({ component, providers }) => {
    root.render(
      <SceneScreenshot component={component} providers={providers} />,
    );
  };
};
