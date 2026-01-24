/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("webxr panel ready", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  const { locator } = vsce.resolveEditor();

  await locator.getByRole("button", { name: "Open in WebXR" }).click();

  await expect(locator.getByTestId("webxr-dialog-open-device")).toBeVisible();
});

test.describe(() => {
  test.use({
    filename: "examples/react-only/src/app.tsx",
  });

  test("webxr panel needs setup", async ({ vsce }) => {
    await vsce.codelens("ReactOnly").click();
    const { locator } = vsce.resolveEditor();

    await locator.getByRole("button", { name: "Open in WebXR" }).click();

    await expect(locator.getByTestId("webxr-dialog-needs-setup")).toBeVisible();
  });
});

test.describe(() => {
  test.use({
    contextOptions: { ignoreHTTPSErrors: true },
  });

  // TODO: Add smoke test once this is live
  test("webxr scene loads", async ({ page, vsce }) => {
    test.skip(
      process.platform === "win32",
      `Skipping on Windows / getting OpenXR + SSL errors and don't have time to fix right now`,
    );

    await vsce.codelens("Plane").click();
    const { locator } = vsce.resolveEditor();
    await locator.getByRole("button", { name: "Open in WebXR" }).click();

    const href = await locator
      .getByRole("link", { name: "Open in Browser Emulator" })
      .getAttribute("href");

    // eslint-disable-next-line playwright/prefer-web-first-assertions
    expect(href).toBeTruthy();
    await page.goto(href!);

    await expect(page.getByTestId("provider-props")).toBeAttached();
  });
});
