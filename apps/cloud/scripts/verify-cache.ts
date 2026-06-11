/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// Two-pass cache verifier. Boot 1 should miss the cache, install, and save
// a snapshot. Boot 2 should hit the cache and skip install. We share state
// via the same browser context so IndexedDB persists.
import { chromium } from "@playwright/test";

const FIXTURE = process.env.FIXTURE ?? "mecha";
const BASE = process.env.BASE ?? "http://localhost:3000";
const URL_TARGET = `${BASE}/folder-spike?fixture=${FIXTURE}`;

async function captureBoot(label: string, page: import("@playwright/test").Page) {
  const lines: string[] = [];
  page.on("console", (msg) => {
    const t = msg.text();
    if (
      t.startsWith("[wc]") ||
      t.startsWith("[npm]") ||
      t.startsWith("[layout]") ||
      t.includes("server-ready")
    ) {
      lines.push(`[${label}] ${t.slice(0, 240)}`);
    }
  });
  return lines;
}

async function readParentLog(page: import("@playwright/test").Page): Promise<string> {
  return await page.evaluate(() => {
    const pre = document.querySelector('pre[data-testid="parent-log"]');
    return pre?.textContent ?? "";
  });
}

async function waitForReady(
  page: import("@playwright/test").Page,
  label: string,
  timeoutMs: number,
): Promise<{ log: string; status: string }> {
  let log = "";
  let status = "";
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="status"]')?.textContent ===
        "child-ready",
      null,
      { timeout: timeoutMs },
    );
    console.log(`[${label}] child-ready reached`);
  } catch {
    /* fall through to dump diagnostics */
  }
  status =
    (await page.evaluate(
      () => document.querySelector('[data-testid="status"]')?.textContent,
    )) || "";
  log = await readParentLog(page);
  return { log, status };
}

async function main() {
  console.log(`[verify-cache] target=${URL_TARGET}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`));

  // Boot 1: cold install, snapshot save.
  console.log(`\n=== Boot 1 (cold) ===`);
  await page.goto(URL_TARGET, { waitUntil: "domcontentloaded" });
  const boot1 = await waitForReady(page, "boot1", 240_000);
  // Give the post-server-ready re-snapshot a chance to run.
  await page.waitForTimeout(15_000);
  const log1 = await readParentLog(page);

  const expect1Miss = log1.includes("[wc] cache miss");
  const expect1Save =
    log1.includes("[wc] cached ") || log1.includes("[wc] re-cached ");
  console.log(`boot1.status=${boot1.status}`);
  console.log(`boot1.cacheMiss=${expect1Miss}`);
  console.log(`boot1.saved=${expect1Save}`);
  // Slice relevant log lines.
  console.log(`\n[boot1 wc/npm/layout lines]`);
  console.log(
    log1
      .split("\n")
      .filter(
        (l) =>
          l.startsWith("[wc]") ||
          l.startsWith("[layout]") ||
          l.startsWith("[npm]"),
      )
      .join("\n"),
  );

  // Boot 2: should hit cache.
  console.log(`\n=== Boot 2 (warm) ===`);
  await page.goto(URL_TARGET, { waitUntil: "domcontentloaded" });
  const boot2 = await waitForReady(page, "boot2", 120_000);
  const log2 = await readParentLog(page);
  const hit = log2.includes("[wc] cache mount OK — vite found");
  const installSkipped = !log2.includes("npm install --legacy-peer-deps");
  console.log(`boot2.status=${boot2.status}`);
  console.log(`boot2.cacheHit=${hit}`);
  console.log(`boot2.installSkipped=${installSkipped}`);
  console.log(`\n[boot2 wc/npm/layout lines]`);
  console.log(
    log2
      .split("\n")
      .filter(
        (l) =>
          l.startsWith("[wc]") ||
          l.startsWith("[layout]") ||
          l.startsWith("[npm]"),
      )
      .join("\n"),
  );

  await browser.close();

  const pass = hit && installSkipped && boot2.status === "child-ready";
  console.log(`\n=== Result: ${pass ? "PASS" : "FAIL"} ===`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error("[verify-cache] crashed:", err);
  process.exit(2);
});
