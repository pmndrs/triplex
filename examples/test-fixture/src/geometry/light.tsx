/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Box from "./box";

export function Light() {
  return (
    <>
      <Box position={[0, 16.06, 55.96]} scale={0.1} />
      <ambientLight position={[0, 1.66, 5.76]} />
    </>
  );
}
