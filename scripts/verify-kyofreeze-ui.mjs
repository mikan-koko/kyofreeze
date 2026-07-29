import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const appPath = (await exists(path.join(root, "outputs", "index.html")))
  ? path.join(root, "outputs", "index.html")
  : path.join(root, "index.html");
const outDir = path.join(root, "outputs", "playwright-checks");
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
    const decorative = new Set(["hero-shine", "hero-illustration"]);
    const overflowing = [...document.querySelectorAll("body *")]
      .map((el) => {
        if ([...el.classList].some((name) => decorative.has(name))) return null;
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          cls: el.className ? String(el.className).slice(0, 80) : "",
          text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width)
        };
      })
      .filter(Boolean)
      .filter((r) => r.width > 0 && (r.left < -2 || r.right > viewportWidth + 2))
      .slice(0, 12);
    const hero = document.querySelector(".hero-character")?.getBoundingClientRect();
    const quiz = document.querySelector("#quizView")?.getBoundingClientRect();
    return {
      name,
      viewportWidth,
      documentWidth: docWidth,
      horizontalOverflow: docWidth > viewportWidth + 2,
      overflowing,
      heroCharacterVisible: hero ? hero.width > 20 && hero.height > 20 && hero.bottom > 0 && hero.top < window.innerHeight : null,
      quizVisible: quiz ? quiz.width > 0 && quiz.height > 0 && getComputedStyle(document.querySelector("#quizView")).display !== "none" : null
    };
  }, label);
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function runViewport(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const baseUrl = pathToFileURL(appPath).href;
  const prefix = `${viewport.width}x${viewport.height}`;
  const results = [];
  const screenshots = [];

  page.on("pageerror", (err) => {
    results.push({ name: `${prefix}-pageerror`, error: err.message });
  });

  await page.goto(baseUrl, { waitUntil: "load" });
  await page.waitForTimeout(350);
  screenshots.push(await shot(page, `${prefix}-01-dict`));
  results.push(await auditLayout(page, `${prefix}-dict`));

  await page.locator(".card").first().click();
  await page.waitForTimeout(250);
  screenshots.push(await shot(page, `${prefix}-02-card-modal`));
  results.push(await auditLayout(page, `${prefix}-card-modal`));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);

  await page.getByRole("button", { name: "洛中地図" }).click();
  await page.waitForTimeout(350);
  const pins = page.locator(".map-pin");
  if (await pins.count()) await pins.nth(Math.min(3, (await pins.count()) - 1)).click();
  await page.waitForTimeout(200);
  screenshots.push(await shot(page, `${prefix}-03-map`));
  results.push(await auditLayout(page, `${prefix}-map`));

  await page.getByRole("button", { name: "はんなり検定" }).click();
  await page.waitForTimeout(350);
  const answer = page.locator("[data-quiz-answer]").first();
  if (await answer.count()) await answer.click();
  await page.waitForTimeout(250);
  screenshots.push(await shot(page, `${prefix}-04-quiz-answered`));
  results.push(await auditLayout(page, `${prefix}-quiz-answered`));

  await page.close();
  return { viewport, screenshots, results };
}

await fs.mkdir(outDir, { recursive: true });
const executablePath = await findBrowser();
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: [
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--allow-file-access-from-files"
  ]
});

const suites = [];
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 900 }
]) {
  suites.push(await runViewport(browser, viewport));
}
await browser.close();

const flat = suites.flatMap((suite) => suite.results);
const failures = flat.filter((r) => r.error || r.horizontalOverflow || (Array.isArray(r.overflowing) && r.overflowing.length));
const report = {
  checkedAt: new Date().toISOString(),
  browser: executablePath,
  app: appPath,
  screenshots: suites.flatMap((suite) => suite.screenshots),
  results: flat,
  ok: failures.length === 0,
  failures
};

await fs.writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({
  ok: report.ok,
  screenshotCount: report.screenshots.length,
  report: path.join(outDir, "report.json"),
  failures: failures.map((f) => f.name)
}, null, 2));

if (!report.ok) process.exitCode = 1;
