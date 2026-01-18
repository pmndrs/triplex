/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

/** Converts an object to JSON while ensuring undefined values are preserved. */
export function stringifyJSON(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v,
  );
}

/** Parses JSON while handling preserved undefined values. */
export function parseJSON(value: string) {
  return JSON.parse(value, (_k, v) => (v === "__UNDEFINED__" ? undefined : v));
}

export function padLines(num: number) {
  return "".padEnd(num, "\n");
}

export function toPascalCase(str: string) {
  const pascal = str.replaceAll(/[ _-]([a-z])/g, (g) => g[1].toUpperCase());
  return pascal.charAt(0).toUpperCase() + pascal.slice(1);
}
