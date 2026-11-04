// Draws the project and timeline background images as vector art and renders
// them to public/banners/*.webp. Run with: npm run banners
//
// Every image is dark, carries no text, uses one accent hue, and keeps its
// detail on the right half, so the copy drawn over the left side stays readable.
// Output is deterministic (seeded randomness), so re-running changes nothing.
import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const W = 1920;
const H = 1080;
const OUT = "public/banners";

/** Small seeded PRNG so each image is reproducible. */
const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
const r2 = (n) => Math.round(n * 100) / 100;
const lerp = (a, b, t) => a + (b - a) * t;

/** Shared backdrop: deep navy, a soft accent nebula, faint grid, and star specks. */
function backdrop(rand, { accent, accent2, nebulaX = 0.72, nebulaY = 0.45 }) {
  let stars = "";
  for (let i = 0; i < 160; i++) {
    const x = rand() * W, y = rand() * H;
    const r = 0.5 + rand() * 1.3;
    stars += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#dbeafe" opacity="${r2(0.15 + rand() * 0.55)}"/>`;
  }
  let grid = "";
  for (let x = 0; x <= W; x += 80) grid += `M${x} 0V${H}`;
  for (let y = 0; y <= H; y += 80) grid += `M0 ${y}H${W}`;
  return `
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="75%">
      <stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#05070f"/>
    </radialGradient>
    <radialGradient id="neb1" cx="${nebulaX}" cy="${nebulaY}" r="0.45">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.32"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="neb2" cx="${nebulaX - 0.3}" cy="${nebulaY + 0.35}" r="0.4">
      <stop offset="0" stop-color="${accent2}" stop-opacity="0.22"/><stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="leftShade" x1="0" x2="1">
      <stop offset="0" stop-color="#05070f" stop-opacity="0.75"/><stop offset="0.55" stop-color="#05070f" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="glowBig" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="24"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#neb1)"/>
  <rect width="${W}" height="${H}" fill="url(#neb2)"/>
  <path d="${grid}" stroke="#93c5fd" stroke-opacity="0.045" stroke-width="1"/>
  ${stars}`;
}

/** The same shapes drawn blurred underneath, then crisp on top. */
const lit = (inner, big = false) => `<g filter="url(#${big ? "glowBig" : "glow"})" opacity="0.8">${inner}</g>${inner}`;

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}<rect width="${W}" height="${H}" fill="url(#leftShade)"/></svg>`;

/** A calligraphic ribbon along a cubic bezier: thick in the middle, pointed at the ends. */
function ribbon(p0, p1, p2, p3, width, color, opacity = 0.9) {
  const pts = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
    const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
    const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    const len = Math.hypot(dx, dy) || 1;
    const w = width * Math.pow(Math.sin(Math.PI * t), 0.6);
    pts.push([x - (dy / len) * w, y + (dx / len) * w, x + (dy / len) * w, y - (dx / len) * w]);
  }
  const left = pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(" ");
  const right = pts.map((p) => `${r2(p[2])},${r2(p[3])}`).reverse().join(" ");
  return `<polygon points="${left} ${right}" fill="${color}" opacity="${opacity}"/>`;
}

// ---------------------------------------------------------------- scenes

/** PEARL: a grid world with a value heat map, policy arrows, and the agent's path to the reward. */
function rlAgent() {
  const rand = rng(11);
  const accent = "#60a5fa", accent2 = "#a855f7";
  let out = backdrop(rand, { accent, accent2 });
  const cols = 10, rows = 7, cell = 72, ox = 1010, oy = 250;
  const goal = [cols - 1, 1];
  let cells = "", arrows = "";
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const d = Math.hypot(c - goal[0], r - goal[1]);
      const v = Math.max(0, 1 - d / 11) + rand() * 0.08;
      const x = ox + c * cell, y = oy + r * cell;
      cells += `<rect x="${x + 3}" y="${y + 3}" width="${cell - 6}" height="${cell - 6}" rx="8" fill="${accent}" opacity="${r2(0.04 + v * 0.3)}" stroke="${accent}" stroke-opacity="0.25"/>`;
      if (!(c === goal[0] && r === goal[1]) && rand() < 0.7) {
        const ang = Math.atan2(goal[1] - r, goal[0] - c) + (rand() - 0.5) * 0.9;
        const cx = x + cell / 2, cy = y + cell / 2, L = 14;
        const tx = cx + Math.cos(ang) * L, ty = cy + Math.sin(ang) * L;
        const bx = cx - Math.cos(ang) * L, by = cy - Math.sin(ang) * L;
        const a1 = ang + 2.6, a2 = ang - 2.6;
        arrows += `<path d="M${r2(bx)} ${r2(by)}L${r2(tx)} ${r2(ty)}M${r2(tx + Math.cos(a1) * 9)} ${r2(ty + Math.sin(a1) * 9)}L${r2(tx)} ${r2(ty)}L${r2(tx + Math.cos(a2) * 9)} ${r2(ty + Math.sin(a2) * 9)}" stroke="#dbeafe" stroke-opacity="0.35" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      }
    }
  }
  // Agent path: a walk from the bottom-left corner that drifts toward the goal.
  let c = 0, r = rows - 1;
  const pathPts = [[c, r]];
  while (c !== goal[0] || r !== goal[1]) {
    if (rand() < 0.5 && c !== goal[0]) c += Math.sign(goal[0] - c); else if (r !== goal[1]) r += Math.sign(goal[1] - r); else c += Math.sign(goal[0] - c);
    pathPts.push([c, r]);
  }
  const path = pathPts.map(([pc, pr], i) => `${i ? "L" : "M"}${ox + pc * cell + cell / 2} ${oy + pr * cell + cell / 2}`).join("");
  const gx = ox + goal[0] * cell + cell / 2, gy = oy + goal[1] * cell + cell / 2;
  const [ac, ar] = pathPts[Math.floor(pathPts.length * 0.6)];
  const ax = ox + ac * cell + cell / 2, ay = oy + ar * cell + cell / 2;
  out += cells + arrows;
  out += lit(`<path d="${path}" stroke="${accent2}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`);
  out += lit(`<path d="M${gx} ${gy - 22}L${gx + 22} ${gy}L${gx} ${gy + 22}L${gx - 22} ${gy}Z" fill="#fbbf24"/>`);
  out += lit(`<circle cx="${ax}" cy="${ay}" r="16" fill="#f0f9ff"/>`, true);
  // Reward curve, bottom right.
  let curve = "M1010 980";
  for (let i = 1; i <= 24; i++) curve += `L${1010 + i * 30} ${r2(980 - Math.min(150, i * 8 + (rand() - 0.5) * 40))}`;
  out += `<path d="${curve}" stroke="${accent}" stroke-width="3" fill="none" opacity="0.6"/><path d="M1010 990H1740M1010 990V820" stroke="#dbeafe" stroke-opacity="0.25" stroke-width="2"/>`;
  return svg(out);
}

/** EPIC CPU: a five-stage pipeline, register file and caches joined by buses, under a glowing die. */
function cpuSchematic() {
  const rand = rng(23);
  const accent = "#fbbf24", accent2 = "#f97316";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.75, nebulaY: 0.5 });
  const block = (x, y, w, h, op = 0.1) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${accent}" fill-opacity="${op}" stroke="${accent}" stroke-opacity="0.85" stroke-width="2.5"/>`;
  let body = "";
  // Pipeline stages.
  for (let i = 0; i < 5; i++) {
    const x = 1000 + i * 158;
    body += block(x, 470, 120, 140);
    for (let k = 0; k < 3; k++) body += `<rect x="${x + 18}" y="${500 + k * 32}" width="${40 + ((i * 7 + k * 13) % 50)}" height="8" rx="4" fill="${accent}" opacity="0.5"/>`;
    if (i < 4) body += `<path d="M${x + 120} 540H${x + 158}M${x + 148} 530L${x + 158} 540L${x + 148} 550" stroke="${accent}" stroke-width="3" fill="none"/>`;
  }
  // Register file above, caches below.
  for (let c = 0; c < 8; c++) for (let r = 0; r < 4; r++)
    body += `<rect x="${1040 + c * 54}" y="${250 + r * 40}" width="40" height="28" rx="5" fill="${accent}" opacity="${r2(0.12 + ((c * r) % 5) * 0.08)}" stroke="${accent}" stroke-opacity="0.5"/>`;
  body += block(1000, 700, 340, 120, 0.06) + block(1420, 700, 340, 120, 0.06);
  for (let k = 0; k < 4; k++) body += `<path d="M1030 ${730 + k * 22}H1310M1450 ${730 + k * 22}H1730" stroke="${accent}" stroke-opacity="0.45" stroke-width="3"/>`;
  // Buses.
  body += `<path d="M1240 420V470M1480 420V470M1240 610V700M1600 610V700M940 540H1000M1790 540H1850" stroke="${accent}" stroke-width="3" fill="none"/>`;
  body += `<path d="M1000 250H960V820H1000M1760 250H1800V820H1760" stroke="${accent}" stroke-opacity="0.6" stroke-width="2" fill="none" stroke-dasharray="10 8"/>`;
  out += lit(body);
  // Chip die, far right, with pins.
  let die = `<rect x="1660" y="60" width="200" height="200" rx="18" fill="#0b1020" stroke="${accent}" stroke-width="3"/><rect x="1700" y="100" width="120" height="120" rx="10" fill="${accent}" opacity="0.35"/>`;
  for (let i = 0; i < 8; i++) die += `<path d="M${1680 + i * 24} 60V36M${1680 + i * 24} 260V284M1660 ${80 + i * 24}H1636M1860 ${80 + i * 24}H1884" stroke="${accent}" stroke-width="4"/>`;
  out += lit(die, true);
  return svg(out);
}

/** Paimon: floating low-poly islands stepping up to a glowing portal, under a pink moon. */
function platformer() {
  const rand = rng(37);
  const accent = "#f472b6", accent2 = "#fb7185";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.78, nebulaY: 0.35 });
  out += lit(`<circle cx="1620" cy="180" r="90" fill="${accent}" opacity="0.55"/>`, true);
  out += `<circle cx="1620" cy="180" r="90" fill="#fce7f3" opacity="0.9"/><circle cx="1585" cy="150" r="18" fill="${accent}" opacity="0.35"/><circle cx="1650" cy="205" r="26" fill="${accent}" opacity="0.3"/>`;
  const island = (x, y, w, d, h) => {
    const top = `M${x} ${y}L${x + w} ${y - d}L${x + w + d * 0.8} ${y}L${x + d * 0.8} ${y + d}Z`;
    const side = `M${x + d * 0.8} ${y + d}L${x + w + d * 0.8} ${y}L${x + w + d * 0.8} ${y + h}L${x + d * 0.8} ${y + d + h}Z`;
    const side2 = `M${x} ${y}L${x + d * 0.8} ${y + d}L${x + d * 0.8} ${y + d + h}L${x} ${y + h}Z`;
    const rocks = `M${x + d * 0.8} ${y + d + h}L${x + w * 0.4} ${y + d + h + 70}L${x + w * 0.7} ${y + h + 50}L${x + w + d * 0.8} ${y + h}`;
    return `<path d="${rocks}" fill="#1e1b4b" opacity="0.9"/><path d="${side2}" fill="#312e81" opacity="0.9"/><path d="${side}" fill="#3730a3" opacity="0.9"/><path d="${top}" fill="#6366f1" opacity="0.95"/>` +
      `<path d="${top}" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.9"/>`;
  }
  const islands = [[980, 880, 300, 80, 60], [1270, 740, 220, 70, 50], [1500, 620, 260, 80, 60], [1180, 520, 150, 60, 40], [1420, 400, 220, 70, 50]];
  for (const [x, y, w, d, h] of islands) out += island(x, y, w, d, h);
  // Bridges between islands.
  out += `<path d="M1300 860L1340 760M1300 870L1340 770M1520 730L1580 640M1520 740L1580 650" stroke="#c7d2fe" stroke-opacity="0.6" stroke-width="3"/>`;
  // Portal on the top island.
  out += lit(`<ellipse cx="1560" cy="340" rx="48" ry="78" fill="none" stroke="${accent}" stroke-width="8"/>`, true);
  out += `<ellipse cx="1560" cy="340" rx="34" ry="62" fill="${accent}" opacity="0.35"/>`;
  // Collectible sparks.
  for (let i = 0; i < 14; i++) {
    const x = 1000 + rand() * 800, y = 300 + rand() * 600;
    out += `<path d="M${x} ${y - 8}L${x + 3} ${y - 3}L${x + 8} ${y}L${x + 3} ${y + 3}L${x} ${y + 8}L${x - 3} ${y + 3}L${x - 8} ${y}L${x - 3} ${y - 3}Z" fill="#fde68a" opacity="${r2(0.5 + rand() * 0.5)}"/>`;
  }
  return svg(out);
}

/** Truck-chan: a real maze (recursive backtracker) with the solved route lit up and the robot at its start. */
function mazeSolver() {
  const rand = rng(41);
  const accent = "#4ade80", accent2 = "#22d3ee";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.74, nebulaY: 0.5 });
  const cols = 15, rows = 10, cell = 52, ox = 1040, oy = 270;
  const walls = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: true, s: true, e: true, w: true })));
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack = [[0, rows - 1]];
  seen[rows - 1][0] = true;
  while (stack.length) {
    const [c, r] = stack[stack.length - 1];
    const opts = [[c, r - 1, "n", "s"], [c, r + 1, "s", "n"], [c + 1, r, "e", "w"], [c - 1, r, "w", "e"]].filter(([nc, nr]) => nc >= 0 && nr >= 0 && nc < cols && nr < rows && !seen[nr][nc]);
    if (!opts.length) { stack.pop(); continue; }
    const [nc, nr, a, b] = opts[Math.floor(rand() * opts.length)];
    walls[r][c][a] = false; walls[nr][nc][b] = false;
    seen[nr][nc] = true;
    stack.push([nc, nr]);
  }
  // Solve with BFS from bottom-left to top-right.
  const prev = new Map();
  const q = [[0, rows - 1]];
  const key = (c, r) => `${c},${r}`;
  prev.set(key(0, rows - 1), null);
  while (q.length) {
    const [c, r] = q.shift();
    if (c === cols - 1 && r === 0) break;
    const w = walls[r][c];
    for (const [nc, nr, open] of [[c, r - 1, !w.n], [c, r + 1, !w.s], [c + 1, r, !w.e], [c - 1, r, !w.w]]) {
      if (open && !prev.has(key(nc, nr))) { prev.set(key(nc, nr), [c, r]); q.push([nc, nr]); }
    }
  }
  const route = [];
  for (let cur = [cols - 1, 0]; cur; cur = prev.get(key(cur[0], cur[1]))) route.push(cur);
  route.reverse();
  let wallPath = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + c * cell, y = oy + r * cell, w = walls[r][c];
    if (w.n) wallPath += `M${x} ${y}H${x + cell}`;
    if (w.w) wallPath += `M${x} ${y}V${y + cell}`;
    if (r === rows - 1 && w.s) wallPath += `M${x} ${y + cell}H${x + cell}`;
    if (c === cols - 1 && w.e) wallPath += `M${x + cell} ${y}V${y + cell}`;
  }
  out += `<rect x="${ox - 20}" y="${oy - 20}" width="${cols * cell + 40}" height="${rows * cell + 40}" rx="18" fill="#05070f" opacity="0.5"/>`;
  out += `<path d="${wallPath}" stroke="${accent}" stroke-opacity="0.55" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  const routeD = route.map(([c, r], i) => `${i ? "L" : "M"}${ox + c * cell + cell / 2} ${oy + r * cell + cell / 2}`).join("");
  out += lit(`<path d="${routeD}" stroke="${accent2}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  // Goal and robot.
  const gx = ox + (cols - 1) * cell + cell / 2, gy = oy + cell / 2;
  out += lit(`<rect x="${gx - 16}" y="${gy - 16}" width="32" height="32" rx="6" fill="none" stroke="#fde68a" stroke-width="3"/><rect x="${gx - 6}" y="${gy - 6}" width="12" height="12" rx="2" fill="#fde68a"/>`);
  const rx = ox + cell / 2, ry = oy + (rows - 1) * cell + cell / 2;
  out += lit(`<rect x="${rx - 18}" y="${ry - 14}" width="36" height="28" rx="6" fill="#e0f2fe"/><rect x="${rx - 24}" y="${ry - 10}" width="6" height="20" rx="2" fill="${accent2}"/><rect x="${rx + 18}" y="${ry - 10}" width="6" height="20" rx="2" fill="${accent2}"/><circle cx="${rx - 6}" cy="${ry - 18}" r="3" fill="${accent2}"/><circle cx="${rx + 6}" cy="${ry - 18}" r="3" fill="${accent2}"/>`);
  // Sensor sweep from the robot.
  out += `<path d="M${rx} ${ry - 20}L${rx - 60} ${ry - 150}A160 160 0 0 1 ${rx + 60} ${ry - 150}Z" fill="${accent2}" opacity="0.12"/>`;
  return svg(out);
}

/** Font detector: calligraphic ribbons with a detection frame and confidence bars. */
function calligraphy() {
  const rand = rng(53);
  const accent = "#fb923c", accent2 = "#f43f5e";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.7, nebulaY: 0.5 });
  const strokes = [
    [[1060, 640], [1180, 300], [1360, 820], [1480, 420]],
    [[1120, 760], [1300, 560], [1420, 740], [1680, 520]],
    [[1500, 300], [1620, 260], [1700, 420], [1620, 560]],
    [[1180, 430], [1260, 380], [1330, 470], [1290, 540]],
    [[1540, 700], [1640, 820], [1760, 700], [1800, 600]],
    [[1040, 520], [1120, 460], [1200, 600], [1100, 700]],
    [[1380, 300], [1460, 240], [1560, 360], [1500, 460]],
    [[1240, 860], [1380, 760], [1520, 880], [1700, 800]],
  ];
  let ink = "";
  strokes.forEach((s, i) => { ink += ribbon(s[0], s[1], s[2], s[3], 18 + (i % 3) * 7, i % 2 ? accent2 : accent, 0.95); });
  for (let i = 0; i < 6; i++) ink += `<circle cx="${r2(1100 + rand() * 700)}" cy="${r2(320 + rand() * 480)}" r="${r2(5 + rand() * 7)}" fill="${accent}" opacity="0.9"/>`;
  out += lit(ink);
  // Detection frame with corner marks and a label bar (no letters).
  const fx = 1020, fy = 240, fw = 820, fh = 620, L = 40;
  out += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="none" stroke="#e0f2fe" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="14 10"/>`;
  out += lit(`<path d="M${fx} ${fy + L}V${fy}H${fx + L}M${fx + fw - L} ${fy}H${fx + fw}V${fy + L}M${fx + fw} ${fy + fh - L}V${fy + fh}H${fx + fw - L}M${fx + L} ${fy + fh}H${fx}V${fy + fh - L}" stroke="#22d3ee" stroke-width="5" fill="none"/>`);
  // Confidence bars.
  [0.98, 0.72, 0.41, 0.2].forEach((v, i) => {
    out += `<rect x="1020" y="${900 + i * 30}" width="300" height="12" rx="6" fill="#e0f2fe" opacity="0.12"/><rect x="1020" y="${900 + i * 30}" width="${300 * v}" height="12" rx="6" fill="${i ? accent : "#22d3ee"}" opacity="0.85"/>`;
  });
  return svg(out);
}

/** Discordo: a chat app layout, servers, channels, messages and a voice bar, in flat shapes. */
function chatApp() {
  const rand = rng(67);
  const accent = "#818cf8", accent2 = "#6366f1";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.72, nebulaY: 0.5 });
  const px = 940, py = 150, pw = 900, ph = 780;
  out += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="24" fill="#0f172a" opacity="0.92" stroke="${accent}" stroke-opacity="0.4" stroke-width="2"/>`;
  out += `<rect x="${px}" y="${py}" width="78" height="${ph}" rx="24" fill="#0b1020"/><rect x="${px + 78}" y="${py}" width="200" height="${ph}" fill="#111827" opacity="0.9"/>`;
  for (let i = 0; i < 9; i++) {
    const on = i === 2;
    out += `<circle cx="${px + 39}" cy="${py + 50 + i * 68}" r="22" fill="${on ? accent2 : "#1f2937"}" stroke="${on ? "#c7d2fe" : accent}" stroke-opacity="${on ? 1 : 0.4}" stroke-width="2"/>`;
    if (on) out += `<rect x="${px + 2}" y="${py + 34 + i * 68}" width="5" height="32" rx="2" fill="#e0e7ff"/>`;
  }
  for (let i = 0; i < 14; i++) {
    const w = 80 + ((i * 37) % 90);
    out += `<rect x="${px + 102}" y="${py + 44 + i * 44}" width="${w}" height="12" rx="6" fill="${i === 4 ? "#e0e7ff" : accent}" opacity="${i === 4 ? 0.95 : 0.35}"/>`;
    if (i % 5 === 0) out += `<rect x="${px + 96}" y="${py + 36 + i * 44}" width="6" height="28" rx="3" fill="${accent}" opacity="0.25"/>`;
  }
  // Messages.
  const mx = px + 310;
  for (let i = 0; i < 7; i++) {
    const y = py + 60 + i * 92;
    const hue = ["#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#fb7185", "#22d3ee"][i];
    out += `<circle cx="${mx + 26}" cy="${y + 22}" r="24" fill="${hue}" opacity="0.8"/>`;
    out += `<rect x="${mx + 70}" y="${y + 4}" width="${90 + ((i * 53) % 70)}" height="12" rx="6" fill="#e0e7ff" opacity="0.85"/><rect x="${mx + 175 + ((i * 53) % 70)}" y="${y + 6}" width="46" height="9" rx="4" fill="${accent}" opacity="0.35"/>`;
    const lines = 1 + (i % 3);
    for (let k = 0; k < lines; k++) out += `<rect x="${mx + 70}" y="${y + 28 + k * 18}" width="${220 + ((i * 71 + k * 97) % 260)}" height="10" rx="5" fill="#cbd5e1" opacity="0.3"/>`;
  }
  // Composer and voice bar.
  out += `<rect x="${mx}" y="${py + ph - 90}" width="${pw - 340}" height="52" rx="14" fill="#1f2937" stroke="${accent}" stroke-opacity="0.35"/>`;
  out += `<rect x="${px + 78}" y="${py + ph - 120}" width="200" height="120" rx="0" fill="#0b1020"/>`;
  for (let i = 0; i < 12; i++) out += `<rect x="${px + 100 + i * 14}" y="${py + ph - 60 - (8 + ((i * 29) % 36))}" width="8" height="${8 + ((i * 29) % 36)}" rx="4" fill="#34d399" opacity="0.8"/>`;
  out += lit(`<circle cx="${px + pw - 60}" cy="${py + 50}" r="14" fill="#34d399"/>`);
  return svg(out);
}

/** GigaChat: three phones with feed cards, linked by arcs across platforms. */
function mobileApp() {
  const rand = rng(71);
  const accent = "#22d3ee", accent2 = "#0ea5e9";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.72, nebulaY: 0.5 });
  const phone = (x, y, rot, scale) => {
    const w = 260, h = 540;
    let s = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">`;
    s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="36" fill="#0b1020" stroke="${accent}" stroke-opacity="0.8" stroke-width="3"/>`;
    s += `<rect x="-50" y="${-h / 2 + 14}" width="100" height="18" rx="9" fill="#1e293b"/>`;
    for (let i = 0; i < 4; i++) {
      const cy = -h / 2 + 60 + i * 118;
      s += `<rect x="${-w / 2 + 18}" y="${cy}" width="${w - 36}" height="104" rx="16" fill="${accent}" opacity="0.1" stroke="${accent}" stroke-opacity="0.35"/>`;
      s += `<circle cx="${-w / 2 + 44}" cy="${cy + 26}" r="14" fill="${accent}" opacity="0.7"/><rect x="${-w / 2 + 66}" y="${cy + 18}" width="80" height="9" rx="4" fill="#e0f2fe" opacity="0.8"/><rect x="${-w / 2 + 66}" y="${cy + 33}" width="50" height="7" rx="3" fill="${accent}" opacity="0.4"/>`;
      s += `<rect x="${-w / 2 + 30}" y="${cy + 54}" width="${w - 60 - (i * 37) % 60}" height="8" rx="4" fill="#cbd5e1" opacity="0.35"/><rect x="${-w / 2 + 30}" y="${cy + 70}" width="${w - 90 - (i * 53) % 60}" height="8" rx="4" fill="#cbd5e1" opacity="0.3"/>`;
      s += `<path d="M${-w / 2 + 34} ${cy + 92}l6 -8l6 8M${-w / 2 + 70} ${cy + 94}h12M${-w / 2 + 104} ${cy + 88}l4 8l4 -8" stroke="${accent}" stroke-opacity="0.6" stroke-width="2" fill="none"/>`;
    }
    s += `<rect x="${-w / 2 + 18}" y="${h / 2 - 48}" width="${w - 36}" height="32" rx="12" fill="${accent}" opacity="0.2"/>`;
    for (let i = 0; i < 4; i++) s += `<circle cx="${-w / 2 + 50 + i * 54}" cy="${h / 2 - 32}" r="6" fill="${i === 0 ? "#e0f2fe" : accent}" opacity="${i === 0 ? 0.95 : 0.5}"/>`;
    return s + "</g>";
  };
  out += lit(`<path d="M1150 300C1300 150 1550 150 1700 300M1150 820C1300 970 1550 970 1700 820" stroke="${accent}" stroke-width="3" fill="none" stroke-dasharray="4 14" stroke-linecap="round"/>`);
  out += phone(1160, 580, -10, 0.86) + phone(1700, 580, 10, 0.86) + phone(1430, 540, 0, 1);
  return svg(out);
}

/** Irminsul: a crawl graph of pages, the index as columns, and a ranked result list. */
function searchEngine() {
  const rand = rng(83);
  const accent = "#34d399", accent2 = "#14b8a6";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.68, nebulaY: 0.5 });
  const nodes = [];
  for (let i = 0; i < 30; i++) nodes.push([980 + rand() * 520, 180 + rand() * 720, 4 + rand() * 7]);
  let edges = "";
  for (let i = 0; i < nodes.length; i++) {
    const near = nodes.map((n, j) => [Math.hypot(n[0] - nodes[i][0], n[1] - nodes[i][1]), j]).sort((a, b) => a[0] - b[0]).slice(1, 3);
    for (const [, j] of near) edges += `M${r2(nodes[i][0])} ${r2(nodes[i][1])}L${r2(nodes[j][0])} ${r2(nodes[j][1])}`;
  }
  out += `<path d="${edges}" stroke="${accent}" stroke-opacity="0.35" stroke-width="1.5"/>`;
  let dots = "";
  for (const [x, y, r] of nodes) dots += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${accent}" opacity="0.85"/>`;
  out += lit(dots);
  // Hub with a magnifier.
  const hx = 1240, hy = 540;
  out += `<path d="${nodes.slice(0, 12).map(([x, y]) => `M${hx} ${hy}L${r2(x)} ${r2(y)}`).join("")}" stroke="${accent2}" stroke-opacity="0.5" stroke-width="2"/>`;
  out += lit(`<circle cx="${hx}" cy="${hy}" r="44" fill="#05070f" stroke="#ecfdf5" stroke-width="7"/><path d="M${hx + 32} ${hy + 32}L${hx + 78} ${hy + 78}" stroke="#ecfdf5" stroke-width="12" stroke-linecap="round"/>`, true);
  // Index columns.
  for (let i = 0; i < 9; i++) {
    const h = 60 + ((i * 97) % 200);
    out += `<rect x="${1570 + i * 30}" y="${440 - h}" width="20" height="${h}" rx="5" fill="${accent2}" opacity="${r2(0.4 + (i % 3) * 0.2)}"/>`;
  }
  out += `<path d="M1560 452H1850" stroke="#ecfdf5" stroke-opacity="0.3" stroke-width="2"/>`;
  // Ranked results.
  for (let i = 0; i < 5; i++) {
    const y = 520 + i * 70;
    out += `<rect x="1570" y="${y}" width="280" height="54" rx="12" fill="${accent}" opacity="${r2(0.16 - i * 0.025)}" stroke="${accent}" stroke-opacity="0.45"/>`;
    out += `<rect x="1588" y="${y + 14}" width="${150 - i * 14}" height="10" rx="5" fill="#ecfdf5" opacity="0.8"/><rect x="1588" y="${y + 32}" width="${220 - i * 20}" height="7" rx="3" fill="${accent}" opacity="0.4"/>`;
    out += `<rect x="1800" y="${y + 18}" width="${34 - i * 5}" height="8" rx="4" fill="#fde68a" opacity="0.8"/>`;
  }
  return svg(out);
}

/** Promptopia: stacked prompt cards with tags, a big quotation mark and sparks. */
function writingPlatform() {
  const rand = rng(97);
  const accent = "#a78bfa", accent2 = "#c084fc";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.7, nebulaY: 0.5 });
  const card = (x, y, rot, op) => {
    let s = `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${op}"><rect x="-230" y="-150" width="460" height="300" rx="26" fill="#0f172a" stroke="${accent}" stroke-opacity="0.7" stroke-width="2.5"/>`;
    s += `<circle cx="-186" cy="-104" r="20" fill="${accent2}" opacity="0.8"/><rect x="-154" y="-114" width="110" height="11" rx="5" fill="#ede9fe" opacity="0.85"/><rect x="-154" y="-96" width="70" height="8" rx="4" fill="${accent}" opacity="0.4"/>`;
    for (let k = 0; k < 5; k++) s += `<rect x="-186" y="${-56 + k * 26}" width="${372 - ((k * 89) % 150)}" height="10" rx="5" fill="#cbd5e1" opacity="0.32"/>`;
    [92, 70, 110].forEach((w, k) => { s += `<rect x="${-186 + k * (w + 12) - (k ? 0 : 0)}" y="100" width="${w}" height="26" rx="13" fill="${accent}" opacity="0.22" stroke="${accent}" stroke-opacity="0.6"/>`; });
    return s + "</g>";
  };
  out += card(1300, 640, -8, 0.6) + card(1480, 560, 6, 0.8) + card(1380, 500, -2, 1);
  // Quotation mark.
  const q = (x, y) => `<path d="M${x} ${y}c0 -40 30 -70 70 -70v26c-24 0 -42 18 -42 44h42v70h-70z" fill="${accent2}"/>`;
  out += lit(q(1000, 300) + q(1090, 300), true);
  for (let i = 0; i < 10; i++) {
    const x = 1000 + rand() * 850, y = 150 + rand() * 800, s = 6 + rand() * 10;
    out += `<path d="M${x} ${y - s}L${x + s * 0.3} ${y - s * 0.3}L${x + s} ${y}L${x + s * 0.3} ${y + s * 0.3}L${x} ${y + s}L${x - s * 0.3} ${y + s * 0.3}L${x - s} ${y}L${x - s * 0.3} ${y - s * 0.3}Z" fill="#fde68a" opacity="${r2(0.4 + rand() * 0.6)}"/>`;
  }
  return svg(out);
}

/** Timeline: a low-poly mesh with lit edges. */
function cyberGeometric() {
  const rand = rng(101);
  const accent = "#22d3ee", accent2 = "#3b82f6";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.6, nebulaY: 0.5 });
  const pts = [];
  for (let i = 0; i < 70; i++) pts.push([rand() * W, rand() * H]);
  let tris = "", edges = "";
  for (let i = 0; i < pts.length; i++) {
    const near = pts.map((p, j) => [Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), j]).sort((a, b) => a[0] - b[0]).slice(1, 4);
    for (const [, j] of near) edges += `M${r2(pts[i][0])} ${r2(pts[i][1])}L${r2(pts[j][0])} ${r2(pts[j][1])}`;
    if (near.length >= 2 && rand() < 0.5) {
      const a = pts[near[0][1]], b = pts[near[1][1]];
      tris += `<polygon points="${r2(pts[i][0])},${r2(pts[i][1])} ${r2(a[0])},${r2(a[1])} ${r2(b[0])},${r2(b[1])}" fill="${rand() < 0.5 ? accent : accent2}" opacity="${r2(0.04 + rand() * 0.1)}"/>`;
    }
  }
  out += tris + `<path d="${edges}" stroke="${accent}" stroke-opacity="0.45" stroke-width="1.5"/>`;
  let dots = "";
  for (const [x, y] of pts) dots += `<circle cx="${r2(x)}" cy="${r2(y)}" r="3" fill="${accent}"/>`;
  out += lit(dots);
  return svg(out);
}

/** Timeline: a quiet workspace in shapes, window light, a desk line and a lamp. */
function workspace() {
  const rand = rng(113);
  const accent = "#fbbf24", accent2 = "#f59e0b";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.75, nebulaY: 0.3 });
  // Window panes with warm light.
  for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++)
    out += `<rect x="${1180 + c * 230}" y="${120 + r * 230}" width="200" height="200" rx="6" fill="${accent}" opacity="${r2(0.06 + rand() * 0.06)}" stroke="${accent}" stroke-opacity="0.3" stroke-width="2"/>`;
  out += `<path d="M1180 580H1860" stroke="${accent}" stroke-opacity="0.5" stroke-width="2"/>`;
  // Desk, laptop, lamp, plant: silhouettes.
  out += `<rect x="1060" y="760" width="820" height="16" rx="8" fill="#e2e8f0" opacity="0.6"/><path d="M1100 776V1000M1840 776V1000" stroke="#e2e8f0" stroke-opacity="0.35" stroke-width="6"/>`;
  out += `<path d="M1330 760L1350 640H1610L1630 760Z" fill="#1e293b" stroke="#cbd5e1" stroke-opacity="0.6" stroke-width="3"/><rect x="1370" y="660" width="220" height="80" rx="4" fill="${accent}" opacity="0.18"/>`;
  for (let k = 0; k < 5; k++) out += `<rect x="1386" y="${672 + k * 13}" width="${60 + ((k * 61) % 120)}" height="6" rx="3" fill="${accent}" opacity="0.6"/>`;
  out += lit(`<path d="M1700 760V560Q1700 520 1740 520H1800" stroke="#e2e8f0" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M1760 540L1850 620" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>`);
  out += `<path d="M1800 560L1990 760H1700Z" fill="${accent}" opacity="0.12"/>`;
  out += `<ellipse cx="1180" cy="760" rx="36" ry="10" fill="#334155"/><path d="M1150 760V700Q1180 690 1210 700V760Z" fill="#334155"/><path d="M1180 700C1150 650 1130 620 1120 580C1160 600 1180 640 1180 700ZM1180 700C1200 650 1230 620 1250 600C1240 650 1210 680 1180 700Z" fill="#34d399" opacity="0.8"/>`;
  return svg(out);
}

/** Timeline: soft fluid blobs in warm and violet tones, kept dark. */
function fluid() {
  const rand = rng(127);
  let out = `<defs><radialGradient id="bg" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#1a0f2e"/><stop offset="1" stop-color="#07060f"/></radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
    <linearGradient id="leftShade" x1="0" x2="1"><stop offset="0" stop-color="#05070f" stop-opacity="0.5"/><stop offset="0.55" stop-color="#05070f" stop-opacity="0"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  const blobs = [["#f97316", 1500, 300, 420, 260], ["#a855f7", 1150, 700, 520, 300], ["#ec4899", 1750, 800, 380, 240], ["#6366f1", 600, 250, 480, 220], ["#fb7185", 900, 950, 420, 180]];
  let g = "";
  for (const [c, x, y, rx, ry] of blobs) g += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" opacity="0.55" transform="rotate(${r2(rand() * 60 - 30)} ${x} ${y})"/>`;
  out += `<g filter="url(#soft)">${g}</g>`;
  // Flow lines on top.
  let lines = "";
  for (let i = 0; i < 9; i++) {
    const y = 120 + i * 100;
    lines += `<path d="M0 ${y}C400 ${y - 120} 800 ${y + 160} 1200 ${y - 40}S1700 ${y + 80} 1920 ${y - 60}" stroke="#fde68a" stroke-opacity="0.18" stroke-width="2" fill="none"/>`;
  }
  out += lines;
  return svg(out);
}

/** Timeline: PCB traces with pads and vias, gold on dark, busier to the right. */
function circuitBoard() {
  const rand = rng(131);
  const accent = "#d4a24c", accent2 = "#22d3ee";
  let out = backdrop(rand, { accent, accent2, nebulaX: 0.7, nebulaY: 0.5 });
  let traces = "", pads = "";
  for (let i = 0; i < 70; i++) {
    let x = Math.round((400 + rand() * 1500) / 20) * 20, y = Math.round(rand() * H / 20) * 20;
    let d = `M${x} ${y}`;
    pads += `<circle cx="${x}" cy="${y}" r="6" fill="#05070f" stroke="${accent}" stroke-width="3"/>`;
    const steps = 3 + Math.floor(rand() * 4);
    for (let s = 0; s < steps; s++) {
      const dir = Math.floor(rand() * 4);
      const len = 40 + Math.round(rand() * 8) * 20;
      const diag = rand() < 0.4;
      if (dir === 0) { x += len; if (diag) { y += 20; } }
      else if (dir === 1) { x -= len; if (diag) { y -= 20; } }
      else if (dir === 2) { y += len; if (diag) { x += 20; } }
      else { y -= len; if (diag) { x -= 20; } }
      x = Math.max(300, Math.min(W - 20, x)); y = Math.max(20, Math.min(H - 20, y));
      d += `L${x} ${y}`;
    }
    traces += d;
    pads += `<circle cx="${x}" cy="${y}" r="${rand() < 0.5 ? 6 : 9}" fill="${rand() < 0.5 ? "#05070f" : accent}" stroke="${accent}" stroke-width="3"/>`;
  }
  out += `<path d="${traces}" stroke="${accent}" stroke-opacity="0.75" stroke-width="3" fill="none" stroke-linejoin="round"/>` + pads;
  // A few components.
  for (let i = 0; i < 6; i++) {
    const x = 1000 + rand() * 760, y = 120 + rand() * 820;
    out += `<rect x="${r2(x)}" y="${r2(y)}" width="${60 + (i % 3) * 30}" height="34" rx="4" fill="#111827" stroke="${accent}" stroke-opacity="0.8" stroke-width="2"/>`;
  }
  out += lit(`<rect x="1420" y="420" width="220" height="220" rx="12" fill="#0b1020" stroke="${accent2}" stroke-width="3"/><rect x="1470" y="470" width="120" height="120" rx="8" fill="${accent2}" opacity="0.3"/>`, true);
  for (let i = 0; i < 9; i++) out += `<path d="M${1440 + i * 22} 420V396M${1440 + i * 22} 640V664M1420 ${440 + i * 22}H1396M1640 ${440 + i * 22}H1664" stroke="${accent2}" stroke-width="3"/>`;
  return svg(out);
}

const IMAGES = {
  "reinforcement_learning_agent_simulation": rlAgent,
  "cpu_architecture_schematic": cpuSchematic,
  "3d_platformer_game_level": platformer,
  "robotics_maze_solver": mazeSolver,
  "arabic_calligraphy_ai_detection": calligraphy,
  "discord_interface_clone": chatApp,
  "cross_platform_mobile_app_dev": mobileApp,
  "search_engine_architecture": searchEngine,
  "creative_writing_platform": writingPlatform,
  "abstract_geometric_cyber_aesthetic_background": cyberGeometric,
  "modern_minimal_office_workspace_background": workspace,
  "creative_fluid_gradient_background": fluid,
  "futuristic_circuit_board_background": circuitBoard,
};

await mkdir(OUT, { recursive: true });
const only = process.argv.slice(2);
for (const [name, draw] of Object.entries(IMAGES)) {
  if (only.length && !only.includes(name)) continue;
  const dest = path.join(OUT, `${name}.webp`);
  const info = await sharp(Buffer.from(draw())).webp({ quality: 80 }).toFile(dest);
  console.log(`${dest}  ${(info.size / 1024).toFixed(0)} KB`);
}
