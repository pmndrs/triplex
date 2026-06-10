/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WorkerOut =
  | { id: number; type: "ping"; ok: true }
  | {
      id: number;
      type: "parsed";
      ok: true;
      exports: string[];
      jsxSummary: Array<{ tag: string; depth: number; line: number; column: number }>;
      durationMs: number;
    }
  | { id: number; type: "error"; ok: false; error: string };

const FILES = [
  "src/geometry/box.tsx",
  "src/scene.tsx",
  "src/empty.tsx",
  "src/provider.tsx",
] as const;

export default function WorkerSpike() {
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const [status, setStatus] = useState<"booting" | "ready" | "error">("booting");
  const [log, setLog] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, Extract<WorkerOut, { type: "parsed" }> | { error: string } | null>>({});

  useEffect(() => {
    const w = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent<WorkerOut>) => {
      const msg = e.data;
      if (msg.type === "ping" && msg.id === -1) {
        setStatus("ready");
        setLog((l) => [...l, "[worker] ready\n"]);
      } else if (msg.type === "parsed") {
        // We can't know which file responded just from id without tracking it.
      } else if (msg.type === "error") {
        setLog((l) => [...l, `[worker error] ${msg.error}\n`]);
      }
    };
    w.onerror = (e) => {
      setStatus("error");
      setLog((l) => [...l, `[worker boot error] ${e.message}\n`]);
    };
    return () => w.terminate();
  }, []);

  const parseFile = useCallback(async (filename: string) => {
    const w = workerRef.current;
    if (!w) return;
    setLog((l) => [...l, `Fetching ${filename}…\n`]);
    const r = await fetch(`/api/file?path=examples/geometry/${filename}`);
    if (!r.ok) {
      setLog((l) => [...l, `Fetch failed: ${r.status}\n`]);
      return;
    }
    const source = await r.text();
    const id = ++reqId.current;
    setLog((l) => [...l, `Parsing ${filename} (${source.length} bytes)…\n`]);
    const handler = (e: MessageEvent<WorkerOut>) => {
      if (e.data.id !== id) return;
      w.removeEventListener("message", handler);
      if (e.data.ok && e.data.type === "parsed") {
        setResults((r) => ({ ...r, [filename]: e.data as Extract<WorkerOut, { type: "parsed" }> }));
        setLog((l) => [
          ...l,
          `[worker] parsed ${filename} in ${(e.data as Extract<WorkerOut, { type: "parsed" }>).durationMs}ms\n`,
        ]);
      } else if (!e.data.ok) {
        setResults((r) => ({ ...r, [filename]: { error: e.data.error } }));
      }
    };
    w.addEventListener("message", handler);
    w.postMessage({ id, type: "parse", filename, source });
  }, []);

  const parseAll = useCallback(async () => {
    for (const f of FILES) await parseFile(f);
  }, [parseFile]);

  return (
    <div style={{ background: "#0b0b0b", color: "#e6e6e6", fontFamily: "system-ui", minHeight: "100vh", padding: 24 }}>
      <h1 style={{ margin: 0 }}>ts-morph in Web Worker — hybrid spike</h1>
      <p style={{ color: "#888" }}>status: {status}</p>
      <button
        disabled={status !== "ready"}
        onClick={parseAll}
        style={{
          background: "#fff",
          border: 0,
          color: "#000",
          cursor: status === "ready" ? "pointer" : "not-allowed",
          marginRight: 8,
          padding: "8px 12px",
        }}
      >
        Parse all four files
      </button>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
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
          <strong style={{ color: "#7af" }}>worker log</strong>
          {"\n"}
          {log.join("")}
        </section>
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FILES.map((f) => {
            const r = results[f];
            return (
              <div key={f} style={{ border: "1px solid #222", padding: 12 }}>
                <strong>{f}</strong>
                {!r && <div style={{ color: "#666" }}>not parsed yet</div>}
                {r && "error" in r && <div style={{ color: "#f55" }}>error: {r.error}</div>}
                {r && "exports" in r && (
                  <>
                    <div style={{ color: "#7af", marginTop: 4 }}>
                      exports ({r.exports.length}): {r.exports.join(", ") || "(none)"}
                    </div>
                    <div style={{ marginTop: 4 }}>parsed in {r.durationMs}ms</div>
                    <div style={{ marginTop: 4 }}>JSX elements ({r.jsxSummary.length}):</div>
                    <pre style={{ fontSize: 11, margin: 0, maxHeight: 160, overflow: "auto" }}>
                      {r.jsxSummary
                        .map((j) => `${"  ".repeat(j.depth)}${j.tag} @${j.line}:${j.column}`)
                        .join("\n")}
                    </pre>
                  </>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
