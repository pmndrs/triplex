/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// eslint-disable-next-line react/display-name

import { useLayoutEffect, useRef, useState } from "react";
import { type Mesh } from "three";

const visible = true;

export const UnsafeRefAccess = () => {
  const ref = useRef<Mesh>(null!);
  const [, setRe] = useState(false);

  useLayoutEffect(() => {
    ref.current.position.x += 0.01;

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current.position.x -= 0.01;
    };
  });

  useLayoutEffect(() => {
    setRe(true);
  }, []);

  return (
    <mesh ref={ref} visible={visible}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
};
