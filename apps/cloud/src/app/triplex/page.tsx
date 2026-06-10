/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { type FileSystemTree, WebContainer } from "@webcontainer/api";
import { useCallback, useRef, useState } from "react";

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
      log("Fetching runtime + example + stub renderer + workspace pkgs…\n");
      const [
        runtimeRes,
        runtimePkgRes,
        exampleRes,
        rendererSrcRes,
        rendererManifestRes,
        bridgePkgRes,
        libPkgRes,
      ] = await Promise.all([
        fetch("/triplex/runtime.mjs"),
        fetch("/triplex/package.json"),
        fetch("/api/example/geometry"),
        fetch("/triplex-renderer/src/index.tsx"),
        fetch("/triplex-renderer/manifest.json"),
        fetch("/api/pkg/bridge"),
        fetch("/api/pkg/lib"),
      ]);
      if (
        !runtimeRes.ok ||
        !exampleRes.ok ||
        !runtimePkgRes.ok ||
        !rendererSrcRes.ok ||
        !rendererManifestRes.ok ||
        !bridgePkgRes.ok ||
        !libPkgRes.ok
      ) {
        throw new Error(
          `fetch failed: runtime=${runtimeRes.status} runtimePkg=${runtimePkgRes.status} example=${exampleRes.status} rendererSrc=${rendererSrcRes.status} rendererManifest=${rendererManifestRes.status} bridge=${bridgePkgRes.status} lib=${libPkgRes.status}`,
        );
      }
      const runtimeBytes = new Uint8Array(await runtimeRes.arrayBuffer());
      const runtimePkg = await runtimePkgRes.text();
      const rendererSrc = await rendererSrcRes.text();
      const rendererManifest = await rendererManifestRes.text();
      const bridgeJson = (await bridgePkgRes.json()) as { tree: ApiFileSystemTree };
      const libJson = (await libPkgRes.json()) as { tree: ApiFileSystemTree };
      const exampleJson = (await exampleRes.json()) as {
        tree: ApiFileSystemTree;
      };
      log(
        `runtime ${(runtimeBytes.byteLength / 1024 / 1024).toFixed(2)} MB; example + bridge + lib fetched\n`,
      );

      const projectTree = decodeTree(exampleJson.tree);

      const configNode = (projectTree[".triplex"] as { directory: FileSystemTree })?.directory?.[
        "config.json"
      ];
      if (configNode && "file" in configNode) {
        const original = configNode.file.contents as string;
        const patched = original.replace(
          /"renderer"\s*:\s*"[^"]+"/,
          '"renderer": "../.triplex-runtime/renderer/src/index.tsx"',
        );
        configNode.file.contents = patched;
        log("patched .triplex/config.json renderer path\n");
      }

      const pkgNode = projectTree["package.json"];
      if (pkgNode && "file" in pkgNode) {
        const parsed = JSON.parse(pkgNode.file.contents as string);
        parsed.devDependencies = {
          ...parsed.devDependencies,
          "@babel/core": "^7.27.0",
          "@babel/preset-react": "^7.27.0",
          "@babel/preset-typescript": "^7.27.0",
          "@statsig/js-client": "^3.17.2",
          "@statsig/js-local-overrides": "^3.17.2",
          "@vitejs/plugin-react": "^4.4.1",
          esbuild: "^0.24.2",
          vite: "^6.0.7",
        };
        pkgNode.file.contents = JSON.stringify(parsed, null, 2);
        log("injected vite + babel + esbuild into project package.json\n");
      }

      (projectTree as FileSystemTree)[".triplex-runtime"] = {
        directory: {
          "runtime.mjs": { file: { contents: runtimeBytes } },
          "package.json": { file: { contents: runtimePkg } },
          renderer: {
            directory: {
              "manifest.json": { file: { contents: rendererManifest } },
              src: {
                directory: {
                  "index.tsx": { file: { contents: rendererSrc } },
                },
              },
            },
          },
        },
      };

      const bridgeTree = decodeTree(bridgeJson.tree);
      const libTree = decodeTree(libJson.tree);

      setStatus("mounting");
      log("Mounting /project (project + runtime + stub renderer)…\n");
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
      const install = await container.spawn("npm", ["install"], {
        cwd: "project",
      });
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
        {servers.find((s) => s.port === 5870) ? (
          <iframe
            src={servers.find((s) => s.port === 5870)!.url}
            style={{ border: 0, height: "100%", width: "100%" }}
            title="triplex-client"
          />
        ) : (
          <div style={{ color: "#666", padding: 32 }}>
            Iframe will appear when the client port (5870) is up.
          </div>
        )}
      </main>
    </div>
  );
}
