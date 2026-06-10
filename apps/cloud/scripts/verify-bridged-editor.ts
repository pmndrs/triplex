/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/bridged-editor-spike";

async function main() {
  console.log(`[verify-bridged-editor] launching, target=${URL}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("pageerror", (err) => console.log(`[page error] ${err.message}`));
  page.on("console", (msg) => {
    const t = msg.type();
    if (t === "error" || t === "warning") {
      console.log(`[console.${t}] ${msg.text()}`);
    }
  });

  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // WebContainer install + Vite boot takes a while; poll status.
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="status"]')?.textContent ===
        "child-ready",
      null,
      { timeout: 180_000 },
    );
    console.log("[verify-bridged-editor] child-ready");
  } catch {
    const s = await page.evaluate(
      () => document.querySelector('[data-testid="status"]')?.textContent,
    );
    console.log(`[verify-bridged-editor] timed out, status=${s}`);
  }
  // Let scene iframe load.
  await page.waitForTimeout(15_000);

  const parentLog = await page.evaluate(() => {
    const pres = Array.from(document.querySelectorAll("pre"));
    return pres[0]?.textContent ?? "";
  });
  console.log("\n=== Parent log ===");
  console.log(parentLog);

  const editorLog = await page.evaluate(() => {
    return (
      document.querySelector('[data-testid="editor-log"]')?.textContent ?? ""
    );
  });

  console.log("\n=== Editor log (last 3000 chars) ===");
  console.log(editorLog.slice(-3000));

  // Sample the iframe DOM to see what mounted.
  const iframeDom = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return "(no iframe)";
    const root = iframe.contentDocument.getElementById("root");
    if (!root) return "(no #root)";
    return {
      childCount: root.children.length,
      classList: Array.from(
        root.querySelectorAll("[class*='loading'], [class*='Loading']"),
      ).map((el) => el.className).slice(0, 10),
      hasLogo: !!iframe.contentDocument.querySelector("svg"),
      innerHTMLLen: root.innerHTML.length,
      tags: Array.from(root.querySelectorAll("*")).slice(0, 30).map(
        (el) => el.tagName.toLowerCase(),
      ),
    };
  });
  console.log("\n=== Iframe root DOM ===");
  console.log(JSON.stringify(iframeDom, null, 2));

  await page.screenshot({ path: "/tmp/bridged-editor.png", fullPage: true });
  await browser.close();
}

main().catch((err) => {
  console.error("[verify-bridged-editor] crashed:", err);
  process.exit(1);
});
