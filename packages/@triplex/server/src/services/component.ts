/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { basename, dirname, extname, relative } from "@triplex/lib/path";
import {
  Node,
  SyntaxKind,
  type JsxElement,
  type JsxFragment,
  type JsxSelfClosingElement,
  type SourceFile,
  type ts,
} from "ts-morph";
import {
  getAttributes,
  getJsxElementAt,
  getJsxElementAtOrThrow,
  getJsxElementFromAstPathOrThrow,
  getJsxTag,
} from "../ast/jsx";
import { getExportNameOrThrow } from "../ast/module";
import { type ComponentRawType, type ComponentTarget } from "../types";
import { DNDError } from "../util/errors";
import { inferExports } from "../util/module";
import { omitFileExtension, prefixLocalPath } from "../util/path";
import { padLines, parseJSON, toPascalCase } from "../util/string";

function guessComponentNameFromPath(path: string) {
  const name = basename(path)
    .replace(extname(path), "")
    .replaceAll(/-[a-z]/g, (match) => match.replace("-", "").toUpperCase());
  return name[0].toUpperCase() + name.slice(1);
}

function extractPath(dirPath: string, targetPath: string) {
  const isSrc =
    targetPath.startsWith(".") ||
    targetPath.startsWith("/") ||
    targetPath.match(/^[A-z]:\//);

  if (isSrc) {
    const targetFilename = `${basename(targetPath).replace(
      extname(targetPath),
      "",
    )}`;
    const relativePath = relative(
      dirPath,
      targetPath.replace(basename(targetPath), ""),
    );

    if (relativePath === "") {
      return "./" + relativePath + targetFilename;
    }

    if (relativePath[0] === ".") {
      return relativePath + "/" + targetFilename;
    }

    return "./" + (relativePath + "/" + targetFilename);
  }

  return targetPath;
}

function propsToString(props: Record<string, unknown>) {
  const attributes: string[] = [];

  for (const key in props) {
    const prop = props[key];
    let value: string;

    switch (typeof prop) {
      case "string":
        value = `"${prop}"`;
        break;

      default:
        value = `{${prop}}`;
    }

    attributes.push(`${key}=${value}`);
  }

  return attributes.join(" ");
}

function insertJsxElement(
  sourceFile: SourceFile,
  target: Node<ts.Node>,
  componentName: string,
  componentProps: Record<string, unknown>,
) {
  const element = target.getFirstDescendant(
    (node) => Node.isJsxFragment(node) || Node.isJsxElement(node),
  );
  const componentText = `<${componentName} ${propsToString(componentProps)}/>`;

  if (Node.isJsxFragment(element)) {
    const pos = element.getClosingFragment().getStart();
    const { column, line } = sourceFile.getLineAndColumnAtPos(pos);

    sourceFile.insertText(pos, componentText);

    return {
      column,
      line,
    };
  } else if (Node.isJsxElement(element)) {
    const jsxElementName = element
      .getOpeningElement()
      .getTagNameNode()
      .getText();

    if (jsxElementName !== "Fragment") {
      const pos = element.getStart();
      const { column, line } = sourceFile.getLineAndColumnAtPos(pos);

      // We need to add another fragment around the existing element.
      element.replaceWithText(`<>${componentText}${element.getText()}</>`);

      return {
        column: 2 + column,
        line,
      };
    } else {
      const pos = element.getClosingElement().getStart();
      const { column, line } = sourceFile.getLineAndColumnAtPos(pos);

      sourceFile.insertText(pos, componentText);

      return {
        column,
        line,
      };
    }
  }

  throw new Error("invariant: could not find jsx element to add to");
}

function addToJsxElement(
  sourceFile: SourceFile,
  target: { action: "child"; column: number; line: number },
  componentName: string,
  componentProps: Record<string, unknown>,
): { column: number; line: number } {
  const element = getJsxElementAt(sourceFile, target.line, target.column);
  if (!element) {
    throw new Error("invariant: element not found");
  }

  const componentText = `<${componentName} ${propsToString(componentProps)}/>`;

  if (Node.isJsxElement(element)) {
    const insertStartPos = element.getClosingElement().getStart();
    const insertedLineCol = sourceFile.getLineAndColumnAtPos(insertStartPos);

    sourceFile.insertText(insertStartPos, componentText);

    return {
      column: insertedLineCol.column,
      line: insertedLineCol.line,
    };
  }

  const { tagName } = getJsxTag(element);
  const openingText = element.getText().replace(" />", ">");
  const closingText = `</${tagName}>`;

  element.replaceWithText(openingText + componentText + closingText);

  return {
    column: target.column + openingText.length,
    line: target.line,
  };
}

export function replaceCode(
  sourceFile: SourceFile,
  {
    code,
    lineFrom,
    lineTo,
  }: { code: string; lineFrom: number; lineTo: number },
) {
  const fromPos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
    lineFrom - 1,
    0,
  );
  const toPos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
    lineTo,
    0,
  );
  sourceFile.replaceText([fromPos, toPos], code);
}

export function insertCode(
  sourceFile: SourceFile,
  { code, line }: { code: string; line: number },
) {
  const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
    line - 1,
    0,
  );
  sourceFile.insertText(pos, code);
}

export function includesComponent(sourceFile: SourceFile, exportName: string) {
  const foundExports = inferExports(sourceFile.getText());

  return foundExports.some((exp) => exp.exportName === exportName);
}

export function create(sourceFile: SourceFile, template: string) {
  let count = 0;
  let exportName = "Untitled";

  while (includesComponent(sourceFile, exportName)) {
    // Find a filename that doesn't exist
    count += 1;
    exportName = `Untitled${count}`;
  }

  sourceFile.addFunction({
    isExported: true,
    name: exportName,
    statements: `return ${template};`,
  });

  return { exportName };
}

export function add(
  sourceFile: SourceFile,
  exportName: string,
  component: ComponentRawType,
  target?: ComponentTarget,
): { column: number; line: number } {
  const { declaration } = getExportNameOrThrow(sourceFile, exportName);

  if (
    Node.isFunctionDeclaration(declaration) ||
    Node.isVariableDeclaration(declaration)
  ) {
    if (component.type === "host") {
      const { column, line } = target
        ? addToJsxElement(sourceFile, target, component.name, component.props)
        : insertJsxElement(
            sourceFile,
            declaration,
            component.name,
            component.props,
          );

      return {
        column,
        line,
      };
    } else if (component.type === "custom") {
      const moduleSpecifier = extractPath(
        sourceFile.getDirectoryPath(),
        component.path,
      );

      let existingImport = sourceFile.getImportDeclaration((decl) => {
        return decl.getModuleSpecifierValue() === moduleSpecifier;
      });

      let importName: string;
      let aliasImportName: string | undefined;

      if (existingImport) {
        if (component.exportName === "default") {
          // Default export - check if it's already exported. If it is reuse the same name.
          const foundDefaultImport = existingImport.getDefaultImport();
          importName = foundDefaultImport ? foundDefaultImport.getText() : "";
        } else {
          // Named export - check if it's already exported. If it is reuse the same name.
          const foundNamedImport = existingImport
            .getNamedImports()
            .find(
              (imp) => imp.getNameNode().getText() === component.exportName,
            );

          if (foundNamedImport) {
            importName = foundNamedImport.getNameNode().getText();
            aliasImportName = foundNamedImport.getAliasNode()?.getText();
          } else {
            importName = component.exportName;
            if (sourceFile.getLocal(importName)) {
              aliasImportName = importName + "1";
            }
          }
        }
      } else {
        importName =
          component.exportName === "default"
            ? guessComponentNameFromPath(component.path)
            : component.exportName;

        if (sourceFile.getLocal(importName)) {
          aliasImportName = importName + "1";
        }
      }

      existingImport = sourceFile.getImportDeclaration((decl) => {
        return decl.getModuleSpecifierValue() === moduleSpecifier;
      });

      if (existingImport) {
        if (component.exportName === "default") {
          existingImport.setDefaultImport(aliasImportName || importName);
        }

        if (component.exportName !== "default") {
          const preExistingImport = existingImport
            .getNamedImports()
            .find(
              (x) =>
                x.getAliasNode()?.getText() === aliasImportName &&
                x.getName() === importName,
            );

          if (!preExistingImport) {
            existingImport.insertNamedImport(0, {
              alias: aliasImportName,
              isTypeOnly: false,
              name: importName,
            });
          }
        }
      } else {
        // We insert text to prevent pushing out jsx elements onto new lines.
        const defaultImport =
          component.exportName === "default"
            ? aliasImportName || importName
            : "";

        const namedImports =
          component.exportName !== "default"
            ? `${importName}${aliasImportName ? ` as ${aliasImportName}` : ""}`
            : "";

        const importDeclaration = `import ${defaultImport}${
          namedImports ? `{ ${namedImports} } ` : " "
        }from "${moduleSpecifier}";`;

        sourceFile.insertText(0, importDeclaration);
      }

      // Less than ideal but we need to find the declaration again because of the
      // Mutation we've done above for import statements. Not the end of the world
      // But might be a performance pitfall. This is a note for later to see if there
      // Are improvements to be made.
      const { declaration } = getExportNameOrThrow(sourceFile, exportName);

      // We add the JSX element after adding/updating imports so line/cols are always correct
      // For the freshly added JSX element.
      const { column, line } = target
        ? addToJsxElement(
            sourceFile,
            target,
            aliasImportName || importName,
            component.props,
          )
        : insertJsxElement(
            sourceFile,
            declaration,
            aliasImportName || importName,
            component.props,
          );

      return {
        column,
        line,
      };
    }
  }

  throw new Error("invariant: unhandled add type");
}

export function upsertProp(
  jsxElement: JsxElement | JsxSelfClosingElement | JsxFragment,
  propName: string,
  propValue: string,
) {
  if (Node.isJsxFragment(jsxElement)) {
    return "invalid-fragment";
  }

  const { attributes, children } = getAttributes(jsxElement);

  const existingProp = attributes[propName];
  if (existingProp) {
    const prevLineSpan =
      existingProp.getEndLineNumber() - existingProp.getStartLineNumber();
    existingProp.setInitializer(`{${propValue}}`);
    const nextLineSpan =
      existingProp.getEndLineNumber() - existingProp.getStartLineNumber();

    if (nextLineSpan !== prevLineSpan) {
      // We need to update the lines so they remain the same, cut the difference and add it as new lines.
      const lines = prevLineSpan - nextLineSpan;
      existingProp.setInitializer(`{${propValue}}${padLines(lines)}`);
    }

    return "updated";
  }

  if (propName === "children") {
    const parsedValue = parseJSON(propValue);
    const jsxChild =
      typeof parsedValue === "string" ? parsedValue : `{${propValue}}`;

    if (Node.isJsxElement(jsxElement)) {
      jsxElement.setBodyText(jsxChild);
    } else {
      const jsxString = jsxElement.getText();
      const tagName = jsxElement.getTagNameNode().getText();
      jsxElement.replaceWithText(
        jsxString.replace("/>", `>${jsxChild}</${tagName}>`),
      );
    }

    return children ? "updated" : "added";
  }

  const newAttribute = {
    initializer: `{${propValue}}`,
    name: propName,
  };

  if (Node.isJsxElement(jsxElement)) {
    jsxElement.getOpeningElement().addAttribute(newAttribute);
  } else {
    jsxElement.addAttribute(newAttribute);
  }

  return "added";
}

const DELETED_PRAGMA = "@triplex_deleted";
const DELETE_PRE = `{/** ${DELETED_PRAGMA} `;
const DELETE_PRE_SAFE = `_/@@ ${DELETED_PRAGMA} `;
const DELETE_POST = "*/}";
const DELETE_POST_SAFE = "@/_";

export function deleteElement(
  element: JsxElement | JsxSelfClosingElement | JsxFragment,
) {
  element.replaceWithText("");
}

export function commentComponent(
  sourceFile: SourceFile,
  line: number,
  column: number,
) {
  const jsxElement = getJsxElementAt(sourceFile, line, column);
  if (!jsxElement) {
    throw new Error("invariant: jsx element not found");
  }

  let safeText = jsxElement.getText();

  if (safeText.includes(DELETED_PRAGMA)) {
    // There is a child that has been deleted. Replace all comments with other values.
    safeText = safeText
      .replaceAll(DELETE_PRE, DELETE_PRE_SAFE)
      .replaceAll(DELETE_POST, DELETE_POST_SAFE);
  }

  sourceFile.replaceText(
    [jsxElement.getStart(), jsxElement.getEnd()],
    DELETE_PRE + safeText + DELETE_POST,
  );
}

export function uncommentComponent(
  sourceFile: SourceFile,
  line: number,
  column: number,
) {
  const node = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxExpression)
    .find((node) => {
      const pos = sourceFile.getLineAndColumnAtPos(node.getStart());
      if (
        pos.line === line &&
        pos.column === column &&
        node.getText().includes(DELETED_PRAGMA)
      ) {
        return true;
      }

      return false;
    });

  if (!node) {
    throw new Error("invariant: jsx element not found");
  }

  let text = node.getText().replace(DELETE_PRE, "").replace(DELETE_POST, "");

  const firstPreIndex = text.indexOf(DELETE_PRE_SAFE);
  const lastPostIndex = text.lastIndexOf(DELETE_POST_SAFE);
  if (firstPreIndex >= 0 && lastPostIndex >= 0) {
    text = text.replace(DELETE_PRE_SAFE, DELETE_PRE);
    text =
      text.slice(0, Math.max(0, lastPostIndex)) +
      DELETE_POST +
      text.slice(Math.max(0, lastPostIndex + DELETE_POST_SAFE.length));
  }

  sourceFile.replaceText([node.getStart(), node.getEnd()], text);
}

export function deleteCommentComponents(sourceFile: SourceFile) {
  const nodes = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxExpression)
    .filter((node) => {
      if (node.getText().includes(DELETED_PRAGMA)) {
        return true;
      }

      return false;
    });

  nodes.forEach((node) => {
    node.replaceWithText("");
  });
}

export function rename(
  sourceFile: SourceFile,
  exportName: string,
  newName: string,
) {
  const { declaration } = getExportNameOrThrow(sourceFile, exportName);

  declaration.rename(newName);
}

export function duplicate(
  sourceFile: SourceFile,
  line: number,
  column: number,
) {
  const jsxElement = getJsxElementAt(sourceFile, line, column);
  if (!jsxElement) {
    throw new Error("invariant: jsx element not found");
  }

  const insertedLineCol = sourceFile.getLineAndColumnAtPos(jsxElement.getEnd());
  sourceFile.insertText(jsxElement.getEnd(), jsxElement.getText());

  return insertedLineCol;
}

export function duplicateElement(sourceFile: SourceFile, astPath: string) {
  const [jsxElement] = getJsxElementFromAstPathOrThrow(sourceFile, astPath);
  const insertedLineCol = sourceFile.getLineAndColumnAtPos(jsxElement.getEnd());
  sourceFile.insertText(jsxElement.getEnd(), jsxElement.getText());

  const astBasePath = dirname(astPath);
  const [elementName, possibleCount = 0] = basename(astPath).split(".");
  const count = Number(possibleCount) + 1;

  return {
    ...insertedLineCol,
    astPath: `${astBasePath}/${elementName}.${count}`,
  };
}

export function move(
  sourceFile: SourceFile,
  source: { column: number; line: number },
  destination: { column: number; line: number },
  action: "move-before" | "move-after" | "make-child",
) {
  const sourceElement = getJsxElementAtOrThrow(
    sourceFile,
    source.line,
    source.column,
  );
  const destinationElement = getJsxElementAtOrThrow(
    sourceFile,
    destination.line,
    destination.column,
  );
  const sourceText = sourceElement.getText();

  switch (action) {
    case "move-before": {
      sourceElement.replaceWithText("");
      sourceFile.insertText(destinationElement.getStart(), sourceText);
      break;
    }

    case "move-after": {
      sourceElement.replaceWithText("");
      sourceFile.insertText(destinationElement.getEnd(), sourceText);
      break;
    }

    case "make-child": {
      if (Node.isJsxElement(destinationElement)) {
        sourceElement.replaceWithText("");
        const structure = destinationElement.getStructure();
        destinationElement.set({
          bodyText: structure.bodyText
            ? `${sourceText}${structure.bodyText}`
            : sourceText,
        });
      } else {
        sourceElement.replaceWithText("");
        const destinationText = destinationElement.getText();
        const { tagName } = getJsxTag(destinationElement);
        destinationElement.replaceWithText(
          destinationText.replace("/>", `>${sourceText}</${tagName}>`),
        );
      }
      break;
    }

    default:
      throw new Error("invariant: unhandled move action");
  }
}

/** Adds an existing component to the end of a scene (auto-detects exports) */
export function addComponentToEnd(
  sceneFile: SourceFile,
  activeScene: string | undefined,
  componentPath: string,
  exportName?: string,
) {
  let componentFile = sceneFile.getProject().getSourceFile(componentPath);

  if (!componentFile) {
    componentFile = sceneFile.getProject().addSourceFileAtPath(componentPath);
  }

  if (!componentFile) {
    throw new DNDError(`Component file not found: ${componentPath}`);
  }

  // determin the imported export
  const defaultExport = componentFile.getDefaultExportSymbol();
  const exportNames = Array.from(
    componentFile.getExportedDeclarations().keys(),
  );

  // If no export name is provided and there are multiple exports, we need to ask the user to specify one.
  if (!defaultExport && exportNames.length > 1 && !exportName) {
    const error = new DNDError(
      `Multiple exports found in ${componentPath}, please specify an export to use.`,
      "multiple-exports",
    );
    error.multipleExports = exportNames;
    throw error;
  }
  // If no exports found, throw.
  if (!defaultExport && exportNames.length === 0) {
    throw new DNDError(`No exports found in ${componentPath}`);
  }

  // Determine which export to use
  const componentExportName = defaultExport
    ? "__default__"
    : (exportName ?? exportNames[0]);

  // Determine the import name

  if (!componentExportName) {
    throw new DNDError(`No exports found in ${componentPath}`);
  }

  // Ensure the import exists
  const componentImportName = ensureImport(
    sceneFile,
    componentPath,
    componentExportName,
  );

  const components = [...sceneFile.getExportedDeclarations().keys()];
  const sceneExportName = components.includes(activeScene || "")
    ? activeScene
    : components[0];

  if (!sceneExportName) {
    throw new DNDError(`No exports found in scene file`);
  }

  const jsxElement = getExportJsxElement(sceneFile, sceneExportName);

  const newComponentJsx = `<${componentImportName} />`;

  insertAtEnd(sceneFile, jsxElement, newComponentJsx);
}
export function getUniqueImportName(
  componentExportName: string,
  componentPath: string,
  sceneFile: SourceFile,
) {
  // Determine the import name
  let componentImportName =
    componentExportName === "__default__"
      ? toPascalCase(
          basename(componentPath).replace(extname(componentPath), ""),
        )
      : componentExportName;
  let componentImportNameAddition = 0;

  // get all current imports/exports/variables to avoid name conflicts
  const currentDeclarations = new Set([
    ...sceneFile.getImportDeclarations().flatMap((imp) => {
      return [
        ...imp.getNamedImports().map((ni) => ni.getName()),
        ...(imp.getDefaultImport() ? [imp.getDefaultImport()!.getText()] : []),
      ];
    }),
    ...sceneFile.getExportDeclarations().flatMap((exp) => {
      return exp.getNamedExports().map((ne) => ne.getName());
    }),
    ...sceneFile
      .getClasses()
      .map((cls) => cls.getName())
      .filter((name): name is string => !!name),
    ...sceneFile
      .getFunctions()
      .map((fn) => fn.getName())
      .filter((name): name is string => !!name),
    ...sceneFile.getVariableStatements().flatMap((vs) => {
      return vs.getDeclarations().map((vd) => vd.getName());
    }),
  ]);
  // check if export name is already taken. If it is, add a number suffix.
  while (
    currentDeclarations.has(
      `${componentImportName}${componentImportNameAddition === 0 ? "" : "_" + componentImportNameAddition}`,
    )
  ) {
    componentImportNameAddition++;
  }
  componentImportName = `${componentImportName}${componentImportNameAddition === 0 ? "" : "_" + componentImportNameAddition}`;
  return componentImportName;
}

/** Ensures an import exists for the component */
function ensureImport(
  sourceFile: SourceFile,
  modulePath: string,
  exportName: string,
): string {
  const importName = getUniqueImportName(exportName, modulePath, sourceFile);
  const baseFolderPath = dirname(sourceFile.getFilePath());
  const relativePath = omitFileExtension(
    prefixLocalPath(relative(baseFolderPath, modulePath)),
  );

  const existingImport = sourceFile.getImportDeclaration(
    (imp) =>
      imp.getModuleSpecifierValue() === modulePath ||
      imp.getModuleSpecifierValue() === relativePath,
  );

  if (!existingImport) {
    if (exportName === "__default__") {
      // add import from default
      sourceFile.addImportDeclaration({
        defaultImport: importName,
        moduleSpecifier: relativePath,
      });
    } else {
      // add import named
      sourceFile.addImportDeclaration({
        moduleSpecifier: relativePath,
        namedImports: [
          {
            alias: importName !== exportName ? importName : undefined,
            name: exportName,
          },
        ],
      });
    }
  } else {
    if (exportName === "__default__") {
      // check default import exists and add it
      const defaultImport = existingImport.getDefaultImport();

      if (!defaultImport) {
        existingImport.setDefaultImport(importName);
      } else {
        return defaultImport.getText();
      }
    } else {
      // check named import exists and add it
      const namedImports = existingImport.getNamedImports();
      const hasImport = namedImports.some((ni) => ni.getName() === exportName);

      if (!hasImport) {
        existingImport.addNamedImport({
          alias: importName !== exportName ? importName : undefined,
          name: exportName,
        });
      } else {
        return exportName;
      }
    }
  }

  return importName;
}

/** Gets the JSX element for an export */
function getExportJsxElement(sourceFile: SourceFile, exportName: string) {
  const exportDeclaration = sourceFile
    .getExportedDeclarations()
    .get(exportName)?.[0];
  if (!exportDeclaration) {
    throw new Error(`Export "${exportName}" not found`);
  }
  const returnStatements = exportDeclaration.getDescendantsOfKind(
    SyntaxKind.ReturnStatement,
  );
  for (const returnStmt of returnStatements) {
    let expression = returnStmt.getExpression();

    while (expression && Node.isParenthesizedExpression(expression)) {
      expression = expression.getExpression();
    }

    if (
      expression &&
      (Node.isJsxElement(expression) ||
        Node.isJsxFragment(expression) ||
        Node.isJsxSelfClosingElement(expression))
    ) {
      return expression;
    }
  }
  throw new Error(`No JSX return found in "${exportName}"`);
}

/** Inserts JSX at the end of an element */
function insertAtEnd(sourceFile: SourceFile, jsxElement: Node, newJsx: string) {
  if (Node.isJsxElement(jsxElement)) {
    const closingElement = jsxElement.getClosingElement();
    sourceFile.insertText(closingElement.getStart(), `\n${newJsx}\n`);
  } else if (Node.isJsxFragment(jsxElement)) {
    const closingFragment = jsxElement.getClosingFragment();
    sourceFile.insertText(closingFragment.getStart(), `\n${newJsx}\n`);
  } else {
    const elementText = jsxElement.getText();
    jsxElement.replaceWithText(`<>\n${elementText}\n${newJsx}\n</>`);
  }

  sourceFile.formatText();
}

export function group(
  sourceFile: SourceFile,
  {
    elements,
    group,
  }: {
    elements: { column: number; line: number }[];
    group: "fragment" | "group";
  },
) {
  const groupName = group === "fragment" ? "" : "group";

  for (const element of elements) {
    const node = getJsxElementAtOrThrow(
      sourceFile,
      element.line,
      element.column,
    );

    node.replaceWithText(`<${groupName}>${node.getText()}</${groupName}>`);
  }
}

export function groupElements(
  sourceFile: SourceFile,
  {
    elements,
    tag,
  }: {
    elements: { astPath: string }[];
    tag: "Fragment" | "group";
  },
) {
  const result: { astPath: string }[] = [];
  const tagName = tag === "Fragment" ? "" : "group";

  for (const element of elements) {
    const [node, tree] = getJsxElementFromAstPathOrThrow(
      sourceFile,
      element.astPath,
    );
    node.replaceWithText(`<${tagName}>${node.getText()}</${tagName}>`);

    const location = tree[element.astPath];
    if (!location.parent) {
      throw new Error("invariant");
    }

    const currentIndex = location.parent.children.findIndex(
      (child) => child.astPath === element.astPath,
    );
    const tagsBeforeCurrentIndex = location.parent.children
      .slice(0, currentIndex)
      .filter((child) => child.tagName === tag).length;

    const nextAstPath = `${location.parent.astPath}/${tag}${tagsBeforeCurrentIndex > 0 ? `.${tagsBeforeCurrentIndex}` : ""}`;

    result.push({
      astPath: nextAstPath,
    });
  }

  return result;
}
