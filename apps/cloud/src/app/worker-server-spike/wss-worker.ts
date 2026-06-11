/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/// <reference lib="webworker" />
import { Project, ScriptTarget, type SourceFile } from "ts-morph";
import {
  getJsxElementAt,
  getJsxElementFromAstPath,
  getJsxElementProps,
  getJsxElementsPositions,
  getJsxTag,
} from "@triplex/server/src/ast/jsx";
import { getElementFilePath } from "@triplex/server/src/ast/module";
import { propGroupsDef } from "@triplex/server/src/ast/prop-groupings";
import { getFunctionPropTypes } from "@triplex/server/src/ast/type-infer";
import { inferExports } from "@triplex/server/src/util/module";

type Req =
  | { type: "fetch-file"; path: string; contents: string }
  | { type: "subscribe"; subId: number; path: string }
  | { type: "unsubscribe"; subId: number };

type Res =
  | { type: "ready" }
  | { type: "message"; subId: number; path: string; data: unknown }
  | { type: "error"; subId: number; path: string; error: string };

const project = new Project({
  compilerOptions: { allowJs: true, jsx: 4, target: ScriptTarget.ESNext },
  useInMemoryFileSystem: true,
});

const fileCache = new Map<string, string>();

function resolveCachedKey(path: string): string | undefined {
  if (fileCache.has(path)) return path;
  // The Babel-injected metadata uses absolute paths inside the WebContainer
  // (e.g. /home/{wcid}/project/src/app.tsx), but the worker stores files
  // under repo-relative keys (/src/app.tsx). Fall back to a suffix match
  // when the exact key is missing.
  for (const key of fileCache.keys()) {
    if (key.length < path.length && path.endsWith(key)) return key;
  }
  return undefined;
}

function ensureSourceFile(path: string): SourceFile | undefined {
  const key = resolveCachedKey(path);
  if (!key) return undefined;
  const source = fileCache.get(key);
  if (source === undefined) return undefined;
  const existing = project.getSourceFile(key);
  if (existing) project.removeSourceFile(existing);
  return project.createSourceFile(key, source, { overwrite: true });
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
    if (segs[1] === "state") return { name: "/project/state", params: {} };
  }
  if (segs[0] === "folder") return { name: "/folder", params: {} };
  if (segs[0] === "prop-groups-def")
    return { name: "/prop-groups-def", params: {} };
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
    if (segs.length === 5 && segs[2] === "object") {
      return {
        name: "/scene/:path/object/:line/:column",
        params: {
          column: segs[4],
          line: segs[3],
          path: decodeURIComponent(segs[1]),
        },
      };
    }
    if (segs.length === 4 && segs[2] === "object") {
      return {
        name: "/scene/:path/object/:astPath",
        params: {
          astPath: decodeURIComponent(segs[3]),
          path: decodeURIComponent(segs[1]),
        },
      };
    }
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
  if (routeName === "/project/state") {
    return { canRedo: false, canUndo: false };
  }
  if (routeName === "/folder") {
    return { name: "project" };
  }
  if (routeName === "/prop-groups-def") {
    return propGroupsDef;
  }
  if (routeName === "/scene/:path/diagnostics") {
    return [];
  }
  if (routeName === "/scene/:path") {
    const file = ensureSourceFile(params.path);
    if (!file) throw new Error(`no source for ${params.path}`);
    return {
      exports: inferExports(file.getText()),
      matchesComponentsGlob: true,
      matchesFilesGlob: true,
      path: params.path,
    };
  }
  if (routeName === "/scene/:path/:exportName") {
    const file = ensureSourceFile(params.path);
    if (!file) throw new Error(`no source for ${params.path}`);
    const exports = inferExports(file.getText());
    const found = exports.find((e) => e.exportName === params.exportName);
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
      exports,
      line: loc.line,
      matchesFilesGlob: true,
      name: found.name,
      path: params.path,
      sceneObjects: positions.elements,
    };
  }
  if (routeName === "/scene/:path/object/:astPath") {
    const file = ensureSourceFile(params.path);
    if (!file) return undefined;
    const result = getJsxElementFromAstPath(file, params.astPath);
    if (!result) return undefined;
    const [sceneObject] = result;
    const tag = getJsxTag(sceneObject);
    const { props, transforms } = getJsxElementProps(file, sceneObject);
    if (tag.type === "custom") {
      // Mirror the server's behaviour: also include the resolved path.
      return {
        exportName: "default",
        name: tag.tagName,
        path: params.path,
        props,
        transforms,
        type: tag.type,
      } as const;
    }
    return {
      name: tag.tagName,
      props,
      transforms,
      type: tag.type,
    } as const;
  }
  if (routeName === "/scene/:path/object/:line/:column") {
    const line = Number(params.line);
    const column = Number(params.column);
    const file = ensureSourceFile(params.path);
    if (!file) return undefined;
    const sceneObject = getJsxElementAt(file, line, column);
    if (!sceneObject) return undefined;
    const tag = getJsxTag(sceneObject);
    const { props, transforms } = getJsxElementProps(file, sceneObject);
    if (tag.type === "custom") {
      const elementPath = getElementFilePath(sceneObject);
      return {
        exportName: elementPath.exportName,
        name: tag.tagName,
        path: elementPath.filePath,
        props,
        transforms,
        type: tag.type,
      } as const;
    }
    return {
      name: tag.tagName,
      props,
      transforms,
      type: tag.type,
    } as const;
  }
  if (routeName === "/scene/:path/:exportName/props") {
    const file = ensureSourceFile(params.path);
    if (!file) throw new Error(`no source for ${params.path}`);
    const computeOne = (exportName: string) => {
      if (!exportName) return undefined;
      try {
        return getFunctionPropTypes(file, exportName);
      } catch {
        return undefined;
      }
    };
    if (params.exportName1 || params.exportName2) {
      return [
        computeOne(params.exportName),
        computeOne(params.exportName1),
        computeOne(params.exportName2),
      ] as const;
    }
    return computeOne(params.exportName);
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
