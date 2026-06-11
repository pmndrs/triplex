/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const TARGET = `${BASE}/folder-spike?fixture=gitplex`;
const RENDERER_FILE = join(
  process.cwd(),
  "../../packages/renderer/src/components/tunnel.tsx",
);

const BOOT_TIMEOUT = 180_000;
const SCENE_SETTLE_MS = 30_000;
const POST_EDIT_MS = 6_000;

async function main() {
  console.log(`[hmr] target=${TARGET}`);
  console.log(`[hmr] file=${RENDERER_FILE}`);
  const originalSrc = readFileSync(RENDERER_FILE, "utf8");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const sceneLogs: string[] = [];
  const parentLogs: string[] = [];

  page.on("console", (msg) => {
    const loc = msg.location();
    const text = msg.text();
    if (loc.url.includes("webcontainer-api.io")) {
      sceneLogs.push(`[${msg.type()}] ${text}`);
    } else if (text.startsWith("[pkg-watch]")) {
      parentLogs.push(`[parent] ${text}`);
    }
  });
  page.on("pageerror", (err) =>
    sceneLogs.push(`[pageerror] ${err.message}`),
  );

  try {
    await page.goto(TARGET, { waitUntil: "domcontentloaded" });

    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="status"]')?.textContent ===
        "child-ready",
      null,
      { timeout: BOOT_TIMEOUT },
    );
    console.log("[hmr] child-ready");

    await page.waitForTimeout(SCENE_SETTLE_MS);
    console.log("[hmr] scene settled, editing renderer src…");

    const marker = `// HMR_PROBE_${Date.now()}`;
    const edited = `${originalSrc}\n${marker}\n`;
    writeFileSync(RENDERER_FILE, edited);

    await page.waitForTimeout(POST_EDIT_MS);
    console.log("[hmr] post-edit window elapsed\n");

    // Parent log is rendered to a <pre> in the floating log panel — pull it
    // straight from the DOM instead of relying on console.log forwarding.
    const parentText: string = await page.evaluate(() => {
      const pres = Array.from(document.querySelectorAll("pre"));
      return pres[0]?.textContent ?? "";
    });
    for (const line of parentText.split("\n")) {
      if (line.includes("[pkg-watch]")) parentLogs.push(`[parent] ${line}`);
    }

    // Dump runtime/vite lines around the edit for diagnostics.
    const runtimeTail = parentText
      .split("\n")
      .filter((l) =>
        /\[runtime\]|\[vite\]|hmr|hot|updated|reload|tunnel/i.test(l),
      )
      .slice(-25);
    console.log("=== runtime/vite tail ===");
    for (const l of runtimeTail) console.log("  " + l);

    const seenWrite = parentLogs.some((l) =>
      l.includes("renderer/components/tunnel.js"),
    );
    const seenReload = parentLogs.some((l) =>
      l.includes("[pkg-watch] reload scene"),
    );
    const seenHmr = sceneLogs.some(
      (l) =>
        /\[vite\].*(hmr update|page reload|invalidated)/i.test(l) ||
        /\[hmr\].*updated/i.test(l),
    );

    console.log("=== parent /pkg-watch entries ===");
    for (const l of parentLogs.slice(-10)) console.log("  " + l);
    console.log("=== scene console (tail 30) ===");
    for (const l of sceneLogs.slice(-30)) console.log("  " + l);

    console.log("\n=== result ===");
    console.log(`  wrote dist file       : ${seenWrite ? "OK" : "MISSING"}`);
    console.log(`  scene reload nudged   : ${seenReload ? "OK" : "MISSING"}`);
    console.log(`  vite hmr signal       : ${seenHmr ? "OK" : "(reload fallback)"}`);

    if (!seenWrite || !seenReload) {
      process.exitCode = 2;
    }
  } finally {
    writeFileSync(RENDERER_FILE, originalSrc);
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[hmr] crashed:", err);
  process.exit(1);
});
