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
    filename: "examples/edge-cases/src/transforms.tsx",
  });

  test("translating a custom component", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { locator, panels, scene } = await vsce.resolveEditor();

    await panels
      .getByRole("button", { name: "TransformedInsideGroup" })
      .click();
    await locator.getByRole("button", { name: "Translate" }).click();
    await scene.locator.getByText("Test Translation").click();

    await expect(panels.getByPlaceholder("x")).toHaveValue("1");
    await expect(panels.getByPlaceholder("y")).toHaveValue("1");
    await expect(panels.getByPlaceholder("z")).toHaveValue("1");
  });
});
