/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useTexture } from "@react-three/drei";

export function Suspends() {
  const map = useTexture("/images/triplex.png");

  return (
    <mesh>
      <planeGeometry />
      <meshBasicMaterial alphaTest={0.5} map={map} transparent />
    </mesh>
  );
}
