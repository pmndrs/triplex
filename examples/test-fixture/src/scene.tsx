/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { MapControls, PerspectiveCamera } from "@react-three/drei";
import { Fragment } from "react";
import Box from "./geometry/box";

export function Plane() {
  return (
    <Fragment>
      <mesh>
        <planeGeometry />
        <meshBasicMaterial color={"#dd8d8d"} visible={true} />
      </mesh>
    </Fragment>
  );
}

export function Scene({
  name: ___ = "jelly",
  value: __ = 100,
  variant: _ = "giant",
  visible: ____ = true,
}: SceneProps) {
  return (
    <>
      <ambientLight position={[2.12, 0, -0.88]} />
      <Box scale={1.5}>
        <meshBasicMaterial color="red" />
      </Box>
      <PerspectiveCamera
        makeDefault={true}
        name={"user_defined"}
        position={[-1.831_592_557_014_578_1, 0.943_661_973_904_340_8, 0]}
        rotation={[
          -1.570_796_326_794_896_6, -1.221_730_476_396_030_6,
          -1.570_796_326_794_896_6,
        ]}
      />
      <group>
        <mesh position={[1.6, 0, -1.7]}>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
        <mesh position={[0.04, 0, -1.7]} scale={[2.42, 2.24, 1]}>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </group>

      <MapControls makeDefault={false} />
    </>
  );
}

interface SceneProps {
  name?: string;
  /**
   * @min 1
   * @max 10
   * @step 0.5
   */
  value?: number;
  variant?: "giant" | "small";
  visible?: boolean;
}
