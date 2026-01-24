/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/* eslint-disable no-console */
/* eslint-disable no-empty-pattern */
import { join } from "node:path";
import { test as _test, _electron as electron, expect } from "@playwright/test";
import { runUseWithTrace } from "../../../../test/playwright";
import { EditorPage } from "./po";

function getExecPath() {
  const platform = process.platform;
  const paths: Record<string, [string, string]> = {
    darwin: [
      "apps/electron/targets/mac-arm64/Triplex.app/Contents/MacOS/Triplex",
      "apps/electron/targets/mac-arm64/Triplex.app/Contents/Resources/app",
    ],
    linux: [
      "apps/electron/targets/linux-unpacked/triplex-electron",
      "apps/electron/targets/linux-unpacked/resources/app",
    ],
    win32: [
      "apps/electron/targets/win-unpacked/Triplex.exe",
      "apps/electron/targets/win-unpacked/resources/app",
    ],
  };

  if (!paths[platform]) {
    throw new Error('Unsupported platform: "' + platform + '"');
  }

  const [execPath, cwd] = paths[platform];

  return {
    cwd: join(process.cwd(), cwd),
    path: join(process.cwd(), execPath),
  };
}

async function launch(
  textFixturePath: string,
  opts: {
    exportName: string;
    path: string;
  },
) {
  const path = getExecPath();
  const logs: string[] = [];

  const app = await electron.launch({
    args: [
      process.env.SMOKE_TEST ? "" : join(__dirname, "../..", "hook-main.js"),
      process.env.CI ? "--headless" : "",
      "--enable-unsafe-swiftshader",
      "--disable-gpu-sandbox",
    ],
    cwd: process.env.SMOKE_TEST ? "/" : join(__dirname, "../.."),
    env: {
      ...process.env,
      ...(process.env.SMOKE_TEST ? {} : { FG_ENVIRONMENT_OVERRIDE: "local" }),
      FORCE_EDITOR_TEST_FIXTURE: join(process.cwd(), textFixturePath),
      FORCE_EXPORT_NAME: opts.exportName,
      FORCE_PATH: opts.path,
      VITE_TRIPLEX_ENV: "test",
    },
    executablePath: process.env.SMOKE_TEST ? path.path : undefined,
  });

  app
    .process()
    .stdout!.on("data", (msg) => logs.push("[main:log] " + msg.toString()));

  app
    .process()
    .stderr!.on("data", (error) =>
      logs.push("[main:error] " + error.toString()),
    );

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // NOTE: During the test run we skip the welcome window.
  // Look for "FORCE_EDITOR_TEST_FIXTURE" env var.
  const window = await app.firstWindow();

  window.on("console", (msg) => {
    logs.push(`[renderer:${msg.type()}] ${msg.text()}`);
  });

  window.on("pageerror", (msg) => {
    logs.push("[renderer:error] " + msg.name + " " + msg.message);
  });

  return {
    app,
    logs,
    window,
  };
}

const test = _test.extend<{
  /**
   * Defaults to the react-three-fiber project folder. Use the `file` option to
   * specify a different project and file/component to open.
   */
  electron: EditorPage;
  file: { exportName: string; path: string; project?: string };
}>({
  electron: async ({ file }, use, testInfo) => {
    const { app, logs, window } = await launch(
      file.project || "examples/test-fixture",
      file,
    );
    const page = new EditorPage(window, testInfo);

    await expect(page.loadedComponent).toHaveText(file.exportName);

    await runUseWithTrace({ logs, page, testInfo, use });

    await app.close();
  },
  file: [
    {
      exportName: "Scene",
      path: "src/scene.tsx",
    },
    { option: true },
  ],
});

export { test };
