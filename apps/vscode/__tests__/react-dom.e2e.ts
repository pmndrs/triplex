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
    filename: "examples/react-only/src/app.tsx",
  });

  test(
    "opening a react-dom only project",
    { tag: "@vsce_smoke" },
    async ({ vsce }) => {
      test.skip(
        !!process.env.SMOKE_TEST && process.platform === "linux",
        `Skipped Linux when running smoke tests because it can't open new files and I couldn't fix it time boxed. Let's fix this in the future.`,
      );
      await vsce.codelens("ReactOnly").click();

      await expect(vsce.loadedComponent).toHaveText("ReactOnly");
    },
  );
});
