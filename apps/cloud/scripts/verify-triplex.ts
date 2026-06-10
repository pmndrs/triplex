/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const URL = process.env.SPIKE_URL ?? "http://localhost:3000/triplex";
const TIMEOUT_MS = 6 * 60 * 1000;

async function main() {
  console.log(`[verify-triplex] launching, target=${URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  page.on("pageerror", (err) => console.log(`[page error] ${err.message}`));
  page.on("console", (msg) => {
    const t = msg.type();
    if (t === "error" || t === "warning") console.log(`[console.${t}] ${msg.text()}`);
  });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Boot Triplex/i }).click();
  console.log("[verify-triplex] clicked Boot; waiting for terminal state…");

  const start = Date.now();
  await page.waitForFunction(
    () => {
      const txt = document.body.innerText;
      return /status: (ready|error)/.test(txt);
    },
    null,
    { timeout: TIMEOUT_MS, polling: 2000 },
  );
  console.log(`[verify-triplex] terminal state in ${Math.round((Date.now() - start) / 1000)}s`);

  const statusLine = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll("p"))
        .map((p) => p.textContent ?? "")
        .find((t) => t.startsWith("status:")) ?? "",
  );
  const logs = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll("div")).filter(
      (d) => d.style.fontFamily && d.style.fontFamily.includes("Menlo"),
    );
    return candidates[0]?.textContent ?? "";
  });
  const serverLinks = await page.locator("a[target=_blank]").allTextContents();
  await page.screenshot({ path: "/tmp/triplex-spike.png", fullPage: false });

  await browser.close();

  writeFileSync(
    "/tmp/triplex-spike-result.json",
    JSON.stringify({ logs, serverLinks, status: statusLine }, null, 2),
  );

  console.log(`\n=== STATUS ===`);
  console.log(statusLine);
  console.log(`\n=== SERVERS EXPOSED ===`);
  console.log(serverLinks.length ? serverLinks.join("\n") : "(none)");
  console.log(`\n=== LOGS ===`);
  console.log(logs);

  if (!statusLine.includes("ready")) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[verify-triplex] crashed:", err);
  process.exit(1);
});
