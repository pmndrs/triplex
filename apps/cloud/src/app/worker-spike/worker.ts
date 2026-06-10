/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/// <reference lib="webworker" />
import { Project, ScriptTarget, SyntaxKind, type JsxElement, type JsxSelfClosingElement } from "ts-morph";

type Req =
  | { id: number; type: "parse"; filename: string; source: string }
  | { id: number; type: "ping" };

type Res =
  | { id: number; type: "ping"; ok: true }
  | {
      id: number;
      type: "parsed";
      ok: true;
      exports: string[];
      jsxSummary: Array<{ tag: string; depth: number; line: number; column: number }>;
      durationMs: number;
    }
  | { id: number; type: "error"; ok: false; error: string };

const project = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    jsx: 4, // JsxEmit.ReactJSX
    target: ScriptTarget.ESNext,
    allowJs: true,
  },
});

function describeJsx(file: ReturnType<Project["createSourceFile"]>) {
  const out: Array<{ tag: string; depth: number; line: number; column: number }> = [];
  function walk(node: import("ts-morph").Node, depth: number) {
    if (
      node.getKind() === SyntaxKind.JsxElement ||
      node.getKind() === SyntaxKind.JsxSelfClosingElement
    ) {
      const el = node as JsxElement | JsxSelfClosingElement;
      const opening =
        node.getKind() === SyntaxKind.JsxElement
          ? (el as JsxElement).getOpeningElement()
          : (el as JsxSelfClosingElement);
      const tag = opening.getTagNameNode().getText();
      const { line, column } = file.getLineAndColumnAtPos(node.getStart());
      out.push({ tag, depth, line, column });
      depth += 1;
    }
    node.forEachChild((c) => walk(c, depth));
  }
  walk(file, 0);
  return out;
}

self.onmessage = (e: MessageEvent<Req>) => {
  const msg = e.data;
  try {
    if (msg.type === "ping") {
      const res: Res = { id: msg.id, type: "ping", ok: true };
      self.postMessage(res);
      return;
    }
    if (msg.type === "parse") {
      const start = performance.now();
      const filename = msg.filename;
      let file = project.getSourceFile(filename);
      if (file) project.removeSourceFile(file);
      file = project.createSourceFile(filename, msg.source, { overwrite: true });
      const exports: string[] = [];
      file.getExportSymbols().forEach((sym) => exports.push(sym.getName()));
      const jsxSummary = describeJsx(file);
      const res: Res = {
        id: msg.id,
        type: "parsed",
        ok: true,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        exports,
        jsxSummary,
      };
      self.postMessage(res);
      return;
    }
  } catch (err) {
    const res: Res = {
      id: msg.id ?? -1,
      type: "error",
      ok: false,
      error: (err as Error).message,
    };
    self.postMessage(res);
  }
};

// Notify the main thread we're ready.
self.postMessage({ id: -1, type: "ping", ok: true } satisfies Res);
