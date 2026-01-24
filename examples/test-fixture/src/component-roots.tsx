/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Button } from "./react-roots";
import { Plane } from "./scene";

export function ThreeFiberRootFromAnotherModule() {
  return <Plane />;
}

export function ReactRoot() {
  return (
    <div data-testid="react-root" style={{ height: "100vh", width: "100vh" }}>
      Hello World
    </div>
  );
}

export function ReactRootFromAnotherModule() {
  return <Button>Button</Button>;
}

export function Unknown() {
  return null;
}
