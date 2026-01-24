/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Box } from "@react-three/drei";

export function Scene() {
  return (
    <group>
      <mesh name="plane1">
        <planeGeometry />
        <meshBasicMaterial color={"#dd8d8d"} visible={true} />
      </mesh>

      <Box name="box1" />
    </group>
  );
}
