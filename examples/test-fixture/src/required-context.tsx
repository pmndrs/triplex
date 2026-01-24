/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createContext, useContext } from "react";

const Context = createContext(false);

export function useBoolean() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("invariant: no context found");
  }

  return value;
}

export function NeedsRequiredContext() {
  const isTrue = useBoolean();

  return (
    <mesh visible={isTrue}>
      <boxGeometry />
    </mesh>
  );
}
