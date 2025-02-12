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
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Renderer } from "./renderer";
import { RendererElement } from "./renderer-element";

init({ RendererElement });

export const bootstrap: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return (opts) => {
    root.render(
      <Renderer
        files={opts.files}
        provider={opts.provider}
        providerPath={opts.config.provider}
      />,
    );
  };
};

function Ready({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("screenshot!");
  }, []);

  return <>{children}</>;
}

export const thumbnail: ThumbnailFunction = (container) => {
  const root = createRoot(container);

  return ({ component: Component, provider: Provider }) => {
    root.render(
      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          inset: 0,
          justifyContent: "center",
          position: "absolute",
          width: "100%",
        }}
      >
        <Ready>
          <ErrorBoundary fallbackRender={() => null}>
            <Provider>
              <Component />
            </Provider>
          </ErrorBoundary>
        </Ready>
      </div>,
    );
  };
};
