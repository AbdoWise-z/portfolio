// Visual check script. Requires the dev server on http://localhost:3000 and an
// installed Edge or Chrome (no browser download): see README "Visual checks".
// Theme + lens checks: light/dark screenshots at several widths, lens over text,
// images and panels, timeline jump buttons, and scroll-warp streaks.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const out = path.join(__dirname, "..", "..", ".checks", "shots", "themes");
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });

  for (const [w, h] of [[390, 844], [1280, 800]]) {
    for (const theme of ["dark", "light"]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
      if (theme === "light") {
        await page.click('button[aria-label^="Switch to"]');
        await page.waitForTimeout(500);
      }
      const htmlClass = await page.evaluate(() => document.documentElement.className);
      await page.mouse.move(-10, -10);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(out, `${theme}-landing-w${w}.png`) });

      // Sections (desktop only to keep the run short)
      if (w === 1280) {
        for (const id of ["about", "timeline", "projects", "contact"]) {
          await page.evaluate((i) => document.getElementById(i).scrollIntoView(), id);
          await page.waitForTimeout(900);
          await page.screenshot({ path: path.join(out, `${theme}-${id}-w${w}.png`) });
        }

        // Lens over the timeline image + text (reveal must work over opaque sections now).
        await page.evaluate(() => document.getElementById("timeline").scrollIntoView());
        await page.waitForTimeout(600);
        for (let i = 0; i <= 10; i++) { await page.mouse.move(400 + i * 20, 200 + i * 10); await page.waitForTimeout(16); }
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(out, `${theme}-lens-timeline.png`), clip: { x: 350, y: 150, width: 600, height: 300 } });

        // Timeline jump: click the 4th point and read the counter.
        await page.click('button[aria-label^="1st Place Robotics"]');
        await page.waitForTimeout(1200);
        const counter = await page.evaluate(() => [...document.querySelectorAll("span")].map((s) => s.textContent).find((t) => /^\d+ \/ \d+$/.test(t)));
        console.log(`${theme} w=${w} timeline counter after jump: ${counter}`);

        // Lens over the landing hero text.
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(800);
        for (let i = 0; i <= 10; i++) { await page.mouse.move(500 + i * 14, 150 + i * 14); await page.waitForTimeout(16); }
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(out, `${theme}-lens-hero.png`), clip: { x: 350, y: 120, width: 600, height: 360 } });

        // Warp: scroll fast and grab a frame mid-motion.
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(600);
        await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 1800); });
        await page.waitForTimeout(90);
        await page.screenshot({ path: path.join(out, `${theme}-warp.png`), clip: { x: 0, y: 0, width: 640, height: 400 } });
      }
      console.log(`${theme} w=${w} html.class="${htmlClass}" errors=${errors.length ? JSON.stringify(errors) : "none"}`);
      await page.close();
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
