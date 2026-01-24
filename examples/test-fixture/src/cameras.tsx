/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Billboard, PerspectiveCamera } from "@react-three/drei";
import Box from "./geometry/box";

export function Camera() {
  return (
    <>
      <PerspectiveCamera name="foo" position={[0, 0, 0.15]} />
      <Box scale={0.1} />
    </>
  );
}

export function LookAtCamera() {
  return (
    <Billboard>
      <mesh>
        <boxGeometry />
      </mesh>
    </Billboard>
  );
}
