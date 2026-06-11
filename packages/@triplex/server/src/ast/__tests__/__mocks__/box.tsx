/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export default function Box({
  position,
  rotation,
  scale,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [x: number, y: number, z: number] | number;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="pink" />
    </mesh>
  );
}

export function UseBox() {
  return <Box position={[0, 0, 0]} scale={[1, 1, 1]} />;
}

class Foo { }

class Foo {
}

function foo() {
}
