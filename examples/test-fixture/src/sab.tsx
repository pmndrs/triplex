/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useState } from "react";

export function SharedArrayBufferTest() {
  const [] = useState(() => new SharedArrayBuffer(2));
  return (
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
