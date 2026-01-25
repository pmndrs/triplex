/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { useContext, useLayoutEffect, useRef } from "react";
import { fitCameraToObjects } from "../../util/three";
import { CameraControlsContext } from "../camera-new/context";

export function FitCameraToScene({ resetKeys }: { resetKeys?: string[] }) {
  const controls = useContext(CameraControlsContext);
  const scene = useThree((store) => store.scene);
  const sceneHasBeenPositioned = useRef(false);
  const resetKey = resetKeys?.join("");
  const lastResetKey = useRef(resetKey);

  useLayoutEffect(() => {
    if (lastResetKey.current !== resetKey) {
      lastResetKey.current = resetKey;
      sceneHasBeenPositioned.current = false;
    }
  }, [resetKey]);

  useLayoutEffect(() => {
    if (!controls || sceneHasBeenPositioned.current) {
      return;
    }

    fitCameraToObjects(scene.children, controls);

    sceneHasBeenPositioned.current = true;
  }, [controls, scene, resetKey]);

  return null;
}
