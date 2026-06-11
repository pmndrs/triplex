/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { chromium, type Page } from "@playwright/test";

const FIXTURE = process.env.FIXTURE ?? "gitplex";
const BASE = process.env.BASE ?? "http://localhost:3000";
const URL_TARGET = `${BASE}/folder-spike?fixture=${FIXTURE}`;
const SCENE_BOOT_TIMEOUT = 180_000;

interface Summary {
  childStatus: string;
  editorErrors: string[];
  parentLog: string;
  editorLog: string;
  sceneIframeLog: string;
  pageErrors: string[];
  sceneSelected: { x: number; y: number } | null;
}

async function dumpIframeConsole(page: Page): Promise<string> {
  // The bridged editor iframe's __log is forwarded to parent as
  // "editor-log" messages. The scene iframe (loaded from the WC URL via
  // src-rewrite) is cross-origin so we can't read its console directly.
  return await page.evaluate(() => {
    const ed = document.querySelector('[data-testid="editor-log"]');
    return ed?.textContent ?? "(no editor log)";
  });
}

async function snapshot(page: Page): Promise<Summary> {
  const childStatus =
    (await page.evaluate(
      () => document.querySelector('[data-testid="status"]')?.textContent,
    )) || "";
  const parentLog =
    (await page.evaluate(() => {
      const pres = Array.from(document.querySelectorAll("pre"));
      return pres[0]?.textContent ?? "";
    })) || "";
  const editorLog = await dumpIframeConsole(page);
  return {
    childStatus,
    editorErrors: [],
    editorLog,
    pageErrors: [],
    parentLog,
    sceneIframeLog: "",
    sceneSelected: null,
  };
}

async function main() {
  console.log(`[verify] target=${URL_TARGET}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const pageErrors: string[] = [];
  const editorErrors: string[] = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
    console.log(`[pageerror] ${err.message}`);
  });
  page.on("console", (msg) => {
    const t = msg.type();
    if (t === "error" || t === "warning") {
      editorErrors.push(`[${t}] ${msg.text()}`);
    }
  });

  // Capture all frame messages so we can see scene-iframe console output.
  page.on("framenavigated", (frame) => {
    console.log(`[frame nav] ${frame.url().slice(0, 120)}`);
  });
  // page.on("console") only catches the main frame, but Playwright bubbles
  // up sub-frame console messages too. Filter for scene-iframe ones.
  page.on("console", (msg) => {
    const t = msg.type();
    const loc = msg.location();
    if (loc.url.includes("webcontainer-api.io")) {
      console.log(`[scene ${t}] ${msg.text().slice(0, 400)}`);
    } else if (t === "error") {
      console.log(`[main error] ${msg.text().slice(0, 400)} @ ${loc.url.slice(-80)}`);
    }
    // Capture parent-frame logs that include worker route diagnostics.
    if (msg.text().startsWith("[wss-worker]")) {
      console.log(`[worker] ${msg.text().slice(0, 500)}`);
    }
  });

  await page.goto(URL_TARGET, { waitUntil: "domcontentloaded" });

  // Wait for the editor + scene to reach child-ready (worker preloaded,
  // npm install done, vite up, bridge port sent).
  let status = "";
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="status"]')?.textContent ===
        "child-ready",
      null,
      { timeout: SCENE_BOOT_TIMEOUT },
    );
    status = "child-ready";
    console.log(`[verify] child-ready reached`);
  } catch {
    status = await page.evaluate(
      () => document.querySelector('[data-testid="status"]')?.textContent ?? "",
    );
    console.log(`[verify] TIMEOUT before child-ready, status=${status}`);
  }

  // Give the scene a generous moment to mount + render so click hits an
  // actual mesh. Runtime startup + Babel transform passes are slow.
  await page.waitForTimeout(40_000);

  // Click in the middle of the scene iframe (which is the LEFT iframe in
  // folder-spike's layout: iframe[title="bridged editor"]). The scene
  // canvas is nested inside it — we use page.mouse.click against absolute
  // coords.
  const iframeRect = await page.evaluate(() => {
    const f = document.querySelector(
      'iframe[title="bridged editor"]',
    ) as HTMLIFrameElement | null;
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return { height: r.height, width: r.width, x: r.x, y: r.y };
  });
  if (iframeRect) {
    // The scene iframe is inside the editor iframe (rendered by editor-next).
    // Click the centre of the editor's content area — the editor takes the
    // whole iframe so this lands inside the scene.
    const cx = iframeRect.x + iframeRect.width * 0.55;
    const cy = iframeRect.y + iframeRect.height * 0.55;
    console.log(`[verify] clicking (${cx}, ${cy})`);
    await page.mouse.click(cx, cy);
    await page.waitForTimeout(2_500);
  } else {
    console.log("[verify] could not find editor iframe");
  }

  const summary = await snapshot(page);
  summary.editorErrors = editorErrors;
  summary.pageErrors = pageErrors;
  summary.childStatus = status || summary.childStatus;

  console.log("\n=== Status ===");
  console.log(summary.childStatus);

  console.log("\n=== Parent log (last 4000 chars) ===");
  console.log(summary.parentLog.slice(-4000));

  console.log("\n=== Editor log (last 3000 chars) ===");
  console.log(summary.editorLog.slice(-3000));

  // Walk all frames and dump their URLs + console errors collected so far.
  console.log("\n=== Frame URLs ===");
  for (const f of page.frames()) {
    console.log(`  - ${f.url().slice(0, 140)}`);
  }

  // Try to capture the scene iframe's body innerHTML length (cross-origin
  // will throw; helps confirm whether the WC frame is at least loaded).
  // Snapshot the editor iframe too — it's same-origin to us via srcdoc.
  try {
    const editor = page
      .frames()
      .find((f) => f.url() === "about:srcdoc");
    if (editor) {
      const editorState = await editor.evaluate(() => {
        const root = document.getElementById("root");
        return {
          children: root?.children.length ?? 0,
          dataState: document.documentElement.dataset,
          tags: Array.from(document.querySelectorAll("*"))
            .slice(0, 40)
            .map((el) => el.tagName.toLowerCase()),
        };
      });
      console.log("\n=== Editor frame ===");
      console.log(JSON.stringify(editorState, null, 2));
    }
  } catch (err) {
    console.log("[editor probe failed]", (err as Error).message);
  }

  const sceneFrames = page
    .frames()
    .filter((f) => f.url().includes("webcontainer-api.io"));
  for (const f of sceneFrames) {
    try {
      // Fetch transformed /src/app.tsx directly via the WC's Vite to see
      // what the babel plugin produced, and what export names survive.
      try {
        const fetchResult = await f.evaluate(async () => {
          const targets = ["/src/app.tsx", "/src/scene.tsx"];
          const out: Record<
            string,
            {
              head: string;
              len: number;
              status: number;
              tail?: string;
              triplexMetaMatches?: string[];
            }
          > = {};
          for (const t of targets) {
            try {
              const r = await fetch(t);
              const text = await r.text();
              out[t] = {
                head: text.slice(0, 200),
                len: text.length,
                status: r.status,
                tail: text.slice(-1500),
                triplexMetaMatches: (
                  text.match(/triplexMeta\s*=\s*[^;]+/g) ?? []
                ).slice(0, 5),
              };
            } catch (err) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              out[t] = { head: (err as any).message, len: 0, status: -1 };
            }
          }
          return out;
        });
        console.log("\n[transformed source]", JSON.stringify(fetchResult, null, 2));
      } catch (err) {
        console.log("[transform fetch failed]", (err as Error).message);
      }
      const info = await f.evaluate(() => {
        const r = document.getElementById("root");
        const canvas = document.querySelector("canvas");
        // Sanity check Tailwind: find a known-styled element and read its
        // computed background colour. If Tailwind never ran, this'll be
        // transparent / browser default.
        const tw = document.querySelector(".bg-slate-700");
        const twBg = tw
          ? window.getComputedStyle(tw).backgroundColor
          : "(no .bg-slate-700 found)";
        // Also check the rounded button — Tailwind v3 should emit
        // border-radius for `.rounded-full`.
        const r2 = document.querySelector(".rounded-2xl");
        const r2BorderRadius = r2
          ? window.getComputedStyle(r2).borderRadius
          : "(no .rounded-2xl found)";
        return {
          twBg,
          r2BorderRadius,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $RefreshReg$: typeof (window as any).$RefreshReg$,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $RefreshSig$: typeof (window as any).$RefreshSig$,
          bodyHtml: document.body.innerHTML.slice(0, 2000),
          bodyLen: document.body.innerHTML.length,
          canvas: canvas
            ? { height: canvas.height, width: canvas.width }
            : null,
          headSrcs: Array.from(document.querySelectorAll("script[src]")).map(
            (s) => (s as HTMLScriptElement).src,
          ),
          rootChildren: r ? r.children.length : -1,
          rootInnerHtml: r ? r.innerHTML.slice(0, 2000) : "(no root)",
          tags: Array.from(document.querySelectorAll("*"))
            .slice(0, 40)
            .map((el) => el.tagName.toLowerCase()),
          title: document.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          triplex: (window as any).triplex
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { env: (window as any).triplex.env }
            : null,
          url: location.href,
        };
      });
      console.log(`\n=== Scene frame (${f.url().slice(0, 80)}) ===`);
      console.log(JSON.stringify(info, null, 2));
    } catch (err) {
      console.log(
        `\n=== Scene frame error: ${(err as Error).message.slice(0, 200)} ===`,
      );
    }
  }

  if (summary.pageErrors.length) {
    console.log("\n=== Page errors ===");
    for (const e of summary.pageErrors) console.log(e);
  }
  if (summary.editorErrors.length) {
    console.log("\n=== Editor console errors/warnings ===");
    for (const e of summary.editorErrors.slice(0, 50)) console.log(e);
  }

  await page.screenshot({ path: "/tmp/folder-spike.png", fullPage: true });
  console.log(`\n[verify] screenshot: /tmp/folder-spike.png`);

  await browser.close();
}

main().catch((err) => {
  console.error("[verify] crashed:", err);
  process.exit(1);
});
