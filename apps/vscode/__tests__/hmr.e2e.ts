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
    filename: "examples/test-fixture/src/controls.tsx",
  });

  /**
   * THIS IS A VERY IMPORTANT TEST DO NOT SKIP OR DELETE. IT PROVES TRIPLEX IS
   * WORKING FOR ITS CORE DEV LOOP.
   */
  test(
    "hmr is flushed when changing component props",
    { tag: "@vsce_smoke" },
    async ({ vsce }) => {
      test.skip(
        !!process.env.SMOKE_TEST && process.platform === "linux",
        `Skipped Linux when running smoke tests because it can't open new files and I couldn't fix it time boxed. Let's fix this in the future.`,
      );
      await vsce.codelens("TestHMR").click();
      const { panels, scene } = vsce.resolveEditor();
      await panels
        .getByRole("button", { name: "ComponentControlsTest" })
        .click();

      await panels.getByLabel("color", { exact: true }).selectOption("green");

      const element = scene.locator.getByTestId("component-props");
      await expect(element).toContainText(`"color":"green"`);
    },
  );

  test("hmr is flushed when changing externals", async ({
    setExternalFile,
    vsce,
  }) => {
    await vsce.codelens("TestHMRExternal").click();
    const { scene } = vsce.resolveEditor();

    await setExternalFile("examples/test-fixture/src/util/external.tsx", () => {
      return `
          export function color() {
            return "red" as const;
          }
        `;
    });

    const element = scene.locator.getByTestId("component-props");
    await expect(element).toContainText(`"color":"red"`);
  });
});
