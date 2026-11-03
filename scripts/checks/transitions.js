// Visual check script. Requires the dev server on http://localhost:3000 and an
// installed Edge or Chrome (no browser download): see README "Visual checks".
// Capture frames through each section boundary so the sheet transitions can be reviewed.
// usage: NODE_PATH=<playwright node_modules> node .checks/transitions.js [width] [theme]
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const w = Number(process.argv[2] || 1280);
const theme = process.argv[3] || "dark";
const h = w < 500 ? 844 : 800;
const out = path.join(__dirname, "..", "..", ".checks", "shots", "transitions");
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  if (theme === "light") { await page.click('button[aria-label^="Switch to"]'); await page.waitForTimeout(400); }
  await page.mouse.move(w - 5, h / 2);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await page.waitForTimeout(1500);

  // Section tops in document coordinates.
  const tops = await page.evaluate(() => {
    const t = (id) => Math.round(document.getElementById(id).getBoundingClientRect().top + window.scrollY);
    return { about: t("about"), timeline: t("timeline"), projectsStack: t("projects-stack"), contact: t("contact"), total: document.documentElement.scrollHeight };
  });
  console.log("tops:", JSON.stringify(tops));

  const frames = [];
  const vh = h;
  // Landing -> About cover
  frames.push(["01-about-enter", tops.about - vh * 0.6]);
  frames.push(["02-about-mid", tops.about - vh * 0.25]);
  // About -> Timeline card expand
  frames.push(["03-timeline-card", tops.timeline - vh * 0.65]);
  frames.push(["04-timeline-expanding", tops.timeline - vh * 0.25]);
  frames.push(["05-timeline-pinned", tops.timeline + 10]);
  // Timeline -> Projects slide over
  frames.push(["06-projects-enter", tops.projectsStack - vh * 0.6]);
  frames.push(["07-projects-mid", tops.projectsStack - vh * 0.25]);
  frames.push(["08-projects-pinned", tops.projectsStack + 10]);
  // Projects -> Contact
  frames.push(["09-contact-enter", tops.contact - vh * 0.6]);
  frames.push(["10-contact-mid", tops.contact - vh * 0.25]);
  frames.push(["11-contact", tops.contact + 10]);

  for (const [name, y] of frames) {
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.max(0, y));
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(out, `${theme}-w${w}-${name}.png`) });
  }
  const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`done theme=${theme} w=${w} horizontalScroll=${hasHScroll} errors=${errors.length ? JSON.stringify(errors) : "none"}`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
