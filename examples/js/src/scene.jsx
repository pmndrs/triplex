/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Sphere from "@/geometry/sphere";
import Box from "./geometry/box";
import Cylinder from "./geometry/cylinder";

export function JSOnlyConfig() {
  return (
    <>
      <Box color="red" />
      <Cylinder position={[-1.86, 0, -1.84]} />
      <Sphere position={[2.02, 0, -1.8]} />
      <ambientLight intensity={0.4} />
      <pointLight intensity={10.38} position={[-1.44, 2.54, 0]} />
    </>
  );
}
