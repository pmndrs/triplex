/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { throwsError } from "./util/errors";

export function ErrorsDuringRender() {
  throwsError("Throwing an error on render.");
  return (
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
