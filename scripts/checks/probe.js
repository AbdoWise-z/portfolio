// Visual check script. Requires the dev server on http://localhost:3000 and an
// installed Edge or Chrome (no browser download): see README "Visual checks".
// Probe the "secret content" mask: hover a SecretContent, sample where each
// layer's mask circle is relative to the mouse while the mask size animates.
const { chromium } = require("playwright");
const path = require("path");

const label = process.argv[2] || "run";
const target = process.argv[3] || "Building"; // text inside the SecretContent to hover

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Innermost element with the text, so the walk up lands on the masked layer, not a wrapper above it.
  const h = page.locator(`:is(h1,p,span):has-text("${target}")`).last();
  await h.scrollIntoViewIfNeeded();
  const box = await h.boundingBox();
  const mx = box.x + box.width / 2, my = box.y + box.height / 2;

  // Approach from outside so mouseenter fires, then sit still.
  await page.mouse.move(mx - 400, my - 300);
  await page.waitForTimeout(300);
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(mx - 400 + 40 * i, my - 300 + 30 * i);
    await page.waitForTimeout(16);
  }

  const sample = async () => page.evaluate((t) => {
    const all = [...document.querySelectorAll("h1,p,span")].filter((e) => e.textContent.includes(t));
    const h = all[all.length - 1]; // innermost match
    let content = h;
    while (content && !(content.getAttribute("style") || "").includes("mask-composite")) content = content.parentElement;
    if (!content) throw new Error("no masked ancestor for " + t);
    const outer = content.parentElement;
    const layers = [...outer.children];
    const read = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const pos = (cs.maskPosition || cs.webkitMaskPosition || "").split(",").pop().trim().split(" ").map(parseFloat);
      const size = (cs.maskSize || cs.webkitMaskSize || "").split(",").pop().trim().split(" ").map(parseFloat);
      return {
        rect: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
        maskPos: pos, maskSize: size,
        // viewport centre of the circle this layer is masking with
        centre: [r.left + pos[0] + size[0] / 2, r.top + pos[1] + size[1] / 2].map(Math.round),
        pos: cs.position,
      };
    };
    const ind = document.querySelector("div[aria-hidden] > div[style*='border-radius'], div.overflow-hidden > div[style*='border-radius']");
    let indicator = null;
    if (ind) {
      const r = ind.getBoundingClientRect();
      indicator = { centre: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)], size: Math.round(r.width) };
    }
    return { layers: layers.map(read), indicator };
  }, target);

  const log = [];
  for (let i = 0; i < 12; i++) {
    const s = await sample();
    log.push({ t: i * 100, mouse: [Math.round(mx), Math.round(my)], ...s });
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: path.join(__dirname, "..", "..", ".checks", "shots", `probe-${label}.png`) });

  for (const s of log) {
    const L = s.layers.map((l, i) => `L${i}(${l.pos}) rect=${l.rect.l},${l.rect.t} ${l.rect.w}x${l.rect.h} size=${l.maskSize[0]} centre=${l.centre}`).join(" | ");
    console.log(`t=${s.t}ms mouse=${s.mouse} ind=${s.indicator ? s.indicator.centre + " sz" + s.indicator.size : "n/a"} :: ${L}`);
  }
  console.log("errors:", errors.length ? errors : "none");
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
