/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function evaluateNumericalExpression(expression: string): number | null {
  try {
    const func = new Function(`return ${expression}`);
    const result = func();

    if (
      typeof result === "number" &&
      !Number.isNaN(result) &&
      Number.isFinite(result)
    ) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}
