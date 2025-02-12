/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("focus on the initial open tab", async ({ electron }) => {
  await expect(electron.fileTabs.activeTab).toHaveText("scene.tsx");
});

test("opening a new file should focus on new tab", async ({ electron }) => {
  await electron.newFile();

  await expect(electron.fileTabs.activeTab).toHaveText("untitled.tsx");
});

test("opening another file", async ({ electron }) => {
  await electron.openFileButton.click();

  await electron.fileDrawer.thumbnail("Box").click();

  await expect(electron.scenePanel.heading).toHaveText("Box");
});

test("fallback to first available tab when closing active tab", async ({
  electron,
}) => {
  await electron.newFile();
  await electron.newFile();
  await electron.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton } = electron.fileTabs.tab("untitled1.tsx");
  await closeButton.click();

  await expect(electron.fileTabs.activeTab).toHaveText("scene.tsx");
});

test("fallback to last active tab when closing active tab", async ({
  electron,
}) => {
  await electron.newFile();
  await electron.newFile();
  await electron.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton, locator } = electron.fileTabs.tab("untitled.tsx");
  await locator.click();
  await closeButton.click();

  await expect(electron.fileTabs.activeTab).toHaveText("untitled1.tsx");
});

test("do nothing when closing inactive tab", async ({ electron }) => {
  await electron.newFile();
  await electron.newFile();
  await electron.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton } = electron.fileTabs.tab("untitled.tsx");
  await closeButton.click();

  await expect(electron.fileTabs.activeTab).toHaveText("untitled1.tsx");
});

test("reopen tab", async ({ electron }) => {
  await electron.newFile();
  await electron.newFile();
  await electron.fileTabs.waitForActiveTab("untitled1.tsx");
  const { closeButton } = electron.fileTabs.tab("scene.tsx");
  await closeButton.click();

  await electron.fileTabs.openLastTabButton.click();

  await expect(electron.fileTabs.activeTab).toHaveText("scene.tsx");
  await expect(electron.fileTabs.locator).toHaveText(
    // scene.tsx should be first!
    "scene.tsxuntitled.tsxuntitled1.tsx",
  );
});

test("persist previously opened component when switching back to the tab", async ({
  electron,
}) => {
  await electron.switchToComponent("Plane");
  await electron.newFile();

  await electron.fileTabs.tab("scene.tsx").locator.click();

  await expect(electron.scenePanel.heading).toHaveText("Plane");
});
