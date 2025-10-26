/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type RawCodeExpression } from "@triplex/lib";
import { evaluateNumericalExpression } from "@triplex/lib/math";
import { useCallback, useState } from "react";
import { type ActionIdSafe } from "../telemetry";
import { NumberInput } from "./number-input";
import { StringInput } from "./string-input";
import { type RenderInput } from "./types";

type Mode = "number" | "expression";

interface NumberOrExpressionInputProps {
  actionId: ActionIdSafe;
  children: RenderInput<
    {
      defaultValue: number | string | undefined;
      max?: number;
      min?: number;
      placeholder?: string;
    },
    HTMLInputElement,
    {
      clear: () => void;
      isActive?: boolean;
      mode: Mode;
      shouldFocus: boolean;
      toggle: () => void;
    }
  >;
  defaultValue?: number;
  label?: string;
  max?: number;
  min?: number;
  name: string;
  onChange: (value: number | string | undefined) => void;
  onConfirm: (value: number | string | RawCodeExpression | undefined) => void;
  persistedValue?: number | string;
  pointerMode?: "capture" | "lock";
  required?: boolean;
  step?: number;
  testId?: string;
  transformValue?: {
    in: (value: number | undefined) => number | undefined;
    out: (value: number | undefined) => number | undefined;
  };
}

/**
 * A number input that can toggle between numeric input mode and code input
 * mode. In expression mode, users can enter mathematical expressions like
 * "Math.PI / 2" or "Math.sqrt(2)"
 */
export function NumberOrExpressionInput({
  actionId,
  children,
  defaultValue,
  label,
  max,
  min,
  name,
  onChange,
  onConfirm,
  persistedValue,
  pointerMode = "lock",
  required,
  step,
  testId,
  transformValue,
}: NumberOrExpressionInputProps) {
  const getInitialMode = (): Mode => {
    if (typeof persistedValue === "string") {
      return "expression";
    }
    return "number";
  };

  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [shouldFocus, setShouldFocus] = useState(false);

  const handleExpressionChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        onChange(undefined);
        return;
      }

      // For live preview, pass the evaluated number
      const evaluated = evaluateNumericalExpression(value);
      if (evaluated !== null) {
        onChange(evaluated);
      }
    },
    [onChange],
  );

  const handleExpressionConfirm = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        onConfirm(undefined);
        return;
      }

      // For saving, wrap the expression in a RawCodeExpression because we don't want it to be interpreted as a regular string
      const evaluated = evaluateNumericalExpression(value);
      if (evaluated !== null) {
        onConfirm({ __expr: value });
      }
    },
    [onConfirm],
  );

  const toggleMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "number" ? "expression" : "number"));
    setShouldFocus(true);
  }, []);

  const handleClear = useCallback(() => {
    onChange(undefined);
    onConfirm(undefined);
  }, [onChange, onConfirm]);

  if (mode === "number") {
    return (
      <NumberInput
        actionId={actionId}
        defaultValue={defaultValue}
        label={label}
        max={max}
        min={min}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={
          typeof persistedValue === "number" ? persistedValue : undefined
        }
        pointerMode={pointerMode}
        required={required}
        step={step}
        testId={testId}
        transformValue={transformValue}
      >
        {(inputProps, inputActions) =>
          children(inputProps, {
            clear: handleClear,
            isActive: inputActions.isActive,
            mode,
            shouldFocus,
            toggle: toggleMode,
          })
        }
      </NumberInput>
    );
  }

  const expressionPersistedValue =
    typeof persistedValue === "string"
      ? persistedValue
      : typeof persistedValue === "number"
        ? String(persistedValue)
        : undefined;

  return (
    <StringInput
      actionId={actionId}
      defaultValue={expressionPersistedValue}
      label={label}
      name={name}
      onChange={handleExpressionChange}
      onConfirm={handleExpressionConfirm}
      persistedValue={
        typeof persistedValue === "string" ? persistedValue : undefined
      }
      required={required}
    >
      {(inputProps) =>
        children(inputProps, {
          clear: handleClear,
          isActive: false,
          mode,
          shouldFocus,
          toggle: toggleMode,
        })
      }
    </StringInput>
  );
}
