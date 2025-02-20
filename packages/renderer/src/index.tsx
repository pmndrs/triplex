/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  init,
  type BootstrapFunction,
  type ThumbnailFunction,
} from "@triplex/bridge/client";
import { initFeatureGates } from "@triplex/lib/fg";
import { createRoot } from "react-dom/client";
import { App } from "./features/app";
import { SceneElement } from "./features/scene-element";
import { SceneScreenshot } from "./features/scene-screenshot";

init({ RendererElement: SceneElement });

export { Canvas } from "./features/canvas";

export const bootstrap: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return async (opts) => {
    await initFeatureGates({
      environment: opts.fgEnvironmentOverride,
      userId: opts.userId,
    });

    root.render(
      <App
        files={opts.files}
        provider={opts.provider}
        providerPath={opts.config.provider}
      />,
    );
  };
};

export const thumbnail: ThumbnailFunction = (container) => {
  const root = createRoot(container);

  return ({ component, provider }) => {
    root.render(<SceneScreenshot component={component} provider={provider} />);
  };
};
