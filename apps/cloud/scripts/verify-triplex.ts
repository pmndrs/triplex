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
  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== "false",
  });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  page.on("pageerror", (err) => console.log(`[page error] ${err.message}`));
  page.on("websocket", (ws) => {
    console.log(`[ws open] ${ws.url()}`);
    ws.on("close", () => console.log(`[ws closed] ${ws.url()}`));
    ws.on("socketerror", (err) =>
      console.log(`[ws socketerror] ${ws.url()} ${err}`),
    );
    ws.on("framereceived", (f) =>
      console.log(`[ws recv] ${ws.url()} ${f.payload.toString().slice(0, 80)}`),
    );
  });
  page.on("response", (r) => {
    if (r.url().includes("--587") && r.status() >= 400) {
      console.log(`[net ${r.status()}] ${r.url()}`);
    }
  });
  page.on("requestfailed", (r) => {
    if (r.url().includes("--587") || r.url().startsWith("wss://")) {
      console.log(`[reqfail] ${r.url()} ${r.failure()?.errorText}`);
    }
  });
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

  if (statusLine.includes("ready")) {
    console.log("[verify-triplex] waiting 15s for editor to mount…");
    page.on("console", (msg) => {
      const t = msg.type();
      if (t === "error" || t === "warning") {
        console.log(`[page console.${t}] ${msg.text()}`);
      }
    });
    page.on("requestfailed", (r) => {
      console.log(`[page reqfail] ${r.url()} ${r.failure()?.errorText ?? ""}`);
    });
    await page.waitForTimeout(15_000);

    // Probe whether the 5872 URL responds at all via HTTPS.
    const wsHttpsUrl = serverLinks.find((u) => u.includes("--5872--"));
    if (wsHttpsUrl) {
      const httpsResult = await page.evaluate(async (url) => {
        try {
          const r = await fetch(url);
          const t = await r.text();
          return `status=${r.status} len=${t.length} body=${t.slice(0, 200)}`;
        } catch (e) {
          return `fetch error: ${(e as Error).message}`;
        }
      }, wsHttpsUrl);
      console.log(`[parent-https 5872] ${httpsResult}`);
    }

    // Try WSS against 5871 (HTTP server) too, to compare.
    const ws5871 = serverLinks
      .find((u) => u.includes("--5871--"))
      ?.replace("https://", "wss://");
    if (ws5871) {
      const r = await page.evaluate(
        (url) =>
          new Promise<string>((resolve) => {
            try {
              const ws = new WebSocket(url);
              const t = setTimeout(() => resolve("timeout"), 5000);
              ws.onopen = () => {
                clearTimeout(t);
                ws.close();
                resolve("open");
              };
              ws.onerror = () => {
                clearTimeout(t);
                resolve("error");
              };
              ws.onclose = (e) => {
                clearTimeout(t);
                resolve(`close: code=${e.code} reason=${e.reason || "(none)"}`);
              };
            } catch (e) {
              resolve(`throw: ${(e as Error).message}`);
            }
          }),
        ws5871,
      );
      console.log(`[parent-ws 5871] ${r}`);
    }

    // Probe whether the WSS URL works from the parent page (not srcdoc).
    const wsUrl = serverLinks
      .find((u) => u.includes("--5872--"))
      ?.replace("https://", "wss://");
    if (wsUrl) {
      const wsResult = await page.evaluate(
        (url) =>
          new Promise<string>((resolve) => {
            try {
              const ws = new WebSocket(url);
              const timeout = setTimeout(() => resolve("timeout"), 5000);
              ws.onopen = () => {
                clearTimeout(timeout);
                ws.close();
                resolve("open");
              };
              ws.onerror = (e) => {
                clearTimeout(timeout);
                resolve(`error: ${(e as Event).type}`);
              };
              ws.onclose = (e) => {
                clearTimeout(timeout);
                resolve(`close: code=${e.code} reason=${e.reason || "(none)"}`);
              };
            } catch (e) {
              resolve(`throw: ${(e as Error).message}`);
            }
          }),
        wsUrl,
      );
      console.log(`[parent-ws ${wsUrl}] ${wsResult}`);
    }

    // Find the editor iframe (srcdoc) and dig into it.
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      const url = frame.url();
      if (url.includes("about:srcdoc") || url === "about:blank") {
        try {
          const snap = await frame.evaluate(() => ({
            bodyTextLen: document.body.innerText?.length ?? 0,
            bodyText: document.body.innerText?.slice(0, 400) ?? "",
            hasMounted: (document.getElementById("root")?.children.length ?? 0) > 0,
            rootChildCount: document.getElementById("root")?.children.length ?? 0,
            rootHTML: document.getElementById("root")?.innerHTML?.slice(0, 400) ?? "",
            editorLog: (window as unknown as { __editorLog?: string[] }).__editorLog ?? [],
            hasTriplexGlobal: !!(window as unknown as { triplex?: unknown }).triplex,
          }));
          console.log("[editor frame]", JSON.stringify(snap, null, 2));
        } catch (e) {
          console.log(`[editor frame eval failed] ${(e as Error).message}`);
        }
      }
    }
    await page.screenshot({ path: "/tmp/triplex-spike.png", fullPage: false });

    page.on("frameattached", (f) => console.log(`[frame attached] ${f.url()}`));
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      const url = frame.url();
      console.log(`[frame] ${url}`);
      try {
        const body = await frame.evaluate(() => ({
          bodyHTML: document.body?.innerHTML?.slice(0, 800) ?? "",
          title: document.title,
          url: location.href,
          hasCanvas: !!document.querySelector("canvas"),
        }));
        console.log(`[frame body]`, JSON.stringify(body, null, 2));
      } catch (err) {
        console.log(`[frame eval failed] ${(err as Error).message}`);
      }
    }

    // Navigate a new tab directly to the client URL so we can capture console
    // errors from inside Triplex's served HTML.
    const clientUrl = serverLinks.find((u) => u.includes("--5870--"));
    if (clientUrl) {
      const sceneUrl = `${clientUrl}/scene?path=/src/geometry/box.tsx&exportName=default`;
      console.log(`[verify-triplex] opening probe page to ${sceneUrl}`);
      const probe = await context.newPage();
      probe.on("pageerror", (err) =>
        console.log(`[probe pageerror] ${err.message}`),
      );
      probe.on("console", async (msg) => {
        const args = msg.args();
        const resolved = await Promise.all(
          args.map((a) =>
            a.jsonValue().catch(() => a.toString()),
          ),
        );
        console.log(
          `[probe console.${msg.type()}] ${resolved
            .map((v) => (typeof v === "string" ? v : JSON.stringify(v)?.slice(0, 200)))
            .join(" ")}`,
        );
      });
      probe.on("requestfailed", (r) =>
        console.log(
          `[probe reqfail] ${r.url()} ${r.failure()?.errorText ?? ""}`,
        ),
      );
      probe.on("response", (r) => {
        if (r.status() >= 400) {
          console.log(`[probe res ${r.status()}] ${r.url()}`);
        }
      });
      try {
        const resp = await probe.goto(sceneUrl, {
          timeout: 30_000,
          waitUntil: "domcontentloaded",
        });
        console.log(`[probe] status=${resp?.status()} ok=${resp?.ok()}`);

        // Inspect the loaded HTML to see the embedded init script + module paths.
        const sceneHtmlInfo = await probe.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll("script"));
          const inline = scripts.find((s) => !s.src && s.textContent && s.textContent.length > 200);
          const inlineText = inline?.textContent ?? "";
          const filesIdx = inlineText.indexOf("const files");
          return {
            inlineLen: inlineText.length,
            scriptSrcs: scripts.map((s) => s.src).filter(Boolean).slice(0, 10),
            filesSnippet: filesIdx >= 0 ? inlineText.slice(filesIdx, filesIdx + 800) : "(no files block)",
          };
        });
        console.log("[scene-html info]", JSON.stringify(sceneHtmlInfo, null, 2));

        // The renderer waits for a request-open-component postMessage. In
        // the real app the editor sends this; here we fake it.
        await probe.evaluate(() => {
          const msg = {
            data: {
              encodedProps: "",
              exportName: "default",
              path: "/src/geometry/box.tsx",
            },
            eventName: "request-open-component",
          };
          window.postMessage(msg, "*");
          setInterval(() => window.postMessage(msg, "*"), 1000);
        });

        for (let i = 0; i < 6; i++) {
          await probe.waitForTimeout(5_000);
          const snap = await probe.evaluate(() => ({
            canvasCount: document.querySelectorAll("canvas").length,
            hasRoot: !!document.getElementById("root"),
            rootChildren: document.getElementById("root")?.children.length ?? 0,
            rootText: document.getElementById("root")?.innerText?.slice(0, 200) ?? "",
          }));
          console.log(`[probe t+${(i + 1) * 5}s]`, JSON.stringify(snap));
          if (snap.canvasCount > 0) break;
        }
        await probe.screenshot({ path: "/tmp/triplex-scene.png", fullPage: false });
      } catch (err) {
        console.log(`[probe failed] ${(err as Error).message}`);
      }
    }
  }
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
