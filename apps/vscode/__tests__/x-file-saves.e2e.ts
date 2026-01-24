/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("updating component from another file", async ({ getFile, vsce }) => {
  await vsce.codelens("Scene").click();
  const { panels } = vsce.resolveEditor();

  // Focus the child element that lives in another file.
  await panels.getByRole("button", { name: "Show Children" }).click();
  await panels.getByRole("button", { name: "hello-world (mesh)" }).click();

  // Update one of the props of said element.
  const input = panels.getByLabel("scale");
  await input.fill("0.5");
  await input.press("Enter");
  await expect(input).toHaveValue("0.5");
  await expect(vsce.page.getByLabel("scene.tsx, Editor Group 2")).toHaveClass(
    /dirty/,
  );

  // Persist the changes to the file system.
  await vsce.page.keyboard.press("ControlOrMeta+S");
  await expect(
    vsce.page.getByLabel("scene.tsx, Editor Group 2"),
  ).not.toHaveClass(/dirty/);

  // Assert the expected changes were persisted.
  expect(getFile("examples/test-fixture/src/geometry/box.tsx")).toContain(
    "scale={0.5}",
  );
});

test("external update can be undone in the editor", async ({
  setFile,
  vsce,
}) => {
  test.skip(true, "This test is flakey and needs to be fixed.");
  await vsce.codelens("Plane").click();
  const { panels } = vsce.resolveEditor();
  await panels.getByRole("button", { name: "meshBasicMaterial" }).click();

  // Perform an external update
  await setFile((contents) =>
    contents.replace("visible={true}", "visible={false}"),
  );
  const input = panels.getByLabel("visible");
  await expect(input).not.toBeChecked();
  // Should remove dirty state
  await expect(
    vsce.page.getByLabel("scene.tsx, Editor Group 2"),
  ).not.toHaveClass(/dirty/);

  // Undo inside the editor back to the original state
  await vsce.page.keyboard.press("ControlOrMeta+Z");
  await expect(input).toBeChecked();
});
