/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("focusing an element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();

  await editor.panels.getByRole("button", { name: "ambientLight" }).click();

  await expect(
    editor.panels.getByRole("button", { name: "ambientLight selected" }),
  ).toBeVisible();
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/lights.tsx",
  });

  test("focusing a light", async ({ vsce }) => {
    await vsce.codelens("PointLight").click();
    const { panels, scene } = vsce.resolveEditor();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "pointLight selected" }),
    ).toBeVisible();
  });
});

test("blurring an element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  await editor.panels.getByRole("button", { name: "ambientLight" }).click();
  await expect(
    editor.panels.getByRole("button", { name: "ambientLight" }),
  ).toHaveAccessibleName(/selected/);

  await vsce.page.keyboard.press("Escape");

  await expect(
    editor.panels.getByRole("button", { exact: true, name: "ambientLight" }),
  ).toBeVisible();
});

test("default component switcher to initially opened component", async ({
  vsce,
}) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();

  await expect(editor.panels.getByTestId("ElementSelect")).toHaveValue("Scene");
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

test("duplicating an element should be selected", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  await editor.panels.getByRole("button", { name: /Box/ }).click();
  await expect(
    editor.panels.getByRole("button", { name: /Box/ }),
  ).toHaveAccessibleName(/selected/);

  await vsce.page.keyboard.press("ControlOrMeta+D");

  const secondBoxElement = editor.panels
    .getByRole("button", { name: "Box" })
    .nth(1);
  await expect(secondBoxElement).toHaveAccessibleName(/selected/);
});

test.describe("react dom", () => {
  test.use({
    filename: "examples/test-fixture/src/component-roots.tsx",
  });

  test("selecting a host element", async ({ vsce }) => {
    await vsce.codelens("ReactRoot").click();
    const { panels, scene } = await vsce.resolveEditor();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "div" }),
    ).toHaveAccessibleName(/selected/);
    await expect(scene.locator.getByTestId("selected(div@16:5)")).toBeVisible();
  });

  test("selecting a custom component", async ({ vsce }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();
    const { panels, scene } = await vsce.resolveEditor();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "Button" }),
    ).toHaveAccessibleName(/selected/);
    await expect(
      scene.locator.getByTestId("selected(Button@23:10)"),
    ).toBeVisible();
  });

  test("hovering over a component", async ({ vsce }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();
    const { scene } = await vsce.resolveEditor();

    await scene.hover();

    await expect(
      scene.locator.getByTestId("hovered(Button@23:10)"),
    ).toBeVisible();
  });

  test("selection state is retained when exiting play mode", async ({
    vsce,
  }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();
    const { locator, scene } = await vsce.resolveEditor();

    await scene.click();
    await locator.getByRole("button", { exact: true, name: "Play" }).click();
    await locator.getByRole("button", { exact: true, name: "Stop" }).click();

    await expect(
      scene.locator.getByTestId("selected(Button@23:10)"),
    ).toBeVisible();
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/selection-edge-case.tsx",
  });

  test("selecting a host element inside a child custom component where both are rendered by the same component", async ({
    vsce,
  }) => {
    await vsce.codelens("UnknownCustomComponentResolvedHostElements").click();
    const { panels, scene } = await vsce.resolveEditor();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "mesh" }),
    ).toHaveAccessibleName(/selected/);
  });

  test("selecting a sprite", async ({ vsce }) => {
    await vsce.codelens("Sprites").click();
    const { panels, scene } = await vsce.resolveEditor();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "sprite" }),
    ).toHaveAccessibleName(/selected/);
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/meshes.tsx",
  });

  test("selecting a batched mesh", async ({ vsce }) => {
    await vsce.codelens("BatchedMeshScene").click();
    const { panels, scene } = await vsce.resolveEditor();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "batchedMesh" }),
    ).toHaveAccessibleName(/selected/);
  });

  test("selecting a instanced mesh", async ({ vsce }) => {
    await vsce.codelens("InstancedMeshScene").click();
    const { panels, scene } = await vsce.resolveEditor();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "Cloud" }),
    ).toHaveAccessibleName(/selected/);
  });
});
