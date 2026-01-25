/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type TriplexMeta } from "@triplex/bridge/client";
import {
  Raycaster,
  Vector2,
  type Camera,
  type Object3D,
  type Vector3,
} from "three";
import { getTriplexMeta, hasTriplexMeta } from "../../util/meta";
import { isObjectVisible } from "../../util/three";

export interface ResolvedObject3D {
  meta: TriplexMeta;
  object: Object3D;
}

export const findTransformedObject3D = (
  sceneObject: Object3D,
  filter: {
    transform: "none" | "translate" | "scale" | "rotate";
  },
): Object3D => {
  const transform =
    filter.transform === "none" ? "translate" : filter.transform;
  let foundExactSceneObject: Object3D | undefined = undefined;
  let foundTranslatedSceneObject: Object3D | undefined;

  sceneObject.traverse((child: Object3D) => {
    const meta = getTriplexMeta(child);
    if (!meta) {
      return;
    }

    // We need to find out if one of the jsx elements between sceneObject
    // and the next triplex boundary has the transform prop applied - if it
    // does we've found the scene object we're interested in!
    // This data is set by the @triplex/client babel plugin.
    if (!foundExactSceneObject && meta[transform]) {
      foundExactSceneObject = child;
    }

    // As a backup we mark a the first found translated scene object if present.
    // We use this if scale and rotate are not found when traversing children.
    // This means the transform gizmo stays on the scene object instead of moving to [0,0,0].
    if (!foundTranslatedSceneObject && meta.translate) {
      foundTranslatedSceneObject = child;
    }
  });

  return foundExactSceneObject || foundTranslatedSceneObject || sceneObject;
};

/**
 * **findObject3d()**
 *
 * Traverses the Three.js scene to find all matching objects based on the
 * filter. Objects can match either by a direct match, or by having a parent
 * that matches the filter. The meta in each return tuple is the meta from the
 * matching direct or parent object.
 */
export const findObject3D = (
  scene: Object3D,
  filter: { astPath: string; column: number; line: number; path: string },
): [object: Object3D, meta: TriplexMeta][] => {
  const foundObjects: [Object3D, TriplexMeta][] = [];

  scene.traverse((obj) => {
    if (!hasTriplexMeta(obj)) {
      return;
    }

    const meta = obj.__triplex;

    if (
      meta.astPath === filter.astPath ||
      (meta.path === filter.path &&
        meta.column === filter.column &&
        meta.line === filter.line)
    ) {
      // We found a direct match for a host element — resolve it and return!
      foundObjects.push([obj, meta]);
      return;
    }

    for (const parent of meta.parents) {
      // Check the parents in the meta to see if they are a match and if so resolve the object.
      if (
        (parent.astPath === filter.astPath ||
          (parent.path === filter.path &&
            parent.column === filter.column &&
            parent.line === filter.line)) &&
        parent.originExportName !== "Canvas"
      ) {
        foundObjects.push([obj, parent]);
        return;
      }
    }
  });

  return foundObjects;
};

export const resolveObject3D = (
  scene: Object3D,
  filter: {
    astPath: string;
    column: number;
    line: number;
    path: string;
    transform: "none" | "translate" | "scale" | "rotate";
  },
): ResolvedObject3D[] => {
  const objects = findObject3D(scene, filter);

  return objects.map(([object, meta]) => {
    const sceneObject = /^[a-z]/.test(meta.name)
      ? object
      : findTransformedObject3D(object, filter);

    return {
      meta,
      object: sceneObject,
    };
  });
};

// We use this as a default raycaster so it is fired on the default layer (0) instead
// Of the editor layer (31).
const raycaster = new Raycaster();
const vector = new Vector2();

export function resolveObjectsFromPoint(
  point: { x: number; y: number },
  opts: {
    camera: Camera | null | undefined;
    scene: Object3D;
  },
) {
  if (!opts.camera) {
    return [];
  }

  vector.set(point.x, point.y);
  raycaster.setFromCamera(vector, opts.camera);

  const results = raycaster.intersectObject(opts.scene);

  return results.filter(
    (found) =>
      isObjectVisible(found.object) &&
      found.object.type !== "TransformControlsPlane",
  );
}

export function resolveObjectsFromOrientation(
  e: { direction: Vector3; origin: Vector3 },
  opts: {
    scene: Object3D;
  },
) {
  raycaster.set(e.origin, e.direction);

  const results = raycaster.intersectObject(opts.scene);

  return results.filter((found) => isObjectVisible(found.object));
}
