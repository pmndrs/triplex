/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import {
  test as base,
  _electron as electron,
  type Electron,
  type ElectronApplication,
  type Page,
  type WorkerInfo,
} from "@playwright/test";
import { resolveCliArgsFromVSCodeExecutablePath } from "@vscode/test-electron";
import { resolveExecPath, runUseWithTrace } from "../../../../test/playwright";
import pkg from "../../package.json";
import { ExtensionPage } from "./po";

async function tryInstallBundledExtension() {
  const executablePath = await resolveExecPath();
  const [cli, ...args] =
    await resolveCliArgsFromVSCodeExecutablePath(executablePath);

  spawnSync(
    cli,
    [
      ...args,
      "--install-extension",
      join(__dirname, "..", "..", "out", `${pkg.name}-${pkg.version}.vsix`),
    ],
    {
      encoding: "utf8",
      // "shell: true" is needed so this works on Windows otherwise it fails silently.
      shell: process.platform === "win32",
      stdio: "inherit",
    },
  );
}

async function openFile({ filename }: { filename: string }) {
  const executablePath = await resolveExecPath();
  const [cli, ...args] =
    await resolveCliArgsFromVSCodeExecutablePath(executablePath);

  const { status } = spawnSync(
    cli,
    [...args, join(process.cwd(), filename), "--reuse-window"],
    {
      encoding: "utf8",
      // "shell: true" is needed so this works on Windows otherwise it fails silently.
      shell: process.platform === "win32",
      stdio: "inherit",
    },
  );

  if (status !== null && status !== 0) {
    throw new Error(`invariant: failed to open ${filename} in VS Code.`);
  }
}

const launchElectronWithRetry = async (
  opts: Parameters<Electron["launch"]>[0],
  retries = 2,
): ReturnType<Electron["launch"]> => {
  try {
    return await electron.launch(opts);
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    const nextMs = (1 / retries) * 2000;

    // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
    console.log((error as any).error);
    // eslint-disable-next-line no-console
    console.log(
      `Failed to launch electron, retrying ${retries} times in ${nextMs}ms...`,
    );

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, nextMs),
    );

    return launchElectronWithRetry(opts, retries - 1);
  }
};

async function launch({
  fg,
  workerInfo,
}: {
  fg: Record<string, boolean>;
  workerInfo: WorkerInfo;
}) {
  const isSmokeTest =
    process.env.SMOKE_TEST &&
    (Array.isArray(workerInfo.config.grep)
      ? false
      : workerInfo.config.grep.test("_smoke"));

  if (isSmokeTest) {
    await tryInstallBundledExtension();
  }

  const logs: string[] = [];
  const executablePath = await resolveExecPath();
  const [, ...args] =
    await resolveCliArgsFromVSCodeExecutablePath(executablePath);
  const app = await launchElectronWithRetry({
    args: [
      ...args,
      join(process.cwd(), "examples/test-fixture"),
      join(process.cwd(), "examples/test-fixture/src/scene.tsx"),
      process.env.CI ? "--headless" : "",
      // Args found from https://github.com/microsoft/playwright/issues/22351
      "--disable-gpu-sandbox", // https://github.com/microsoft/vscode-test/issues/221
      "--disable-updates", // https://github.com/microsoft/vscode-test/issues/120
      "--disable-workspace-trust",
      ...(isSmokeTest
        ? []
        : [
            "--disable-extensions",
            "--profile-temp", // "debug in a clean environment",
            "--extensionDevelopmentPath=" + join(__dirname, "..", ".."),
          ]),
      "--new-window", // Opens a new session of VS Code instead of restoring the previous session (default).
      "--no-sandbox", // https://github.com/microsoft/vscode/issues/84238
      "--skip-welcome",
      "--skip-release-notes",
      "--enable-coi",
    ],
    env: {
      ...process.env,
      ...(process.env.SMOKE_TEST ? {} : { FG_ENVIRONMENT_OVERRIDE: "local" }),
      VITE_FG_OVERRIDES: JSON.stringify(fg),
      VITE_TRIPLEX_ENV: "test",
    },
    executablePath,
  });

  const window = await app.firstWindow();

  app
    .process()
    .stdout!.on("data", (msg) => logs.push("[main:log] " + msg.toString()));

  app
    .process()
    .stderr!.on("data", (error) =>
      logs.push("[main:error] " + error.toString()),
    );

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

const test = base.extend<
  {
    filename: string;
    getFile: (path?: string) => string;
    setExternalFile: (
      filename: string,
      cb: (contents: string) => string,
    ) => Promise<void>;
    setFile: (cb: (contents: string) => string) => Promise<void>;
    vsce: ExtensionPage;
  },
  {
    fg: Record<string, boolean>;
    vscode: {
      app: ElectronApplication;
      logs: string[];
      window: Page;
    };
  }
>({
  fg: [{}, { option: true, scope: "worker" }],
  filename: ["examples/test-fixture/src/scene.tsx", { option: true }],
  getFile: async ({ filename }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use((path) =>
      readFileSync(join(process.cwd(), path ?? filename), "utf8"),
    );
  },
  setExternalFile: async ({ getFile }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(async (filename, cb) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await writeFile(join(process.cwd(), filename), cb(getFile(filename)));
    });
  },
  setFile: async ({ filename, getFile }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(async (cb) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await writeFile(join(process.cwd(), filename), cb(getFile()));
    });
  },
  vsce: async ({ filename, vscode }, use, testInfo) => {
    const { status } = spawnSync("git diff --exit-code examples", {
      shell: true,
    });

    if (status !== null && status !== 0) {
      throw new Error(
        "invariant: unstaged changes inside examples need to be resolved before running tests",
      );
    }

    const page = new ExtensionPage(
      vscode.window,
      basename(filename),
      filename.split("/")[1],
    );

    await openFile({ filename });
    await runUseWithTrace({ logs: vscode.logs, page, testInfo, use });

    if (testInfo.status !== "skipped") {
      // Close the editor to avoid the "Do you want to save changes?" dialog.
      await page.page.keyboard.press("Escape");
      await page.page.keyboard.press("ControlOrMeta+Shift+P");
      await page.page
        .getByPlaceholder("Type the name of a command")
        .fill("> Revert and Close Editor");
      await page.page.keyboard.press("Enter");
    }

    // Cleanup any files created or modified by the test.
    spawnSync("git checkout examples examples", { shell: true });
  },
  vscode: [
    async ({ fg }, use, workerInfo) => {
      const vscode = await launch({ fg, workerInfo });
      await use(vscode);
      await vscode.app.close();
    },
    { scope: "worker" },
  ],
});

export function overrideFg(key: string, value: boolean) {
  test.use({
    fg: {
      [key]: value,
    },
  });
}

export { test };
