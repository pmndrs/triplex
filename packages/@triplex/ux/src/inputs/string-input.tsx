/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { noop, useEvent } from "@triplex/lib";
import {
  useEffect,
  useRef,
  type FocusEventHandler,
  type KeyboardEventHandler,
} from "react";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

export function StringInput({
  actionId,
  children,
  defaultValue = "",
  label,
  name,
  onChange = noop,
  onConfirm = noop,
  persistedValue,
  required,
}: {
  actionId: ActionIdSafe;
  children: RenderInput<{
    defaultValue: string | undefined;
    onBlur: FocusEventHandler<HTMLInputElement>;
    onKeyDown: KeyboardEventHandler<HTMLInputElement>;
    placeholder?: string;
  }>;
  defaultValue?: string;
  label?: string;
  name: string;
  onChange?: (value: string | undefined) => void;
  onConfirm?: (value: string | undefined) => void;
  persistedValue?: string;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null!);
  const telemetry = useTelemetry();
  const actualValue = persistedValue ?? defaultValue;

  useEffect(() => {
    ref.current.value = actualValue;
  }, [actualValue]);

  const onChangeHandler = useEvent(() => {
    const nextValue = ref.current.value || undefined;
    if (nextValue === undefined && required) {
      // Ignore calling back if it's required
      return;
    }

    onChange(nextValue);
  });

  const onConfirmHandler = useEvent(() => {
    const nextValue = ref.current.value || undefined;
    if (nextValue === undefined && required) {
      // Ignore calling back if it's required
      return;
    }

    if (persistedValue !== nextValue) {
      onConfirm(nextValue);
      telemetry.event(`${actionId}_confirm`);
    }
  });

  const onClear = useEvent(() => {
    onChange(undefined);
    onConfirm(undefined);
  });

  const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = useEvent(
    (e) => {
      if (e.key === "Enter") {
        ref.current.blur();
      }
    },
  );

  return children(
    // Waiting to hear back if this is a false positive.
    // See: https://github.com/reactwg/react-compiler/discussions/32
    // eslint-disable-next-line react-compiler/react-compiler
    {
      defaultValue: actualValue,
      id: name,
      onBlur: onConfirmHandler,
      onChange: onChangeHandler,
      onKeyDown: onKeyDownHandler,
      placeholder: label ? `${label} (string)` : "string",
      ref,
      required,
    },
    {
      clear: onClear,
    },
  );
}
