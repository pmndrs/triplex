/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/ws-bridge-spike";

async function main() {
  console.log(`[verify-ws-bridge] launching, target=${URL}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("pageerror", (err) => console.log(`[page error] ${err.message}`));
  page.on("console", (msg) => {
    const t = msg.type();
    if (t === "error" || t === "warning") {
      console.log(`[console.${t}] ${msg.text()}`);
    }
  });

  await page.goto(URL, { waitUntil: "networkidle" });

  // Wait, but only briefly — we'll dump logs even on timeout.
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="status"]')?.textContent === "done",
      null,
      { timeout: 10_000 },
    );
    console.log("[verify-ws-bridge] harness done");
  } catch {
    const status = await page.evaluate(
      () => document.querySelector('[data-testid="status"]')?.textContent,
    );
    console.log(`[verify-ws-bridge] timed out, status=${status}`);
  }

  const harnessResults = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="harness-results"]');
    return el?.textContent ?? "(missing)";
  });
  console.log("\n=== Harness results ===");
  console.log(harnessResults.slice(0, 4000));

  const parentLog = await page.evaluate(() => {
    const pres = Array.from(document.querySelectorAll("pre"));
    return pres[0]?.textContent ?? "";
  });
  console.log("\n=== Parent log ===");
  console.log(parentLog);

  const childLog = await page.evaluate(() => {
    const iframe = document.querySelector("iframe");
    if (!iframe) return "(no iframe)";
    try {
      const doc = (iframe as HTMLIFrameElement).contentDocument;
      return doc?.getElementById("out")?.textContent ?? "(no log)";
    } catch (err) {
      return `(cross-origin: ${(err as Error).message})`;
    }
  });
  console.log("\n=== Child (iframe) log ===");
  console.log(childLog);

  await page.screenshot({ path: "/tmp/ws-bridge.png", fullPage: true });
  await browser.close();
}

main().catch((err) => {
  console.error("[verify-ws-bridge] crashed:", err);
  process.exit(1);
});
