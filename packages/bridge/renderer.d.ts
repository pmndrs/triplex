/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
declare interface Window {
  readonly triplex: {
    readonly env: {
      readonly mode: "webxr" | "default";
      state: "edit" | "pause" | "play";
    };
    readonly preload: {
      readonly reactThreeFiber: boolean;
    };
    readonly webgpu: boolean;
  };
}
