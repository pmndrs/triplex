/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
function Box({ color, position, rotation, scale, size = 1 }) {
  return (
    <group scale={scale}>
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} key={color} />
      </mesh>
    </group>
  );
}

export default Box;
