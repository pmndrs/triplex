/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  type Modules,
  type SceneComponent,
  type SceneMeta,
} from "@triplex/bridge/client";
import { Fragment } from "react";
import { suspend } from "suspend-react";
import { type Scene } from "./types";

export function useSceneLoader({
  exportName,
  modules,
  path,
}: {
  exportName: string;
  modules: Modules;
  path: string;
}): Scene | null {
  if (modules == undefined || modules == null) {
    return null;
  }

  const relativePathToPickComponent = Object.keys(modules).find((filename) =>
    path ? path.endsWith(filename) : false,
  );

  if (!relativePathToPickComponent || !exportName) {
    return null;
  }

  const { component, meta } = suspend(async () => {
    const resolvedModule = await modules[relativePathToPickComponent]();
    const moduleExport = resolvedModule[exportName];
    const resolvedMeta: SceneMeta = moduleExport?.triplexMeta || {
      lighting: "default",
      root: undefined,
    };

    return {
      component: (moduleExport || Fragment) as SceneComponent,
      meta: resolvedMeta,
    };
  }, [exportName, modules, relativePathToPickComponent]);

  return {
    component,
    meta,
  };
}
