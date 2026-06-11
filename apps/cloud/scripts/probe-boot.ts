/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const URL_TARGET = `${BASE}/folder-spike?fixture=gitplex`;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("pageerror", (err) =>
    console.log(`[pageerror] ${err.message.slice(0, 240)}`),
  );

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[main error] ${msg.text().slice(0, 240)}`);
    }
  });

  await page.goto(URL_TARGET, { waitUntil: "domcontentloaded" });
  // Print parent log every 20s so we can see where it's stuck if it stalls.
  const interval = setInterval(async () => {
    try {
      const text: string = await page.evaluate(() => {
        const pres = Array.from(document.querySelectorAll("pre"));
        return pres[0]?.textContent ?? "";
      });
      const last = text.split("\n").slice(-4).join(" | ");
      process.stdout.write(`[heartbeat] ${last}\n`);
    } catch {
      /* page busy */
    }
  }, 20_000);
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="status"]')?.textContent ===
        "child-ready",
      null,
      { timeout: 300_000 },
    );
  } finally {
    clearInterval(interval);
  }

  // Snapshot parent log right at child-ready (before any sleep), with
  // explicit stdout flush so background runners see progress incrementally.
  const parent: string = await page.evaluate(() => {
    const pres = Array.from(document.querySelectorAll("pre"));
    return pres[0]?.textContent ?? "";
  });
  process.stdout.write("=== parent log @ child-ready ===\n");
  process.stdout.write(parent + "\n");
  // 12s poll for any new tail entries or page death.
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(4_000);
    try {
      const tail: string = await page.evaluate(() => {
        const pres = Array.from(document.querySelectorAll("pre"));
        const text = pres[0]?.textContent ?? "";
        return text.split("\n").slice(-15).join("\n");
      });
      process.stdout.write(`=== tail @ t+${(i + 1) * 4}s ===\n${tail}\n`);
    } catch (err) {
      process.stdout.write(
        `=== unreachable @ t+${(i + 1) * 4}s: ${(err as Error).message.slice(0, 200)}\n`,
      );
      break;
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error("[probe] crashed:", e);
  process.exit(1);
});
