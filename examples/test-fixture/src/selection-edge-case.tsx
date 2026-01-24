/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ReactNode } from "react";

export function UnknownCustomComponentResolvedHostElements() {
  return (
    <ContextProvider>
      <mesh>
        <boxGeometry />
      </mesh>
    </ContextProvider>
  );
}

export function Sprites() {
  return <sprite />;
}

function ContextProvider({ children }: { children: ReactNode }) {
  return children;
}
