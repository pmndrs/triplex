/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { WebContainer } from "@webcontainer/api";
import { useCallback, useRef, useState } from "react";
import { testProject } from "./test-project";

type Status = "idle" | "booting" | "installing" | "starting" | "ready" | "error";

export default function SpikePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [hmrCounter, setHmrCounter] = useState(1);
  const containerRef = useRef<WebContainer | null>(null);

  const log = useCallback((line: string) => {
    setLogs((prev) => [...prev, line]);
  }, []);

  const boot = useCallback(async () => {
    if (containerRef.current) return;

    try {
      setStatus("booting");
      log("Booting WebContainer…");
      const container = await WebContainer.boot();
      containerRef.current = container;

      log("Mounting project files…");
      await container.mount(testProject);

      setStatus("installing");
      log("Running npm install (cold — first boot is slow)…");
      const install = await container.spawn("npm", ["install"]);
      install.output.pipeTo(
        new WritableStream({
          write(chunk) {
            log(chunk);
          },
        }),
      );
      const installExit = await install.exit;
      if (installExit !== 0) {
        throw new Error(`npm install exited ${installExit}`);
      }

      setStatus("starting");
      log("Starting Vite dev server…");
      const dev = await container.spawn("npm", ["run", "dev"]);
      dev.output.pipeTo(
        new WritableStream({
          write(chunk) {
            log(chunk);
          },
        }),
      );

      container.on("server-ready", (port, url) => {
        log(`server-ready: port=${port} url=${url}`);
        setIframeUrl(url);
        setStatus("ready");
      });

      container.on("error", (err) => {
        log(`error: ${err.message}`);
        setStatus("error");
      });
    } catch (err) {
      log(`boot failed: ${(err as Error).message}`);
      setStatus("error");
    }
  }, [log]);

  const triggerHmr = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    const next = hmrCounter + 1;
    setHmrCounter(next);
    const colors = ["hotpink", "skyblue", "orange", "limegreen", "gold"];
    const color = colors[next % colors.length];
    const contents = `import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [3, 3, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="${color}" />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
`;
    log(`Writing src/App.tsx (HMR ${next})…`);
    await container.fs.writeFile("/src/App.tsx", contents);
  }, [hmrCounter, log]);

  return (
    <div
      style={{
        display: "grid",
        fontFamily: "system-ui",
        gridTemplateColumns: "360px 1fr",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          padding: 16,
          background: "#0b0b0b",
          color: "#e6e6e6",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <h2 style={{ margin: 0 }}>WebContainer Spike</h2>
        <p style={{ color: "#888" }}>status: {status}</p>
        <button
          disabled={status !== "idle"}
          onClick={boot}
          style={{
            background: "#fff",
            border: 0,
            color: "#000",
            cursor: status === "idle" ? "pointer" : "not-allowed",
            marginBottom: 8,
            padding: "8px 12px",
          }}
        >
          {status === "idle" ? "Boot WebContainer" : `… ${status}`}
        </button>
        <button
          disabled={status !== "ready"}
          onClick={triggerHmr}
          style={{
            background: "#1a8917",
            border: 0,
            color: "#fff",
            cursor: status === "ready" ? "pointer" : "not-allowed",
            marginBottom: 16,
            padding: "8px 12px",
          }}
        >
          Trigger HMR write
        </button>
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
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            style={{ border: 0, height: "100%", width: "100%" }}
            title="webcontainer-preview"
          />
        ) : (
          <div style={{ color: "#666", padding: 32 }}>
            Iframe will appear when Vite is ready.
          </div>
        )}
      </main>
    </div>
  );
}
