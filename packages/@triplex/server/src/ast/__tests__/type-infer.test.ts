/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";
import { describe, expect, it } from "vitest";
import { getJsxElementAt, getJsxElementAtOrThrow } from "../jsx";
import { _createProject } from "../project";
import { getFunctionPropTypes, getJsxElementPropTypes } from "../type-infer";

describe("type infer", () => {
  it("should disable transforms if controlled in code", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/named.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 17, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { transforms } = getJsxElementPropTypes(sceneObject);

    expect(transforms).toEqual({
      rotate: false,
      scale: false,
      translate: false,
    });
  });

  it("should return types of a imported component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 17, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 9,
          "description": undefined,
          "group": "Other",
          "kind": "tuple",
          "line": 18,
          "name": "position",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
          ],
          "tags": {},
          "value": [
            0.9223319881614562,
            0,
            4.703084245305494,
          ],
          "valueKind": "array",
        },
        {
          "column": 9,
          "description": undefined,
          "group": "Other",
          "kind": "tuple",
          "line": 19,
          "name": "rotation",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
          ],
          "tags": {},
          "value": [
            1.660031347769923,
            -0.07873115868670048,
            -0.7211124466452248,
          ],
          "valueKind": "array",
        },
        {
          "description": undefined,
          "group": "Other",
          "kind": "union",
          "name": "scale",
          "required": false,
          "shape": [
            {
              "kind": "number",
            },
            {
              "kind": "tuple",
              "shape": [
                {
                  "kind": "number",
                  "label": "x",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "y",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "z",
                  "required": true,
                },
              ],
            },
          ],
          "tags": {},
        },
      ]
    `);
  });

  it("should return types of a local component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 26, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sceneObject);

    expect(types.props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
          "group": "Other",
          "kind": "string",
          "name": "color",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  it("should not throw when extracting types from typedef jsx", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sceneObject);

    expect(Object.keys(types).length).toBeTruthy();
  });

  it("should get the jsx tag of a jsx element with children", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/variables.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 44, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 35,
          "description": undefined,
          "group": "Form",
          "kind": "boolean",
          "line": 44,
          "name": "value",
          "required": true,
          "tags": {},
          "value": "null",
          "valueKind": "unhandled",
        },
        {
          "column": 9,
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "line": 45,
          "name": "children",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "boolean",
              "literal": false,
            },
          ],
          "tags": {},
          "value": "{children}",
          "valueKind": "unhandled",
        },
      ]
    `);
  });

  it("should not blow up extracting same file types", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 34, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    expect(() => getJsxElementPropTypes(sceneObject)).not.toThrow();
  });

  it("should extract args", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props.find((type) => type.name === "args")).toMatchInlineSnapshot(`
      {
        "description": undefined,
        "group": "Constructor",
        "kind": "tuple",
        "name": "args",
        "required": false,
        "shape": [
          {
            "kind": "number",
            "label": "width",
            "required": false,
          },
          {
            "kind": "number",
            "label": "height",
            "required": false,
          },
          {
            "kind": "number",
            "label": "depth",
            "required": false,
          },
        ],
        "tags": {},
      }
    `);
  });

  it("should infer host component types", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 30, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const propTypes = getJsxElementPropTypes(sceneObject);

    expect(Object.keys(propTypes).length).toBeGreaterThan(0);
  });

  it("should remove duplicate values from union", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 30, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props.find((type) => type.name === "scale")).toMatchInlineSnapshot(`
      {
        "description": "The object's local scale.",
        "group": "Transform",
        "kind": "union",
        "name": "scale",
        "required": false,
        "shape": [
          {
            "kind": "number",
          },
          {
            "kind": "tuple",
            "shape": [
              {
                "kind": "number",
                "label": "x",
                "required": true,
              },
              {
                "kind": "number",
                "label": "y",
                "required": true,
              },
              {
                "kind": "number",
                "label": "z",
                "required": true,
              },
            ],
          },
        ],
        "tags": {
          "defaultValue": "\`new THREE.Vector3( 1, 1, 1 )\`",
        },
      }
    `);
  });

  it("should collect meta from jsdoc", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/meta.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 41, 10);

    const { props } = getJsxElementPropTypes(sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 21,
          "description": undefined,
          "group": "Other",
          "kind": "number",
          "line": 41,
          "name": "posX",
          "required": true,
          "tags": {
            "another": true,
            "max": 10,
            "min": -10,
            "test": "yes",
          },
          "value": 5,
          "valueKind": "number",
        },
      ]
    `);
  });

  it("should sort union types to match the defined tuple value", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/union-type-sorting.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 8, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const prop = props.find((type) => type.name === "position");

    expect(prop && prop.kind === "union" && prop.shape[0])
      .toMatchInlineSnapshot(`
        {
          "kind": "tuple",
          "shape": [
            {
              "kind": "number",
              "label": "x",
              "required": true,
            },
            {
              "kind": "number",
              "label": "y",
              "required": true,
            },
            {
              "kind": "number",
              "label": "z",
              "required": true,
            },
          ],
        }
      `);
  });

  it("should sort union types to match the defined number value", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/union-type-sorting.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 12, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const prop = props.find((type) => type.name === "position");

    expect(prop && prop.kind === "union" && prop.shape[0])
      .toMatchInlineSnapshot(`
        {
          "kind": "number",
        }
      `);
  });

  it("should sort union types to match the defined string value", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/union-type-sorting.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 20, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const prop = props.find((type) => type.name === "value");

    expect(prop && prop.kind === "union" && prop.shape[0])
      .toMatchInlineSnapshot(`
        {
          "kind": "string",
        }
      `);
  });

  it("should sort union types to match the default string value", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/union-type-sorting.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 43, 36);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const prop = props.find((type) => type.name === "defaultUnion");

    expect(prop && prop.kind === "union" && prop.shape[0])
      .toMatchInlineSnapshot(`
        {
          "kind": "number",
        }
      `);
  });

  it("should show union fourth arg from rotation", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 30, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props.find((type) => type.name === "rotation"))
      .toMatchInlineSnapshot(`
        {
          "description": "Object's local rotation ({@link https://en.wikipedia.org/wiki/Euler_angles | Euler angles}), in radians.",
          "group": "Transform",
          "kind": "union",
          "name": "rotation",
          "required": false,
          "shape": [
            {
              "kind": "number",
            },
            {
              "kind": "tuple",
              "shape": [
                {
                  "kind": "number",
                  "label": "x",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "y",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "z",
                  "required": true,
                },
                {
                  "kind": "union",
                  "label": "order",
                  "required": false,
                  "shape": [
                    {
                      "kind": "string",
                      "literal": "XYZ",
                    },
                    {
                      "kind": "string",
                      "literal": "YXZ",
                    },
                    {
                      "kind": "string",
                      "literal": "ZXY",
                    },
                    {
                      "kind": "string",
                      "literal": "ZYX",
                    },
                    {
                      "kind": "string",
                      "literal": "YZX",
                    },
                    {
                      "kind": "string",
                      "literal": "XZY",
                    },
                  ],
                },
              ],
            },
          ],
          "tags": {
            "defaultValue": "\`new THREE.Euler()\` - that is \`(0, 0, 0, Euler.DEFAULT_ORDER)\`.",
          },
        }
      `);
  });

  it("should infer prop types from a function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );

    const { props } = getFunctionPropTypes(sourceFile, "UnionOptional")!;

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
          "group": "Other",
          "kind": "union",
          "name": "color",
          "required": false,
          "shape": [
            {
              "kind": "string",
              "literal": "black",
            },
            {
              "kind": "string",
              "literal": "white",
            },
          ],
          "tags": {},
        },
      ]
    `);
  });

  it("should infer default props from a jsx element function decl", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/default-props.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 15, 7);

    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "defaultValue": {
            "kind": "boolean",
            "value": false,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "debugPhysics",
          "required": false,
          "tags": {},
        },
        {
          "defaultValue": {
            "kind": "boolean",
            "value": false,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "enablePhysics",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // TODO: How do we get access to the concrete AST of a component declared using
  // React.FC? It's currently unknown so this test isn't showing the correct data
  // it's missing default props!
  it.todo("should infer default props from a jsx element React.FC decl", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/default-props.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 14, 7);

    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
          "kind": "number",
          "name": "scaleMax",
          "required": false,
          "tags": {
            "max": 2000,
            "min": 0,
          },
        },
        {
          "column": 13,
          "description": undefined,
          "kind": "string",
          "line": 102,
          "name": "seed",
          "required": true,
          "tags": {},
          "value": "",
          "valueKind": "string",
        },
        {
          "description": undefined,
          "kind": "string",
          "literal": "foo",
          "name": "strategy",
          "required": false,
          "tags": {},
        },
        {
          "description": undefined,
          "kind": "boolean",
          "name": "useInterpolation",
          "required": false,
          "tags": {},
        },
        {
          "description": undefined,
          "kind": "boolean",
          "name": "useNoise",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  it("should infer default props from a jsx element component with hoc", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/default-props.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 16, 7);

    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "defaultValue": {
            "kind": "string",
            "value": "foo",
          },
          "description": undefined,
          "group": "Other",
          "kind": "union",
          "name": "name",
          "required": false,
          "shape": [
            {
              "kind": "string",
              "literal": "foo",
            },
            {
              "kind": "string",
              "literal": "bar",
            },
          ],
          "tags": {},
        },
        {
          "defaultValue": {
            "kind": "boolean",
            "value": true,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "test",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  it("should infer props from a FC component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );

    const { props } = getFunctionPropTypes(sourceFile, "Home")!;

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "defaultValue": {
            "kind": "number",
            "value": 700,
          },
          "description": undefined,
          "group": "Other",
          "kind": "number",
          "name": "scaleMax",
          "required": false,
          "tags": {
            "max": 2000,
            "min": 0,
          },
        },
        {
          "description": undefined,
          "group": "Other",
          "kind": "string",
          "name": "seed",
          "required": true,
          "tags": {},
        },
        {
          "defaultValue": {
            "kind": "string",
            "value": "WGAN",
          },
          "description": undefined,
          "group": "Other",
          "kind": "string",
          "literal": "foo",
          "name": "strategy",
          "required": false,
          "tags": {},
        },
        {
          "defaultValue": {
            "kind": "boolean",
            "value": true,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "useInterpolation",
          "required": false,
          "tags": {},
        },
        {
          "defaultValue": {
            "kind": "boolean",
            "value": true,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "useNoise",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  it("should infer prop types from arrow function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );

    const { props } = getFunctionPropTypes(sourceFile, "ArrowFunc")!;

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
          "group": "Other",
          "kind": "string",
          "name": "color",
          "required": true,
          "tags": {},
        },
      ]
    `);
  });

  it("should infer prop types from wrapped arrow function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );

    const { props } = getFunctionPropTypes(sourceFile, "WrappedFunc")!;

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
          "group": "Other",
          "kind": "string",
          "name": "name",
          "required": true,
          "tags": {},
        },
      ]
    `);
  });

  it("should return function type default prop values", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );

    const { props } = getFunctionPropTypes(sourceFile, "Provider")!;

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "defaultValue": {
            "kind": "boolean",
            "value": false,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "debugPhysics",
          "required": false,
          "tags": {},
        },
        {
          "defaultValue": {
            "kind": "boolean",
            "value": false,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "enablePhysics",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  it("should return arrow function type default prop values", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );

    const { props } = getFunctionPropTypes(sourceFile, "DefaultProps")!;

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "defaultValue": {
            "kind": "string",
            "value": "foo",
          },
          "description": undefined,
          "group": "Other",
          "kind": "union",
          "name": "name",
          "required": false,
          "shape": [
            {
              "kind": "string",
              "literal": "foo",
            },
            {
              "kind": "string",
              "literal": "bar",
            },
          ],
          "tags": {},
        },
        {
          "defaultValue": {
            "kind": "boolean",
            "value": true,
          },
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "test",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  it("should extract literal labels", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 77, 10);
    const { props } = getJsxElementPropTypes(sceneObject!);

    expect(props.filter((prop) => prop.name === "side")).toMatchInlineSnapshot(`
      [
        {
          "description": "Defines which of the face sides will be rendered - front, back or both.
      Default is {@link THREE.FrontSide}. Other options are {@link THREE.BackSide} and {@link THREE.DoubleSide}.",
          "group": "Render",
          "kind": "union",
          "name": "side",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "FrontSide",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "BackSide",
              "literal": 1,
            },
            {
              "kind": "number",
              "label": "DoubleSide",
              "literal": 2,
            },
          ],
          "tags": {
            "default": "{@link THREE.FrontSide}",
          },
        },
      ]
    `);
  });

  it("should extract literal labels nested", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 77, 10);
    const { props } = getJsxElementPropTypes(sceneObject!);

    expect(props.filter((prop) => prop.name === "blendSrc"))
      .toMatchInlineSnapshot(`
        [
          {
            "description": "Blending source. It's one of the blending mode constants defined in Three.js. Default is {@link SrcAlphaFactor}.",
            "group": "Blend",
            "kind": "union",
            "name": "blendSrc",
            "required": false,
            "shape": [
              {
                "kind": "number",
                "label": "ZeroFactor",
                "literal": 200,
              },
              {
                "kind": "number",
                "label": "OneFactor",
                "literal": 201,
              },
              {
                "kind": "number",
                "label": "SrcColorFactor",
                "literal": 202,
              },
              {
                "kind": "number",
                "label": "OneMinusSrcColorFactor",
                "literal": 203,
              },
              {
                "kind": "number",
                "label": "SrcAlphaFactor",
                "literal": 204,
              },
              {
                "kind": "number",
                "label": "OneMinusSrcAlphaFactor",
                "literal": 205,
              },
              {
                "kind": "number",
                "label": "DstAlphaFactor",
                "literal": 206,
              },
              {
                "kind": "number",
                "label": "OneMinusDstAlphaFactor",
                "literal": 207,
              },
              {
                "kind": "number",
                "label": "DstColorFactor",
                "literal": 208,
              },
              {
                "kind": "number",
                "label": "OneMinusDstColorFactor",
                "literal": 209,
              },
              {
                "kind": "number",
                "label": "ConstantColorFactor",
                "literal": 211,
              },
              {
                "kind": "number",
                "label": "OneMinusConstantColorFactor",
                "literal": 212,
              },
              {
                "kind": "number",
                "label": "ConstantAlphaFactor",
                "literal": 213,
              },
              {
                "kind": "number",
                "label": "OneMinusConstantAlphaFactor",
                "literal": 214,
              },
              {
                "kind": "number",
                "label": "SrcAlphaSaturateFactor",
                "literal": 210,
              },
            ],
            "tags": {
              "default": "THREE.SrcAlphaFactor",
            },
          },
        ]
      `);
  });

  it("should extract enum labels", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/n_modules.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 24, 7);
    const { props } = getJsxElementPropTypes(sceneObject!);

    expect(props.filter((prop) => prop.name === "frictionCombineRule"))
      .toMatchInlineSnapshot(`
        [
          {
            "description": "What happens when two bodies meet. See https://rapier.rs/docs/user_guides/javascript/colliders#friction.",
            "group": "Other",
            "kind": "union",
            "name": "frictionCombineRule",
            "required": false,
            "shape": [
              {
                "kind": "number",
                "label": "Average",
                "literal": 0,
              },
              {
                "kind": "number",
                "label": "Min",
                "literal": 1,
              },
              {
                "kind": "number",
                "label": "Multiply",
                "literal": 2,
              },
              {
                "kind": "number",
                "label": "Max",
                "literal": 3,
              },
            ],
            "tags": {},
          },
        ]
      `);
  });
  it("should evaluate expressions", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/prop-expression.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 12, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const rotateXProp = props.find((prop) => prop.name === "rotateX");
    expect(rotateXProp).toEqual(
      expect.objectContaining({
        value: "Math.PI / 2",
        valueKind: "number",
      }),
    );
    const rotateYProp = props.find((prop) => prop.name === "rotateY");
    expect(rotateYProp).toEqual(
      expect.objectContaining({
        valueKind: "unhandled",
      }),
    );
    const positionProp = props.find((prop) => prop.name === "position");
    expect(positionProp).toEqual(
      expect.objectContaining({
        value: ["Math.sqrt(2)", "Math.sqrt(2)", "Math.sqrt(2)"],
      }),
    );
  });
});
