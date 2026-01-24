/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("play mode defaults to default camera", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/react-roots.tsx",
  });

  test("default to default camera for react root", async ({ vsce }) => {
    await vsce.codelens("CanvasExample").click();
    const panel = vsce.resolveEditor();

    await expect(panel.devOnlyCameraPanel).toHaveText(/name: default/);
  });
});

test("default to editor camera for three fiber root", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await expect(panel.devOnlyCameraPanel).toHaveText(
    /name: triplex_perspective/,
  );
});

test("switch to play mode and back", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();
  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await panel.locator
    .getByRole("button", { exact: true, name: "Stop" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(
    /name: triplex_perspective/,
  );
});
