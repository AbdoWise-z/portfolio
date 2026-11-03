// Visual check script. Requires the dev server on http://localhost:3000 and an
// installed Edge or Chrome (no browser download): see README "Visual checks".
// Full-page and per-viewport screenshots of the portfolio at several widths.
// usage: node shots.js <label> [width,...]
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const label = process.argv[2] || "survey";
const widths = (process.argv[3] || "390,768,1280,1920").split(",").map(Number);
const heights = { 390: 844, 768: 1024, 1280: 800, 1920: 1080 };
const out = path.join(__dirname, "..", "..", ".checks", "shots", label);
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });
  for (const w of widths) {
    const h = heights[w] || 900;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.mouse.move(-10, -10);
    await page.waitForTimeout(800);

    // Viewport shots while scrolling one screen at a time (sticky sections need real scroll).
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    let y = 0, i = 0;
    while (y < total && i < 40) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(out, `w${w}-${String(i).padStart(2, "0")}-y${y}.png`) });
      y += Math.round(h * 0.9);
      i++;
    }
    const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(`w=${w} h=${h} pageHeight=${total} shots=${i} horizontalScroll=${hasHScroll} errors=${errors.length ? JSON.stringify(errors) : "none"}`);
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
