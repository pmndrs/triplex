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
    filename: "examples/test-fixture/src/untyped.tsx",
  });

  test("untyped host element loads props", async ({ vsce }) => {
    await vsce.codelens("UntypedHostElement").click();
    const { panels } = await vsce.resolveEditor();

    await panels.getByRole("button", { name: "untyped_element" }).click();

    await expect(panels.getByText("This element has no props")).toBeVisible();
  });
});
