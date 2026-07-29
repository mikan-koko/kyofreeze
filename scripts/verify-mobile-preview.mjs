import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "outputs", "mobile-preview");
const baseUrl = process.env.KYOFREEZE_MOBILE_URL || "http://127.0.0.1:8082";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function findBrowser() {
  if (await exists(edgePath)) return edgePath;
  if (await exists(chromePath)) return chromePath;
  throw new Error("Chrome/Edge executable was not found.");
}

async function auditLayout(page, label) {
  return await page.evaluate((name) => {
    const viewportWidth = window.innerWidth;
    const docWidth = document.documentElement.scrollWidth;
    const overflowing = [...document.querySelectorAll("body *")]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        };
      })
      .filter((r) => r.width > 0 && (r.left < -2 || r.right > viewportWidth + 2))
      .filter((r) => !(r.text === "" && (r.tag === "div" || r.tag === "img")))
      .slice(0, 12);

    return {
      name,
      viewportWidth,
      documentWidth: docWidth,
      horizontalOverflow: docWidth > viewportWidth + 2,
      overflowing,
    };
  }, label);
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function openTab(page, label) {
  await page.getByText(label, { exact: true }).click();
  await page.waitForTimeout(500);
}

async function runViewport(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const prefix = `${viewport.width}x${viewport.height}`;
  const results = [];
  const screenshots = [];

  page.on("pageerror", (err) => {
    results.push({ name: `${prefix}-pageerror`, error: err.message });
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.getByText("京ふれーず", { exact: true }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1000);
  screenshots.push(await shot(page, `${prefix}-dict`));
  results.push(await auditLayout(page, `${prefix}-dict`));

  await openTab(page, "洛中地図");
  await page.getByText("祇園", { exact: true }).click().catch(() => null);
  screenshots.push(await shot(page, `${prefix}-map`));
  results.push(await auditLayout(page, `${prefix}-map`));

  await openTab(page, "検定");
  const options = page.locator("text=/^.+$/").filter({ hasNotText: "検定" });
  await options.nth(12).click().catch(() => null);
  screenshots.push(await shot(page, `${prefix}-quiz`));
  results.push(await auditLayout(page, `${prefix}-quiz`));

  await openTab(page, "iOS計画");
  screenshots.push(await shot(page, `${prefix}-roadmap`));
  results.push(await auditLayout(page, `${prefix}-roadmap`));

  await page.close();
  return { viewport, results, screenshots };
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: await findBrowser(),
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

try {
  const runs = [];
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
  ]) {
    runs.push(await runViewport(browser, viewport));
  }

  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    runs,
  };
  await fs.writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
