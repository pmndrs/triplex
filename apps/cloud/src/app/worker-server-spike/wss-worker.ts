/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/// <reference lib="webworker" />
import {
  Node,
  Project,
  ScriptTarget,
  SyntaxKind,
  type JsxElement,
  type JsxFragment,
  type JsxSelfClosingElement,
  type SourceFile,
} from "ts-morph";

type Req =
  | { type: "fetch-file"; path: string; contents: string }
  | { type: "subscribe"; subId: number; path: string }
  | { type: "unsubscribe"; subId: number };

type Res =
  | { type: "ready" }
  | { type: "message"; subId: number; path: string; data: unknown }
  | { type: "error"; subId: number; path: string; error: string };

interface JsxElementPosition {
  astPath: string;
  children: JsxElementPosition[];
  column: number;
  exportName?: string;
  line: number;
  name: string;
  parentPath: string;
  path?: string;
  tagName: string;
  type: "host" | "custom";
}

const project = new Project({
  compilerOptions: { allowJs: true, jsx: 4, target: ScriptTarget.ESNext },
  useInMemoryFileSystem: true,
});

const fileCache = new Map<string, string>();

function ensureSourceFile(path: string): SourceFile | undefined {
  const source = fileCache.get(path);
  if (source === undefined) return undefined;
  const existing = project.getSourceFile(path);
  if (existing) project.removeSourceFile(existing);
  return project.createSourceFile(path, source, { overwrite: true });
}

function inferExports(file: string) {
  const namedExports = file.matchAll(
    /export (function|const|let) ([A-Z]\w+)/g,
  );
  const defaultExport = /export default .*? ?\(?([A-Z]\w+)/.exec(file);
  const foundExports: { exportName: string; name: string }[] = [];
  for (const match of namedExports) {
    const [, , exportName] = match;
    foundExports.push({ exportName, name: exportName });
  }
  if (defaultExport) {
    foundExports.push({ exportName: "default", name: defaultExport[1] });
  }
  return foundExports;
}

function getJsxTag(
  node: JsxElement | JsxSelfClosingElement | JsxFragment,
): { name: string; tagName: string; type: "host" | "custom" } {
  if (Node.isJsxFragment(node)) {
    return { name: "Fragment", tagName: "", type: "custom" };
  }
  const tagName = Node.isJsxElement(node)
    ? node.getOpeningElement().getTagNameNode().getText()
    : node.getTagNameNode().getText();
  const type: "host" | "custom" = /^[a-z]/.exec(tagName) ? "host" : "custom";
  return { name: tagName, tagName, type };
}

function resolveExportDeclaration(node: Node | undefined): Node | undefined {
  if (!node) return undefined;
  if (Node.isExportAssignment(node)) {
    const expression = node.getExpression();
    const decls = Node.isCallExpression(expression)
      ? expression.getArguments()[0]?.getSymbol()?.getDeclarations()
      : expression?.getSymbol()?.getDeclarations();
    const filtered = decls?.filter(
      (d) =>
        !Node.isTypeAliasDeclaration(d) && !Node.isInterfaceDeclaration(d),
    );
    return filtered?.[0] ?? node;
  }
  if (Node.isVariableDeclaration(node)) {
    return node.getInitializer() ?? node;
  }
  return node;
}

function getJsxElementsPositions(
  sourceFile: SourceFile,
  exportName: string,
): JsxElementPosition[] | undefined {
  const foundExport = sourceFile
    .getExportSymbols()
    .find((sym) => sym.getName() === exportName);
  if (!foundExport) return undefined;
  const declarations = foundExport.getDeclarations();
  if (declarations.length === 0) return undefined;
  const root = resolveExportDeclaration(declarations[0]);
  if (!root) return undefined;

  const tree: JsxElementPosition[] = [];
  const parentMap = new Map<Node, JsxElementPosition>();

  root.forEachDescendant((node) => {
    if (
      !Node.isJsxElement(node) &&
      !Node.isJsxSelfClosingElement(node) &&
      !Node.isJsxFragment(node)
    ) {
      return;
    }
    const { column, line } = sourceFile.getLineAndColumnAtPos(node.getStart());
    const tag = getJsxTag(node);
    const position: JsxElementPosition = {
      astPath: "",
      children: [],
      column,
      line,
      name: tag.name,
      parentPath: "",
      tagName: tag.tagName,
      type: tag.type,
      ...(tag.type === "custom" ? { exportName: "default" } : {}),
    };
    parentMap.set(node, position);
    let parentNode: Node | undefined = node.getParent();
    let parentPos: JsxElementPosition | undefined;
    while (parentNode) {
      parentPos = parentMap.get(parentNode);
      if (parentPos) break;
      parentNode = parentNode.getParent();
    }
    if (parentPos) parentPos.children.push(position);
    else tree.push(position);
  });

  function computePaths(nodes: JsxElementPosition[], prefix: string) {
    const counts: Record<string, number> = {};
    for (const n of nodes) {
      counts[n.tagName] ??= 0;
      const idx = counts[n.tagName]++;
      const suffix = idx > 0 ? `.${idx}` : "";
      n.astPath = `${prefix}/${n.tagName}${suffix}`;
      n.parentPath = prefix;
      computePaths(n.children, n.astPath);
    }
  }
  computePaths(tree, "");
  return tree;
}

function matchRoute(path: string): {
  name: string;
  params: Record<string, string>;
} | null {
  const segs = path.split("/").filter(Boolean);
  if (segs.length === 0) return null;
  if (segs[0] === "project") {
    if (segs[1] === "repo") return { name: "/project/repo", params: {} };
    if (segs[1] === "dependencies")
      return { name: "/project/dependencies", params: {} };
  }
  if (segs[0] === "scene") {
    const last = segs[segs.length - 1];
    if (segs.length === 2)
      return {
        name: "/scene/:path",
        params: { path: decodeURIComponent(segs[1]) },
      };
    if (segs.length === 3 && last === "diagnostics")
      return {
        name: "/scene/:path/diagnostics",
        params: { path: decodeURIComponent(segs[1]) },
      };
    if (segs.length === 3)
      return {
        name: "/scene/:path/:exportName",
        params: {
          exportName: decodeURIComponent(segs[2]),
          path: decodeURIComponent(segs[1]),
        },
      };
    if (last === "props" && segs.length >= 4 && segs.length <= 6) {
      const exportNames = segs
        .slice(2, -1)
        .map((s) => decodeURIComponent(s));
      return {
        name: "/scene/:path/:exportName/props",
        params: {
          exportName: exportNames[0],
          exportName1: exportNames[1] ?? "",
          exportName2: exportNames[2] ?? "",
          path: decodeURIComponent(segs[1]),
        },
      };
    }
  }
  return null;
}

function handleRoute(
  routeName: string,
  params: Record<string, string>,
): unknown {
  if (routeName === "/project/repo") {
    return { visibility: "public" } as const;
  }
  if (routeName === "/project/dependencies") {
    return {
      args: [],
      missingDependencies: {
        category: "react-three-fiber",
        optional: [],
        required: [],
      },
      pkgManager: "npm",
    };
  }
  if (routeName === "/scene/:path/diagnostics") {
    return [];
  }
  if (routeName === "/scene/:path") {
    const file = ensureSourceFile(params.path);
    if (!file) throw new Error(`no source for ${params.path}`);
    const text = file.getText();
    return {
      exports: inferExports(text),
      matchesComponentsGlob: true,
      matchesFilesGlob: true,
      path: params.path,
    };
  }
  if (routeName === "/scene/:path/:exportName/props") {
    // Stub: empty props for each export. Good enough for boot path.
    const stub = {
      props: [],
      source: { react: false, three: false },
      transforms: { rotate: false, scale: false, translate: false },
    };
    if (params.exportName1 || params.exportName2) {
      return [stub, stub, stub];
    }
    return stub;
  }
  if (routeName === "/scene/:path/:exportName") {
    const file = ensureSourceFile(params.path);
    if (!file) throw new Error(`no source for ${params.path}`);
    const text = file.getText();
    const found = inferExports(text).find(
      (e) => e.exportName === params.exportName,
    );
    if (!found) return undefined;
    const positions = getJsxElementsPositions(file, params.exportName);
    if (!positions) return undefined;
    const exp = file
      .getExportSymbols()
      .find((s) => s.getName() === params.exportName);
    const decl = exp?.getDeclarations()[0];
    const loc = decl
      ? file.getLineAndColumnAtPos(decl.getStart())
      : { column: 0, line: 0 };
    return {
      column: loc.column,
      exports: inferExports(text),
      line: loc.line,
      matchesFilesGlob: true,
      name: found.name,
      path: params.path,
      sceneObjects: positions,
    };
  }
  throw new Error(`unknown route ${routeName}`);
}

self.onmessage = (e: MessageEvent<Req>) => {
  const msg = e.data;
  if (msg.type === "fetch-file") {
    fileCache.set(msg.path, msg.contents);
    return;
  }
  if (msg.type === "unsubscribe") return;
  if (msg.type === "subscribe") {
    // eslint-disable-next-line no-console
    console.log("[wss-worker] subscribe", msg.path);
    try {
      const matched = matchRoute(msg.path);
      if (!matched) {
        // eslint-disable-next-line no-console
        console.log("[wss-worker] NO MATCH for", msg.path);
        const res: Res = {
          error: `no route matches ${msg.path}`,
          path: msg.path,
          subId: msg.subId,
          type: "error",
        };
        self.postMessage(res);
        return;
      }
      const data = handleRoute(matched.name, matched.params);
      // eslint-disable-next-line no-console
      console.log(
        "[wss-worker] →",
        matched.name,
        JSON.stringify(matched.params),
      );
      const res: Res = {
        data,
        path: msg.path,
        subId: msg.subId,
        type: "message",
      };
      self.postMessage(res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("[wss-worker] ERROR", msg.path, (err as Error).message);
      const res: Res = {
        error: (err as Error).message,
        path: msg.path,
        subId: msg.subId,
        type: "error",
      };
      self.postMessage(res);
    }
  }
};

const ready: Res = { type: "ready" };
self.postMessage(ready);
