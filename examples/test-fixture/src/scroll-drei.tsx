/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Scroll, ScrollControls, useScroll } from "@react-three/drei";

function ThrowWhenUndefined() {
  const scroll = useScroll();
  if (!scroll) {
    throw new Error("invariant: scroll was not found");
  }

  return null;
}

export function ScrollTestFixture() {
  return (
    <>
      <ScrollControls pages={3}>
        <ThrowWhenUndefined />
        <Scroll>
          <mesh>
            <boxGeometry />
          </mesh>
        </Scroll>
      </ScrollControls>
    </>
  );
}
