// Visual check script. Requires the dev server on http://localhost:3000 and an
// installed Edge or Chrome (no browser download): see README "Visual checks".
// Targeted checks: projects slide at its sticky position, mobile menu, routes, frame rate.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const out = path.join(__dirname, "..", "..", ".checks", "shots", "checks");
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });

  // Routes
  const ctx = await browser.newContext();
  for (const route of ["/robots.txt", "/sitemap.xml", "/opengraph-image", "/does-not-exist"]) {
    const res = await ctx.request.get(`http://localhost:3000${route}`);
    const body = await res.text();
    console.log(`${route} -> ${res.status()} ${res.headers()["content-type"] || ""} ${route.endsWith("image") ? "" : body.slice(0, 80).replace(/\s+/g, " ")}`);
  }
  await ctx.close();

  for (const [w, h] of [[390, 844], [768, 1024], [1280, 800]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto("http://localhost:3000/#projects", { waitUntil: "networkidle" });
    await page.mouse.move(-10, -10);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(out, `projects-w${w}.png`) });

    // Advance one slide with the on-screen button, then with the keyboard.
    await page.click('button[aria-label="Next project"]');
    await page.waitForTimeout(900);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const counter = await page.locator('[aria-live="polite"]').textContent();
    console.log(`w=${w} projects counter after next+arrow: ${counter.trim()}`);

    if (w === 390) {
      await page.click('button[aria-label="Open menu"]');
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(out, `menu-w${w}.png`) });
      await page.click('[role="dialog"] a[href="#contact"]');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(out, `menu-contact-w${w}.png`) });
      const top = await page.evaluate(() => document.getElementById("contact").getBoundingClientRect().top);
      console.log(`w=${w} contact section top after menu click: ${Math.round(top)}px`);
    }

    if (w === 1280) {
      // 404 page
      await page.goto("http://localhost:3000/does-not-exist", { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(out, `404-w${w}.png`) });

      // Frame rate sample on the landing while the pointer moves.
      await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
      const fps = await page.evaluate(() => new Promise((resolve) => {
        const times = [];
        let last = performance.now();
        const tick = (now) => { times.push(now - last); last = now; if (times.length < 120) requestAnimationFrame(tick); else resolve(times); };
        requestAnimationFrame(tick);
      }));
      const avg = fps.reduce((a, b) => a + b, 0) / fps.length;
      const worst = Math.max(...fps);
      console.log(`w=${w} frame interval avg=${avg.toFixed(1)}ms worst=${worst.toFixed(1)}ms`);
    }
    console.log(`w=${w} errors=${errors.length ? JSON.stringify(errors) : "none"}`);
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
