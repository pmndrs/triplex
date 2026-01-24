/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useState } from "react";
import { type Vector3Tuple } from "three";

function Box({
  children,
  color = "blue",
  position,
  rotation,
  scale,
  size = 1,
}: {
  children?: React.ReactNode;
  color?: "red" | "green" | "blue";
  position?: Vector3Tuple | number;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple | number;
  /**
   * @min 1
   * @max 2
   * @step 0.1
   * @group Custom Group
   */
  size?: number | string;
}) {
  const ok = {};
  const [hover, setHover] = useState(false);
  return (
    <group scale={scale} visible={true}>
      <mesh
        {...ok}
        name="hello-world"
        onClick={() => {}}
        onPointerOut={() => setHover(false)}
        onPointerOver={() => setHover(true)}
        position={position}
        rotation={rotation}
        userData={{ hello: true }}
        visible={true}
      >
        <boxGeometry args={[+size, +size, +size]} />
        <meshStandardMaterial color={hover ? "purple" : color} key={color} />
        {children}
      </mesh>
    </group>
  );
}

export default Box;
