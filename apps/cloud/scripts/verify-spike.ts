/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const URL = process.env.SPIKE_URL ?? "http://localhost:3000/spike";
const READY_TIMEOUT_MS = 5 * 60 * 1000;
const HMR_SETTLE_MS = 6000;

function hash(buf: Buffer) {
  return createHash("sha256").update(buf).digest("hex").slice(0, 12);
}

async function main() {
  console.log(`[verify-spike] launching chromium, target=${URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on("pageerror", (err) => console.log(`[page error] ${err.message}`));
  page.on("console", (msg) => {
    const t = msg.type();
    if (t === "error" || t === "warning") console.log(`[console.${t}] ${msg.text()}`);
  });

  await page.goto(URL, { waitUntil: "networkidle" });
  console.log("[verify-spike] page loaded");

  await page.getByRole("button", { name: /Boot WebContainer/i }).click();
  console.log("[verify-spike] clicked Boot WebContainer; waiting for ready…");

  const start = Date.now();
  await page.waitForFunction(
    () => document.body.innerText.includes("status: ready"),
    null,
    { timeout: READY_TIMEOUT_MS, polling: 2000 },
  );
  console.log(`[verify-spike] became ready in ${Math.round((Date.now() - start) / 1000)}s`);

  const iframe = page.frameLocator('iframe[title="webcontainer-preview"]');
  console.log("[verify-spike] waiting for canvas inside iframe…");
  await iframe.locator("canvas").waitFor({ state: "visible", timeout: 60_000 });

  const iframeBox = await page.locator('iframe[title="webcontainer-preview"]').boundingBox();
  if (!iframeBox) throw new Error("iframe not visible");
  console.log(`[verify-spike] iframe box ${JSON.stringify(iframeBox)}`);

  async function waitForStableShot(label: string, maxMs = 20_000) {
    const start = Date.now();
    let prevHash = "";
    while (Date.now() - start < maxMs) {
      const buf = await page.screenshot({ clip: iframeBox });
      const h = hash(buf);
      if (prevHash && prevHash === h && buf.length > 4000) {
        console.log(`[verify-spike] ${label} stabilized hash=${h} bytes=${buf.length}`);
        return buf;
      }
      prevHash = h;
      await page.waitForTimeout(700);
    }
    throw new Error(`${label} never stabilized`);
  }

  const beforePath = "/tmp/spike-before.png";
  const afterPath = "/tmp/spike-after.png";
  const fullBeforePath = "/tmp/spike-before-full.png";
  const fullAfterPath = "/tmp/spike-after-full.png";

  const beforeBuf = await waitForStableShot("before");
  writeFileSync(beforePath, beforeBuf);
  await page.screenshot({ path: fullBeforePath });

  await page.getByRole("button", { name: /Trigger HMR write/i }).click();
  console.log("[verify-spike] clicked HMR, waiting for visual change…");

  const beforeH = hash(beforeBuf);
  const hmrStart = Date.now();
  let afterBuf: Buffer | null = null;
  while (Date.now() - hmrStart < HMR_SETTLE_MS * 4) {
    const buf = await page.screenshot({ clip: iframeBox });
    if (hash(buf) !== beforeH && buf.length > 4000) {
      afterBuf = await waitForStableShot("after");
      break;
    }
    await page.waitForTimeout(500);
  }
  if (!afterBuf) throw new Error("iframe never changed after HMR write");
  writeFileSync(afterPath, afterBuf);
  await page.screenshot({ path: fullAfterPath });
  console.log(`[verify-spike] after  hash=${hash(afterBuf)} bytes=${afterBuf.length}`);

  const changed = hash(beforeBuf) !== hash(afterBuf);
  const statusLine = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll("p"))
        .map((p) => p.textContent ?? "")
        .find((t) => t.startsWith("status:")) ?? "",
  );
  console.log(`[verify-spike] final ${statusLine}`);

  await browser.close();

  const result = {
    afterHash: hash(afterBuf),
    beforeHash: hash(beforeBuf),
    hmrChanged: changed,
    iframeBox,
    screenshots: { afterPath, beforePath, fullAfterPath, fullBeforePath },
    status: statusLine,
  };
  writeFileSync("/tmp/spike-verify-result.json", JSON.stringify(result, null, 2));

  console.log("\n=== VERIFY RESULT ===");
  console.log(JSON.stringify(result, null, 2));

  if (!changed) {
    console.error("\n[verify-spike] FAIL: iframe screenshot did not change after HMR write.");
    process.exit(1);
  }
  console.log("\n[verify-spike] PASS: iframe rendered and HMR write changed the visual output.");
}

main().catch((err) => {
  console.error("[verify-spike] crashed:", err);
  process.exit(1);
});
