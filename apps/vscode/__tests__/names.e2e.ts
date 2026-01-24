/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/names.tsx",
  });

  test("host element with a name", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { panels } = vsce.resolveEditor();

    await expect(panels.getByRole("button", { name: "plane1" })).toBeVisible();
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/names.tsx",
  });

  test("custom element with a name", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { panels } = vsce.resolveEditor();

    await expect(panels.getByRole("button", { name: "box1" })).toBeVisible();
  });
});
