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

  test("component with canvas component and sibling HTML", async ({ vsce }) => {
    await vsce.codelens("CanvasExample").click();
    const { scene } = vsce.resolveEditor();

    await expect(
      scene.locator.getByText("HTML CONTENT OUTSIDE CANVAS"),
    ).toBeVisible();
  });

  test("focusing three element then dom element", async ({ vsce }) => {
    await vsce.codelens("CanvasExample").click();
    const { panels } = vsce.resolveEditor();

    await panels.getByRole("button", { exact: true, name: "mesh" }).click();
    await expect(
      panels.getByRole("button", { name: "selected" }),
    ).toHaveAccessibleName(/mesh/);

    await panels.getByRole("button", { exact: true, name: "div" }).click();
    await expect(
      panels.getByRole("button", { name: "selected" }),
    ).toHaveAccessibleName(/div/);
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/component-roots.tsx",
  });

  test("component with three react root from another module", async ({
    vsce,
  }) => {
    await vsce.codelens("ThreeFiberRootFromAnotherModule").click();

    await expect(vsce.loadedComponent).toHaveText(
      "ThreeFiberRootFromAnotherModule",
    );
  });

  test("component with react root", async ({ vsce }) => {
    await vsce.codelens("ReactRoot").click();
    const { scene } = vsce.resolveEditor();

    await expect(scene.locator.getByTestId("react-root")).toBeVisible();
  });

  test("component with react root from another module", async ({ vsce }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();
    const { scene } = vsce.resolveEditor();

    await expect(scene.locator.getByRole("button")).toBeVisible();
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/selection-edge-case.tsx",
  });

  test("unknown custom component but resolved host elements", async ({
    vsce,
  }) => {
    await vsce.codelens("UnknownCustomComponentResolvedHostElements").click();

    await expect(vsce.loadedComponent).toHaveText(
      `UnknownCustomComponentResolvedHostElements`,
    );
  });
});
