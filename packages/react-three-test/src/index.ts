/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import renderer from "@react-three/test-renderer";
import { fireEvent as fireDOMEvent } from "@testing-library/dom";
import { type JSX } from "react";

interface TreeNode {
  children: TreeNode[];
  props: {
    [key: string]: unknown;
  };
  type: string;
}

// @ts-ignore - Ignore global variable in test.
global.IS_REACT_ACT_ENVIRONMENT = true;

function find(
  nodes: TreeNode[],
  predicate: (node: TreeNode) => boolean,
): TreeNode | undefined {
  for (const node of nodes) {
    if (predicate(node)) {
      return node;
    }

    if (node.children) {
      const result = find(node.children, predicate);
      if (result) {
        return result;
      }
    }
  }

  return undefined;
}

export async function render(jsx: JSX.Element) {
  let canvas: HTMLCanvasElement;

  const controls = await renderer.create(jsx, {
    onCreated(state) {
      canvas = state.gl.domElement;
    },
  });

  return {
    ...controls,
    act: renderer.act as (
      cb: () => unknown | Promise<unknown>,
    ) => Promise<unknown>,
    get canvas() {
      return canvas;
    },
    fireDOMEvent,
    tree: {
      getByName(name: string) {
        const tree = controls.toTree();
        if (!tree) {
          throw new Error("invariant");
        }

        const result = find(tree, (node) => node.props.name === name);

        return result;
      },
      getByType(type: string) {
        const tree = controls.toTree();
        if (!tree) {
          throw new Error("invariant");
        }

        const result = find(tree, (node) => node.type === type);

        return result;
      },
    },
  };
}
