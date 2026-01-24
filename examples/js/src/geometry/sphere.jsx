/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export default function Sphere({ position, rotation, scale }) {
  return (
    <mesh
      castShadow={true}
      position={position}
      receiveShadow={true}
      rotation={rotation}
      scale={scale}
    >
      <sphereGeometry />
      <meshStandardMaterial color={"#84f4ea"} />
    </mesh>
  );
}
