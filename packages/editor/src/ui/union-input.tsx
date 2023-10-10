/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { SwitchIcon } from "@radix-ui/react-icons";
import type { Type } from "@triplex/server";
import { useState } from "react";
import { IconButton } from "../ds/button";
import { PropInput } from "./prop-input";

export function UnionInput({
  column,
  defaultValue,
  line,
  name,
  onChange,
  onConfirm,
  path,
  required,
  values,
}: {
  column?: number;
  defaultValue?: string | number;
  line?: number;
  name: string;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  path: string;
  required?: boolean;
  values: Type[];
}) {
  const [index, setIndex] = useState(0);
  const value = values[index % values.length];
  const incrementIndex = () => {
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-1">
        <PropInput
          column={column}
          line={line}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
          path={path}
          prop={
            Object.assign(
              {},
              value,
              defaultValue ? { value: defaultValue } : {}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any
          }
          required={required}
        />
      </div>
      <div className="self-start">
        <IconButton
          icon={SwitchIcon}
          onClick={incrementIndex}
          title="Switch prop type"
        />
      </div>
    </div>
  );
}
