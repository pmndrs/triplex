/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Canvas as FiberCanvas, type CanvasProps } from "@react-three/fiber";
import { send } from "@triplex/bridge/client";
import { LoadingLogo } from "@triplex/lib/loader";
import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { TriplexGrid } from "../../components/grid";
import { Tunnel } from "../../components/tunnel";
import { usePlayState } from "../../stores/use-play-state";
import { defaultLayer, editorLayer } from "../../util/layers";
import { CameraAxisHelper } from "../camera-helpers/camera-axis-helper";
import { FitCameraToScene } from "../camera-helpers/camera-fit-scene";
import { Camera } from "../camera-new";
import { SceneElement } from "../scene-element";
import { useLoadedScene } from "../scene-loader/context";
import { ResolveSelection } from "../selection-provider/resolve-selection";
import { ThreeFiberSelection } from "../selection-three-fiber";
import { CaptureShaderErrors } from "./capture-shader-errors";
import { SceneLights } from "./scene-lights";
import { useCanvasMounted } from "./store";

/**
 * **Canvas**
 *
 * Internal component that renders scene helpers for Three Fiber. Don't rely on
 * any explicit props being passed here as this component can be rendered in
 * userland. Only rely on context or external stores.
 */
export function Canvas({ children, ...props }: CanvasProps) {
  const playState = usePlayState();
  const { exportName, path, providerPath, providers, scene } = useLoadedScene();
  const setMounted = useCanvasMounted((state) => state.setMounted);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (playState === "play") {
      ref.current?.focus();
    }
  }, [playState]);

  useLayoutEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, [setMounted]);

  return (
    <FiberCanvas
      renderer={window.triplex.config.webgpu ? "webgpu" : undefined}
      shadows="percentage"
      {...props}
      raycaster={{
        ...props.raycaster,
        layers:
          playState === "play"
            ? (props.raycaster?.layers ?? defaultLayer)
            : // This forces the default r3f raycaster to be fired on a different layer (31)
              // than the default layer (0) that object3d's are set to default.
              editorLayer,
      }}
      ref={ref}
    >
      <CaptureShaderErrors />
      <Camera>
        <ErrorBoundaryForScene
          fallbackRender={() => <ErrorFallback />}
          onError={(err) =>
            send("error", {
              message: err.message,
              source: providerPath,
              stack: err.stack,
              subtitle:
                "The scene could not be rendered because there was an error in the provider component. Resolve the errors and try again.",
              title: "Could not render scene",
            })
          }
          resetKeys={[scene, providers]}
        >
          <Suspense
            fallback={
              <Tunnel.In>
                <LoadingLogo
                  color="rgb(59 130 246)"
                  position="hint"
                  variant="stroke"
                />
              </Tunnel.In>
            }
          >
            <SceneElement
              __component={providers.CanvasProvider}
              __meta={{
                astPath: "global/CanvasProvider",
                column: -999,
                exportName: "CanvasProvider",
                line: -999,
                name: "CanvasProvider",
                path: providerPath,
                rotate: false,
                scale: false,
                translate: false,
              }}
              forceInsideSceneObjectContext
            >
              <ThreeFiberSelection filter={{ exportName, path }}>
                <Suspense
                  fallback={
                    <Tunnel.In>
                      <LoadingLogo
                        color="rgb(59 130 246)"
                        position="hint"
                        variant="stroke"
                      />
                    </Tunnel.In>
                  }
                >
                  {children}
                  <ResolveSelection />
                  <FitCameraToScene resetKeys={[path, exportName]} />
                  <SceneLights />
                  {window.triplex.env.mode === "default" && <TriplexGrid />}
                  {window.triplex.env.mode === "default" && (
                    <CameraAxisHelper />
                  )}
                </Suspense>
              </ThreeFiberSelection>
            </SceneElement>
          </Suspense>
        </ErrorBoundaryForScene>
      </Camera>
    </FiberCanvas>
  );
}
