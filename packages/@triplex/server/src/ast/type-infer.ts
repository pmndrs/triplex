/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { evaluateNumericalExpression } from "@triplex/lib/math";
import {
  type AttributeValue,
  type DeclaredProp,
  type ExpressionValue,
  type Prop,
  type UnionType,
  type Type as UnrolledType,
} from "@triplex/lib/types";
import {
  Node,
  type Expression,
  type JsxAttribute,
  type JsxChild,
  type JsxElement,
  type JsxFragment,
  type JsxSelfClosingElement,
  type JsxText,
  type Symbol as SymbolType,
  type ts,
  type Type,
} from "ts-morph";
import type { Source, Transforms } from "../types";
import { isReactDOMElement } from "./is-react-element";
import { isReactThreeElement } from "./is-three-element";
import { getAttributes, getJsxTag } from "./jsx";
import { getExportName } from "./module";
import { type SourceFileReadOnly } from "./project";
import { reactDOMPropGrouping, threeFiberPropGrouping } from "./prop-groupings";

export function resolveAttributeValue(attribute: JsxAttribute): {
  start: number;
  value: ExpressionValue;
} {
  const initializer = attribute.getInitializer?.();
  const value = resolveExpressionValue(
    Node.isJsxExpression(initializer)
      ? initializer.getExpressionOrThrow()
      : initializer,
  );

  return { start: attribute.getStart(), value };
}

export function resolveChildJsxValue(children: JsxChild[]): {
  start: number;
  value: ExpressionValue;
} {
  if (children.length === 1) {
    return {
      start: children[0].getStart(),
      value: resolveExpressionValue(children[0]),
    };
  }

  return {
    start: children[0].getStart(),
    value: {
      kind: "unhandled",
      value: children.map((child) => child.getText()).join(""),
    },
  };
}

export function sortUnionType(type: UnionType, value: AttributeValue) {
  const isLiteralUnion = type.shape.every((val) => "literal" in val);
  if (isLiteralUnion) {
    // Bail out from sorting literal unions. We don't want their item positions to change in the UI.
    return;
  }

  const typeOfValue = typeof value;
  const isValueAnArray = Array.isArray(value);

  type.shape.sort((typeA, typeB) => {
    if (typeOfValue === typeA.kind) {
      return -1;
    }

    if (typeOfValue === typeB.kind) {
      return 1;
    }

    if (isValueAnArray) {
      if (typeA.kind === "tuple") {
        let partialMatch = true;

        for (let i = 0; i < value.length; i++) {
          const typeofElValue = typeof value[i];
          const elType = typeA.shape[i];

          if (elType.kind !== typeofElValue) {
            partialMatch = false;
            break;
          }
        }

        if (partialMatch) {
          return -1;
        }
      }

      if (typeB.kind === "tuple") {
        let partialMatch = true;

        for (let i = 0; i < value.length; i++) {
          const typeofElValue = typeof value[i];
          const elType = typeB.shape[i];

          if (elType.kind !== typeofElValue) {
            partialMatch = false;
            break;
          }
        }

        if (partialMatch) {
          return 1;
        }
      }
    }

    return 0;
  });
}

export function unrollType(
  type: Type,
  unionLabels: Record<string, string> = {},
): UnrolledType {
  if (type.isNumber()) {
    return {
      kind: "number",
    };
  }

  if (type.isString()) {
    return {
      kind: "string",
    };
  }

  if (type.isBoolean()) {
    return {
      kind: "boolean",
    };
  }

  if (type.isBooleanLiteral()) {
    return {
      kind: "boolean",
      literal: !!type.getLiteralValue(),
    };
  }

  if (type.isTuple()) {
    const elements = type.getTupleElements();
    const labels = ((type.compilerType as ts.TupleType).target as ts.TupleType)
      .labeledElementDeclarations;

    const result = {
      kind: "tuple",
      shape: elements.map((val, index) => ({
        ...unrollType(val, unionLabels),
        label: labels ? labels[index]?.name.getText() : undefined,
        required: labels ? !labels[index]?.questionToken : true,
      })),
    } as const;

    if (result.shape.length > 0) {
      return result;
    }
  }

  if (type.isUnion()) {
    const types = type.getUnionTypes();
    const shape = types
      .map((val) => {
        const unrolled = unrollType(val, unionLabels);
        const label = unionLabels[val.getText()];

        if (label) {
          return {
            ...unrolled,
            label,
          };
        }

        return unrolled;
      })
      // Filter out unknown values - if its unknown we don't want to handle it.
      .filter((val) => val.kind !== "unhandled")
      .filter(
        // Remove duplicates if any exist
        (v, i, a) =>
          a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i,
      );

    if (shape.length === 1) {
      // After filter if there is only one value let's throw away the union and return the
      // only value inside it. Easier for us to handle on the client that way.
      return shape[0];
    }

    if (shape.length !== 0) {
      return {
        kind: "union",
        shape,
      };
    }
  }

  if (type.isStringLiteral()) {
    return {
      kind: "string",
      literal: `${type.getLiteralValueOrThrow()}`,
    };
  }

  if (type.isNumberLiteral()) {
    return {
      kind: "number",
      literal: Number(`${type.getLiteralValueOrThrow()}`),
    };
  }

  return {
    kind: "unhandled",
  };
}

function getJsxDeclProps(
  element: JsxSelfClosingElement | JsxElement | JsxFragment,
) {
  if (Node.isJsxFragment(element)) {
    return null;
  }

  const tagName = Node.isJsxSelfClosingElement(element)
    ? element.getTagNameNode()
    : element.getOpeningElement().getTagNameNode();
  const tagNameText = tagName.getText();

  if (/^[a-z]/.exec(tagNameText)) {
    const jsxType = tagName.getSymbol()?.getTypeAtLocation(tagName);
    const isThreeElement = isReactThreeElement(tagNameText) && "three";
    const isReactElement = isReactDOMElement(tagNameText) && "react";

    if (!jsxType) {
      // No type found for this JSX element.
      return null;
    }

    return {
      declaration: element,
      properties: jsxType.getApparentProperties(),
      source:
        isThreeElement || isReactElement || resolveSource(jsxType) || "unknown",
    } as const;
  } else {
    const jsxType = tagName.getType();
    const signatures = jsxType.getCallSignatures();
    if (signatures.length === 0) {
      // No signatures for this call-like node found.
      return null;
    }

    const [props] = signatures[0].getParameters();
    if (!props) {
      // No props arg
      return null;
    }

    const valueDeclaration = props.getValueDeclaration();
    if (!valueDeclaration) {
      // No decl found!
      return null;
    }

    const symbol = jsxType.getSymbol() || jsxType.getAliasSymbol();
    if (!symbol) {
      throw new Error("invariant: could not find symbol");
    }

    const declaration = symbol.getDeclarations()[0];

    const propsType = element
      .getProject()
      .getTypeChecker()
      .getTypeOfSymbolAtLocation(props, valueDeclaration);

    const properties = propsType.getApparentProperties();

    return {
      declaration,
      properties,
      source: resolveSource(propsType) || "unknown",
      symbolType: props,
    } as const;
  }
}

function toPrimitive(value?: string): string | boolean | number {
  if (value === undefined || value === "true") {
    return true;
  }

  const valueAsNumber = Number(value);

  if (Number.isNaN(valueAsNumber)) {
    return value;
  }

  return valueAsNumber;
}

function extractJSDoc(symbol: SymbolType) {
  const decls = symbol.getDeclarations().filter(Node.isJSDocable);

  const tags: Record<string, string | boolean | number> = {};
  const description: string[] = [];

  for (let i = 0; i < decls.length; i++) {
    const decl = decls[i];
    const jsdocs = decl.getJsDocs();

    jsdocs.forEach((doc) => {
      description.push(doc.getDescription().trim());
      doc.getTags().map((tag) => {
        const name = tag.getTagName();
        const value = tag.getCommentText();

        tags[name] = toPrimitive(value);
      });
    });
  }

  return {
    description: description.length ? description.join("\n") : undefined,
    tags,
  };
}

function collectUnionLabels(
  propType: Type,
  outLabels: Record<string, Record<string, string>>,
  propDecl: Node<ts.Node> | undefined,
): Record<string, string> | undefined {
  if (!propDecl) {
    return undefined;
  }

  const propTypeAtLocation = propDecl.getSymbol()?.getTypeAtLocation(propDecl);
  const propTypeName = propTypeAtLocation?.getText();

  if (!propTypeAtLocation || !propTypeName) {
    return undefined;
  }

  if (!propType.isUnion()) {
    return outLabels[propTypeName];
  }

  // Collect union labels for use later.
  if (outLabels[propTypeName]) {
    // We've already collected the labels for this union type. Skip!
    return outLabels[propTypeName];
  }

  outLabels[propTypeName] = {};

  let typeDeclarations = (
    propTypeAtLocation.getSymbol() || propTypeAtLocation.getAliasSymbol()
  )?.getDeclarations();

  if (!typeDeclarations) {
    // We need to resolve each symbol individually.
    const typeNode = Node.isPropertyDeclaration(propDecl)
      ? propDecl.getTypeNode?.()
      : undefined;

    if (Node.isUnionTypeNode(typeNode)) {
      typeDeclarations = typeNode
        .getTypeNodes()
        .flatMap((val) => {
          return (
            val.getType().getSymbol() || val.getType().getAliasSymbol()
          )?.getDeclarations();
        })
        .filter((decl) => !!decl);
    }
  }

  typeDeclarations?.forEach((declaration) => {
    declaration.forEachDescendant((node) => {
      if (Node.isTypeQuery(node) && node.getType().isLiteral()) {
        const label = node.getExprName().getText();
        const typeValue = node.getType().getText();

        if (!outLabels[propTypeName][typeValue]) {
          outLabels[propTypeName][typeValue] = label;
        }
      }

      if (Node.isEnumMember(node)) {
        const label = node.getName();
        const typeValue = `${propTypeName}.${label}`;

        if (typeValue) {
          if (!outLabels[propTypeName][typeValue]) {
            outLabels[propTypeName][typeValue] = label;
          }
        }
      }
    });
  });

  return outLabels[propTypeName];
}

export function resolveExpressionValue(
  expression: Expression | JsxText | undefined,
): ExpressionValue {
  // Value is inside a JSX expression
  if (Node.isIdentifier(expression)) {
    const text = expression.getText();
    if (text === "undefined") {
      return { kind: "undefined", value: undefined };
    }

    return { kind: "identifier", value: text };
  }

  if (Node.isArrayLiteralExpression(expression)) {
    const elements = expression.getElements();
    const value: AttributeValue[] = [];

    for (let i = 0; i < elements.length; i++) {
      const nextElement = elements[i];
      const nextValue = resolveExpressionValue(nextElement);
      if (nextValue.kind === "unhandled") {
        return { kind: "unhandled", value: expression.getText() };
      }

      value.push(nextValue.value);
    }

    return { kind: "array", value };
  }

  if (Node.isStringLiteral(expression)) {
    return { kind: "string", value: expression.getLiteralText() };
  }

  if (Node.isJsxText(expression)) {
    return { kind: "string", value: expression.getText() };
  }

  if (Node.isNumericLiteral(expression)) {
    return { kind: "number", value: Number(expression.getLiteralText()) };
  }

  if (expression && evaluateNumericalExpression(expression.getText())) {
    return { kind: "number", value: expression.getText() };
  }

  if (Node.isPrefixUnaryExpression(expression)) {
    const operand = expression.getOperand();
    if (Node.isNumericLiteral(operand)) {
      return { kind: "number", value: -Number(operand.getLiteralText()) };
    }
  }

  if (Node.isTrueLiteral(expression)) {
    return { kind: "boolean", value: true };
  }

  if (Node.isFalseLiteral(expression)) {
    return { kind: "boolean", value: false };
  }

  if (!expression) {
    // Implicit boolean!
    return { kind: "boolean", value: true };
  }

  return { kind: "unhandled", value: expression.getText() };
}

export function resolveGroupName({
  propName,
  source,
  tags,
}: {
  propName: string;
  source: "react" | "three" | "unknown";
  tags: Record<string, number | string | boolean>;
}): string {
  const customGroupName =
    typeof tags.group === "string" ? tags.group : undefined;

  if (source === "react") {
    return customGroupName || reactDOMPropGrouping[propName] || "Other";
  }

  if (source === "three") {
    return customGroupName || threeFiberPropGrouping[propName] || "Other";
  }

  return customGroupName || "Other";
}

export function resolveSource(
  type: Type<ts.Type>,
): "react" | "three" | undefined {
  const symbol = type.getSymbol() || type.getAliasSymbol();
  const filePath =
    symbol?.getDeclarations().at(0)?.getSourceFile().getFilePath() ||
    type.getText();

  if (
    filePath?.includes("@react-three/fiber/") ||
    filePath?.includes("@types/three/")
  ) {
    return "three";
  }

  if (filePath?.includes("@types/react/")) {
    return "react";
  }

  return undefined;
}

export function getJsxElementPropTypes(
  element: JsxSelfClosingElement | JsxElement | JsxFragment,
) {
  const props: (Prop | DeclaredProp)[] = [];
  const { attributes, children } = getAttributes(element);
  const jsxDecl = getJsxDeclProps(element);
  const unionValueLabels: Record<string, Record<string, string>> = {};
  const defaultValues: Record<string, ExpressionValue> = {};
  const elementName = getJsxTag(element).tagName;

  if (!jsxDecl) {
    return {
      elementName,
      props: [],
      source: "unknown",
      transforms: { rotate: false, scale: false, translate: false },
    };
  }

  const { declaration, properties, source, symbolType } = jsxDecl;

  const sources = {
    react: source === "react",
    three: source === "three",
  };

  let rotate = false;
  let scale = false;
  let translate = false;

  const binding = getComponentPropsObjectBinding(declaration, symbolType);

  if (binding) {
    binding.getElements().forEach((element) => {
      const name = element.getPropertyNameNode() || element.getNameNode();
      if (!name) {
        return;
      }

      const propertyName = name.getText();
      const initializer = element.getInitializer?.();

      if (!initializer) {
        return;
      }

      defaultValues[propertyName] = resolveExpressionValue(initializer);
    });
  }

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const declarations = prop.getDeclarations();
    const propName = prop.getName();
    const propDeclaration = declarations.at(0);
    const propType = prop.getTypeAtLocation(declaration);
    const { description, tags } = extractJSDoc(prop);
    const unionLabels = collectUnionLabels(
      propType,
      unionValueLabels,
      propDeclaration,
    );
    const defaultValue = defaultValues[propName];
    const isOptional = prop.isOptional();

    const declaredProp =
      propName === "children"
        ? children || attributes[propName]
        : attributes[propName];

    if (declaredProp) {
      const type = unrollType(propType, unionLabels);
      const { start, value } = Array.isArray(declaredProp)
        ? resolveChildJsxValue(declaredProp)
        : resolveAttributeValue(declaredProp);
      const { column, line } = element
        .getSourceFile()
        .getLineAndColumnAtPos(start);

      if (value.kind !== "unhandled" && value.kind !== "identifier") {
        if (propName === "rotation") {
          rotate = true;
        } else if (propName === "position") {
          translate = true;
        } else if (propName === "scale") {
          scale = true;
        }
      }

      if (type.kind === "union") {
        // Sort the union values to have the one that matches the first value as the first option.
        sortUnionType(type, value.value);
      }

      const propSource = resolveSource(propType);
      if (propSource === "react") {
        sources.react = true;
      } else if (propSource === "three") {
        sources.three = true;
      }

      props.push({
        ...type,
        column,
        description: description || undefined,
        group: "Other",
        line,
        name: propName,
        required: !isOptional,
        tags,
        value: value.value as string,
        valueKind: value.kind,
        ...(defaultValue ? { defaultValue } : undefined),
      });
    } else {
      const type = unrollType(propType, unionLabels);

      if (propName === "rotation") {
        rotate = true;
      } else if (propName === "position") {
        translate = true;
      } else if (propName === "scale") {
        scale = true;
      }

      if (type.kind === "union" && defaultValue) {
        // Sort the union values to have the one that matches the first value as the first option.
        sortUnionType(type, defaultValue.value);
      }

      const propSource = resolveSource(propType);
      if (propSource === "react") {
        sources.react = true;
      } else if (propSource === "three") {
        sources.three = true;
      }

      props.push({
        ...type,
        description: description || undefined,
        group: "Other",
        name: propName,
        required: !isOptional,
        tags,
        ...(defaultValue ? { defaultValue } : undefined),
      });
    }
  }

  const reconciledSource =
    (sources.three && "three") || (sources.react && "react") || "unknown";

  /**
   * We resolve the group name after the initial loop because we need to get the
   * data on all props to see where they're sourced from.
   */
  const groupedProps = props.map((prop) => ({
    ...prop,
    group: resolveGroupName({
      propName: prop.name,
      source: reconciledSource,
      tags: prop.tags,
    }),
  }));

  return {
    elementName,
    props: groupedProps,
    source: reconciledSource,
    transforms: { rotate, scale, translate },
  };
}

function getComponentPropsObjectBinding(
  declaration: Node,
  propsSymbolType?: SymbolType,
) {
  const valueDeclaration = propsSymbolType?.getValueDeclaration();
  if (Node.isParameterDeclaration(valueDeclaration)) {
    const nameNode = valueDeclaration.getNameNode();

    if (Node.isObjectBindingPattern(nameNode)) {
      return nameNode;
    }
  }

  if (Node.isVariableDeclaration(declaration)) {
    const initializer = declaration.getInitializer?.();
    if (Node.isArrowFunction(initializer)) {
      const param = initializer.getParameters()[0];
      if (param) {
        const binding = param.getNameNode();
        if (Node.isObjectBindingPattern(binding)) {
          return binding;
        }
      }
    }
  }

  return undefined;
}

export function getFunctionPropTypes(
  sourceFile: SourceFileReadOnly,
  exportName: string,
): { props: Prop[]; source: Source; transforms: Transforms } | undefined {
  const propTypes: Prop[] = [];
  const exportNode = getExportName(sourceFile, exportName);
  const type = exportNode?.declaration.getType();
  const signatures = type?.getCallSignatures();
  const sources = {
    react: false,
    three: false,
  };

  if (!signatures || !exportNode || signatures.length === 0) {
    // No signatures for this call-like node found.
    return undefined;
  }

  const [props] = signatures[0].getParameters();
  if (!props) {
    // No props arg
    return undefined;
  }

  const propsType = sourceFile
    .getProject()
    .getTypeChecker()
    .getTypeOfSymbolAtLocation(props, exportNode.declaration);

  const properties = propsType.getApparentProperties();
  const defaultValues: Record<string, ExpressionValue> = {};

  let rotate = false;
  let scale = false;
  let translate = false;

  const binding = getComponentPropsObjectBinding(exportNode.declaration, props);
  if (binding) {
    binding.getElements().forEach((element) => {
      const name = element.getPropertyNameNode() || element.getNameNode();
      if (!name) {
        return;
      }

      const propertyName = name.getText();
      const initializer = element.getInitializer?.();

      if (!initializer) {
        return;
      }

      defaultValues[propertyName] = resolveExpressionValue(initializer);
    });
  }

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const propName = prop.getName();
    const propType = prop.getTypeAtLocation(exportNode.declaration);
    const { description, tags } = extractJSDoc(prop);

    if (propName === "rotation") {
      rotate = true;
    } else if (propName === "position") {
      translate = true;
    } else if (propName === "scale") {
      scale = true;
    }

    const defaultValue = defaultValues[propName];

    const propSource = resolveSource(propType);
    if (propSource === "react") {
      sources.react = true;
    } else if (propSource === "three") {
      sources.three = true;
    }

    propTypes.push({
      ...unrollType(propType),
      description: description || undefined,
      group: "Other",
      name: propName,
      required: !prop.isOptional(),
      tags,
      ...(defaultValue ? { defaultValue } : undefined),
    });
  }

  const reconciledSource =
    (sources.three && "three") || (sources.react && "react") || "unknown";

  /**
   * We resolve the group name after the initial loop because we need to get the
   * data on all props to see where they're sourced from.
   */
  const groupedProps = propTypes.map((prop) => ({
    ...prop,
    group: resolveGroupName({
      propName: prop.name,
      source: reconciledSource,
      tags: prop.tags,
    }),
  }));

  return {
    props: groupedProps,
    source: reconciledSource,
    transforms: { rotate, scale, translate },
  };
}
