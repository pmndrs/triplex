/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { useEffect, useRef, useState } from "react";

const FILES: Record<string, string> = {
  "src/empty.tsx": "examples/geometry/src/empty.tsx",
  "src/geometry/box.tsx": "examples/geometry/src/geometry/box.tsx",
  "src/scene.tsx": "examples/geometry/src/scene.tsx",
};

const IFRAME_HTML = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>bridge child</title></head>
<body style="background:#0b0b0b;color:#e6e6e6;font-family:system-ui;margin:0;padding:16px;">
<h2 style="margin:0 0 8px;">Bridged WebSocket harness</h2>
<p style="color:#888;margin:0 0 12px;">All WebSocket() calls go through window.parent → worker.</p>
<pre id="out" style="background:#000;border:1px solid #222;padding:8px;font-size:11px;height:380px;overflow:auto;margin:0;"></pre>
<script>
(function () {
  const out = document.getElementById("out");
  function log(s) { out.textContent += s + "\\n"; }

  let bridgePort = null;
  const pending = new Map();

  // Receive the MessagePort from parent.
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "bridge-port") {
      bridgePort = e.ports[0];
      bridgePort.onmessage = function (ev) {
        const msg = ev.data;
        const sock = pending.get(msg.subId);
        if (!sock) return;
        if (msg.type === "message") {
          const event = new MessageEvent("message", { data: JSON.stringify(msg.data) });
          sock.dispatchEvent(event);
        } else if (msg.type === "error") {
          const event = new MessageEvent("message", { data: JSON.stringify({ error: msg.error }) });
          sock.dispatchEvent(event);
        }
      };
      log("[bridge] port ready");
      runHarness();
    }
  });

  let readyInterval = null;
  function notifyParentReady() {
    window.parent.postMessage({ type: "child-ready" }, "*");
    readyInterval = setInterval(function () {
      if (bridgePort) {
        clearInterval(readyInterval);
        return;
      }
      window.parent.postMessage({ type: "child-ready" }, "*");
    }, 100);
  }

  let nextSubId = 0;

  // WebSocket shim: each instance maps to a subscription on the worker.
  class BridgedWebSocket extends EventTarget {
    constructor(url) {
      super();
      this.url = url;
      this.readyState = 0;
      this.subId = ++nextSubId;
      pending.set(this.subId, this);
      this._openHandlers = [];
      this._messageHandlers = [];
      this._closeHandlers = [];
      this._errorHandlers = [];
      setTimeout(() => {
        this.readyState = 1;
        const ev = new Event("open");
        this.dispatchEvent(ev);
        if (this.onopen) this.onopen(ev);
      }, 0);
    }
    send(data) {
      if (typeof data !== "string") return;
      if (!bridgePort) {
        log("[shim] no bridgePort yet, dropping send");
        return;
      }
      bridgePort.postMessage({ type: "subscribe", subId: this.subId, path: data });
    }
    close() {
      this.readyState = 3;
      if (bridgePort) {
        bridgePort.postMessage({ type: "unsubscribe", subId: this.subId });
      }
      pending.delete(this.subId);
      const ev = new CloseEvent("close", { code: 1000 });
      this.dispatchEvent(ev);
      if (this.onclose) this.onclose(ev);
    }
    addEventListener(type, fn) {
      super.addEventListener(type, fn);
      if (type === "message") {
        // Also wire to onmessage style
      }
    }
  }
  BridgedWebSocket.CONNECTING = 0;
  BridgedWebSocket.OPEN = 1;
  BridgedWebSocket.CLOSING = 2;
  BridgedWebSocket.CLOSED = 3;

  window.WebSocket = BridgedWebSocket;
  log("[shim] WebSocket replaced");

  function ws(path) {
    return new Promise(function (resolve, reject) {
      const s = new BridgedWebSocket("ws://localhost:5872");
      const timer = setTimeout(function () { reject(new Error("timeout " + path)); }, 5000);
      s.addEventListener("open", function () { s.send(path); });
      s.addEventListener("message", function (ev) {
        clearTimeout(timer);
        s.close();
        try { resolve(JSON.parse(ev.data)); }
        catch (err) { reject(err); }
      });
    });
  }

  async function runHarness() {
    log("[harness] starting");
    const probes = [
      "/project/repo",
      "/project/dependencies",
      "/scene/src%2Fgeometry%2Fbox.tsx/default",
      "/scene/src%2Fscene.tsx/default",
    ];
    const results = {};
    for (const p of probes) {
      try {
        const data = await ws(p);
        results[p] = data;
        log("← " + p + " :: " + JSON.stringify(data).slice(0, 120) + "...");
      } catch (err) {
        log("✗ " + p + " :: " + err.message);
      }
    }
    log("[harness] done");
    document.body.setAttribute("data-harness-state", "complete");
    window.parent.postMessage({ type: "harness-results", results: results }, "*");
  }

  notifyParentReady();
})();
</script>
</body>
</html>`;

export default function WsBridgeSpike() {
  const workerRef = useRef<Worker | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const channelRef = useRef<MessageChannel | null>(null);
  const [status, setStatus] = useState<"booting" | "ready" | "running" | "done">(
    "booting",
  );
  const [log, setLog] = useState<string[]>([]);
  const [harnessResults, setHarnessResults] = useState<unknown>(null);

  useEffect(() => {
    const w = new Worker(
      new URL("../worker-server-spike/wss-worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = w;
    const channel = new MessageChannel();
    channelRef.current = channel;

    channel.port1.onmessage = (e) => {
      // Forward iframe-side messages to the worker.
      w.postMessage(e.data);
    };

    w.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "ready") {
        setLog((l) => [...l, "[worker] ready"]);
        return;
      }
      // Forward worker messages back to the iframe via the channel.
      channel.port1.postMessage(msg);
    };

    w.onerror = (e) => {
      setLog((l) => [...l, `[worker boot error] ${e.message}`]);
    };

    // Preload example files into the worker.
    (async () => {
      for (const [vpath, repoPath] of Object.entries(FILES)) {
        const r = await fetch(`/api/file?path=${encodeURIComponent(repoPath)}`);
        if (!r.ok) continue;
        const contents = await r.text();
        w.postMessage({ type: "fetch-file", path: vpath, contents });
      }
      setStatus("ready");
      setLog((l) => [...l, "[worker] preloaded files"]);
    })();

    function onMsg(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "child-ready") {
        setLog((l) => [...l, "[child] ready, sending port"]);
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) return;
        iframe.contentWindow.postMessage({ type: "bridge-port" }, "*", [
          channel.port2,
        ]);
        setStatus("running");
      } else if (data.type === "harness-results") {
        setHarnessResults(data.results);
        setLog((l) => [...l, "[child] harness complete"]);
        setStatus("done");
      }
    }
    window.addEventListener("message", onMsg);

    return () => {
      window.removeEventListener("message", onMsg);
      w.terminate();
      channel.port1.close();
    };
  }, []);

  return (
    <div
      style={{
        background: "#0b0b0b",
        color: "#e6e6e6",
        fontFamily: "system-ui",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <h1 style={{ margin: 0 }}>WebSocket-shim ↔ Web Worker bridge spike</h1>
      <p style={{ color: "#888" }}>
        status: <span data-testid="status">{status}</span>
      </p>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr 1fr",
          height: 540,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong style={{ color: "#7af", marginBottom: 4 }}>
            parent log
          </strong>
          <pre
            style={{
              background: "#000",
              border: "1px solid #222",
              flex: 1,
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 11,
              margin: 0,
              overflow: "auto",
              padding: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {log.join("\n")}
          </pre>
          {harnessResults && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ color: "#7fa", cursor: "pointer" }}>
                harness results (click to expand)
              </summary>
              <pre
                data-testid="harness-results"
                style={{
                  background: "#000",
                  border: "1px solid #222",
                  fontSize: 11,
                  margin: 0,
                  maxHeight: 200,
                  overflow: "auto",
                  padding: 8,
                }}
              >
                {JSON.stringify(harnessResults, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <iframe
          ref={iframeRef}
          srcDoc={IFRAME_HTML}
          style={{ background: "#000", border: "1px solid #222", height: "100%" }}
          title="bridge child"
        />
      </div>
    </div>
  );
}
