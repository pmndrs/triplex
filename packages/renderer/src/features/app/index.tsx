/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  broadcastForwardedKeyboardEvents,
  compose,
  on,
  send,
  type Modules,
  type ProviderModule,
} from "@triplex/bridge/client";
import { LoadingLogo } from "@triplex/lib/loader";
import {
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { Tunnel } from "../../components/tunnel";
import { PlayStateProvider } from "../../stores/use-play-state";
import { SceneLoader } from "../scene-loader";
import { SwitchToComponentContext } from "./context";
import { DebugAttributes } from "./debug";
import { type Component } from "./types";

export function App({
  files,
  providerPath,
  providers,
}: {
  files: Modules;
  providerPath: string;
  providers: ProviderModule;
}) {
  const [component, setComponent] = useState<Component>({
    exportName: "",
    path: "",
    props: {},
  });

  const switchToComponent = useCallback((component: Component) => {
    startTransition(() => {
      setComponent(component);
      send("component-opened", {
        encodedProps: JSON.stringify(component.props),
        entered: true,
        exportName: component.exportName,
        path: component.path,
      });
    });
  }, []);

  useEffect(() => {
    send("set-extension-points", {
      area: "elements",
      controls: [
        {
          buttons: [
            {
              icon: "camera",
              id: "camera_enter",
              label: "Enter Camera",
            },
            {
              icon: "exit",
              id: "camera_exit",
              label: "Exit Camera",
            },
          ],
          filter: "PerspectiveCamera|OrthographicCamera",
          groupId: "enter_camera",
          type: "toggle-button",
        },
      ],
    });
  }, []);

  useEffect(() => {
    send("ready", undefined);
    return compose([
      broadcastForwardedKeyboardEvents(),
      on("request-open-component", (sceneObject) => {
        if (!sceneObject) {
          return;
        }

        switchToComponent({
          exportName: sceneObject.exportName,
          path: sceneObject.path,
          props: sceneObject.encodedProps
            ? JSON.parse(sceneObject.encodedProps)
            : {},
        });
      }),
    ]);
  }, [switchToComponent]);

  return (
    <SwitchToComponentContext.Provider value={switchToComponent}>
      <PlayStateProvider>
        <ErrorBoundaryForScene
          fallbackRender={() => <ErrorFallback />}
          onError={(err) =>
            send("error", {
              message: err.message,
              source: component.path,
              stack: err.message,
              subtitle:
                "The scene could not be rendered as there was an error parsing its module. Resolve the error and try again.",
              title: "Module Error",
            })
          }
          resetKeys={[component]}
        >
          <div style={{ height: "100%", position: "relative", width: "100%" }}>
            <Suspense
              fallback={
                <LoadingLogo
                  color="rgb(59 130 246)"
                  position="hint"
                  variant="stroke"
                />
              }
            >
              <SceneLoader
                exportName={component.exportName}
                modules={files}
                path={component.path}
                providerPath={providerPath}
                providers={providers}
                sceneProps={component.props}
              />
            </Suspense>
            <Tunnel.Out />
            <DebugAttributes />
          </div>
        </ErrorBoundaryForScene>
      </PlayStateProvider>
    </SwitchToComponentContext.Provider>
  );
}
