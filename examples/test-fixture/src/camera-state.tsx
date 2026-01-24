/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Box, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export function Scene() {
  return (
    <Canvas>
      <Box scale={1.5}>
        <meshBasicMaterial color="red" />
      </Box>
      <PerspectiveCamera
        makeDefault
        position={[-1.8, 0.9, 0]}
        rotation={[-1.6, -0.47, -1.908]}
      />
    </Canvas>
  );
}
