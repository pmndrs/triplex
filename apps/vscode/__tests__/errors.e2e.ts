/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test.describe("when an error is thrown on render", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-on-render.tsx",
  });

  test("should show an error notification and then recover", async ({
    setFile,
    vsce,
  }) => {
    await vsce.codelens("ErrorsDuringRender", { skipWait: true }).click();
    await expect(
      vsce.page.getByRole("dialog", {
        name: /Render Error: Throwing an error on render./,
      }),
    ).toBeVisible();

    await setFile((file) => {
      const index = file.indexOf("throwsError(");
      return file.slice(0, index) + "// " + file.slice(index);
    });

    await expect(vsce.loadedComponent).toHaveText("ErrorsDuringRender");
  });
});

test.describe("when an error is thrown on missing module", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-missing-dependency.tsx",
  });

  test("should show an error notification and then recover", async ({
    setFile,
    vsce,
  }) => {
    await vsce
      .codelens("ErrorsDuringDependencyResolution", { skipWait: true })
      .click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: /Module Error: Failed to fetch/,
      }),
    ).toBeVisible();
    await expect(
      vsce.page.getByRole("dialog", {
        name: /Module Error: Failed to resolve/,
      }),
    ).toBeVisible();

    await setFile((file) => {
      const index = file.indexOf(`import "dont-`);
      return file.slice(0, index) + "// " + file.slice(index);
    });

    await expect(vsce.loadedComponent).toHaveText(
      "ErrorsDuringDependencyResolution",
    );
  });
});

test.describe("when an error is thrown during module initialization", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-module-scope.tsx",
  });

  test("should show an error notification", async ({ vsce }) => {
    await vsce.codelens("ErrorsDuringModuleInit", { skipWait: true }).click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: /Module Error: Throwing an error during module initialization./,
      }),
    ).toBeVisible();
  });
});

test.describe("when an error is thrown on interaction", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-on-interaction.tsx",
  });

  test("should show an error notification", async ({ vsce }) => {
    await vsce.codelens("ErrorsDuringInteraction").click();
    const { devOnlyCameraPanel, locator, scene } = await vsce.resolveEditor();
    await locator.getByRole("button", { exact: true, name: "Play" }).click();
    await expect(devOnlyCameraPanel).toHaveText(/name: default/);

    await scene.click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: /Unhandled Error: Throwing an error on interaction./,
      }),
    ).toBeVisible();
  });
});

test.describe("when an error is thrown during glsl compilation", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-glsl.tsx",
  });

  test("should show a notification for both vertex and fragment failures", async ({
    vsce,
  }) => {
    await vsce.codelens("GLSLErrorAll").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: /GLSL Error: Vertex and fragment shaders failed to compile/,
      }),
    ).toBeVisible();
  });

  test("should show a notification for vertex failure", async ({ vsce }) => {
    await vsce.codelens("GLSLErrorVertex").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: /GLSL Error: A vertex shader failed to compile because of the error/,
      }),
    ).toBeVisible();
  });

  test("should show a notification for fragment failure", async ({ vsce }) => {
    await vsce.codelens("GLSLErrorFragment").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: /GLSL Error: A fragment shader failed to compile because of the error/,
      }),
    ).toBeVisible();
  });
});

test.describe("when an error is thrown during glsl compilation (2)", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-glsl-fallback.tsx",
  });

  test("should show a notification for varying failure", async ({ vsce }) => {
    await vsce.codelens("GLSLErrorFallback").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: /GLSL Error: A shader failed to compile because of the error "FRAGMENT varying/,
      }),
    ).toBeVisible();
  });
});

test.describe("when an error is thrown resolving a renderer", () => {
  test.use({
    filename: "examples/error-renderer/src/examples/scene.tsx",
  });

  test("should show unrecoverable splash screen", async ({ vsce }) => {
    await vsce.codelens("Component", { skipWait: true }).click();
    const { locator } = vsce.resolveEditor();

    await expect(locator.getByTestId("ErrorSplash")).toHaveText(
      /An unexpected error occurred/,
      { ignoreCase: true },
    );
  });
});
