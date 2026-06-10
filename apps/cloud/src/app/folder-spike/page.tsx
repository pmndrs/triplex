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
import { scaffold } from "./scaffold";

const TRIPLEX_ENV_BASE = {
  env: {
    config: {
      define: {},
      experimental: {},
      files: ["/src/**/*.tsx"],
      provider: "/src/provider.tsx",
      publicDir: "/public",
    },
    externalIP: "127.0.0.1",
    fgEnvironmentOverride: "local",
    ports: { client: 5870, server: 5871, ws: 5872 },
  },
  isTelemetryEnabled: false,
  sessionId: "folder-session",
  userId: "folder-user",
  version: "0.72.5",
};

function buildIframeHtml(initialPath: string, initialExport: string): string {
  const env = {
    ...TRIPLEX_ENV_BASE,
    initialState: { exportName: initialExport, path: initialPath },
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

    window.triplex = ${JSON.stringify(env)};
    window.acquireVsCodeApi = function () {
      return { postMessage: function () {}, getState: function () { return null; }, setState: function () {} };
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

  const startWithHandle = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      setFolderName(handle.name);
      setStatus("picked");
      log(`[folder] picked: ${handle.name}`);

      // Ask for readwrite. Browser may auto-grant if previously approved.
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

      // Prepare the editor iframe HTML now that we know the initial state.
      setIframeHtml(buildIframeHtml(target.path, target.exportName));

      // Boot worker.
      const w = new Worker(
        new URL("../worker-server-spike/wss-worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = w;
      const channel = new MessageChannel();
      channelRef.current = channel;
      channel.port1.onmessage = (e) => w.postMessage(e.data);
      w.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === "ready") {
          log("[worker] ready");
          return;
        }
        if (msg.type === "error") {
          log(`[worker err] ${msg.path}: ${msg.error}`);
        } else if (msg.type === "message") {
          // Quiet — too noisy.
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
      const tree = scaffold(walk.tree, /* pkgJsonText (already in tree) */ null);
      await container.mount(tree);
      setStatus("wc-installing");
      log("[wc] npm install --legacy-peer-deps…");
      const install = await container.spawn("npm", [
        "install",
        "--legacy-peer-deps",
      ]);
      install.output.pipeTo(
        new WritableStream({
          write(chunk) {
            const t = chunk.trim();
            if (!t) return;
            // Suppress per-line npm progress noise.
            if (t.length > 200) return;
            log(`[npm] ${t.slice(0, 180)}`);
          },
        }),
      );
      const installExit = await install.exit;
      if (installExit !== 0) {
        log(`[wc] install failed (${installExit})`);
        return;
      }
      log("[wc] starting vite…");
      const dev = await container.spawn("npm", ["run", "dev"]);
      dev.output.pipeTo(
        new WritableStream({
          write(chunk) {
            const t = chunk.trim();
            if (t) log(`[vite] ${t.slice(0, 220)}`);
          },
        }),
      );
      container.on("server-ready", (port, url) => {
        log(`[wc] server-ready ${port} ${url}`);
        setSceneUrl(url);
        setStatus("wc-ready");
        // Notify iframe if it's already up.
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ type: "scene-url", url }, "*");
        }
        maybeSendPort.current?.();
      });
    },
    [log],
  );

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
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [sceneUrl, log]);

  const onPick = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle: FileSystemDirectoryHandle = await (
        window as any
      ).showDirectoryPicker({ mode: "readwrite" });
      await saveRootHandle(handle);
      setHasStoredHandle(true);
      await startWithHandle(handle);
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
    setHasStoredHandle(false);
    setFolderName(null);
    log("[folder] cleared persisted handle");
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
        padding: 0,
      }}
    >
      <header
        style={{
          alignItems: "center",
          borderBottom: "1px solid #222",
          display: "flex",
          gap: 12,
          padding: 12,
        }}
      >
        <strong>Folder spike</strong>
        <span style={{ color: "#888" }}>
          status: <span data-testid="status">{status}</span>
          {folderName && <> · folder: <span style={{ color: "#7fa" }}>{folderName}</span></>}
          {walkSummary && (
            <> · {walkSummary.fileCount} files{walkSummary.skipped ? `, ${walkSummary.skipped} skipped` : ""}{walkSummary.truncated ? " (truncated)" : ""}</>
          )}
          {sceneUrl && <> · scene: <span style={{ color: "#7fa" }}>{sceneUrl}</span></>}
          {initialTarget && <> · target: <span style={{ color: "#7fa" }}>{initialTarget.path}#{initialTarget.exportName}</span></>}
        </span>
        <span style={{ flex: 1 }} />
        {status === "idle" && (
          <>
            <button onClick={onPick} style={btn}>Open folder…</button>
            {hasStoredHandle && (
              <button onClick={onResume} style={btn}>Resume {folderName}</button>
            )}
            {hasStoredHandle && (
              <button onClick={onForget} style={{ ...btn, background: "#333" }}>Forget</button>
            )}
          </>
        )}
      </header>

      <div
        style={{
          display: "grid",
          flex: 1,
          gridTemplateColumns: iframeHtml ? "1fr 1fr" : "1fr",
          minHeight: 0,
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
          <div style={{ alignItems: "center", color: "#888", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", padding: 24 }}>
            <p>Pick a Triplex project folder to begin.</p>
            <p style={{ fontSize: 12, maxWidth: 480, textAlign: "center" }}>
              Chromium only (File System Access API). The folder is mirrored
              into a Web Worker (for AST) and a WebContainer (for Vite). The
              first run installs npm deps, so initial boot is ~30–60s.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <strong style={{ color: "#7af", padding: "8px 8px 0" }}>parent log</strong>
          <pre
            style={{
              background: "#000",
              border: "1px solid #222",
              flex: 1,
              fontSize: 11,
              margin: 8,
              overflow: "auto",
              padding: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {parentLog.join("\n")}
          </pre>
          <strong style={{ color: "#7af", padding: "8px 8px 0" }}>editor log</strong>
          <pre
            data-testid="editor-log"
            style={{
              background: "#000",
              border: "1px solid #222",
              flex: 1,
              fontSize: 11,
              margin: 8,
              overflow: "auto",
              padding: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {editorLog.join("\n")}
          </pre>
        </div>
      </div>
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
