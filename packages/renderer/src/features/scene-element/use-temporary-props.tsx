/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { compose, on, type RendererElementProps } from "@triplex/bridge/client";
import { useCallback, useEffect, useRef, useState } from "react";

function useForceRender() {
  const [, setState] = useState(0);
  return useCallback(() => setState((prev) => prev + 1), []);
}

export function useTemporaryProps(
  meta: RendererElementProps["__meta"],
  props: Record<string, unknown>,
): Record<string, unknown> {
  const forceRender = useForceRender();
  const intermediateProps = useRef<Record<string, unknown>>({});
  const propsRef = useRef<Record<string, unknown>>({});

  // Assign all current top-level props to a ref so we can access it in an effect.
  // eslint-disable-next-line react-compiler/react-compiler
  Object.assign(propsRef.current, props);

  useEffect(() => {
    return compose([
      on("self:request-reset-file", ({ path }) => {
        if (meta.path.endsWith(path)) {
          intermediateProps.current = {};
        }
      }),
      on("request-reset-scene", () => {
        if (Object.keys(intermediateProps.current).length) {
          intermediateProps.current = {};
          forceRender();
        }
      }),
      on("request-set-element-prop", (data) => {
        if (data.astPath === meta.astPath) {
          intermediateProps.current[data.propName] = data.propValue;
          forceRender();
        } else if (
          "column" in data &&
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          intermediateProps.current[data.propName] = data.propValue;
          forceRender();
        }
      }),
      on("request-reset-prop", (data) => {
        if (data.astPath === meta.astPath) {
          delete intermediateProps.current[data.propName];
          forceRender();
        } else if (
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          delete intermediateProps.current[data.propName];
          forceRender();
        }
      }),
    ]);
  }, [meta.column, meta.line, meta.name, meta.path, forceRender, meta.astPath]);

  // eslint-disable-next-line react-compiler/react-compiler
  const nextProps = { ...props, ...intermediateProps.current };

  for (const key in nextProps) {
    const value = nextProps[key];
    if (value === undefined) {
      // If the value is undefined we remove it from props altogether.
      // If props are spread onto the host jsx element in r3f this means it
      // gets completely removed and r3f will reset its value back to default.
      // For props directly assigned we instead transform it in the babel plugin
      // to be conditionally applied instead.
      delete nextProps[key];
    }
  }

  return nextProps;
}
