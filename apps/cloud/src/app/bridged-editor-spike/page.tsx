/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { WebContainer } from "@webcontainer/api";
import { useEffect, useRef, useState } from "react";
import { sceneProject } from "./scene-project";

const FILES: Record<string, string> = {
  "/src/empty.tsx": "examples/geometry/src/empty.tsx",
  "/src/geometry/box.tsx": "examples/geometry/src/geometry/box.tsx",
  "/src/provider.tsx": "examples/geometry/src/provider.tsx",
  "/src/scene.tsx": "examples/geometry/src/scene.tsx",
};

const INITIAL = {
  exportName: "default",
  path: "/src/geometry/box.tsx",
};

const TRIPLEX_ENV = {
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
  initialState: INITIAL,
  isTelemetryEnabled: false,
  sessionId: "bridge-session",
  userId: "bridge-user",
  version: "0.72.5",
};

const IFRAME_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bridged Editor</title>
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

    window.triplex = ${JSON.stringify(TRIPLEX_ENV)};
    window.acquireVsCodeApi = function () {
      return { postMessage: function () {}, getState: function () { return null; }, setState: function () {} };
    };

    // --- WebSocket shim: route all sockets through MessagePort -> worker.
    let bridgePort = null;
    const pending = new Map();
    let nextSubId = 0;

    class BridgedWebSocket extends EventTarget {
      constructor(url, protocols) {
        super();
        this.url = url;
        this.protocol = "";
        this.binaryType = "arraybuffer";
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
        if (!bridgePort) {
          window.__log.push("[shim] dropped send (no port): " + data);
          return;
        }
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

    let bootEditor = null;
    function bootIfReady() {
      if (bridgePort && bootEditor) bootEditor();
    }

    let sceneUrl = null;

    function installIframeRewrite() {
      // Rewrite any iframe[src] that points at localhost:5870 -> the
      // WebContainer Vite URL we received from the parent.
      function rewrite(value) {
        if (typeof value !== "string" || !sceneUrl) return value;
        return value.replace(
          /https?:\\/\\/(?:localhost|127\\.0\\.0\\.1):5870/g,
          sceneUrl.replace(/\\/$/, ""),
        );
      }
      const setAttr = HTMLIFrameElement.prototype.setAttribute;
      HTMLIFrameElement.prototype.setAttribute = function (name, value) {
        if (name === "src") value = rewrite(value);
        return setAttr.call(this, name, value);
      };
      const desc = Object.getOwnPropertyDescriptor(
        HTMLIFrameElement.prototype,
        "src",
      );
      if (desc && desc.set) {
        Object.defineProperty(HTMLIFrameElement.prototype, "src", {
          ...desc,
          set: function (v) {
            return desc.set.call(this, rewrite(v));
          },
        });
      }
      // Catch already-rendered iframes (React may have inserted them).
      try {
        document.querySelectorAll("iframe").forEach(function (f) {
          const cur = f.getAttribute("src");
          if (cur) f.setAttribute("src", rewrite(cur));
        });
      } catch {}
      window.__log.push("[shim] iframe[src] rewrite installed -> " + sceneUrl);
    }

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "bridge-port") {
        bridgePort = e.ports[0];
        bridgePort.onmessage = function (ev) { deliver(ev.data); };
        if (e.data.sceneUrl) {
          sceneUrl = e.data.sceneUrl;
          installIframeRewrite();
        }
        window.__log.push("[shim] bridge port acquired");
        bootIfReady();
      } else if (e.data && e.data.type === "scene-url") {
        sceneUrl = e.data.url;
        installIframeRewrite();
      }
    });

    // Tell parent we're ready, then load the editor only after the port is wired.
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
      s.onerror = function () { window.__log.push("[boot] editor load failed"); };
      document.body.appendChild(s);
    };

    announceReady();
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

type SpikeStatus =
  | "booting"
  | "preloaded"
  | "scene-ready"
  | "child-ready";

export default function BridgedEditorSpike() {
  const workerRef = useRef<Worker | null>(null);
  const containerRef = useRef<WebContainer | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState<SpikeStatus>("booting");
  const [parentLog, setParentLog] = useState<string[]>([]);
  const [editorLog, setEditorLog] = useState<string[]>([]);
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);

  useEffect(() => {
    const w = new Worker(
      new URL("../worker-server-spike/wss-worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = w;
    const channel = new MessageChannel();

    channel.port1.onmessage = (e) => w.postMessage(e.data);

    w.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "ready") {
        setParentLog((l) => [...l, "[worker] ready"]);
        return;
      }
      if (msg.type === "error") {
        setParentLog((l) => [
          ...l,
          `[worker err] ${msg.path}: ${msg.error}`,
        ]);
      } else if (msg.type === "message") {
        setParentLog((l) => [
          ...l,
          `[worker ok] ${msg.path}`,
        ]);
      }
      channel.port1.postMessage(msg);
    };

    let portSent = false;
    let preloaded = false;
    let childReady = false;
    let sceneReady: string | null = null;
    function maybeSendPort() {
      if (portSent) return;
      if (!preloaded || !childReady || !sceneReady) return;
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        { type: "bridge-port", sceneUrl: sceneReady },
        "*",
        [channel.port2],
      );
      portSent = true;
      setStatus("child-ready");
      setParentLog((l) => [...l, "[parent] port + scene URL sent"]);
    }

    (async () => {
      for (const [vpath, repoPath] of Object.entries(FILES)) {
        const r = await fetch(`/api/file?path=${encodeURIComponent(repoPath)}`);
        if (!r.ok) continue;
        const contents = await r.text();
        w.postMessage({ type: "fetch-file", path: vpath, contents });
      }
      preloaded = true;
      setStatus((s) => (s === "booting" ? "preloaded" : s));
      setParentLog((l) => [...l, "[worker] files preloaded"]);
      maybeSendPort();
    })();

    // Boot the WebContainer that hosts Vite + R3F (the scene renderer).
    (async () => {
      try {
        if (containerRef.current) return;
        setParentLog((l) => [...l, "[wc] booting…"]);
        const container = await WebContainer.boot();
        containerRef.current = container;
        await container.mount(sceneProject);
        setParentLog((l) => [...l, "[wc] npm install…"]);
        const install = await container.spawn("npm", ["install"]);
        const installExit = await install.exit;
        if (installExit !== 0) {
          setParentLog((l) => [
            ...l,
            `[wc] install failed (${installExit})`,
          ]);
          return;
        }
        setParentLog((l) => [...l, "[wc] starting vite…"]);
        const dev = await container.spawn("npm", ["run", "dev"]);
        dev.output.pipeTo(
          new WritableStream({
            write(chunk) {
              const trimmed = chunk.trim();
              if (trimmed) {
                setParentLog((l) => [
                  ...l,
                  `[vite] ${trimmed.slice(0, 200)}`,
                ]);
              }
            },
          }),
        );
        container.on("server-ready", (port, url) => {
          setParentLog((l) => [...l, `[wc] server-ready ${port} ${url}`]);
          sceneReady = url;
          setSceneUrl(url);
          setStatus((s) => (s === "preloaded" ? "scene-ready" : s));
          // Notify iframe if it's already up so the rewrite can install.
          const iframe = iframeRef.current;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(
              { type: "scene-url", url },
              "*",
            );
          }
          maybeSendPort();
        });
      } catch (err) {
        setParentLog((l) => [
          ...l,
          `[wc] error: ${(err as Error).message}`,
        ]);
      }
    })();

    function onMsg(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "child-ready") {
        if (!childReady) setParentLog((l) => [...l, "[child] ready"]);
        childReady = true;
        maybeSendPort();
      } else if (data.type === "editor-log" && Array.isArray(data.lines)) {
        setEditorLog((l) => [...l, ...data.lines]);
      }
    }
    window.addEventListener("message", onMsg);

    return () => {
      window.removeEventListener("message", onMsg);
      w.terminate();
      channel.port1.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <header style={{ padding: 12, borderBottom: "1px solid #222" }}>
        <strong>Bridged editor spike</strong>{" "}
        <span style={{ color: "#888" }}>
          status: <span data-testid="status">{status}</span>
          {sceneUrl && (
            <>
              {" · scene: "}
              <span style={{ color: "#7fa" }}>{sceneUrl}</span>
            </>
          )}
        </span>
      </header>
      <div
        style={{
          display: "grid",
          flex: 1,
          gridTemplateColumns: "1fr 1fr",
          minHeight: 0,
        }}
      >
        <iframe
          ref={iframeRef}
          srcDoc={IFRAME_HTML}
          style={{ background: "#000", border: 0, height: "100%", width: "100%" }}
          title="bridged editor"
        />
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <strong style={{ color: "#7af", padding: "8px 8px 0" }}>
            parent log
          </strong>
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
          <strong style={{ color: "#7af", padding: "8px 8px 0" }}>
            editor log
          </strong>
          <pre
            data-testid="editor-log"
            style={{
              background: "#000",
              border: "1px solid #222",
              flex: 2,
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
