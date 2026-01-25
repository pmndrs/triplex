/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useRef, type ReactNode } from "react";
import {
  Matrix4,
  type Group,
  type OrthographicCamera as OrthographicCameraImpl,
} from "three";
import { Hud, OrthographicCamera } from "triplex-drei";
import { ActiveCameraContext } from "../camera-new/context";

const matrix = new Matrix4();

export interface GizmoHelperProps {
  alignment?:
    | "top-left"
    | "top-right"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center"
    | "center-right"
    | "center-left"
    | "center-center"
    | "top-center";
  children?: ReactNode;
  margin?: [number, number];
  renderPriority?: number;
}

export const GizmoHelper = ({
  alignment = "bottom-right",
  children,
  margin = [80, 80],
  renderPriority = 1,
}: GizmoHelperProps) => {
  const size = useThree((state) => state.size);
  const camera = useContext(ActiveCameraContext);
  const gizmoRef = useRef<Group>(null!);
  const virtualCam = useRef<OrthographicCameraImpl>(null!);

  useFrame(() => {
    if (camera && gizmoRef.current) {
      matrix.copy(camera.camera.matrix).invert();
      gizmoRef.current.quaternion.setFromRotationMatrix(matrix);
    }
  });

  // Position gizmo component within scene
  const [marginX, marginY] = margin;
  const x = alignment.endsWith("-center")
    ? 0
    : alignment.endsWith("-left")
      ? -size.width / 2 + marginX
      : size.width / 2 - marginX;
  const y = alignment.startsWith("center-")
    ? 0
    : alignment.startsWith("top-")
      ? size.height / 2 - marginY
      : -size.height / 2 + marginY;

  if (window.triplex.config.webgpu) {
    // TODO: Add support for webgpu.
    return null;
  }

  return (
    <Hud renderPriority={renderPriority}>
      <OrthographicCamera makeDefault position={[0, 0, 200]} ref={virtualCam} />
      <group position={[x, y, 0]} ref={gizmoRef}>
        {children}
      </group>
    </Hud>
  );
};
