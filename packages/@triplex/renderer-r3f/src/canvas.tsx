/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas as RCanvas } from "@react-three/fiber";

export function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <RCanvas
      id="editor-canvas"
      shadows
      style={{ inset: 0, position: "absolute" }}
    >
      {children}
    </RCanvas>
  );
}
