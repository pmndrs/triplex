/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEffect } from "react";
import { addDOMTestData } from "./util/add-dom-data";
import { color } from "./util/external";

export function TestHMR() {
  return <ComponentControlsTest color="blue" />;
}

export function TestHMRExternal() {
  return <ComponentControlsTest color={color()} />;
}

export function ComponentControlsTest({
  color = "blue",
}: {
  color?: "red" | "green" | "blue";
}) {
  useEffect(() => {
    return addDOMTestData("component-props", { color });
  }, [color]);

  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
