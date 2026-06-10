/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WorkerRes =
  | { type: "ready" }
  | { type: "message"; subId: number; path: string; data: unknown }
  | { type: "error"; subId: number; path: string; error: string };

const FILES: Record<string, string> = {
  "src/empty.tsx": "examples/geometry/src/empty.tsx",
  "src/geometry/box.tsx": "examples/geometry/src/geometry/box.tsx",
  "src/scene.tsx": "examples/geometry/src/scene.tsx",
};

const PROBES: Array<{ label: string; path: string }> = [
  { label: "/project/repo", path: "/project/repo" },
  { label: "/project/dependencies", path: "/project/dependencies" },
  { label: "/scene/box.tsx", path: "/scene/src%2Fgeometry%2Fbox.tsx" },
  {
    label: "/scene/box.tsx/default",
    path: "/scene/src%2Fgeometry%2Fbox.tsx/default",
  },
  {
    label: "/scene/scene.tsx/default",
    path: "/scene/src%2Fscene.tsx/default",
  },
  {
    label: "/scene/empty.tsx/Empty",
    path: "/scene/src%2Fempty.tsx/Empty",
  },
  {
    label: "/scene/box.tsx/diagnostics",
    path: "/scene/src%2Fgeometry%2Fbox.tsx/diagnostics",
  },
];

export default function WorkerServerSpike() {
  const workerRef = useRef<Worker | null>(null);
  const subIdRef = useRef(0);
  const pending = useRef(new Map<number, (res: WorkerRes) => void>());
  const [status, setStatus] = useState<"booting" | "ready" | "error">(
    "booting",
  );
  const [log, setLog] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<string, WorkerRes | null>>(
    {},
  );

  useEffect(() => {
    const w = new Worker(new URL("./wss-worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent<WorkerRes>) => {
      const msg = e.data;
      if (msg.type === "ready") {
        setStatus("ready");
        setLog((l) => [...l, "[worker] ready"]);
        return;
      }
      if (msg.type === "message" || msg.type === "error") {
        const handler = pending.current.get(msg.subId);
        if (handler) {
          handler(msg);
          pending.current.delete(msg.subId);
        }
      }
    };
    w.onerror = (e) => {
      setStatus("error");
      setLog((l) => [...l, `[worker boot error] ${e.message}`]);
    };
    return () => w.terminate();
  }, []);

  const runAll = useCallback(async () => {
    const w = workerRef.current;
    if (!w) return;
    setResponses({});
    setLog((l) => [...l, "fetching example files…"]);
    for (const [vpath, repoPath] of Object.entries(FILES)) {
      const r = await fetch(`/api/file?path=${encodeURIComponent(repoPath)}`);
      if (!r.ok) {
        setLog((l) => [...l, `fetch failed for ${repoPath}: ${r.status}`]);
        continue;
      }
      const contents = await r.text();
      w.postMessage({ type: "fetch-file", path: vpath, contents });
    }
    setLog((l) => [...l, "issuing subscriptions…"]);
    for (const probe of PROBES) {
      const subId = ++subIdRef.current;
      const result = await new Promise<WorkerRes>((resolve) => {
        pending.current.set(subId, resolve);
        w.postMessage({ type: "subscribe", subId, path: probe.path });
      });
      setResponses((r) => ({ ...r, [probe.label]: result }));
      setLog((l) => [...l, `← ${probe.label}`]);
    }
    setLog((l) => [...l, "done"]);
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
      <h1 style={{ margin: 0 }}>wss-protocol worker spike</h1>
      <p style={{ color: "#888" }}>
        status: <span data-testid="status">{status}</span>
      </p>
      <button
        disabled={status !== "ready"}
        onClick={runAll}
        style={{
          background: "#fff",
          border: 0,
          color: "#000",
          cursor: status === "ready" ? "pointer" : "not-allowed",
          marginBottom: 16,
          padding: "8px 12px",
        }}
      >
        Run all probes
      </button>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <section
          style={{
            background: "#000",
            border: "1px solid #222",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 11,
            height: 480,
            overflow: "auto",
            padding: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          <strong style={{ color: "#7af" }}>log</strong>
          {"\n"}
          {log.join("\n")}
        </section>
        <section
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {PROBES.map((probe) => {
            const r = responses[probe.label];
            return (
              <div
                key={probe.label}
                data-testid={`probe-${probe.label}`}
                style={{ border: "1px solid #222", padding: 8 }}
              >
                <strong>{probe.label}</strong>
                {!r && (
                  <div style={{ color: "#666" }}>idle</div>
                )}
                {r && r.type === "error" && (
                  <div style={{ color: "#f55" }}>error: {r.error}</div>
                )}
                {r && r.type === "message" && (
                  <pre
                    style={{
                      color: "#7fa",
                      fontSize: 11,
                      margin: 0,
                      maxHeight: 200,
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(r.data, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
