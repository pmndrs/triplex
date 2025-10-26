/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type CSSProperties } from "react";

export interface RawCodeExpression {
  __expr: string;
}

export function isRawCodeExpression(
  value: unknown,
): value is RawCodeExpression {
  return Boolean(value && typeof value === "object" && "__expr" in value);
}

export function toJSONString(value: unknown): string {
  // Handle RawCodeExpression at the root level first
  if (isRawCodeExpression(value)) {
    return value.__expr;
  }

  const str = JSON.stringify(value, (_k, v) => {
    if (v === undefined) {
      return "__UNDEFINED__";
    }
    // Handle raw code expressions in nested values
    if (isRawCodeExpression(v)) {
      return `__EXPR__${v.__expr}__EXPR__`;
    }
    return v;
  });

  return str
    .replaceAll('"__UNDEFINED__"', "undefined")
    .replaceAll(/"__EXPR__(.*?)__EXPR__"/g, "$1");
}

export function kebabCase(str: string): string {
  return str.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function style(styles: CSSProperties): string {
  return Object.entries(styles).reduce((acc, [key, value]) => {
    return `${acc}${kebabCase(key)}:${value};`;
  }, "");
}
