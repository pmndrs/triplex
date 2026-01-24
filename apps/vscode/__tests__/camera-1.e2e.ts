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
    filename: "examples/test-fixture/src/react-roots.tsx",
  });

  test("switch to editor camera when viewing react-dom component", async ({
    vsce,
  }) => {
    await vsce.codelens("CanvasExample").click();
    const panel = vsce.resolveEditor();

    await expect(panel.devOnlyCameraPanel).toHaveText(/name: default/);

    await panel.locator
      .getByRole("combobox", { name: "Settings" })
      .selectOption("Use Editor Camera");

    await expect(panel.devOnlyCameraPanel).toHaveText(
      /name: triplex_perspective/,
    );
  });
});

test("switch to play mode and toggle to editor camera", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();
  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await panel.locator
    .getByRole("combobox", { name: "Settings" })
    .selectOption("Use Editor Camera");

  await expect(panel.devOnlyCameraPanel).toHaveText(
    /name: triplex_perspective/,
  );
});

test("toggle to default camera and switch to play mode", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();
  await panel.locator
    .getByRole("combobox", { name: "Settings" })
    .selectOption("Use Default Camera");
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);
});

test("jump to element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  await editor.panels.getByRole("button", { name: "ambientLight" }).click();
  await expect(
    editor.panels.getByRole("button", { name: "ambientLight" }),
  ).toHaveAccessibleName(/selected/);

  await vsce.page.keyboard.press("f");

  await expect(editor.devOnlyCameraPanel).toHaveText(/pos: 2\.12,0,-0\.88/);
});

test("camera preview when focused", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();

  await editor.panels.getByRole("button", { name: "user_defined" }).click();

  await expect(editor.scene.locator.getByTestId("CameraPreview")).toHaveText(
    "user_defined",
  );
});
