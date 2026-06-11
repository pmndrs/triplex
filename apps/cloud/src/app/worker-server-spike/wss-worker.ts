/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/// <reference lib="webworker" />
import {
  InMemoryFileSystemHost,
  Project,
  ScriptTarget,
  type SourceFile,
} from "ts-morph";
import {
  getJsxElementAtOrThrow,
  getJsxElementFromAstPath,
  getJsxElementFromAstPathOrThrow,
  getJsxElementAt,
  getJsxElementProps,
  getJsxElementsPositions,
  getJsxTag,
} from "@triplex/server/src/ast/jsx";
import { getElementFilePath } from "@triplex/server/src/ast/module";
import { propGroupsDef } from "@triplex/server/src/ast/prop-groupings";
import { getFunctionPropTypes } from "@triplex/server/src/ast/type-infer";
import { inferExports } from "@triplex/server/src/util/module";
import { upsertProp } from "@triplex/server/src/services/component";

// Custom ts-morph file system. Reads from an internal in-memory map (the
// initial folder mirror); writes go to that map AND through to the user's
// FileSystemDirectoryHandle. Only the async writeFile path persists to
// disk — that's the path sourceFile.save() takes. createSourceFile and
// other loader code use writeFileSync, which we let the parent class
// handle in-memory only, so the initial mirror doesn't touch disk.
class FSAHHost extends InMemoryFileSystemHost {
  private root: FileSystemDirectoryHandle | null = null;

  setRoot(handle: FileSystemDirectoryHandle): void {
    this.root = handle;
  }

  hasRoot(): boolean {
    return this.root !== null;
  }

  override async writeFile(filePath: string, text: string): Promise<void> {
    await super.writeFile(filePath, text);
    await this.persist(filePath, text);
  }

  private async persist(filePath: string, text: string): Promise<void> {
    if (!this.root) return;
    const rel = filePath
      .replace(/^\/home\/[^/]+\/project\//, "")
      .replace(/^\/+/, "");
    // Skip type mirrors and anything pointing back into the WC layout.
    if (rel.startsWith("node_modules/")) return;
    if (!rel) return;
    const segs = rel.split("/").filter(Boolean);
    try {
      let dir = this.root;
      for (let i = 0; i < segs.length - 1; i++) {
        dir = await dir.getDirectoryHandle(segs[i], { create: true });
      }
      const fh = await dir.getFileHandle(segs[segs.length - 1], {
        create: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = await (fh as any).createWritable();
      await w.write(text);
      await w.close();
      // eslint-disable-next-line no-console
      console.log(`[wss-worker] persisted ${rel} (${text.length}B)`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[wss-worker] FSAH write failed for ${rel}:`,
        (err as Error).message,
      );
    }
  }
}

type Req =
  | { type: "fetch-file"; path: string; contents: string }
  | {
      type: "load-types";
      entries: { contents: string; path: string }[];
    }
  | {
      type: "set-root-handle";
      handle: FileSystemDirectoryHandle;
    }
  | {
      type: "mutate-set-prop";
      mutationId: number;
      astPath?: string;
      column: number;
      line: number;
      path: string;
      propName: string;
      propValue: unknown;
    }
  | { type: "save-all"; saveId: number }
  | { type: "subscribe"; subId: number; path: string }
  | { type: "unsubscribe"; subId: number };

type Res =
  | { type: "ready" }
  | { type: "message"; subId: number; path: string; data: unknown }
  | { type: "error"; subId: number; path: string; error: string }
  | {
      type: "mutated";
      mutationId: number;
      ok: boolean;
      error?: string;
      // Updated source so the page can mirror to WC FS for Vite HMR.
      path: string;
      contents?: string;
      dirtyCount: number;
    }
  | {
      type: "saved";
      saveId: number;
      saved: { path: string }[];
      skipped: { path: string; error: string }[];
      dirtyCount: number;
    }
  | { type: "dirty-count"; count: number };

// jsx: 4 == JsxEmit.ReactJSX. Lib + module/resolution are tuned so
// declarations mirrored from the WebContainer's node_modules can resolve
// each other via standard Node-style module lookup.
const fsHost = new FSAHHost();
const project = new Project({
  compilerOptions: {
    allowJs: true,
    esModuleInterop: true,
    jsx: 4,
    lib: ["lib.dom.d.ts", "lib.dom.iterable.d.ts", "lib.esnext.d.ts"],
    module: 99, // ESNext
    moduleResolution: 2, // Node
    skipLibCheck: true,
    target: ScriptTarget.ESNext,
    types: [],
  },
  fileSystem: fsHost,
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
  // Files are eagerly loaded via fetch-file. Just look up — don't reload
  // from fileCache, otherwise we'd clobber in-flight mutations and reset
  // the file's saved state.
  const existing = project.getSourceFile(key);
  if (existing) return existing;
  // Late-bind: file was cached after the project was initialised, or
  // wasn't picked up by the eager-load filter (e.g. an unusual extension).
  const source = fileCache.get(key);
  if (source === undefined) return undefined;
  try {
    return project.createSourceFile(key, source, { overwrite: true });
  } catch {
    return undefined;
  }
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

function ensureSourceFileInProject(path: string, contents: string): void {
  const existing = project.getSourceFile(path);
  if (existing) {
    // Don't trample in-progress mutations. Only refresh when the file is
    // already in sync with disk and the page is just re-pushing initial
    // content.
    if (existing.isSaved() && existing.getFullText() !== contents) {
      existing.replaceWithText(contents);
    }
    return;
  }
  try {
    project.createSourceFile(path, contents, { overwrite: true });
  } catch {
    // Some user files reference types we can't resolve — that's fine,
    // ts-morph still keeps them in the project as best it can.
  }
}

// Active subscription tracking so we can push fresh data when the file
// they depend on gets mutated. Without this the editor's websocks-client
// caches the first response forever — re-selecting the same element after
// an edit returns the old (cached) value even though ts-morph has the new
// one.
interface ActiveSub {
  // The original subscribe path (still URL-encoded so we can echo back).
  path: string;
  // The matched route + params so we can re-handle without re-parsing.
  route: string;
  params: Record<string, string>;
}
const activeSubs = new Map<number, ActiveSub>();

function pathDependsOnFile(sub: ActiveSub, mutatedKey: string): boolean {
  const p = sub.params.path;
  if (!p) return false;
  // Routes use the absolute babel-injected path; the mutated file's
  // ts-morph filePath is the cached key (e.g. /src/foo.tsx). Compare via
  // suffix match in either direction.
  return (
    p === mutatedKey ||
    p.endsWith(mutatedKey) ||
    mutatedKey.endsWith(p)
  );
}

function pushSubsForFile(mutatedKey: string): void {
  for (const [subId, info] of activeSubs) {
    if (!pathDependsOnFile(info, mutatedKey)) continue;
    try {
      const data = handleRoute(info.route, info.params);
      const res: Res = {
        data,
        path: info.path,
        subId,
        type: "message",
      };
      self.postMessage(res);
    } catch (err) {
      const res: Res = {
        error: (err as Error).message,
        path: info.path,
        subId,
        type: "error",
      };
      self.postMessage(res);
    }
  }
}

function countUnsaved(): number {
  let n = 0;
  for (const f of project.getSourceFiles()) {
    if (f.isSaved()) continue;
    if (f.getFilePath().startsWith("/node_modules/")) continue;
    n += 1;
  }
  return n;
}

self.onmessage = (e: MessageEvent<Req>) => {
  const msg = e.data;
  if (msg.type === "fetch-file") {
    fileCache.set(msg.path, msg.contents);
    // Eagerly add to the project so the TS type-checker can resolve cross-
    // file imports (custom components in other files won't get their
    // props resolved otherwise).
    if (
      msg.path.endsWith(".tsx") ||
      msg.path.endsWith(".ts") ||
      msg.path.endsWith(".jsx") ||
      msg.path.endsWith(".js")
    ) {
      ensureSourceFileInProject(msg.path, msg.contents);
    }
    return;
  }
  if (msg.type === "load-types") {
    let added = 0;
    for (const entry of msg.entries) {
      const existing = project.getSourceFile(entry.path);
      if (existing) project.removeSourceFile(existing);
      try {
        project.createSourceFile(entry.path, entry.contents, {
          overwrite: true,
        });
        added += 1;
      } catch {
        // Some d.ts files reference each other in ways ts-morph
        // doesn't like — skip and continue.
      }
    }
    // eslint-disable-next-line no-console
    console.log(`[wss-worker] loaded ${added}/${msg.entries.length} type files`);
    return;
  }
  if (msg.type === "set-root-handle") {
    fsHost.setRoot(msg.handle);
    // eslint-disable-next-line no-console
    console.log("[wss-worker] root handle attached");
    return;
  }
  if (msg.type === "mutate-set-prop") {
    const file = ensureSourceFile(msg.path);
    if (!file) {
      const res: Res = {
        contents: undefined,
        dirtyCount: countUnsaved(),
        error: `no source for ${msg.path}`,
        mutationId: msg.mutationId,
        ok: false,
        path: msg.path,
        type: "mutated",
      };
      self.postMessage(res);
      return;
    }
    try {
      const element = msg.astPath
        ? getJsxElementFromAstPathOrThrow(file, msg.astPath)[0]
        : getJsxElementAtOrThrow(file, msg.line, msg.column);
      upsertProp(element, msg.propName, JSON.stringify(msg.propValue));
      const contents = file.getFullText();
      const res: Res = {
        contents,
        dirtyCount: countUnsaved(),
        mutationId: msg.mutationId,
        ok: true,
        path: file.getFilePath(),
        type: "mutated",
      };
      self.postMessage(res);
      // Re-push any active subscriptions whose data depends on the file
      // we just mutated. Without this the websocks-client caches the
      // first response and re-selecting the same element shows stale
      // props.
      pushSubsForFile(file.getFilePath());
    } catch (err) {
      const res: Res = {
        dirtyCount: countUnsaved(),
        error: (err as Error).message,
        mutationId: msg.mutationId,
        ok: false,
        path: msg.path,
        type: "mutated",
      };
      self.postMessage(res);
    }
    return;
  }
  if (msg.type === "save-all") {
    void (async () => {
      const unsaved = project
        .getSourceFiles()
        .filter((f) => !f.isSaved())
        .filter((f) => {
          // Skip mirrored type declarations — never persisted.
          const p = f.getFilePath();
          return !p.startsWith("/node_modules/");
        });
      const saved: { path: string }[] = [];
      const skipped: { path: string; error: string }[] = [];
      for (const f of unsaved) {
        try {
          // sourceFile.save() walks ts-morph and calls fsHost.writeFile
          // (async). Our custom host then forwards to the user's
          // FileSystemDirectoryHandle.
          await f.save();
          saved.push({ path: f.getFilePath() });
        } catch (err) {
          skipped.push({
            error: (err as Error).message,
            path: f.getFilePath(),
          });
        }
      }
      const res: Res = {
        dirtyCount: countUnsaved(),
        saveId: msg.saveId,
        saved,
        skipped,
        type: "saved",
      };
      self.postMessage(res);
    })();
    return;
  }
  if (msg.type === "unsubscribe") {
    activeSubs.delete(msg.subId);
    return;
  }
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
      activeSubs.set(msg.subId, {
        params: matched.params,
        path: msg.path,
        route: matched.name,
      });
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
