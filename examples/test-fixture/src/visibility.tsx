/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function InvisibleMesh() {
  return (
    <>
      <mesh name={"visible"} position={[0, 0, -1.2]} scale={[3.66, 3.04, 1]}>
        <boxGeometry />
      </mesh>
      <mesh name={"invisible"} visible={false}>
        <boxGeometry />
      </mesh>
    </>
  );
}

export function InvisibleParent() {
  return (
    <>
      <mesh name={"visible"} position={[0, 0, -1.2]} scale={[3.66, 3.04, 1]}>
        <boxGeometry />
      </mesh>
      <group visible={false}>
        <mesh name={"invisible"}>
          <boxGeometry />
        </mesh>
      </group>
    </>
  );
}
