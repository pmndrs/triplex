/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { type FileSystemTree, WebContainer } from "@webcontainer/api";
import { useCallback, useRef, useState } from "react";

function EditorFrame({ servers }: { servers: ServerInfo[] }) {
  const portToUrl: Record<number, string> = {};
  for (const s of servers) portToUrl[s.port] = s.url;

  const initialState = {
    exportName: "default",
    path: "/src/geometry/box.tsx",
  };

  const triplexEnv = {
    env: {
      config: {
        define: {},
        experimental: {},
        files: ["/src/**/*.tsx"],
        publicDir: "/public",
      },
      externalIP: "127.0.0.1",
      fgEnvironmentOverride: "local",
      ports: { client: 5870, server: 5871, ws: 5872 },
    },
    initialState,
    isTelemetryEnabled: false,
    sessionId: "spike-session",
    userId: "spike-user",
    version: "0.72.5",
  };

  // Replace any localhost:5870/5871/5872 occurrence with the corresponding
  // WebContainer proxy URL. We do this by intercepting fetch + WebSocket and
  // by mutation-observing iframe[src].
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Triplex Editor</title>
    <style>html,body,#root{margin:0;height:100%;min-height:100%;background:#0b0b0b;color:#fff;}canvas{outline:none;}</style>
    <script>
      // Forward console + errors to parent so we can see them outside the iframe.
      window.__editorLog = [];
      const _push = (level, args) => {
        try {
          window.__editorLog.push(level + ": " + Array.from(args).map(a => {
            try { return typeof a === "string" ? a : JSON.stringify(a); }
            catch { return String(a); }
          }).join(" "));
        } catch {}
      };
      ["log","info","warn","error","debug"].forEach(level => {
        const orig = console[level].bind(console);
        console[level] = (...args) => { _push(level, args); orig(...args); };
      });
      window.addEventListener("error", e => _push("error", ["window.error:", e.message, e.filename + ":" + e.lineno]));
      window.addEventListener("unhandledrejection", e => _push("error", ["unhandledrejection:", e.reason?.message ?? e.reason]));

      window.triplex = ${JSON.stringify(triplexEnv)};

      // The editor was originally built for a VSCode webview which provides
      // window.acquireVsCodeApi. We're not in VSCode; stub it as a no-op.
      window.acquireVsCodeApi = function() {
        return {
          postMessage: function(data) {
            window.parent.postMessage({ source: "triplex-editor", payload: data }, "*");
          },
          getState: function() { return null; },
          setState: function() {},
        };
      };

      const PORT_URL = ${JSON.stringify(portToUrl)};
      function rewrite(url) {
        if (typeof url !== "string") return url;
        return url.replace(/(https?|wss?):\\/\\/(localhost|127\\.0\\.0\\.1):(5870|5871|5872)/g, (_, _proto, _host, port) => {
          const target = PORT_URL[port];
          if (!target) return _;
          // Rewrite the scheme to https/wss to match the WebContainer proxy.
          const tProto = target.startsWith("wss") ? "wss" : (target.startsWith("https") ? "https" : (target.startsWith("ws") ? "ws" : "http"));
          // Mix: the protocol from the original (http/ws) needs to use the matching secure variant.
          const origIsWs = _proto.startsWith("ws");
          const useProto = origIsWs ? "wss" : "https";
          return useProto + "://" + target.replace(/^[a-z]+:\\/\\//, "");
        });
      }

      const _fetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        if (typeof input === "string") input = rewrite(input);
        else if (input instanceof Request) {
          const newUrl = rewrite(input.url);
          if (newUrl !== input.url) input = new Request(newUrl, input);
        }
        return _fetch(input, init);
      };

      const _WS = window.WebSocket;
      function PatchedWS(url, protocols) {
        const rewritten = rewrite(url);
        _push("debug", ["WS construct:", url, "->", rewritten]);
        const ws = new _WS(rewritten, protocols);
        ws.addEventListener("open", () => _push("debug", ["WS open:", rewritten]));
        ws.addEventListener("error", (e) => _push("error", ["WS error:", rewritten, e?.message]));
        ws.addEventListener("close", (e) => _push("debug", ["WS close:", rewritten, e?.code, e?.reason]));
        return ws;
      }
      PatchedWS.prototype = _WS.prototype;
      PatchedWS.CONNECTING = _WS.CONNECTING;
      PatchedWS.OPEN = _WS.OPEN;
      PatchedWS.CLOSING = _WS.CLOSING;
      PatchedWS.CLOSED = _WS.CLOSED;
      window.WebSocket = PatchedWS;

      // Rewrite iframe src attributes as they're set.
      const setAttr = HTMLIFrameElement.prototype.setAttribute;
      HTMLIFrameElement.prototype.setAttribute = function(name, value) {
        if (name === "src") value = rewrite(value);
        return setAttr.call(this, name, value);
      };
      const srcDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
      if (srcDesc && srcDesc.set) {
        Object.defineProperty(HTMLIFrameElement.prototype, "src", {
          ...srcDesc,
          set(v) { return srcDesc.set.call(this, rewrite(v)); },
        });
      }
      console.log("[triplex-editor-wrap] URL rewrites installed", PORT_URL);
    </script>
    <link rel="stylesheet" crossorigin href="/triplex-editor/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/triplex-editor/index.js"></script>
  </body>
</html>`;

  return (
    <iframe
      srcDoc={html}
      style={{ border: 0, height: "100%", width: "100%" }}
      title="triplex-editor"
    />
  );
}

type Status =
  | "idle"
  | "booting"
  | "fetching"
  | "mounting"
  | "spawning"
  | "ready"
  | "error";

type ServerInfo = { port: number; url: string };

type ApiFileNode = { file: { contents: string | { base64: string } } };
type ApiDirectoryNode = { directory: ApiFileSystemTree };
type ApiFileSystemTree = Record<string, ApiFileNode | ApiDirectoryNode>;

function decodeTree(api: ApiFileSystemTree): FileSystemTree {
  const out: FileSystemTree = {};
  for (const [name, node] of Object.entries(api)) {
    if ("directory" in node) {
      out[name] = { directory: decodeTree(node.directory) };
    } else if (typeof node.file.contents === "string") {
      out[name] = { file: { contents: node.file.contents } };
    } else {
      const bin = Uint8Array.from(atob(node.file.contents.base64), (c) =>
        c.charCodeAt(0),
      );
      out[name] = { file: { contents: bin } };
    }
  }
  return out;
}

export default function TriplexSpike() {
  const [status, setStatus] = useState<Status>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const containerRef = useRef<WebContainer | null>(null);

  const log = useCallback((line: string) => {
    setLogs((prev) => [...prev, line]);
  }, []);

  const boot = useCallback(async () => {
    if (containerRef.current) return;
    try {
      setStatus("booting");
      log("Booting WebContainer…\n");
      const container = await WebContainer.boot();
      containerRef.current = container;

      container.on("server-ready", (port, url) => {
        log(`server-ready :${port} → ${url}\n`);
        setServers((prev) => [...prev, { port, url }]);
      });
      container.on("error", (err) => log(`container error: ${err.message}\n`));

      setStatus("fetching");
      log("Fetching runtime + example + workspace pkgs (bridge, lib, renderer)…\n");
      const [
        runtimeRes,
        runtimePkgRes,
        exampleRes,
        bridgePkgRes,
        libPkgRes,
        rendererPkgRes,
      ] = await Promise.all([
        fetch("/triplex/runtime.mjs"),
        fetch("/triplex/package.json"),
        fetch("/api/example/geometry"),
        fetch("/api/pkg/bridge"),
        fetch("/api/pkg/lib"),
        fetch("/api/pkg/renderer"),
      ]);
      if (
        !runtimeRes.ok ||
        !exampleRes.ok ||
        !runtimePkgRes.ok ||
        !bridgePkgRes.ok ||
        !libPkgRes.ok ||
        !rendererPkgRes.ok
      ) {
        throw new Error(
          `fetch failed: runtime=${runtimeRes.status} runtimePkg=${runtimePkgRes.status} example=${exampleRes.status} bridge=${bridgePkgRes.status} lib=${libPkgRes.status} renderer=${rendererPkgRes.status}`,
        );
      }
      const runtimeBytes = new Uint8Array(await runtimeRes.arrayBuffer());
      const runtimePkg = await runtimePkgRes.text();
      const bridgeJson = (await bridgePkgRes.json()) as { tree: ApiFileSystemTree };
      const libJson = (await libPkgRes.json()) as { tree: ApiFileSystemTree };
      const rendererJson = (await rendererPkgRes.json()) as { tree: ApiFileSystemTree };
      const exampleJson = (await exampleRes.json()) as {
        tree: ApiFileSystemTree;
      };
      log(
        `runtime ${(runtimeBytes.byteLength / 1024 / 1024).toFixed(2)} MB; example + bridge + lib + renderer fetched\n`,
      );

      const projectTree = decodeTree(exampleJson.tree);

      const configNode = (projectTree[".triplex"] as { directory: FileSystemTree })?.directory?.[
        "config.json"
      ];
      if (configNode && "file" in configNode) {
        const original = configNode.file.contents as string;
        const patched = original.replace(
          /"renderer"\s*:\s*"[^"]+"/,
          '"renderer": "react-three-fiber"',
        );
        configNode.file.contents = patched;
        log("patched .triplex/config.json renderer → react-three-fiber\n");
      }

      const pkgNode = projectTree["package.json"];
      if (pkgNode && "file" in pkgNode) {
        const parsed = JSON.parse(pkgNode.file.contents as string);
        parsed.devDependencies = {
          ...parsed.devDependencies,
          "@babel/core": "^7.27.0",
          "@babel/preset-react": "^7.27.0",
          "@babel/preset-typescript": "^7.27.0",
          "@emotion/react": "^11.14.0",
          "@react-three/handle": "^6.6.16",
          "@statsig/js-client": "^3.17.2",
          "@statsig/js-local-overrides": "^3.17.2",
          "@vitejs/plugin-react": "^4.4.1",
          "bind-event-listener": "^3.0.0",
          debounce: "^2.2.0",
          esbuild: "^0.24.2",
          "raf-schd": "^4.0.3",
          "react-error-boundary": "^3.1.4",
          "suspend-react": "^0.1.3",
          tinycolor2: "^1.6.0",
          "triplex-drei": "npm:@react-three/drei@^10.0.0",
          "triplex-handle": "npm:@react-three/handle@^6.6.16",
          "tunnel-rat": "^0.1.2",
          "use-callback-ref": "^1.3.1",
          vite: "^6.0.7",
          "vite-plugin-glsl": "^1.4.1",
          "vite-tsconfig-paths": "^5.1.4",
          zustand: "^4.3.2",
        };
        pkgNode.file.contents = JSON.stringify(parsed, null, 2);
        log("injected vite + babel + esbuild into project package.json\n");
      }

      (projectTree as FileSystemTree)[".triplex-runtime"] = {
        directory: {
          "runtime.mjs": { file: { contents: runtimeBytes } },
          "package.json": { file: { contents: runtimePkg } },
        },
      };

      const bridgeTree = decodeTree(bridgeJson.tree);
      const libTree = decodeTree(libJson.tree);
      const rendererTree = decodeTree(rendererJson.tree);

      setStatus("mounting");
      log("Mounting /project (project + runtime)…\n");
      await container.mount({
        "package.json": {
          file: {
            contents: JSON.stringify({
              name: "triplex-cloud-root",
              private: true,
            }),
          },
        },
        project: { directory: projectTree },
      });

      log("Running npm install in /project (cold — slow)…\n");
      const install = await container.spawn(
        "npm",
        ["install", "--legacy-peer-deps", "--no-audit", "--no-fund"],
        { cwd: "project" },
      );
      install.output.pipeTo(
        new WritableStream({ write: (chunk) => log(chunk) }),
      );
      const installExit = await install.exit;
      if (installExit !== 0) throw new Error(`npm install exit ${installExit}`);

      log("Mounting workspace pkgs into node_modules (post-install)…\n");
      await container.mount(
        {
          node_modules: {
            directory: {
              "@triplex": {
                directory: {
                  bridge: { directory: bridgeTree },
                  lib: { directory: libTree },
                  renderer: { directory: rendererTree },
                },
              },
            },
          },
        },
        { mountPoint: "project" },
      );

      const lsProc = await container.spawn(
        "ls",
        ["-la", "project/node_modules/@triplex"],
        { cwd: "." },
      );
      lsProc.output.pipeTo(
        new WritableStream({ write: (chunk) => log(`[ls] ${chunk}`) }),
      );
      await lsProc.exit;

      setStatus("spawning");
      log("Spawning Triplex runtime…\n");
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
          write: (chunk) => {
            log(chunk);
            if (chunk.includes("[triplex] ready")) {
              setStatus("ready");
            }
          },
        }),
      );

      void triplexProc.exit.then((code) => {
        log(`\ntriplex process exited code=${code}\n`);
        if (code !== 0) setStatus("error");
      });

      void triplexProc.output;

      // Defer until the user has had a chance to see status=ready, then
      // probe the listening ports from INSIDE the container.
      void (async () => {
        await new Promise((r) => setTimeout(r, 5000));
        for (const [label, port, path] of [
          ["server", 5871, "/healthcheck"],
          ["ws-http", 5872, "/"],
        ] as const) {
          const tmpPath = `probe-${port}.txt`;
          try {
            const proc = await container.spawn(
              "node",
              [
                "-e",
                `fetch("http://0.0.0.0:${port}${path}").then(async r=>{const fs=await import('node:fs/promises'); const t=await r.text(); await fs.writeFile("${tmpPath}", "status="+r.status+"\\n"+t)}).catch(e=>require('fs').writeFileSync("${tmpPath}", "ERR "+e.message))`,
              ],
              { cwd: "." },
            );
            await proc.exit;
            const body = await container.fs.readFile(tmpPath, "utf-8");
            log(`[probe :${port}${path}]\n${body.slice(0, 600)}\n---\n`);
          } catch (e) {
            log(`[probe :${port}${path}] ERROR: ${(e as Error).message}\n`);
          }
        }
      })();
    } catch (err) {
      log(`boot failed: ${(err as Error).message}\n`);
      setStatus("error");
    }
  }, [log]);

  return (
    <div
      style={{
        display: "grid",
        fontFamily: "system-ui",
        gridTemplateColumns: "440px 1fr",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <aside
        style={{
          background: "#0b0b0b",
          borderRight: "1px solid #222",
          color: "#e6e6e6",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          padding: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Triplex in WebContainer</h2>
        <p style={{ color: "#888" }}>status: {status}</p>
        <button
          disabled={status !== "idle"}
          onClick={boot}
          style={{
            background: "#fff",
            border: 0,
            color: "#000",
            cursor: status === "idle" ? "pointer" : "not-allowed",
            marginBottom: 12,
            padding: "8px 12px",
          }}
        >
          {status === "idle" ? "Boot Triplex" : `… ${status}`}
        </button>
        <div style={{ fontSize: 12, marginBottom: 12 }}>
          {servers.length === 0 ? (
            <span style={{ color: "#666" }}>No servers exposed yet.</span>
          ) : (
            servers.map((s) => (
              <div key={s.port}>
                <span style={{ color: "#888" }}>:{s.port}</span>{" "}
                <a
                  href={s.url}
                  rel="noreferrer"
                  style={{ color: "#7af" }}
                  target="_blank"
                >
                  {s.url}
                </a>
              </div>
            ))
          )}
        </div>
        <div
          style={{
            background: "#000",
            border: "1px solid #222",
            flex: 1,
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 11,
            minHeight: 0,
            overflow: "auto",
            padding: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {logs.join("")}
        </div>
      </aside>
      <main style={{ background: "#fff" }}>
        {servers.length >= 3 ? (
          <EditorFrame servers={servers} />
        ) : (
          <div style={{ color: "#666", padding: 32 }}>
            Editor will load when all three Triplex ports are up.
          </div>
        )}
      </main>
    </div>
  );
}
