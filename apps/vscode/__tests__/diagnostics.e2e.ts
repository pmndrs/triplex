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
    filename: "examples/test-fixture/src/geometry/syntax-error.tsx",
  });

  test("should show syntax error splash when opening", async ({ vsce }) => {
    await vsce.codelens("SyntaxError", { skipWait: true }).click();
    const { locator } = vsce.resolveEditor();

    await expect(locator.getByTestId("InvalidCodeSplash")).toHaveText(
      /There was an error parsing this file/,
    );
  });
});

test("should recover from initial syntax error", async ({
  getFile,
  setFile,
  vsce,
}) => {
  await setFile((file) => "%" + file);
  await vsce.codelens("Plane", { skipWait: true }).click();
  const { locator } = vsce.resolveEditor();

  await expect(locator.getByTestId("InvalidCodeSplash")).toHaveText(
    /There was an error parsing this file/,
  );
  // Don't continue until the file is flushed with the broken syntax
  await expect.poll(() => getFile()).toContain("%");

  await setFile((file) => file.replace("%", ""));

  await expect(locator.getByTestId("InvalidCodeSplash")).toBeHidden();
  await expect(vsce.loadedComponent).toHaveText("Plane");
});

test("should recover from subsequent syntax error", async ({
  getFile,
  setFile,
  vsce,
}) => {
  await vsce.codelens("Plane").click();
  const { locator } = vsce.resolveEditor();

  await setFile((file) => "%" + file);
  await expect(locator.getByTestId("InvalidCodeSplash")).toHaveText(
    /There was an error parsing this file/,
  );
  // Don't continue until the file is flushed with the broken syntax
  await expect.poll(() => getFile()).toContain("%");
  await setFile((file) => file.replace("%", ""));

  await expect(locator.getByTestId("InvalidCodeSplash")).toBeHidden();
  await expect(vsce.loadedComponent).toHaveText("Plane");
});

test(
  "should recover from component being unexported",
  { tag: "@vsce_smoke" },
  async ({ setFile, vsce }) => {
    await vsce.codelens("Plane").click();
    const { locator } = vsce.resolveEditor();

    await setFile((file) =>
      file.replace("export function Plane", "function Plane"),
    );
    await expect(locator.getByText("Component data was lost.")).toBeVisible();

    await setFile((file) =>
      file.replace("function Plane", "export function Plane"),
    );
    await expect(vsce.loadedComponent).toHaveText("Plane");
  },
);
