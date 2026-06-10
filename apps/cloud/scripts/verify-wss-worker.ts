/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/worker-server-spike";

async function main() {
  console.log(`[verify-wss-worker] launching, target=${URL}`);
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
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="status"]')?.textContent ===
      "ready",
    null,
    { timeout: 30_000 },
  );
  console.log("[verify-wss-worker] worker ready");

  await page.getByRole("button", { name: /Run all probes/i }).click();
  console.log("[verify-wss-worker] clicked Run");

  await page.waitForFunction(
    () => {
      const sections = Array.from(
        document.querySelectorAll('[data-testid^="probe-"]'),
      );
      const populated = sections.filter(
        (s) => s.querySelector("pre") || s.textContent?.includes("error"),
      );
      return populated.length >= 7;
    },
    null,
    { timeout: 30_000 },
  );

  const snap = await page.evaluate(() => {
    const out: Array<{ label: string; body: string }> = [];
    const sections = Array.from(
      document.querySelectorAll('[data-testid^="probe-"]'),
    );
    for (const s of sections) {
      const label =
        s.getAttribute("data-testid")?.replace("probe-", "") ?? "?";
      const body = (s.querySelector("pre") ?? s).textContent ?? "";
      out.push({ body, label });
    }
    return out;
  });

  console.log("\n=== Probe results ===\n");
  for (const r of snap) {
    console.log(`--- ${r.label} ---`);
    console.log(r.body.slice(0, 1500));
    console.log();
  }

  await page.screenshot({ path: "/tmp/wss-worker.png", fullPage: true });
  await browser.close();
}

main().catch((err) => {
  console.error("[verify-wss-worker] crashed:", err);
  process.exit(1);
});
