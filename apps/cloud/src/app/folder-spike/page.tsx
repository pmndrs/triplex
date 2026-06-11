/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { WebContainer } from "@webcontainer/api";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearRootHandle,
  loadRootHandle,
  saveRootHandle,
} from "./folder-handle-store";
import { walkFolder, type WalkResult } from "./folder-walk";
import {
  clearSnapshot,
  hashDeps,
  loadSnapshot,
  saveSnapshot,
} from "./node-modules-cache";
import { scaffold } from "./scaffold";

// "triplex:empty-provider.jsx" is the sentinel @triplex/client uses to mean
// "no user-supplied provider"; panel-provider.tsx in the editor short-circuits
// the providers subscription when this is set.
const NO_PROVIDER = "triplex:empty-provider.jsx";

function buildIframeHtml(
  initialPath: string,
  initialExport: string,
  providerPath: string,
): string {
  const env = {
    env: {
      config: {
        define: {},
        experimental: {},
        files: ["/src/**/*.tsx"],
        provider: providerPath,
        publicDir: "/public",
      },
      externalIP: "127.0.0.1",
      fgEnvironmentOverride: "local",
      ports: { client: 5870, server: 5871, ws: 5872 },
    },
    initialState: { exportName: initialExport, path: initialPath },
    isTelemetryEnabled: false,
    sessionId: "folder-session",
    userId: "folder-user",
    version: "0.72.5",
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bridged Editor (folder)</title>
  <style>html,body,#root{margin:0;height:100%;min-height:100%;background:#0b0b0b;color:#fff;}</style>
  <script>
    window.__log = [];
    function flushLog() {
      try { window.parent.postMessage({ type: "editor-log", lines: window.__log.splice(0) }, "*"); } catch {}
    }
    setInterval(flushLog, 250);
    ["log","info","warn","error","debug"].forEach(function (level) {
      const orig = console[level].bind(console);
      console[level] = function () {
        try {
          const args = Array.from(arguments).map(function (a) {
            if (typeof a === "string") return a;
            try { return JSON.stringify(a); } catch { return String(a); }
          });
          window.__log.push(level + ": " + args.join(" "));
        } catch {}
        orig.apply(null, arguments);
      };
    });
    window.addEventListener("error", function (e) {
      window.__log.push("window.error: " + e.message + " @" + e.filename + ":" + e.lineno);
    });
    window.addEventListener("unhandledrejection", function (e) {
      window.__log.push("unhandled: " + (e.reason && e.reason.message ? e.reason.message : String(e.reason)));
    });

    // Forward Cmd+S / Ctrl+S to the parent so it can flush dirty files to
    // the user's FileSystemDirectoryHandle.
    window.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === "s") {
        e.preventDefault();
        try {
          window.parent.postMessage({ type: "save-shortcut" }, "*");
        } catch (err) {}
      }
    }, true);

    // Log all bridge-style postMessage events received by the editor iframe.
    // Anything with {eventName} is a bridge event. Skip our internal types.
    window.addEventListener("message", function (e) {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "bridge-port" || d.type === "scene-url") return;
      if (typeof d.eventName === "string") {
        window.__log.push("[bridge in] " + d.eventName + ((typeof d.data === "object" && d.data) ? " " + JSON.stringify(d.data).slice(0, 200) : ""));
      }
    });


    window.triplex = ${JSON.stringify(env)};
    // Stub VSCode API — but instead of a no-op, forward every postMessage
    // to the parent (our folder-spike page) so we can translate VSCE bridge
    // events into mutations against the WC's @triplex/server + write-back
    // to the user's FileSystemDirectoryHandle.
    window.acquireVsCodeApi = function () {
      return {
        postMessage: function (data) {
          try {
            window.parent.postMessage({ type: "vsce", payload: data }, "*");
          } catch (e) {
            window.__log.push("[vsce forward error] " + e.message);
          }
        },
        getState: function () { return null; },
        setState: function () {},
      };
    };

    let bridgePort = null;
    let sceneUrl = null;
    const pending = new Map();
    let nextSubId = 0;

    class BridgedWebSocket extends EventTarget {
      constructor(url) {
        super();
        this.url = url;
        this.readyState = 0;
        this.subId = ++nextSubId;
        pending.set(this.subId, this);
        const self = this;
        setTimeout(function () {
          self.readyState = 1;
          const ev = new Event("open");
          self.dispatchEvent(ev);
          if (self.onopen) self.onopen(ev);
        }, 0);
      }
      send(data) {
        if (typeof data !== "string") return;
        if (!bridgePort) return;
        bridgePort.postMessage({ type: "subscribe", subId: this.subId, path: data });
      }
      close() {
        this.readyState = 3;
        if (bridgePort) bridgePort.postMessage({ type: "unsubscribe", subId: this.subId });
        pending.delete(this.subId);
        const ev = new CloseEvent("close", { code: 1000 });
        this.dispatchEvent(ev);
        if (this.onclose) this.onclose(ev);
      }
    }
    BridgedWebSocket.CONNECTING = 0;
    BridgedWebSocket.OPEN = 1;
    BridgedWebSocket.CLOSING = 2;
    BridgedWebSocket.CLOSED = 3;
    window.WebSocket = BridgedWebSocket;

    function deliver(msg) {
      const sock = pending.get(msg.subId);
      if (!sock) return;
      let payload;
      if (msg.type === "message") payload = JSON.stringify(msg.data);
      else if (msg.type === "error") payload = JSON.stringify({ error: msg.error });
      else return;
      const ev = new MessageEvent("message", { data: payload });
      sock.dispatchEvent(ev);
      if (sock.onmessage) sock.onmessage(ev);
    }

    function installIframeRewrite() {
      function rewrite(v) {
        if (typeof v !== "string" || !sceneUrl) return v;
        return v.replace(
          /https?:\\/\\/(?:localhost|127\\.0\\.0\\.1):5870/g,
          sceneUrl.replace(/\\/$/, ""),
        );
      }
      const setAttr = HTMLIFrameElement.prototype.setAttribute;
      HTMLIFrameElement.prototype.setAttribute = function (name, value) {
        if (name === "src") value = rewrite(value);
        return setAttr.call(this, name, value);
      };
      const desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
      if (desc && desc.set) {
        Object.defineProperty(HTMLIFrameElement.prototype, "src", {
          ...desc,
          set: function (v) { return desc.set.call(this, rewrite(v)); },
        });
      }
      try {
        document.querySelectorAll("iframe").forEach(function (f) {
          const cur = f.getAttribute("src");
          if (cur) f.setAttribute("src", rewrite(cur));
        });
      } catch {}
      window.__log.push("[shim] iframe[src] rewrite -> " + sceneUrl);
    }

    let bootEditor = null;
    function bootIfReady() { if (bridgePort && bootEditor) bootEditor(); }

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "bridge-port") {
        bridgePort = e.ports[0];
        bridgePort.onmessage = function (ev) { deliver(ev.data); };
        if (e.data.sceneUrl) { sceneUrl = e.data.sceneUrl; installIframeRewrite(); }
        bootIfReady();
      } else if (e.data && e.data.type === "scene-url") {
        sceneUrl = e.data.url;
        installIframeRewrite();
      }
    });

    let readyTick = null;
    function announceReady() {
      window.parent.postMessage({ type: "child-ready" }, "*");
      readyTick = setInterval(function () {
        if (bridgePort) { clearInterval(readyTick); return; }
        window.parent.postMessage({ type: "child-ready" }, "*");
      }, 100);
    }

    bootEditor = function () {
      window.__log.push("[boot] loading editor bundle");
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "/triplex-editor/assets/index.css";
      document.head.appendChild(css);
      const s = document.createElement("script");
      s.type = "module";
      s.src = "/triplex-editor/index.js";
      document.body.appendChild(s);
    };

    announceReady();
  </script>
</head>
<body><div id="root"></div></body>
</html>`;
}

type Status =
  | "idle"
  | "picked"
  | "walked"
  | "wc-installing"
  | "wc-ready"
  | "child-ready";

// Packages whose type defs we want the Worker's ts-morph project to know
// about. Without these, JSX intrinsics resolve to nothing and the props
// panel is empty. Order matters only for log readability.
const TYPE_MIRROR_PACKAGES = [
  "@types/react",
  "@react-three/fiber",
  "three",
  "@types/three",
  "csstype",
];

interface WCFs {
  readdir(
    path: string,
    options: { withFileTypes: true },
  ): Promise<Array<{ isDirectory(): boolean; isFile(): boolean; name: string }>>;
  readdir(path: string): Promise<string[]>;
  readFile(path: string, encoding: "utf-8"): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
}

// Dump the top-level layout of project/ and project/node_modules/ so we
// can see what a cache mount actually produced. Useful when the snapshot
// format's path semantics aren't documented.
async function dumpLayout(
  container: { fs: WCFs },
  log: (s: string) => void,
): Promise<void> {
  for (const dir of ["project", "project/node_modules"]) {
    try {
      const entries = await container.fs.readdir(dir);
      const trimmed = entries.slice(0, 12);
      log(
        `[layout] ${dir} (${entries.length}): ${trimmed.join(", ")}${entries.length > trimmed.length ? "…" : ""}`,
      );
    } catch (err) {
      log(`[layout] ${dir}: read failed (${(err as Error).message})`);
    }
  }
}

interface WCLike {
  fs: WCFs;
}

// Writes `contents` to `relPath` (project-relative) inside the user's
// chosen FileSystemDirectoryHandle, creating directories if needed.
async function writeToDirHandle(
  root: FileSystemDirectoryHandle,
  relPath: string,
  contents: string,
): Promise<void> {
  const segments = relPath.split("/").filter(Boolean);
  if (segments.length === 0) throw new Error("empty path");
  let dir = root;
  for (let i = 0; i < segments.length - 1; i++) {
    dir = await dir.getDirectoryHandle(segments[i], { create: false });
  }
  const file = await dir.getFileHandle(segments.at(-1)!, { create: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = await (file as any).createWritable();
  await w.write(contents);
  await w.close();
}

// Translates one vscode-bridge event into an HTTP call to the WC's
// @triplex/server. We use `mode: "no-cors"` because the WC proxy URL
// rejects CORS preflights even though the server sets
// Access-Control-Allow-Origin:* — the response is opaque but the side
// effect (file mutation) still lands. Returns the absolute path of the
// file that was (probably) mutated, or null if not applicable.
async function applyVSCEMutation(
  evt: { eventName: string; data: unknown },
  ctx: { log: (s: string) => void; server5871Url: string },
): Promise<string | null> {
  const { log, server5871Url } = ctx;
  const base = server5871Url.replace(/\/$/, "");
  const data = evt.data as Record<string, unknown>;
  switch (evt.eventName) {
    case "element-set-prop": {
      const { astPath, column, line, path, propName, propValue } = data as {
        astPath: string;
        column: number;
        line: number;
        path: string;
        propName: string;
        propValue: unknown;
      };
      const url =
        `${base}/scene/object/${line}/${column}/prop?` +
        `value=${encodeURIComponent(JSON.stringify(propValue))}` +
        `&path=${encodeURIComponent(path)}` +
        `&name=${encodeURIComponent(propName)}` +
        `&astPath=${encodeURIComponent(astPath)}`;
      try {
        await fetch(url, { mode: "no-cors" });
        log(
          `[edit] set-prop ${propName} ${path.split("/").pop()}:${line} (dirty)`,
        );
        return path;
      } catch (err) {
        log(`[edit] set-prop error: ${(err as Error).message}`);
        return null;
      }
    }
    case "element-delete": {
      const { astPath, column, line, path } = data as {
        astPath: string;
        column: number;
        line: number;
        path: string;
      };
      const url =
        `${base}/scene/${encodeURIComponent(path)}/object/${line}/${column}/delete?` +
        `astPath=${encodeURIComponent(astPath)}`;
      try {
        await fetch(url, { method: "POST", mode: "no-cors" });
        log(`[edit] delete ${path.split("/").pop()}:${line} (dirty)`);
        return path;
      } catch (err) {
        log(`[edit] delete error: ${(err as Error).message}`);
        return null;
      }
    }
    case "code-update": {
      const u = data as
        | {
            code: string;
            fromLineNumber: number;
            id: string;
            path: string;
            toLineNumber: number;
            type: "replace";
          }
        | {
            code: string;
            id: string;
            lineNumber: number;
            path: string;
            type: "add";
          };
      const url =
        u.type === "replace"
          ? `${base}/scene/${encodeURIComponent(u.path)}/${u.fromLineNumber}/${u.toLineNumber}/replace`
          : `${base}/scene/${encodeURIComponent(u.path)}/${u.lineNumber}/add`;
      try {
        await fetch(url, {
          body: JSON.stringify({ code: u.code, id: u.id }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
          mode: "no-cors",
        });
        log(`[edit] code-update ${u.type} ${u.path.split("/").pop()} (dirty)`);
        return u.path;
      } catch (err) {
        log(`[edit] code-update error: ${(err as Error).message}`);
        return null;
      }
    }
    default:
      return null;
  }
}

// Cmd+S handler: walks every absolute file path the editor has dirtied
// since last save, reads each from the WC, and writes through the user's
// FileSystemDirectoryHandle. The worker also gets the fresh source so its
// AST stays consistent.
async function commitDirtyToDisk(
  dirty: Set<string>,
  ctx: {
    container: WCLike;
    log: (s: string) => void;
    rootHandle: FileSystemDirectoryHandle | null;
    worker: Worker;
  },
): Promise<{ savedPaths: Set<string>; skipped: number }> {
  const { container, log, rootHandle, worker } = ctx;
  if (!rootHandle) {
    log(`[save] no rootHandle — fixture mode? ${dirty.size} pending change(s)`);
    return { savedPaths: new Set(), skipped: dirty.size };
  }
  const savedPaths = new Set<string>();
  let skipped = 0;
  for (const absPath of dirty) {
    const rel = absPath.replace(/^\/home\/[^/]+\/project\//, "");
    const wcPath = `project/${rel}`;
    let contents: string;
    try {
      contents = await container.fs.readFile(wcPath, "utf-8");
    } catch (err) {
      log(`[save] WC read failed ${wcPath}: ${(err as Error).message}`);
      skipped += 1;
      continue;
    }
    worker.postMessage({
      contents,
      path: `/${rel}`,
      type: "fetch-file",
    });
    try {
      await writeToDirHandle(rootHandle, rel, contents);
      log(`[save] ${rel} (${contents.length}B)`);
      savedPaths.add(absPath);
    } catch (err) {
      log(`[save] failed ${rel}: ${(err as Error).message}`);
      skipped += 1;
    }
  }
  return { savedPaths, skipped };
}


async function mirrorTypesIntoWorker(
  container: WCLike,
  worker: Worker,
  log: (s: string) => void,
): Promise<void> {
  const entries: { contents: string; path: string }[] = [];

  async function walk(wcPath: string, virtualPath: string): Promise<void> {
    let dirents: Awaited<ReturnType<WCFs["readdir"]>>;
    try {
      dirents = await container.fs.readdir(wcPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const d of dirents) {
      const childWc = `${wcPath}/${d.name}`;
      const childVirt = `${virtualPath}/${d.name}`;
      if (d.isDirectory()) {
        // Skip nested node_modules — they don't shadow root deps in our
        // synthetic project and only inflate the payload.
        if (d.name === "node_modules") continue;
        await walk(childWc, childVirt);
      } else if (d.isFile()) {
        // Only keep .d.ts and package.json. Source .js/.cjs aren't needed
        // for type resolution and would slow ts-morph to a crawl.
        if (!d.name.endsWith(".d.ts") && d.name !== "package.json") continue;
        try {
          const contents = await container.fs.readFile(childWc, "utf-8");
          entries.push({ contents, path: childVirt });
        } catch {
          // Binary or missing — skip silently.
        }
      }
    }
  }

  for (const pkg of TYPE_MIRROR_PACKAGES) {
    const wcRoot = `project/node_modules/${pkg}`;
    const virtRoot = `/node_modules/${pkg}`;
    const before = entries.length;
    await walk(wcRoot, virtRoot);
    log(`[types] ${pkg}: +${entries.length - before} files`);
  }

  if (entries.length === 0) {
    log("[types] nothing mirrored — worker AST will be type-blind");
    return;
  }
  worker.postMessage({ entries, type: "load-types" });
  log(`[types] sent ${entries.length} declarations to worker`);
}

function inferExportsQuick(
  text: string,
): { exportName: string; name: string }[] {
  const named = text.matchAll(/export (?:function|const|let) ([A-Z]\w+)/g);
  const dflt = /export default .*? ?\(?([A-Z]\w+)/.exec(text);
  const out: { exportName: string; name: string }[] = [];
  for (const m of named) out.push({ exportName: m[1], name: m[1] });
  if (dflt) out.push({ exportName: "default", name: dflt[1] });
  return out;
}

const SCENEY_NAMES = ["scene.tsx", "app.tsx", "main.tsx", "index.tsx"];

function findFirstScene(
  walk: WalkResult,
): { path: string; exportName: string } | null {
  // First pass: prefer files with a scene-ish name (scene.tsx, app.tsx…)
  // Second pass: any .tsx under src/ that isn't provider.tsx.
  const candidates = walk.files.filter(
    (f) =>
      typeof f.contents === "string" &&
      f.path.endsWith(".tsx") &&
      f.path.startsWith("src/") &&
      !f.path.endsWith("/provider.tsx"),
  );
  if (candidates.length === 0) return null;

  const ordered = [
    ...candidates.filter((f) =>
      SCENEY_NAMES.some((n) => f.path.endsWith(`/${n}`) || f.path === n),
    ),
    ...candidates,
  ];

  for (const f of ordered) {
    const exports = inferExportsQuick(f.contents as string);
    if (exports.length === 0) continue;
    // Prefer "default", else the first named export.
    const exportName =
      exports.find((e) => e.exportName === "default")?.exportName ??
      exports[0].exportName;
    return { exportName, path: `/${f.path}` };
  }
  return null;
}

export default function FolderSpike() {
  const workerRef = useRef<Worker | null>(null);
  const containerRef = useRef<WebContainer | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const channelRef = useRef<MessageChannel | null>(null);
  const rootHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const server5871Ref = useRef<string | null>(null);
  // Set by the cache code so the server-ready handler can re-snapshot
  // node_modules after Vite has warmed its dep cache. Both refs are read
  // by the server-ready handler registered before the cache logic runs.
  const justInstalledRef = useRef(false);
  const cacheKeyRef = useRef<string | null>(null);
  // Worker is the source of truth — it tracks "unsaved" via ts-morph's
  // sourceFile.isSaved() and emits dirtyCount on every mutation/save.
  const [dirtyCount, setDirtyCount] = useState(0);
  const mutationIdRef = useRef(0);
  const saveIdRef = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [folderName, setFolderName] = useState<string | null>(null);
  const [hasStoredHandle, setHasStoredHandle] = useState(false);
  const [walkSummary, setWalkSummary] = useState<{
    fileCount: number;
    skipped: number;
    truncated: boolean;
  } | null>(null);
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [parentLog, setParentLog] = useState<string[]>([]);
  const [npmSpinner, setNpmSpinner] = useState<string | null>(null);
  const [editorLog, setEditorLog] = useState<string[]>([]);
  const [initialTarget, setInitialTarget] = useState<{
    path: string;
    exportName: string;
  } | null>(null);
  const [iframeHtml, setIframeHtml] = useState<string | null>(null);

  const log = useCallback((line: string) => {
    setParentLog((l) => [...l, line]);
  }, []);

  // Check for a persisted handle on mount.
  useEffect(() => {
    (async () => {
      const h = await loadRootHandle().catch(() => null);
      if (h) {
        setHasStoredHandle(true);
        setFolderName(h.name);
      }
    })();
  }, []);

  const startWithWalk = useCallback(
    async (walk: WalkResult, displayName: string) => {
      setFolderName(displayName);
      setWalkSummary({
        fileCount: walk.files.length,
        skipped: walk.skipped.length,
        truncated: walk.truncated,
      });
      setStatus("walked");
      log(
        `[folder] done: ${walk.files.length} files, ${walk.skipped.length} skipped${walk.truncated ? " (truncated)" : ""}`,
      );

      const target = findFirstScene(walk);
      if (!target) {
        log("[folder] no .tsx scene file found under src/. Aborting.");
        return;
      }
      setInitialTarget(target);
      log(`[folder] initial scene: ${target.path}#${target.exportName}`);

      // Detect the user's provider file. Triplex's convention is
      // .triplex/provider.tsx; some setups put it under src/. Fall back to
      // the no-provider sentinel if neither exists.
      const providerCandidates = [
        ".triplex/provider.tsx",
        "src/provider.tsx",
      ];
      const providerFile = walk.files.find((f) =>
        providerCandidates.some((c) => f.path === c || f.path.endsWith(`/${c}`)),
      );
      const providerPath = providerFile ? `/${providerFile.path}` : NO_PROVIDER;
      log(`[folder] provider: ${providerPath}`);

      // Prepare the editor iframe HTML now that we know the initial state.
      setIframeHtml(buildIframeHtml(target.path, target.exportName, providerPath));

      // Boot worker.
      const w = new Worker(
        new URL("../worker-server-spike/wss-worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = w;
      // If the user already granted readwrite access, hand the directory
      // handle to the worker so its custom ts-morph FS persists save()s.
      if (rootHandleRef.current) {
        w.postMessage({
          handle: rootHandleRef.current,
          type: "set-root-handle",
        });
      }
      const channel = new MessageChannel();
      channelRef.current = channel;
      channel.port1.onmessage = (e) => w.postMessage(e.data);
      w.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === "ready") {
          log("[worker] ready");
          return;
        }
        if (msg.type === "mutated") {
          setDirtyCount(msg.dirtyCount);
          if (!msg.ok) {
            log(`[edit] worker error: ${msg.error}`);
            return;
          }
          // Mirror the worker's ts-morph buffer into the WC so Vite HMRs.
          const wcRel = msg.path
            .replace(/^\/home\/[^/]+\/project\//, "")
            .replace(/^\/+/, "");
          const wc = containerRef.current;
          if (wc && msg.contents !== undefined) {
            void wc.fs
              .writeFile(`project/${wcRel}`, msg.contents)
              .then(() => log(`[edit] WC sync ${wcRel} (${msg.contents!.length}B)`))
              .catch((err: Error) =>
                log(`[edit] WC sync failed ${wcRel}: ${err.message}`),
              );
          }
          return;
        }
        if (msg.type === "saved") {
          setDirtyCount(msg.dirtyCount);
          log(
            `[save] ${msg.saved.length} saved · ${msg.skipped.length} skipped`,
          );
          for (const s of msg.saved) log(`[save] ✓ ${s.path}`);
          for (const s of msg.skipped) log(`[save] ✗ ${s.path}: ${s.error}`);
          return;
        }
        if (msg.type === "error") {
          log(`[worker err] ${msg.path}: ${msg.error}`);
        } else if (msg.type === "message") {
          // Quiet — subscriptions can be very chatty.
        }
        channel.port1.postMessage(msg);
      };

      // Push every text file into the worker. Worker path keys use a leading
      // slash to match what window.triplex.initialState.path looks like.
      const textFiles = walk.files.filter(
        (f) => typeof f.contents === "string",
      );
      for (const f of textFiles) {
        w.postMessage({
          contents: f.contents as string,
          path: `/${f.path}`,
          type: "fetch-file",
        });
      }
      log(`[worker] preloaded ${textFiles.length} text files`);

      // Boot WebContainer.
      log("[wc] booting…");
      const container = await WebContainer.boot();
      containerRef.current = container;
      // Tell the worker the WC project root so its sceneObjects responses
      // use absolute paths matching what the babel plugin injects into
      // the renderer's runtime meta. Without this, scene→tree selection
      // sync silently fails on the parentPath equality check.
      const projectRoot = `${container.workdir}/project`;
      const existingWorker = workerRef.current;
      if (existingWorker) {
        existingWorker.postMessage({
          root: projectRoot,
          type: "set-project-root",
        });
      }
      log(`[worker] project root → ${projectRoot}`);
      const { tree, triplexDeps } = scaffold(
        walk.tree,
        /* pkgJsonText (already in tree) */ null,
      );

      // Fetch the real @triplex/runtime-bundle (a single ESM file that
      // boots @triplex/server + @triplex/client). We don't run the babel
      // plugin ourselves — the runtime-bundle's bundled @triplex/client
      // wires it up correctly via its full Vite config (scenePlugin,
      // remoteModulePlugin, syncPlugin, glsl, tsconfigPaths, etc.).
      const [runtimeRes, runtimePkgRes] = await Promise.all([
        fetch("/triplex/runtime.mjs"),
        fetch("/triplex/package.json"),
      ]);
      if (!runtimeRes.ok || !runtimePkgRes.ok) {
        log(
          `[wc] runtime fetch failed: runtime=${runtimeRes.status} pkg=${runtimePkgRes.status}`,
        );
        return;
      }
      const runtimeBytes = new Uint8Array(await runtimeRes.arrayBuffer());
      const runtimePkg = await runtimePkgRes.text();
      log(`[wc] runtime ${(runtimeBytes.byteLength / 1024 / 1024).toFixed(2)} MB`);

      // Nest the user's project under ./project. The runtime lives INSIDE
      // project/.triplex-runtime so Node's module resolution finds vite (and
      // friends) in project/node_modules. Top-level package.json keeps WC's
      // home dir from walking past the workspace root.
      (tree as FileSystemTree)[".triplex-runtime"] = {
        directory: {
          "package.json": { file: { contents: runtimePkg } },
          "runtime.mjs": { file: { contents: runtimeBytes } },
        },
      };
      const rootTree: FileSystemTree = {
        "package.json": {
          file: {
            contents: JSON.stringify({
              name: "triplex-folder-spike-root",
              private: true,
            }),
          },
        },
        project: { directory: tree },
      };

      await container.mount(rootTree);
      setStatus("wc-installing");

      // node_modules cache: hash the resolved pkg deps and try to mount a
      // previously-cached snapshot before reaching for npm install.
      const pkgEntry = (tree as FileSystemTree)["package.json"];
      let scaffoldedPkg: {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      } = {};
      if (
        pkgEntry &&
        "file" in pkgEntry &&
        typeof pkgEntry.file.contents === "string"
      ) {
        try {
          scaffoldedPkg = JSON.parse(pkgEntry.file.contents);
        } catch {}
      }
      const depsHash = await hashDeps(scaffoldedPkg);
      cacheKeyRef.current = depsHash;
      log(`[wc] cache check hash=${depsHash.slice(0, 12)}…`);
      let usedCache = false;
      try {
        const cached = await loadSnapshot(depsHash);
        if (!cached) {
          log(`[wc] cache miss (no entry or migrated-out)`);
        } else {
          log(
            `[wc] cache hit (${(cached.byteLength / 1024 / 1024).toFixed(1)} MB)`,
          );
          // container.export(path, {format:"binary"}) snapshots the
          // *contents* of the path. mountPoint requires the target dir to
          // already exist — otherwise the mount silently no-ops. Create
          // project/node_modules first, then mount the contents there.
          try {
            await container.fs.mkdir("project/node_modules", {
              recursive: true,
            });
            await container.mount(cached, {
              mountPoint: "project/node_modules",
            });
            await dumpLayout(container, log);
          } catch (err) {
            log(`[wc] binary mount failed: ${(err as Error).message}`);
            throw err;
          }
          let viteOk = false;
          try {
            await container.fs.readFile(
              "project/node_modules/vite/package.json",
              "utf-8",
            );
            viteOk = true;
          } catch {
            // ignored
          }
          if (viteOk) {
            log("[wc] cache mount OK — vite found");
            usedCache = true;
          } else {
            log("[wc] cache mounted but vite missing — falling back to install");
          }
        }
      } catch (err) {
        log(`[wc] cache mount failed: ${(err as Error).message}`);
      }

      if (usedCache) {
        log("[wc] skipped npm install");
      } else {
        log("[wc] npm install --legacy-peer-deps (in project)…");
      }
      // Old install block follows; guarded behind usedCache.
      const install = usedCache
        ? null
        : await container.spawn(
            "npm",
            ["install", "--legacy-peer-deps", "--no-audit", "--no-fund"],
            { cwd: "project" },
          );
      if (install) {
      justInstalledRef.current = true;
      install.output.pipeTo(
        new WritableStream({
          write(chunk) {
            // Strip ANSI control sequences (npm's cursor-home + clear-line +
            // spinner produce a torrent of these per second).
            const stripped = chunk.replace(
              /\[[\d;]*[a-zA-Z]/g,
              "",
            );
            const t = stripped.trim();
            if (!t) return;
            // If the only thing left is a single spinner character, update
            // the rotating placeholder instead of pushing a new log line.
            if (/^[\\|/\-]$/.test(t)) {
              setNpmSpinner(t);
              return;
            }
            // Multi-char chunks may still contain spinner crud mixed with
            // real text; collapse runs of spinner chars.
            const cleaned = t.replace(/[\\|/\-]{2,}/g, "").trim();
            if (!cleaned) return;
            if (cleaned.length > 200) return;
            log(`[npm] ${cleaned.slice(0, 180)}`);
          },
        }),
      );
      const installExit = await install.exit;
      setNpmSpinner(null);
      if (installExit !== 0) {
        log(`[wc] install failed (${installExit})`);
        return;
      }
      // Snapshot the fresh node_modules for next boot. Binary is opaque
      // but compact and avoids the JSON.stringify hot-loop on large trees.
      try {
        log("[wc] snapshotting node_modules (export)…");
        const bytes = await container.export("project/node_modules", {
          format: "binary",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const snapshot = bytes as any as Uint8Array;
        log(
          `[wc] export ok (${(snapshot.byteLength / 1024 / 1024).toFixed(1)} MB); writing to IDB…`,
        );
        await saveSnapshot(depsHash, snapshot);
        log(
          `[wc] cached ${(snapshot.byteLength / 1024 / 1024).toFixed(1)} MB (hash ${depsHash.slice(0, 12)}…)`,
        );
      } catch (err) {
        log(`[wc] snapshot failed: ${(err as Error).message}`);
      }
      } // close `if (install)`

      // Mount workspace @triplex/* packages into project/node_modules.
      // The runtime-bundle expects @triplex/renderer, @triplex/bridge,
      // @triplex/lib to be resolvable from the project root.
      for (const dep of triplexDeps) {
        const pkgName = dep.replace(/^@triplex\//, "");
        log(`[wc] mounting workspace ${dep}…`);
        try {
          const res = await fetch(`/api/pkg/${pkgName}`);
          if (!res.ok) {
            log(`[wc] /api/pkg/${pkgName} → ${res.status}`);
            continue;
          }
          const { tree: pkgTree } = (await res.json()) as {
            tree: Record<string, unknown>;
          };
          await container.mount(
            {
              node_modules: {
                directory: {
                  "@triplex": {
                    directory: { [pkgName]: { directory: pkgTree } },
                  },
                },
              },
            },
            { mountPoint: "project" },
          );
          log(`[wc] mounted ${dep}`);
        } catch (err) {
          log(`[wc] mount ${dep} failed: ${(err as Error).message}`);
        }
      }

      // Mirror the WC's installed type declarations into the Web Worker so
      // ts-morph there can resolve JSX intrinsic types (mesh, group, div…)
      // and compute real prop types. Without this, getJsxElementProps
      // returns an empty array for every element.
      await mirrorTypesIntoWorker(container, w, log);

      log("[wc] spawning @triplex/runtime-bundle…");
      const triplexProc = await container.spawn(
        "node",
        ["./.triplex-runtime/runtime.mjs"],
        {
          cwd: "project",
          env: {
            TRIPLEX_CLIENT_PORT: "5870",
            TRIPLEX_SERVER_PORT: "5871",
            TRIPLEX_WS_PORT: "5872",
          },
        },
      );
      triplexProc.output.pipeTo(
        new WritableStream({
          write(chunk) {
            const stripped = chunk.replace(
              // eslint-disable-next-line no-control-regex
              /\x1b\[[\d;]*[a-zA-Z]/g,
              "",
            );
            const t = stripped.trim();
            if (!t) return;
            if (/^[\\|/\-]$/.test(t)) return;
            const cleaned = t.replace(/[\\|/\-]{2,}/g, "").trim();
            if (!cleaned) return;
            log(`[runtime] ${cleaned.slice(0, 220)}`);
          },
        }),
      );
      void triplexProc.exit.then((code) =>
        log(`[runtime] exit code=${code}`),
      );
      container.on("server-ready", (port, url) => {
        log(`[wc] server-ready ${port} ${url}`);
        // Port 5871 is @triplex/server's HTTP routes — used for mutations
        // (set-prop, delete, etc.). We capture the proxy URL so the vsce
        // bridge handler can target it.
        if (port === 5871) {
          server5871Ref.current = url;
          return;
        }
        // 5870 is the Vite-served /scene route. 5872 is the WS server
        // (unused — the worker handles all WS).
        if (port !== 5870) return;
        setSceneUrl(url);
        setStatus("wc-ready");
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ type: "scene-url", url }, "*");
        }
        maybeSendPort.current?.();

        // If we just installed (didn't reuse cache), re-snapshot now —
        // Vite has finished its initial pre-bundling pass, so the new
        // snapshot includes node_modules/.vite-* / .triplex-* caches and
        // future cold starts will skip pre-bundling.
        if (justInstalledRef.current && cacheKeyRef.current) {
          const key = cacheKeyRef.current;
          justInstalledRef.current = false;
          setTimeout(() => {
            void (async () => {
              try {
                log("[wc] re-snapshotting after Vite warm-up…");
                const bytes = await container.export("project/node_modules", {
                  format: "binary",
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const snap = bytes as any as Uint8Array;
                await saveSnapshot(key, snap);
                log(
                  `[wc] re-cached ${(snap.byteLength / 1024 / 1024).toFixed(1)} MB (incl. vite pre-bundle)`,
                );
              } catch (err) {
                log(`[wc] re-snapshot failed: ${(err as Error).message}`);
              }
            })();
          }, 3000);
        }
      });
    },
    [log],
  );

  const startWithHandle = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      rootHandleRef.current = handle;
      setStatus("picked");
      log(`[folder] picked: ${handle.name}`);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perm: PermissionState = await (handle as any).requestPermission({
          mode: "readwrite",
        });
        log(`[folder] readwrite permission: ${perm}`);
      } catch (err) {
        log(`[folder] permission error: ${(err as Error).message}`);
      }
      log("[folder] walking…");
      const walk = await walkFolder(handle, (n) =>
        setParentLog((l) => {
          const last = l[l.length - 1];
          const line = `[folder] walked ${n} files`;
          return last === line ? l : [...l, line];
        }),
      );
      await startWithWalk(walk, handle.name);
    },
    [log, startWithWalk],
  );

  const startWithFixture = useCallback(
    async (name: string) => {
      setStatus("picked");
      log(`[fixture] loading examples/${name}…`);
      const res = await fetch(`/api/folder-fixture/${name}`);
      if (!res.ok) {
        log(`[fixture] /api/folder-fixture/${name} → ${res.status}`);
        return;
      }
      const payload = (await res.json()) as {
        files: Array<
          | { contents: string; path: string }
          | { contentsBase64: string; path: string }
        >;
        name: string;
        tree: Record<string, unknown>;
      };
      // Walk the API tree, decoding base64 binaries into Uint8Array so
      // WebContainer.mount accepts them. The API hands us
      // { file: { contents: { base64: "..." } } } for binaries.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function decodeTree(api: any): any {
        const out: Record<string, unknown> = {};
        for (const [name, node] of Object.entries(api)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const n = node as any;
          if ("directory" in n) {
            out[name] = { directory: decodeTree(n.directory) };
          } else if (typeof n.file.contents === "string") {
            out[name] = { file: { contents: n.file.contents } };
          } else {
            const bin = Uint8Array.from(atob(n.file.contents.base64), (c) =>
              c.charCodeAt(0),
            );
            out[name] = { file: { contents: bin } };
          }
        }
        return out;
      }

      const walk: WalkResult = {
        files: payload.files.map((f) =>
          "contents" in f
            ? { contents: f.contents, path: f.path }
            : {
                contents: Uint8Array.from(atob(f.contentsBase64), (c) =>
                  c.charCodeAt(0),
                ),
                path: f.path,
              },
        ),
        skipped: [],
        tree: decodeTree(payload.tree),
        truncated: false,
      };
      await startWithWalk(walk, payload.name);
    },
    [log, startWithWalk],
  );

  // Auto-start when ?fixture=<name> is present in the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fixture = params.get("fixture");
    if (fixture) {
      // Defer to next tick so refs/state are mounted.
      const id = setTimeout(() => {
        startWithFixture(fixture);
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [startWithFixture]);

  // Send port to iframe once worker + WC + child are all ready.
  const maybeSendPort = useRef<() => void>();
  useEffect(() => {
    let portSent = false;
    let childReady = false;
    function trySend() {
      if (portSent) return;
      if (!childReady) return;
      if (!sceneUrl) return;
      if (!channelRef.current) return;
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        { type: "bridge-port", sceneUrl },
        "*",
        [channelRef.current.port2],
      );
      portSent = true;
      setStatus("child-ready");
      log("[parent] port + sceneUrl sent");
    }
    maybeSendPort.current = trySend;
    function onMsg(e: MessageEvent) {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "child-ready") {
        childReady = true;
        trySend();
      } else if (d.type === "editor-log" && Array.isArray(d.lines)) {
        setEditorLog((l) => [...l, ...d.lines]);
      } else if (d.type === "vsce" && d.payload && typeof d.payload === "object") {
        const evt = d.payload as { eventName?: string; data?: unknown };
        if (!evt.eventName) return;
        const worker = workerRef.current;
        if (!worker) {
          log(`[edit] dropped ${evt.eventName} — worker not ready`);
          return;
        }
        if (evt.eventName === "element-set-prop") {
          const p = evt.data as {
            astPath?: string;
            column: number;
            line: number;
            path: string;
            propName: string;
            propValue: unknown;
          };
          const id = ++mutationIdRef.current;
          log(`[edit] set-prop ${p.propName} ${p.path.split("/").pop()}:${p.line}`);
          worker.postMessage({
            astPath: p.astPath,
            column: p.column,
            line: p.line,
            mutationId: id,
            path: p.path,
            propName: p.propName,
            propValue: p.propValue,
            type: "mutate-set-prop",
          });
        } else {
          // Other VSCE event types not yet wired through the worker.
          log(`[vsce] ignored ${evt.eventName} (not routed to worker yet)`);
        }
      } else if (d.type === "save-shortcut") {
        const worker = workerRef.current;
        if (!worker) {
          log("[save] worker not ready");
          return;
        }
        const id = ++saveIdRef.current;
        worker.postMessage({ saveId: id, type: "save-all" });
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        window.postMessage({ type: "save-shortcut" }, "*");
      }
    }
    window.addEventListener("message", onMsg);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sceneUrl, log]);

  const onPick = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle: FileSystemDirectoryHandle = await (
        window as any
      ).showDirectoryPicker({ mode: "readwrite" });
      await saveRootHandle(handle);
      setHasStoredHandle(true);
      rootHandleRef.current = handle;
      // Worker doesn't exist yet — startWithHandle creates it. The transfer
      // happens inside startWithWalk once the worker is up.
    } catch (err) {
      log(`[folder] pick cancelled: ${(err as Error).message}`);
    }
  }, [log, startWithHandle]);

  const onResume = useCallback(async () => {
    const h = await loadRootHandle();
    if (!h) return;
    await startWithHandle(h);
  }, [startWithHandle]);

  const onForget = useCallback(async () => {
    await clearRootHandle();
    await clearSnapshot().catch(() => {});
    setHasStoredHandle(false);
    setFolderName(null);
    log("[folder] cleared persisted handle + node_modules cache");
  }, [log]);

  return (
    <div
      style={{
        background: "#0b0b0b",
        color: "#e6e6e6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
        padding: 0,
      }}
    >
      {/* Kill the body's default 8px margin so the editor iframe sits flush
          against every edge of the viewport. */}
      <style>{`html,body{margin:0;padding:0;background:#0b0b0b;}`}</style>
      {/* Status pill is still useful for the headless verify which queries
          `[data-testid="status"]`; just keep it visually inert. */}
      <div
        aria-hidden
        data-testid="status"
        style={{ height: 0, overflow: "hidden" }}
      >
        {status}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
        {iframeHtml ? (
          <iframe
            ref={iframeRef}
            srcDoc={iframeHtml}
            style={{ background: "#000", border: 0, height: "100%", width: "100%" }}
            title="bridged editor"
          />
        ) : (
          <div
            style={{
              alignItems: "center",
              color: "#888",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "100%",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <p style={{ margin: 0 }}>Pick a Triplex project folder to begin.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onPick} style={btn}>
                Open folder…
              </button>
              {hasStoredHandle && (
                <button onClick={onResume} style={btn}>
                  Resume {folderName}
                </button>
              )}
              {hasStoredHandle && (
                <button onClick={onForget} style={{ ...btn, background: "#333", color: "#ccc" }}>
                  Forget
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, margin: 0, maxWidth: 480, textAlign: "center" }}>
              Chromium only (File System Access API). The folder is mirrored
              into a Web Worker (for AST) and a WebContainer (for the runtime).
              First boot is ~90s; subsequent boots reuse the cached node_modules.
            </p>
          </div>
        )}

        <LogPanel
          editorLog={editorLog}
          npmSpinner={npmSpinner}
          parentLog={parentLog}
        />
      </div>
    </div>
  );
}

function LogPanel({
  editorLog,
  npmSpinner,
  parentLog,
}: {
  editorLog: string[];
  npmSpinner: string | null;
  parentLog: string[];
}) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"parent" | "editor">("parent");

  // Auto-scroll the active pane on new lines — but only when the user
  // hasn't scrolled away from the bottom. If they've intentionally
  // scrolled up to read earlier output, leave their viewport alone.
  const preRef = useRef<HTMLPreElement | null>(null);
  const stickToBottomRef = useRef(true);
  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [parentLog, editorLog, tab, npmSpinner]);

  function onLogScroll(e: React.UIEvent<HTMLPreElement>) {
    const el = e.currentTarget;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    // 24px slack so a single line of new content still counts as "near
    // the bottom" and keeps the stickiness.
    stickToBottomRef.current = distanceFromBottom < 24;
  }

  // When switching tabs the user usually wants the freshest view, so
  // reset the stickiness on tab change.
  useEffect(() => {
    stickToBottomRef.current = true;
  }, [tab]);

  const lines = tab === "parent" ? parentLog : editorLog;

  return (
    <div
      style={{
        background: "rgba(15, 15, 15, 0.92)",
        border: "1px solid #2a2a2a",
        borderRadius: 8,
        bottom: 16,
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
        color: "#e6e6e6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: 11,
        height: open ? 280 : 32,
        position: "absolute",
        right: 16,
        transition: "height 120ms ease",
        width: open ? 460 : 110,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          alignItems: "center",
          background: "transparent",
          border: 0,
          color: "#bbb",
          cursor: "pointer",
          display: "flex",
          fontFamily: "inherit",
          fontSize: 11,
          gap: 8,
          height: 32,
          padding: "0 10px",
          textAlign: "left",
          width: "100%",
        }}
      >
        <span style={{ color: "#7af" }}>logs</span>
        <span style={{ color: "#666" }}>
          ({parentLog.length}/{editorLog.length})
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: "#888" }}>{open ? "—" : "▢"}</span>
      </button>
      {open && (
        <>
          <div
            style={{
              borderBottom: "1px solid #222",
              borderTop: "1px solid #222",
              display: "flex",
            }}
          >
            {(["parent", "editor"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  background: tab === id ? "#1a1a1a" : "transparent",
                  border: 0,
                  borderBottom:
                    tab === id ? "2px solid #7af" : "2px solid transparent",
                  color: tab === id ? "#e6e6e6" : "#888",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  padding: "6px 14px",
                }}
              >
                {id}
              </button>
            ))}
          </div>
          <pre
            ref={preRef}
            data-testid={tab === "editor" ? "editor-log" : "parent-log"}
            onScroll={onLogScroll}
            style={{
              background: "#000",
              flex: 1,
              margin: 0,
              overflow: "auto",
              padding: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {lines.join("\n")}
            {tab === "parent" && npmSpinner ? `\n[npm] ${npmSpinner}` : ""}
          </pre>
        </>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "#fff",
  border: 0,
  color: "#000",
  cursor: "pointer",
  padding: "6px 10px",
};
