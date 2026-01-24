/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("resizing the scene panel", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  const splitter = editor.locator.getByTestId("panel-drag-handle");

  const initialStyle = await editor.panels.getAttribute("style");

  await splitter.dragTo(editor.locator.getByRole("button", { name: "Select" }));

  await expect(editor.panels).not.toHaveAttribute("style", initialStyle || "");
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/controls.tsx",
  });

  test("component controls updates prop value", async ({ vsce }) => {
    await vsce.codelens("ComponentControlsTest").click();
    const { componentControlsButtons, panels, scene } = vsce.resolveEditor();
    await componentControlsButtons.open.click();
    const input = panels.getByLabel("color", { exact: true });

    await input.selectOption("green");

    const element = scene.locator.getByTestId("component-props");
    await expect(element).toContainText(`"color":"green"`);
  });
});
