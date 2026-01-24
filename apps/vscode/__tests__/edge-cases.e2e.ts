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
    filename: "examples/test-fixture/src/scroll-drei.tsx",
  });

  test("scroll controls loads", async ({ vsce }) => {
    await vsce.codelens("ScrollTestFixture").click();

    await expect(vsce.loadedComponent).toHaveText("ScrollTestFixture");
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/sab.tsx",
  });

  test(
    "shared array buffers load without errors",
    { tag: "@vsce_smoke" },
    async ({ vsce }) => {
      test.skip(
        !!process.env.SMOKE_TEST && process.platform === "linux",
        `Skipped Linux when running smoke tests because it can't open new files and I couldn't fix it time boxed. Let's fix this in the future.`,
      );
      await vsce.codelens("SharedArrayBufferTest").click();

      await expect(vsce.loadedComponent).toHaveText("SharedArrayBufferTest");
    },
  );
});

test.describe(() => {
  test.use({
    filename: "examples/no-config/src/scene.jsx",
  });

  test(
    "opening js only no config no tsconfig",
    { tag: "@vsce_smoke" },
    async ({ vsce }) => {
      test.skip(
        !!process.env.SMOKE_TEST && process.platform === "linux",
        `Skipped Linux when running smoke tests because it can't open new files and I couldn't fix it time boxed. Let's fix this in the future.`,
      );
      await vsce.codelens("JSOnly").click();
      const { panels } = vsce.resolveEditor();

      await panels.getByRole("button", { name: "ambientLight" }).click();

      await expect(panels.getByLabel("position")).toBeVisible();
    },
  );
});

test.describe(() => {
  test.use({
    filename: "examples/js/src/scene.jsx",
  });

  test(
    "opening js only no tsconfig",
    { tag: "@vsce_smoke" },
    async ({ vsce }) => {
      test.skip(
        !!process.env.SMOKE_TEST && process.platform === "linux",
        `Skipped Linux when running smoke tests because it can't open new files and I couldn't fix it time boxed. Let's fix this in the future.`,
      );
      await vsce.codelens("JSOnlyConfig").click();
      const { panels } = vsce.resolveEditor();

      await panels.getByRole("button", { name: "ambientLight" }).click();

      await expect(panels.getByLabel("position")).toBeVisible();
    },
  );
});

test.describe(() => {
  test.use({
    filename: "examples/missing-deps/src/app.tsx",
  });

  test("missing dependencies splash screen", async ({ vsce }) => {
    const { locator } = vsce.resolveEditor();
    await vsce.codelens("MissingCriticalDeps", { skipWait: true }).click();

    await expect(locator.getByTestId("DepsToInstall")).toHaveText(
      "pnpm i @react-three/fiber react react-dom three",
    );
  });
});

test.describe(() => {
  test.use({
    filename: "examples/missing-deps-deno/src/app.tsx",
  });

  test("missing deno deps shows arg", async ({ vsce }) => {
    const { locator } = vsce.resolveEditor();
    await vsce.codelens("MissingCriticalDeps", { skipWait: true }).click();

    await expect(locator.getByTestId("DepsToInstall")).toHaveText(
      "deno i react react-dom --npm",
    );
  });
});
