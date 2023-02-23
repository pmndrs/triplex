import { join } from "path";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { getExportName, getLocalName } from "../module";

describe("module", () => {
  it("should return the name of the direct default export function", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const actual = getExportName(sourceFile, "default");

    expect(actual).toEqual("Scene");
  });

  it("should return the name of the named function declaration", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const actual = getExportName(sourceFile, "SceneAlt");

    expect(actual).toEqual("SceneAlt");
  });

  it("should return the name of the named arrow function", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const actual = getExportName(sourceFile, "SceneArrow");

    expect(actual).toEqual("SceneArrow");
  });

  it("should return default as the import", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );

    const actual = getLocalName(sourceFile, "Box");

    expect(actual).toEqual({
      importName: "default",
    });
  });

  it("should return named import as the import", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );

    const actual = getLocalName(sourceFile, "Named");

    expect(actual).toEqual({
      importName: "Named",
    });
  });

  it("should return mapped named import as the import", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );

    const actual = getLocalName(sourceFile, "Remapped");

    expect(actual).toEqual({
      importName: "Named",
    });
  });

  it("should return in module name", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );

    const actual = getLocalName(sourceFile, "SceneAlt");

    expect(actual).toEqual({
      importName: "SceneAlt",
    });
  });
});
