/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { memo } from "react";

const Box = () => {
  const pi = Math.PI;
  return (
    <mesh
      position={[Math.sqrt(2), Math.sqrt(2), Math.sqrt(2)]}
      rotateX={Math.PI / 2}
      rotateY={pi / 2}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="pink" />
    </mesh>
  );
};

export default memo(Box);
