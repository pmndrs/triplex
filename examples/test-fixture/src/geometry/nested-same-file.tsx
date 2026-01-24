/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export function Inbuilt() {
  return (
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
export function Inbuilt1() {
  return <Inbuilt />;
}

export function Inbuilt2() {
  return <Inbuilt1 />;
}

export function Scene() {
  return (
    <>
      <Inbuilt2 />
    </>
  );
}
