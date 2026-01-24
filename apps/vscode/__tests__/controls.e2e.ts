/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("default to pointer", async ({ vsce }) => {
  await vsce.codelens("Scene").click();

  const panel = vsce.resolveEditor();

  await expect(
    panel.locator.getByRole("button", { name: "Select" }),
  ).toHaveAccessibleName("Select active");
});

test("switch to scale via click", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator.getByRole("button", { name: "Scale" }).click();

  await expect(
    panel.locator.getByRole("button", { name: "Scale" }),
  ).toHaveAccessibleName("Scale active");
});

test("switch to rotate via hotkey", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator.getByRole("button", { name: "Scale" }).press("r");

  await expect(
    panel.locator.getByRole("button", { name: "Rotate" }),
  ).toHaveAccessibleName("Rotate active");
});

test("lights set on load", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await expect(
    panel.locator.getByRole("button", { name: "Turn On Default Lights" }),
  ).toBeVisible();
  await expect(
    panel.scene.locator.getByTestId("scene-lights-off"),
  ).toBeVisible();
});

test("lights turned on", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator
    .getByRole("button", { name: "Turn On Default Lights" })
    .click();

  await expect(
    panel.scene.locator.getByTestId("scene-lights-on"),
  ).toBeVisible();
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/react-roots.tsx",
  });

  test("remove three fiber controls when switching to a no canvas component", async ({
    vsce,
  }) => {
    await vsce.codelens("CanvasExample").click();
    const { locator, panels } = vsce.resolveEditor();

    await panels.getByLabel("Switch component").selectOption("Button");

    await expect(
      locator.getByRole("button", { name: "Turn On Default Lights" }),
    ).toBeHidden();
  });
});
