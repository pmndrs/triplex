/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { fg } from "@triplex/lib/fg";
import { useContext, useEffect, useState, type ReactNode } from "react";
import { Box3, Camera, Vector3 } from "three";
import { HOVER_LAYER_INDEX, SELECTION_LAYER_INDEX } from "../../util/layers";
import { resolveElementMeta } from "../../util/meta";
import { encodeProps, strip } from "../../util/three";
import { SwitchToComponentContext } from "../app/context";
import {
  ActiveCameraContext,
  CameraControlsContext,
} from "../camera-new/context";
import { CameraPreview } from "../camera-preview";
import { SceneObjectContext } from "../scene-element/context";
import { SceneObjectEventsContext } from "../scene-element/use-scene-element-events";
import { useSelectionMarshal } from "../selection-provider/use-selection-marhsal";
import { WebXRTransformHandles } from "../webxr/webxr-transform-handles";
import {
  findObject3D,
  resolveObject3D,
  resolveObjectsFromOrientation,
  resolveObjectsFromPoint,
  type ResolvedObject3D,
} from "./resolver";
import { SelectionIndicator } from "./selection-indicator";
import { SelectionIndicatorLines } from "./selection-indicator-lines";
import { useActionsStore } from "./store";
import { TransformControls } from "./transform-controls";
import {
  TransformControls as TransformControlsImmutable,
  type TransformEvent,
} from "./transform-controls-immutable";

export function ThreeFiberSelection({
  children,
  filter,
}: {
  children?: ReactNode;
  filter: { exportName: string; path: string };
}) {
  const switchToComponent = useContext(SwitchToComponentContext);
  const setSpace = useActionsStore((store) => store.setSpace);
  const setTransform = useActionsStore((store) => store.setTransform);
  const transform = useActionsStore((store) => store.transform);
  const space = useActionsStore((store) => store.space);
  const scene = useThree((store) => store.scene);
  const camera = useContext(ActiveCameraContext);
  const gl = useThree((store) => store.gl);
  const [transforms, setTransforms] = useState({
    rotate: false,
    scale: false,
    translate: false,
  });
  const [selections, hovered, selectionActions] =
    useSelectionMarshal<ResolvedObject3D>({
      listener: (e) => {
        if ("inputSourceOrigin" in e) {
          return resolveObjectsFromOrientation(
            { direction: e.inputSourceDirection, origin: e.inputSourceOrigin },
            { scene },
          )
            .map((found) => {
              const meta = resolveElementMeta(found.object, filter);

              if (meta) {
                return {
                  column: meta.column,
                  line: meta.line,
                  parentPath: filter.path,
                  path: meta.path,
                  point: found.point,
                };
              }

              return undefined;
            })
            .filter((found) => !!found);
        }

        const canvasSize = gl.domElement.getBoundingClientRect();

        const isPointerInsideCanvas =
          e.clientX >= canvasSize.left &&
          e.clientX <= canvasSize.left + canvasSize.width &&
          e.clientY >= canvasSize.top &&
          e.clientY <= canvasSize.top + canvasSize.height;

        if (!isPointerInsideCanvas) {
          return [];
        }

        // Scope the pointer position to coordinates relative to the canvas
        const canvasClientX = e.clientX - canvasSize.left;
        const canvasClientY = e.clientY - canvasSize.top;

        // Convert the pointer position to a normalized coordinate system
        const x = (canvasClientX / canvasSize.width) * 2 - 1;
        const y = -(canvasClientY / canvasSize.height) * 2 + 1;

        return resolveObjectsFromPoint(
          { x, y },
          { camera: camera?.camera, scene },
        )
          .map((found) => {
            const meta = resolveElementMeta(found.object, filter);

            if (meta) {
              return {
                column: meta.column,
                line: meta.line,
                parentPath: filter.path,
                path: meta.path,
              };
            }

            return undefined;
          })
          .filter((found) => !!found);
      },
      onDeselect: (selection) => {
        selection.object.traverse((child) =>
          child.layers.disable(SELECTION_LAYER_INDEX),
        );
      },
      onHovered: (selection) => {
        selection.object.traverse((child) =>
          child.layers.enable(HOVER_LAYER_INDEX),
        );
      },
      onSelect: (selection) => {
        selection.object.traverse((child) =>
          child.layers.enable(SELECTION_LAYER_INDEX),
        );
      },
      onSettled: (selection) => {
        selection.object.traverse((child) =>
          child.layers.disable(HOVER_LAYER_INDEX),
        );
      },
      priority: 0,
      resolve: (selections) => {
        return selections.flatMap((selection) => {
          return resolveObject3D(scene, {
            column: selection.column,
            line: selection.line,
            path: selection.parentPath,
            transform,
          });
        });
      },
    });
  const controls = useContext(CameraControlsContext);
  const resolvedObject = selections.at(0);

  useEffect(() => {
    return on("extension-point-triggered", (data) => {
      if (data.scope !== "scene") {
        return;
      }

      switch (data.id) {
        case "translate":
        case "scale":
        case "rotate":
        case "none": {
          setTransform(data.id);
          break;
        }

        case "transformlocal": {
          setSpace("local");
          return { handled: true };
        }

        case "transformworld": {
          setSpace("world");
          return { handled: true };
        }
      }
    });
  }, [setSpace, setTransform]);

  useEffect(() => {
    return compose([
      on("element-focused-props", ({ props }) => {
        // When an element is selected the host will send all available prop names for it.
        // We use this list to determine which transform controls are available.
        setTransforms({
          rotate: props.includes("rotation"),
          scale: props.includes("scale"),
          translate: props.includes("position"),
        });
      }),
      on("request-open-component", (sceneObject) => {
        if (!sceneObject && !resolvedObject) {
          return;
        }

        if (
          !sceneObject &&
          resolvedObject &&
          resolvedObject.meta.originExportName &&
          resolvedObject.meta.originPath
        ) {
          switchToComponent({
            exportName: resolvedObject.meta.originExportName,
            path: resolvedObject.meta.originPath,
            props: encodeProps(resolvedObject),
          });

          send("element-blurred", undefined);
        }
      }),
      on("request-jump-to-element", (sceneObject) => {
        const objects = sceneObject
          ? findObject3D(scene, sceneObject).map((resolved) => resolved[0])
          : selections.map((resolved) => resolved.object);

        if (objects.length === 0) {
          return;
        }

        send("track", { actionId: "element_jumpto" });

        const box = new Box3();

        objects.forEach((object) => box.expandByObject(object));

        if (box.min.x === Number.POSITIVE_INFINITY) {
          box.setFromCenterAndSize(
            objects[0].position,
            new Vector3(0.5, 0.5, 0.5),
          );
        }

        controls?.fitToBox(box, false, {
          paddingBottom: 0.5,
          paddingLeft: 0.5,
          paddingRight: 0.5,
          paddingTop: 0.5,
        });
      }),
    ]);
  }, [controls, resolvedObject, selections, scene, switchToComponent]);

  const onConfirmTransformHandler = useEvent((e: TransformEvent) => {
    if (!resolvedObject) {
      return;
    }

    if (e.mode === "translate") {
      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "position",
        propValue: e.value,
      });
      send("track", { actionId: "element_transform_translate" });
    } else if (e.mode === "rotate") {
      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "rotation",
        propValue: e.value,
      });
      send("track", { actionId: "element_transform_rotate" });
    } else if (e.mode === "scale") {
      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "scale",
        propValue: e.value,
      });
      send("track", { actionId: "element_transform_scale" });
    }
  });

  const onChangeTransformHandler = useEvent((e: TransformEvent) => {
    if (!resolvedObject) {
      return;
    }

    const update = (propName: string) => ({
      column: resolvedObject.meta.column,
      line: resolvedObject.meta.line,
      path: resolvedObject.meta.path,
      propName,
      propValue: e.value,
    });

    if (e.mode === "translate") {
      send("element-preview-prop", update("position"));
    } else if (e.mode === "rotate") {
      send("element-preview-prop", update("rotation"));
    } else if (e.mode === "scale") {
      send("element-preview-prop", update("scale"));
    }
  });

  const onCompleteTransformHandler = useEvent(() => {
    if (!resolvedObject) {
      return;
    }

    if (transform === "translate") {
      const position = resolvedObject.object.position.toArray();

      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "position",
        propValue: position.map(strip),
      });

      send("track", { actionId: "element_transform_translate" });
    } else if (transform === "rotate") {
      const rotation = resolvedObject.object.rotation.toArray();
      rotation.pop();

      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "rotation",
        propValue: rotation,
      });

      send("track", { actionId: "element_transform_rotate" });
    } else if (transform === "scale") {
      const scale = resolvedObject.object.scale.toArray();

      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "scale",
        propValue: scale.map(strip),
      });

      send("track", { actionId: "element_transform_scale" });
    }
  });

  return (
    <SceneObjectContext.Provider value={true}>
      <SceneObjectEventsContext.Provider
        value={selectionActions.resolveIfMissing}
      >
        {children}
      </SceneObjectEventsContext.Provider>

      {!!resolvedObject &&
        transform !== "none" &&
        window.triplex.env.mode === "default" &&
        fg("immutable_transform_controls") && (
          <TransformControlsImmutable
            enabled={
              /^[a-z]/.test(resolvedObject.meta.name)
                ? true
                : transforms[transform]
            }
            mode={transform}
            object={resolvedObject}
            onChange={onChangeTransformHandler}
            onConfirm={onConfirmTransformHandler}
            space={space}
          />
        )}

      {!!resolvedObject &&
        transform !== "none" &&
        window.triplex.env.mode === "default" &&
        !fg("immutable_transform_controls") && (
          <TransformControls
            enabled={
              /^[a-z]/.test(resolvedObject.meta.name)
                ? true
                : transforms[transform]
            }
            mode={transform}
            object={resolvedObject.object}
            onCompleteTransform={onCompleteTransformHandler}
            space={space}
          />
        )}

      {window.triplex.env.mode === "webxr" &&
        !!resolvedObject &&
        transform !== "none" && (
          <WebXRTransformHandles
            enabled={
              /^[a-z]/.test(resolvedObject.meta.name)
                ? true
                : transforms[transform]
            }
            mode={transform}
            object={resolvedObject.object}
            onChange={onChangeTransformHandler}
            onConfirm={onConfirmTransformHandler}
            space={space}
          />
        )}

      {window.triplex.env.mode === "default" &&
        camera?.type === "editor" &&
        resolvedObject?.object instanceof Camera && (
          <CameraPreview camera={resolvedObject.object} />
        )}

      {import.meta.env.VITE_TRIPLEX_ENV !== "test" &&
        window.triplex.env.mode === "default" && (
          // Disable the selection post processing in CI tests as they don't have GPUs.
          <SelectionIndicator />
        )}

      {window.triplex.env.mode === "webxr" && (
        <SelectionIndicatorLines hovered={hovered} selections={selections} />
      )}
    </SceneObjectContext.Provider>
  );
}
