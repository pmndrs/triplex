/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { throwsError } from "./util/errors";

export function ErrorsDuringInteraction() {
  return (
    <mesh onClick={() => throwsError("Throwing an error on interaction.")}>
      <boxGeometry />
    </mesh>
  );
}
