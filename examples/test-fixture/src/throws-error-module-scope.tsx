/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { throwsError } from "./util/errors";

// When starting Triplex and then commenting out this line of code the editor
// doesn't recover — forcing you to restart the editor. Vite doesn't trigger any
// HMR events when the file is updated. Is this a bug?
throwsError("Throwing an error during module initialization.");

export function ErrorsDuringModuleInit() {
  return (
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
