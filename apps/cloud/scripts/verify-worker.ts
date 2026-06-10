/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/worker-spike";

async function main() {
  console.log(`[verify-worker] launching, target=${URL}`);
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
  await page.waitForFunction(() => document.body.innerText.includes("status: ready"), null, {
    timeout: 30_000,
  });
  console.log("[verify-worker] worker ready");

  await page.getByRole("button", { name: /Parse all four files/i }).click();
  console.log("[verify-worker] clicked Parse all");

  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("section pre")).filter((p) => (p.textContent ?? "").length > 0).length >= 4,
    null,
    { timeout: 30_000 },
  );

  const snap = await page.evaluate(() => {
    const out: Array<{ file: string; text: string }> = [];
    const sections = Array.from(document.querySelectorAll("section > div"));
    for (const s of sections) {
      const strong = s.querySelector("strong")?.textContent ?? "";
      const text = s.textContent ?? "";
      out.push({ file: strong, text: text.slice(0, 1200) });
    }
    return out;
  });
  console.log("\n=== Per-file results ===\n");
  for (const r of snap) {
    console.log(`--- ${r.file} ---`);
    console.log(r.text);
    console.log();
  }
  await page.screenshot({ path: "/tmp/worker-spike.png", fullPage: true });
  await browser.close();
}

main().catch((err) => {
  console.error("[verify-worker] crashed:", err);
  process.exit(1);
});
