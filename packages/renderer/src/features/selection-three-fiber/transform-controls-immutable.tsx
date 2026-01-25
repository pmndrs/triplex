/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  applyProps,
  createPortal,
  useFrame,
  type Instance,
} from "@react-three/fiber";
import { applyStepModifiers, useEvent, useStepModifiers } from "@triplex/lib";
import {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { MathUtils, Object3D, type Vector3Tuple } from "three";
import {
  TransformControls as TransformControlsImpl,
  type TransformControlsProps,
} from "triplex-drei";
import { Tunnel } from "../../components/tunnel";
import { strip } from "../../util/three";
import {
  ActiveCameraContext,
  CameraControlsContext,
} from "../camera-new/context";
import { type ResolvedObject3D } from "./resolver";

const steps = {
  rotate: {
    ctrl: MathUtils.degToRad(10),
    default: Math.PI / 180,
  },
  scale: { ctrl: 0.1, default: 0.01 },
  translate: { ctrl: 1, default: 0.01 },
};

const defaultTransforms = {
  position: [0, 0, 0] as Vector3Tuple,
  rotation: [0, 0, 0] as Vector3Tuple,
  scale: [1, 1, 1] as Vector3Tuple,
};

export type TransformMode = NonNullable<TransformControlsProps["mode"]>;

export interface TransformEvent {
  mode: TransformMode;
  value: Vector3Tuple;
}

function resolveTransformValue(
  object: Object3D,
  mode: TransformMode,
): Vector3Tuple {
  if (mode === "translate") {
    const position = object.position.toArray();
    return position.map(strip) as Vector3Tuple;
  } else if (mode === "rotate") {
    const rotation = object.rotation.toArray();
    rotation.pop();
    return rotation as Vector3Tuple;
  } else if (mode === "scale") {
    const scale = object.scale.toArray();
    return scale.map(strip) as Vector3Tuple;
  } else {
    throw new Error("invariant");
  }
}

export function TransformControls({
  enabled,
  mode,
  object,
  onChange,
  onConfirm,
  space,
}: {
  enabled?: boolean;
  mode: TransformMode;
  object: ResolvedObject3D;
  onChange?: (e: TransformEvent) => void;
  onConfirm?: (e: TransformEvent) => void;
  space?: TransformControlsProps["space"];
}) {
  const ref = useRef<Object3D>(null);
  const controls = useContext(CameraControlsContext);
  const camera = useContext(ActiveCameraContext);
  const modifiers = useStepModifiers({ isDisabled: !enabled });
  const [isDragging, setIsDragging] = useState(false);
  const [placeholder, setPlaceholder] = useState<Object3D>(
    () => new Object3D(),
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const callback = (event: { value: boolean }) => {
      if (controls) {
        // eslint-disable-next-line react-compiler/react-compiler
        controls.enabled = !event.value;
      }
    };

    const transformControls = ref.current;

    // @ts-expect-error — This event isn't typed.
    transformControls.addEventListener("dragging-changed", callback);

    return () => {
      // @ts-expect-error — This event isn't typed.
      transformControls.removeEventListener("dragging-changed", callback);
    };
  }, [controls]);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (isDragging && e.key === "Escape") {
        // TODO: Pressing escape should revert back to the original position/rotation/scale.
        // Right now we just block being able to de-select the current selection.
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", callback);

    return () => document.removeEventListener("keydown", callback);
  }, [isDragging]);

  const onMouseDownHandler = useEvent(() => {
    setIsDragging(true);
  });

  const onMouseUpHandler = useEvent(() => {
    setIsDragging(false);

    onConfirm?.({
      mode,
      value: resolveTransformValue(placeholder, mode),
    });
  });

  const onChangeHandler = useEvent(() => {
    onChange?.({
      mode,
      value: resolveTransformValue(placeholder, mode),
    });
  });

  useFrame(() => {
    if (isDragging) {
      return;
    }

    applyProps(placeholder as Instance["object"], {
      position:
        object.meta.props.current.position || defaultTransforms.position,
      rotation:
        object.meta.props.current.rotation || defaultTransforms.rotation,
      scale: object.meta.props.current.scale || defaultTransforms.scale,
    });
  });

  return (
    <>
      {import.meta.env.VITE_TRIPLEX_ENV === "test" && enabled && (
        <Tunnel.In>
          <button
            onMouseUp={(e) => {
              e.stopPropagation();

              placeholder.position.set(1, 1, 1);
              onConfirm?.({
                mode,
                value: resolveTransformValue(placeholder, mode),
              });
            }}
            style={{ left: 0, position: "absolute", top: "50%", zIndex: 999 }}
          >
            Test Translation
          </button>
        </Tunnel.In>
      )}

      <TransformControlsImpl
        camera={camera?.camera || undefined}
        enabled={enabled}
        mode={mode}
        object={placeholder}
        onMouseDown={onMouseDownHandler}
        onMouseUp={onMouseUpHandler}
        onObjectChange={onChangeHandler}
        ref={ref as RefObject<never>}
        rotationSnap={applyStepModifiers(steps.rotate, modifiers)}
        scaleSnap={applyStepModifiers(steps.scale, modifiers)}
        space={space}
        translationSnap={applyStepModifiers(steps.translate, modifiers)}
      />

      {object.object.parent && (
        <Fragment key={object.object.id}>
          {createPortal(
            <group ref={setPlaceholder} />,
            /**
             * It's important that the placeholder is rendered at the same scene
             * position as the object otherwise inherited transforms from
             * parents will end up being super whacky.
             */
            object.object.parent,
          )}
        </Fragment>
      )}
    </>
  );
}
