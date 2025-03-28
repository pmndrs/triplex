/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { on } from "@triplex/bridge/client";
import { fg } from "@triplex/lib/fg";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type OrthographicCamera, type PerspectiveCamera } from "three";
import { usePlayState } from "../../stores/use-play-state";
import { EDITOR_LAYER_INDEX, HIDDEN_LAYER_INDEX } from "../../util/layers";
import {
  ActiveCameraContext,
  DefaultCameraContext,
  type ActiveCameraContextValue,
} from "./context";
import { fitCamerasToViewport } from "./fit-cameras-to-viewport";
import { type CanvasCamera, type EditorCameraType } from "./types";

interface ModeState {
  edit: CanvasCamera;
  editor: EditorCameraType;
  play: CanvasCamera;
}

type ModeActions =
  | {
      action: "set-canvas-camera";
      camera: CanvasCamera;
    }
  | {
      action: "set-editor-camera-type";
      type: EditorCameraType;
    };

export function Cameras({ children }: { children: ReactNode }) {
  const defaultEditorCamera = useContext(DefaultCameraContext);
  const [activeCamera, setActiveCamera] = useState<
    PerspectiveCamera | OrthographicCamera | null
  >(null);
  const defaultCamera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const perspectiveRef = useRef<PerspectiveCamera>(null!);
  const orthographicRef = useRef<OrthographicCamera>(null!);
  const playState = usePlayState();
  const [state, setCameraState] = useReducer<ModeState, [ModeActions]>(
    (state, action) => {
      if (action.action === "set-canvas-camera") {
        if (playState === "edit") {
          return { ...state, edit: action.camera };
        }

        return { ...state, play: action.camera };
      }

      if (action.action === "set-editor-camera-type") {
        return { ...state, editor: action.type };
      }

      return state;
    },
    { edit: defaultEditorCamera, editor: "perspective", play: "default" },
  );
  const activeState = playState === "edit" ? state.edit : state.play;

  useLayoutEffect(() => {
    return fitCamerasToViewport(gl, [
      defaultCamera,
      perspectiveRef.current,
      orthographicRef.current,
    ]);
  }, [defaultCamera, gl]);

  useLayoutEffect(() => {
    if (activeState === "default") {
      setActiveCamera(defaultCamera);
    } else {
      setActiveCamera(
        state.editor === "perspective"
          ? perspectiveRef.current
          : orthographicRef.current,
      );
    }
  }, [activeState, defaultCamera, state.editor]);

  useEffect(() => {
    return on("extension-point-triggered", ({ id, scope }) => {
      if (scope !== "scene") {
        return;
      }

      switch (id) {
        case "camera_editor":
          setCameraState({ action: "set-canvas-camera", camera: "editor" });
          break;
        case "camera_default":
          setCameraState({ action: "set-canvas-camera", camera: "default" });
          break;

        case "perspective":
        case "orthographic":
          setCameraState({ action: "set-editor-camera-type", type: id });
          return { handled: true };
      }
    });
  }, [defaultCamera]);

  useEffect(() => {
    if (!activeCamera) {
      return;
    }

    switch (playState) {
      case "edit":
      case "pause":
        activeCamera.layers.enable(EDITOR_LAYER_INDEX);
        activeCamera.layers.enable(HIDDEN_LAYER_INDEX);
        break;
      case "play":
        activeCamera.layers.disable(EDITOR_LAYER_INDEX);
        activeCamera.layers.disable(HIDDEN_LAYER_INDEX);
        break;
    }
  }, [activeCamera, playState]);

  useEffect(() => {
    if (!gl || !activeCamera || !fg("camera_pp_fix")) {
      return;
    }

    const originalRender = gl.render;

    /**
     * This hijacks the existing GL render function to forcibly switch what
     * camera is being used. This enables postprocessing to do its thing without
     * Triplex having to do more work to support it.
     */
    gl.render = function (scene, camera, ...args) {
      // only patch defaultCamera calls to preserve triplex ui correctly
      if (activeState === "editor" && camera === defaultCamera) {
        return originalRender.call(this, scene, activeCamera, ...args);
      }

      return originalRender.call(this, scene, camera, ...args);
    };

    return () => {
      gl.render = originalRender;
    };
  }, [gl, activeCamera, activeState, defaultCamera]);

  useFrame(
    ({ gl, scene }) => {
      if (fg("camera_pp_fix")) {
        if (activeCamera) {
          /**
           * This is complementary to the render hijack above, postprocessing
           * effects can disable clear which causes selection outlines to hang.
           */
          gl.autoClear = true;
          // gl.render call needed components without pp
          gl.render(scene, activeCamera);
        }
      } else {
        if (activeCamera) {
          gl.render(scene, activeCamera);
        }
      }
    },
    // We use 0.5 here so it's ran before postprocessing.
    // See: https://github.com/pmndrs/react-postprocessing/blob/master/src/EffectComposer.tsx#L63
    fg("camera_pp_fix") ? 0.5 : 1,
  );

  const context: ActiveCameraContextValue = useMemo(
    () => (activeCamera ? { camera: activeCamera, type: activeState } : null),
    [activeCamera, activeState],
  );

  return (
    <ActiveCameraContext.Provider value={context}>
      {children}
      <perspectiveCamera
        far={100_000}
        // Opt out from r3f auto update updating the frustum.
        // @ts-expect-error
        manual
        name="triplex_perspective"
        near={0.01}
        position={[0, 0, 1]}
        ref={perspectiveRef}
      />
      <orthographicCamera
        far={100_000}
        // Opt out from r3f auto update updating the frustum.
        // @ts-expect-error
        manual
        name="triplex_orthographic"
        near={-100}
        position={[0, 0, 1]}
        ref={orthographicRef}
        zoom={100}
      />
    </ActiveCameraContext.Provider>
  );
}
