/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import tinycolor from "tinycolor2";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";

export function ColorInput({
  defaultValue,
  name,
  onChange,
  onConfirm,
  required,
}: {
  defaultValue?: string;
  name: string;
  onChange: (value: string | undefined) => void;
  onConfirm: (value: string | undefined) => void;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const defaultValueColor = defaultValue ? tinycolor(defaultValue) : undefined;
  const defaultValueHex = defaultValueColor
    ? defaultValueColor.toHexString()
    : undefined;
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const cb = (e: Event) => {
      if (
        e.target instanceof HTMLInputElement &&
        defaultValueHex !== e.target.value
      ) {
        onConfirm(e.target.value);
      }
    };

    const element = ref.current;
    element.addEventListener("change", cb);

    return () => {
      element.removeEventListener("change", cb);
    };
  }, [defaultValueHex, onConfirm]);

  const onChangeHandler: FormEventHandler<HTMLInputElement> = (e) => {
    if (e.target instanceof HTMLInputElement) {
      setHasChanged(true);
      onChange(e.target.value);
    }
  };

  const clearInputValue = useCallback(() => {
    if (defaultValue !== undefined) {
      onChange(undefined);
      onConfirm(undefined);
      setHasChanged(false);
    }
  }, [defaultValue, onChange, onConfirm]);

  return (
    <div className="flex items-center gap-1">
      <div className="relative h-7 w-7">
        {!defaultValueHex && !hasChanged && (
          <div className="bg-checker pointer-events-none absolute inset-[3px] rounded-[3px] text-neutral-600 [background-size:20px]" />
        )}
        <input
          className="peer h-7 w-7 rounded-md bg-neutral-700 p-[3px] outline-none [color-scheme:dark]"
          data-testid={`color-${defaultValue}`}
          defaultValue={defaultValueHex}
          id={name}
          onChange={onChangeHandler}
          ref={ref}
          type="color"
        />
        <div
          className={cn([
            defaultValueColor?.isLight()
              ? // When it's light show dark interaction states
                "peer-hover:bg-black/10 peer-active:bg-black/20"
              : // When it's dark (or undefined) show light interaction states
                "peer-hover:bg-white/10 peer-active:bg-white/20",
            "pointer-events-none absolute inset-0 rounded-md",
          ])}
        />
      </div>
      {!required && defaultValue && (
        <IconButton
          className="opacity-50 group-hover:opacity-100"
          icon={Cross2Icon}
          onClick={clearInputValue}
          size="tight"
          title="Clear value"
        />
      )}
    </div>
  );
}
