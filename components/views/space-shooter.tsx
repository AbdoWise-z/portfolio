"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * Space Defender: a small retro shooter, the site's easter egg. Everything is
 * drawn on a 240x320 canvas that is scaled up with crisp pixels.
 *
 * Waves of three invader types shuffle sideways and shoot; from wave 2 some
 * peel off and dive. Tougher ones carry health bars. Every third wave brings a
 * boss with escorts. Destroyed enemies sometimes drop power-ups: rapid fire,
 * spread shot, a one-hit shield, a freeze, or an extra life. Three bunkers
 * erode under fire. Arrow keys or A/D move, space fires, P pauses, M toggles
 * the bleeps; on touch, press and drag to fly with automatic fire.
 */

const W = 240;
const H = 320;
const HIGH_KEY = "space-defender-high";
const MUTE_KEY = "space-defender-muted";

const COLS = 6;
const ROWS = 3;
const CELL_W = 24;
const CELL_H = 20;
const FORMATION_W = COLS * CELL_W;
const PLAYER_Y = H - 30;
const PLAYER_SPEED = 130;
const MAX_LIVES = 5;

type Sprite = string[];

const PLAYER: Sprite = [
    ".....#.....",
    ".....#.....",
    "....###....",
    "...#####...",
    "..##.#.##..",
    ".#########.",
    "###########",
    "#.#.....#.#",
];

/** Enemy types by formation row: the top row is worth the most, the bottom row is the toughest. */
const ENEMY_TYPES: { color: string; points: number; hp: number; frames: [Sprite, Sprite] }[] = [
    {
        color: "#f472b6",
        points: 30,
        hp: 1,
        frames: [
            ["...##...", "..####..", ".######.", "##.##.##", "########", "..#..#..", ".#.##.#.", "#.#..#.#"],
            ["...##...", "..####..", ".######.", "##.##.##", "########", ".#.##.#.", "#......#", ".#....#."],
        ],
    },
    {
        color: "#22d3ee",
        points: 20,
        hp: 1,
        frames: [
            ["..#.....#..", "...#...#...", "..#######..", ".##.###.##.", "###########", "#.#######.#", "#.#.....#.#", "...##.##..."],
            ["..#.....#..", "#..#...#..#", "#.#######.#", "###.###.###", "###########", ".#########.", "..#.....#..", ".#.......#."],
        ],
    },
    {
        color: "#facc15",
        points: 10,
        hp: 2,
        frames: [
            ["....####....", ".##########.", "############", "###..##..###", "############", "...##..##...", "..##.##.##..", "##........##"],
            ["....####....", ".##########.", "############", "###..##..###", "############", "..###..###..", ".##..##..##.", "..##....##.."],
        ],
    },
];

const BOSS: Sprite = [
    ".......######.......",
    ".....##########.....",
    "...##############...",
    "..####..####..####..",
    ".##################.",
    "####################",
    "#..##..##..##..##..#",
    ".##################.",
    "..#.#..#.##.#..#.#..",
    "...#.....##.....#...",
    ".#.......##.......#.",
];
const BOSS_COLOR = "#a78bfa";
const BOSS_POINTS = 500;

const BUNKER: Sprite = ["..######..", ".########.", "##########", "##########", "###....###", "##......##"];
const BUNKER_CELL = 2;
const BUNKER_XS = [38, 110, 182];
const BUNKER_Y = PLAYER_Y - 36;

type PowerKind = "rapid" | "spread" | "shield" | "freeze" | "life";
const POWERS: Record<PowerKind, { letter: string; color: string; label: string; weight: number }> = {
    rapid: { letter: "R", color: "#facc15", label: "RAPID FIRE", weight: 30 },
    spread: { letter: "S", color: "#f472b6", label: "SPREAD SHOT", weight: 30 },
    shield: { letter: "O", color: "#22d3ee", label: "SHIELD UP", weight: 20 },
    freeze: { letter: "F", color: "#93c5fd", label: "FREEZE", weight: 15 },
    life: { letter: "+", color: "#4ade80", label: "EXTRA LIFE", weight: 5 },
};
const POWER_KINDS = Object.keys(POWERS) as PowerKind[];
const DROP_CHANCE = 0.2;

function rasterize(sprite: Sprite, color: string): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.width = sprite[0].length;
    c.height = sprite.length;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color;
    sprite.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) if (row[x] === "#") ctx.fillRect(x, y, 1, 1);
    });
    return c;
}

type Sprites = {
    player: HTMLCanvasElement;
    enemies: [HTMLCanvasElement, HTMLCanvasElement][];
    boss: HTMLCanvasElement;
    bossFlash: HTMLCanvasElement;
};

const buildSprites = (): Sprites => ({
    player: rasterize(PLAYER, "#e0f7fa"),
    enemies: ENEMY_TYPES.map((t) => [rasterize(t.frames[0], t.color), rasterize(t.frames[1], t.color)]),
    boss: rasterize(BOSS, BOSS_COLOR),
    bossFlash: rasterize(BOSS, "#ffffff"),
});

/** A 3x5 pixel font, so text stays as crisp as the sprites when the canvas is scaled up. */
const FONT: Record<string, string[]> = {
    A: [".#.", "#.#", "###", "#.#", "#.#"], B: ["##.", "#.#", "##.", "#.#", "##."], C: [".##", "#..", "#..", "#..", ".##"],
    D: ["##.", "#.#", "#.#", "#.#", "##."], E: ["###", "#..", "##.", "#..", "###"], F: ["###", "#..", "##.", "#..", "#.."],
    G: [".##", "#..", "#.#", "#.#", ".##"], H: ["#.#", "#.#", "###", "#.#", "#.#"], I: ["###", ".#.", ".#.", ".#.", "###"],
    J: ["..#", "..#", "..#", "#.#", ".#."], K: ["#.#", "#.#", "##.", "#.#", "#.#"], L: ["#..", "#..", "#..", "#..", "###"],
    M: ["#.#", "###", "###", "#.#", "#.#"], N: ["##.", "#.#", "#.#", "#.#", "#.#"], O: [".#.", "#.#", "#.#", "#.#", ".#."],
    P: ["##.", "#.#", "##.", "#..", "#.."], Q: [".#.", "#.#", "#.#", ".#.", "..#"], R: ["##.", "#.#", "##.", "#.#", "#.#"],
    S: [".##", "#..", ".#.", "..#", "##."], T: ["###", ".#.", ".#.", ".#.", ".#."], U: ["#.#", "#.#", "#.#", "#.#", "###"],
    V: ["#.#", "#.#", "#.#", "#.#", ".#."], W: ["#.#", "#.#", "###", "###", "#.#"], X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
    Y: ["#.#", "#.#", ".#.", ".#.", ".#."], Z: ["###", "..#", ".#.", "#..", "###"],
    0: ["###", "#.#", "#.#", "#.#", "###"], 1: [".#.", "##.", ".#.", ".#.", "###"], 2: ["##.", "..#", ".#.", "#..", "###"],
    3: ["###", "..#", ".##", "..#", "###"], 4: ["#.#", "#.#", "###", "..#", "..#"], 5: ["###", "#..", "##.", "..#", "##."],
    6: [".##", "#..", "###", "#.#", "###"], 7: ["###", "..#", ".#.", ".#.", ".#."], 8: ["###", "#.#", "###", "#.#", "###"],
    9: ["###", "#.#", "###", "..#", "##."],
    ".": ["...", "...", "...", "...", ".#."], "!": [".#.", ".#.", ".#.", "...", ".#."], "-": ["...", "...", "###", "...", "..."],
    "+": ["...", ".#.", "###", ".#.", "..."], "=": ["...", "###", "...", "###", "..."], ":": ["...", ".#.", "...", ".#.", "..."],
    "<": ["..#", ".#.", "#..", ".#.", "..#"], ">": ["#..", ".#.", "..#", ".#.", "#.."],
};

type Align = "left" | "center" | "right";

const textWidth = (s: string, scale: number) => s.length * 4 * scale - scale;

/** Draw a string in the pixel font; (x, y) is the top edge, align picks which edge x refers to. */
function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, scale = 1, align: Align = "left", color = "#e0f7fa") {
    const chars = s.toUpperCase().split("");
    const width = textWidth(s, scale);
    let cx = align === "center" ? Math.round(x - width / 2) : align === "right" ? Math.round(x - width) : Math.round(x);
    ctx.fillStyle = color;
    for (const ch of chars) {
        const glyph = FONT[ch];
        if (glyph) {
            glyph.forEach((row, gy) => {
                for (let gx = 0; gx < 3; gx++) if (row[gx] === "#") ctx.fillRect(cx + gx * scale, y + gy * scale, scale, scale);
            });
        }
        cx += 4 * scale;
    }
}

/** Square-wave bleeps through the Web Audio API; the context is created on the first sound. */
class Beeper {
    private ctx: AudioContext | null = null;
    muted = false;

    private tone(from: number, to: number, duration: number, type: OscillatorType = "square", volume = 0.05) {
        if (this.muted) return;
        try {
            this.ctx ??= new AudioContext();
            if (this.ctx.state === "suspended") void this.ctx.resume();
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(from, t);
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + duration);
            gain.gain.setValueAtTime(volume, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
            osc.connect(gain).connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + duration);
        } catch {
            // No audio available: the game is silent.
        }
    }

    shoot() { this.tone(900, 300, 0.08); }
    hit() { this.tone(220, 60, 0.12, "sawtooth", 0.05); }
    tick() { this.tone(500, 380, 0.04, "square", 0.03); }
    die() { this.tone(320, 40, 0.5, "square", 0.07); }
    wave() { this.tone(420, 900, 0.3, "triangle", 0.06); }
    power() { this.tone(600, 1400, 0.18, "square", 0.05); }
    shieldBreak() { this.tone(900, 180, 0.25, "sawtooth", 0.05); }
    bossHit() { this.tone(160, 110, 0.05, "square", 0.04); }
    bossDie() { this.tone(240, 30, 0.9, "sawtooth", 0.08); }
    close() { void this.ctx?.close(); }
}

interface Enemy { type: number; col: number; row: number; hp: number; maxHp: number; alive: boolean; dive: number | null }
interface Boss { x: number; hp: number; maxHp: number; dir: 1 | -1; fireTimer: number; flash: number; volley: number }
interface Bullet { x: number; y: number; vx: number; vy: number; mine: boolean }
interface PowerUp { kind: PowerKind; x: number; y: number; t: number }
interface Bunker { x: number; cells: boolean[][] }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }
interface Floater { x: number; y: number; text: string; life: number; color: string }
interface Star { x: number; y: number; speed: number; shade: number }
interface Rect { x: number; y: number; w: number; h: number }

interface Game {
    phase: "title" | "playing" | "paused" | "over";
    score: number;
    high: number;
    lives: number;
    wave: number;
    bosses: number;
    player: { x: number; cooldown: number; invulnerable: number; dead: number };
    shield: boolean;
    effects: { rapid: number; spread: number; freeze: number };
    enemies: Enemy[];
    boss: Boss | null;
    formation: { x: number; y: number; dir: 1 | -1 };
    bullets: Bullet[];
    powerups: PowerUp[];
    bunkers: Bunker[];
    particles: Particle[];
    floaters: Floater[];
    stars: Star[];
    fireTimer: number;
    diveTimer: number;
    animTimer: number;
    animFrame: 0 | 1;
    banner: number;
    bannerText: string;
    blink: number;
    shake: number;
    input: { left: boolean; right: boolean; fire: boolean; pointerX: number | null };
}

const createGame = (high: number): Game => ({
    phase: "title",
    score: 0,
    high,
    lives: 3,
    wave: 0,
    bosses: 0,
    player: { x: W / 2, cooldown: 0, invulnerable: 0, dead: 0 },
    shield: false,
    effects: { rapid: 0, spread: 0, freeze: 0 },
    enemies: [],
    boss: null,
    formation: { x: 0, y: 0, dir: 1 },
    bullets: [],
    powerups: [],
    bunkers: [],
    particles: [],
    floaters: [],
    stars: Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 8 + Math.random() * 30,
        shade: 0.25 + Math.random() * 0.6,
    })),
    fireTimer: 1,
    diveTimer: 4,
    animTimer: 0,
    animFrame: 0,
    banner: 0,
    bannerText: "",
    blink: 0,
    shake: 0,
    input: { left: false, right: false, fire: false, pointerX: null },
});

const buildBunkers = (): Bunker[] =>
    BUNKER_XS.map((x) => ({ x, cells: BUNKER.map((row) => row.split("").map((c) => c === "#")) }));

const isBossWave = (wave: number) => wave % 3 === 0;

function spawnWave(g: Game) {
    g.wave += 1;
    g.enemies = [];
    g.boss = null;
    const bonusHp = Math.floor(g.wave / 4);
    const rows = isBossWave(g.wave) ? 1 : ROWS;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < COLS; col++) {
            const hp = ENEMY_TYPES[row].hp + bonusHp;
            g.enemies.push({ type: row, col, row, hp, maxHp: hp, alive: true, dive: null });
        }
    }
    if (isBossWave(g.wave)) {
        g.bosses += 1;
        const hp = 20 + 12 * g.bosses;
        g.boss = { x: W / 2, hp, maxHp: hp, dir: 1, fireTimer: 2, flash: 0, volley: 0 };
        g.formation = { x: (W - FORMATION_W) / 2, y: 50, dir: 1 };
        g.bannerText = `WAVE ${g.wave} - BOSS`;
    } else {
        g.formation = { x: (W - FORMATION_W) / 2, y: 36, dir: 1 };
        g.bannerText = `WAVE ${g.wave}`;
    }
    g.bullets = [];
    g.powerups = [];
    g.bunkers = buildBunkers();
    g.fireTimer = 1.2;
    g.diveTimer = 4;
    g.banner = 1.4;
}

function startRun(g: Game) {
    g.phase = "playing";
    g.score = 0;
    g.lives = 3;
    g.wave = 0;
    g.bosses = 0;
    g.player = { x: W / 2, cooldown: 0, invulnerable: 0, dead: 0 };
    g.shield = false;
    g.effects = { rapid: 0, spread: 0, freeze: 0 };
    g.particles = [];
    g.floaters = [];
    spawnWave(g);
}

const enemyRect = (g: Game, e: Enemy): Rect => {
    const s = ENEMY_TYPES[e.type].frames[0];
    const w = s[0].length;
    const h = s.length;
    let x = g.formation.x + e.col * CELL_W + (CELL_W - w) / 2;
    let y = g.formation.y + e.row * CELL_H;
    if (e.dive !== null) {
        x = Math.max(0, Math.min(W - w, x + Math.sin(e.dive * 4) * 36));
        y += e.dive * 120;
    }
    return { x, y, w, h };
};

const bossRect = (b: Boss): Rect => ({ x: b.x - BOSS[0].length / 2, y: 26, w: BOSS[0].length, h: BOSS.length });

const playerRect = (g: Game): Rect => ({ x: g.player.x - 5, y: PLAYER_Y, w: 11, h: 8 });

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const inRect = (x: number, y: number, r: Rect) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

function burst(g: Game, x: number, y: number, color: string, count = 10) {
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 20 + Math.random() * 60;
        g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + Math.random() * 0.3, color });
    }
}

const float = (g: Game, x: number, y: number, s: string, color = "#e0f7fa") =>
    g.floaters.push({ x, y, text: s, life: 0.9, color });

function pickPower(g: Game): PowerKind {
    const kinds = POWER_KINDS.filter((k) => k !== "life" || g.lives < MAX_LIVES);
    const total = kinds.reduce((n, k) => n + POWERS[k].weight, 0);
    let r = Math.random() * total;
    for (const k of kinds) {
        r -= POWERS[k].weight;
        if (r <= 0) return k;
    }
    return kinds[0];
}

const dropPower = (g: Game, x: number, y: number) => g.powerups.push({ kind: pickPower(g), x, y, t: Math.random() * 6 });

function saveHigh(g: Game) {
    if (g.score <= g.high) return;
    g.high = g.score;
    try { localStorage.setItem(HIGH_KEY, String(g.high)); } catch { /* private mode */ }
}

function killEnemy(g: Game, e: Enemy, beep: Beeper) {
    const r = enemyRect(g, e);
    e.alive = false;
    e.dive = null;
    const pts = ENEMY_TYPES[e.type].points;
    g.score += pts;
    burst(g, r.x + r.w / 2, r.y + r.h / 2, ENEMY_TYPES[e.type].color);
    float(g, r.x + r.w / 2, r.y, `+${pts}`, ENEMY_TYPES[e.type].color);
    if (Math.random() < DROP_CHANCE) dropPower(g, r.x + r.w / 2, r.y + r.h / 2);
    beep.hit();
}

function hitPlayer(g: Game, beep: Beeper) {
    const p = g.player;
    if (g.shield) {
        g.shield = false;
        burst(g, p.x, PLAYER_Y + 4, POWERS.shield.color, 14);
        float(g, p.x, PLAYER_Y - 14, "SHIELD DOWN", POWERS.shield.color);
        p.invulnerable = 1;
        beep.shieldBreak();
        return;
    }
    burst(g, p.x, PLAYER_Y + 4, "#e0f7fa", 16);
    beep.die();
    g.shake = 0.35;
    g.lives -= 1;
    g.effects = { rapid: 0, spread: 0, freeze: g.effects.freeze };
    if (g.lives <= 0) {
        g.phase = "over";
        saveHigh(g);
        return;
    }
    p.dead = 1.2;
}

/** Erode a bunker cell (and a neighbour or two) where a bullet lands. True if something was hit. */
function hitBunker(g: Game, b: Bullet): boolean {
    for (const k of g.bunkers) {
        for (const py of [b.y, b.y + 3]) {
            const cx = Math.floor((b.x - k.x) / BUNKER_CELL);
            const cy = Math.floor((py - BUNKER_Y) / BUNKER_CELL);
            if (cy < 0 || cy >= k.cells.length || cx < 0 || cx >= k.cells[0].length || !k.cells[cy][cx]) continue;
            k.cells[cy][cx] = false;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const row = k.cells[cy + dy];
                if (row && Math.random() < 0.5 && cx + dx >= 0 && cx + dx < row.length) row[cx + dx] = false;
            }
            return true;
        }
    }
    return false;
}

function applyPower(g: Game, kind: PowerKind, beep: Beeper) {
    const p = g.player;
    switch (kind) {
        case "rapid": g.effects.rapid = 8; break;
        case "spread": g.effects.spread = 8; break;
        case "freeze": g.effects.freeze = 4; break;
        case "shield": g.shield = true; break;
        case "life": g.lives = Math.min(MAX_LIVES, g.lives + 1); break;
    }
    float(g, p.x, PLAYER_Y - 14, POWERS[kind].label, POWERS[kind].color);
    beep.power();
}

function update(g: Game, dt: number, beep: Beeper) {
    g.blink += dt;
    g.shake = Math.max(0, g.shake - dt);
    for (const s of g.stars) {
        s.y += s.speed * dt;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    }
    g.particles = g.particles.filter((q) => (q.life -= dt) > 0);
    for (const q of g.particles) { q.x += q.vx * dt; q.y += q.vy * dt; }
    g.floaters = g.floaters.filter((f) => (f.life -= dt) > 0);
    for (const f of g.floaters) f.y -= 18 * dt;
    if (g.phase !== "playing") return;

    const p = g.player;
    const fx = g.effects;
    fx.rapid = Math.max(0, fx.rapid - dt);
    fx.spread = Math.max(0, fx.spread - dt);
    fx.freeze = Math.max(0, fx.freeze - dt);
    const frozen = fx.freeze > 0;

    // Player: respawn countdown, movement, firing.
    if (p.dead > 0) {
        p.dead -= dt;
        if (p.dead <= 0) { p.x = W / 2; p.invulnerable = 2; }
    } else {
        const { input } = g;
        if (input.pointerX !== null) {
            const d = input.pointerX - p.x;
            p.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt);
        } else {
            p.x += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * PLAYER_SPEED * dt;
        }
        p.x = Math.max(6, Math.min(W - 6, p.x));
        p.cooldown -= dt;
        const firing = input.fire || input.pointerX !== null;
        const mine = g.bullets.filter((b) => b.mine).length;
        if (firing && p.cooldown <= 0 && mine < (fx.rapid > 0 ? 7 : 4)) {
            const spread = fx.spread > 0 ? [-55, 0, 55] : [0];
            for (const vx of spread) g.bullets.push({ x: p.x, y: PLAYER_Y - 2, vx, vy: -220, mine: true });
            p.cooldown = fx.rapid > 0 ? 0.12 : 0.25;
            beep.shoot();
        }
    }
    p.invulnerable = Math.max(0, p.invulnerable - dt);

    g.animTimer += dt;
    if (g.animTimer > (frozen ? 2 : 0.45)) { g.animTimer = 0; g.animFrame = g.animFrame ? 0 : 1; }

    const alive = g.enemies.filter((e) => e.alive);

    if (g.banner > 0) {
        g.banner -= dt;
    } else if (!frozen) {
        // Formation: faster with each wave and as it thins out; steps down at the edges.
        const inRank = alive.filter((e) => e.dive === null);
        if (inRank.length) {
            const speed = 16 * (1 + 0.18 * (g.wave - 1)) * (1 + 2.5 * (1 - alive.length / (COLS * ROWS)));
            g.formation.x += g.formation.dir * speed * dt;
            const minCol = Math.min(...inRank.map((e) => e.col));
            const maxCol = Math.max(...inRank.map((e) => e.col));
            const left = g.formation.x + minCol * CELL_W + 2;
            const right = g.formation.x + (maxCol + 1) * CELL_W - 2;
            if ((g.formation.dir > 0 && right > W - 4) || (g.formation.dir < 0 && left < 4)) {
                g.formation.dir = g.formation.dir > 0 ? -1 : 1;
                g.formation.y += 8;
            }

            // The lowest enemy in a random column shoots.
            g.fireTimer -= dt;
            if (g.fireTimer <= 0) {
                g.fireTimer = Math.max(0.35, 1.0 - 0.07 * (g.wave - 1)) * (0.6 + Math.random() * 0.8);
                const pick = inRank[Math.floor(Math.random() * inRank.length)];
                const lowest = inRank.filter((e) => e.col === pick.col).sort((a, b) => b.row - a.row)[0];
                const r = enemyRect(g, lowest);
                g.bullets.push({ x: r.x + r.w / 2, y: r.y + r.h, vx: 0, vy: 90 + 6 * g.wave, mine: false });
            }

            // From wave 2, one enemy at a time peels off and dives, firing at the player on the way.
            if (g.wave >= 2) {
                g.diveTimer -= dt;
                if (g.diveTimer <= 0) {
                    g.diveTimer = Math.max(1.6, 4.2 - 0.3 * g.wave) * (0.7 + Math.random() * 0.6);
                    const diver = inRank[Math.floor(Math.random() * inRank.length)];
                    diver.dive = 0;
                    const r = enemyRect(g, diver);
                    const dx = p.x - (r.x + r.w / 2);
                    const dy = PLAYER_Y - r.y;
                    const len = Math.hypot(dx, dy) || 1;
                    g.bullets.push({ x: r.x + r.w / 2, y: r.y + r.h, vx: (dx / len) * 70, vy: (dy / len) * 110, mine: false });
                }
            }
        }
        for (const e of alive) {
            if (e.dive === null) continue;
            e.dive += dt;
            if (enemyRect(g, e).y > H) e.dive = null;
        }

        // Boss: sweeps side to side, alternating a spread volley and an aimed shot.
        const b = g.boss;
        if (b) {
            b.flash = Math.max(0, b.flash - dt);
            b.x += b.dir * (36 + 8 * g.bosses) * dt;
            if (b.x > W - 14) b.dir = -1;
            if (b.x < 14) b.dir = 1;
            b.fireTimer -= dt;
            if (b.fireTimer <= 0) {
                b.fireTimer = Math.max(0.5, 1.3 - 0.1 * g.bosses);
                const r = bossRect(b);
                const ox = r.x + r.w / 2;
                const oy = r.y + r.h;
                if (b.volley++ % 2 === 0) {
                    for (const vx of [-45, 0, 45]) g.bullets.push({ x: ox, y: oy, vx, vy: 95, mine: false });
                } else {
                    const dx = p.x - ox;
                    const dy = PLAYER_Y - oy;
                    const len = Math.hypot(dx, dy) || 1;
                    g.bullets.push({ x: ox, y: oy, vx: (dx / len) * 120, vy: (dy / len) * 120, mine: false });
                }
            }
        }
    }

    // Bullets: move, erode bunkers, then hit things.
    for (const bl of g.bullets) { bl.x += bl.vx * dt; bl.y += bl.vy * dt; }
    g.bullets = g.bullets.filter((bl) => bl.y > -6 && bl.y < H + 6 && bl.x > -4 && bl.x < W + 4 && !hitBunker(g, bl));

    for (const bl of g.bullets) {
        if (bl.mine) {
            if (g.boss && inRect(bl.x, bl.y, bossRect(g.boss))) {
                bl.y = -100;
                g.boss.hp -= 1;
                g.boss.flash = 0.06;
                beep.bossHit();
                if (g.boss.hp <= 0) {
                    const r = bossRect(g.boss);
                    g.score += BOSS_POINTS;
                    burst(g, r.x + r.w / 2, r.y + r.h / 2, BOSS_COLOR, 40);
                    float(g, r.x + r.w / 2, r.y + r.h, `+${BOSS_POINTS}`, BOSS_COLOR);
                    dropPower(g, r.x + r.w / 2 - 12, r.y + r.h);
                    dropPower(g, r.x + r.w / 2 + 12, r.y + r.h);
                    g.boss = null;
                    g.shake = 0.5;
                    beep.bossDie();
                }
                continue;
            }
            for (const e of alive) {
                if (!e.alive) continue;
                if (inRect(bl.x, bl.y, enemyRect(g, e))) {
                    bl.y = -100;
                    e.hp -= 1;
                    if (e.hp <= 0) killEnemy(g, e, beep);
                    else beep.tick();
                    break;
                }
            }
        } else if (p.dead <= 0 && p.invulnerable <= 0 && inRect(bl.x, bl.y + 2, playerRect(g))) {
            bl.y = H + 100;
            hitPlayer(g, beep);
        }
    }
    g.bullets = g.bullets.filter((bl) => bl.y > -6 && bl.y < H + 6);

    // Divers that ram the player take it down with them.
    if (p.dead <= 0 && p.invulnerable <= 0) {
        const pr = playerRect(g);
        for (const e of alive) {
            if (e.alive && e.dive !== null && overlaps(enemyRect(g, e), pr)) {
                killEnemy(g, e, beep);
                hitPlayer(g, beep);
                break;
            }
        }
    }

    // Power-ups drift down and sway; the ship collects them.
    for (const pu of g.powerups) { pu.y += 38 * dt; pu.t += dt; pu.x += Math.sin(pu.t * 2.5) * 12 * dt; }
    g.powerups = g.powerups.filter((pu) => {
        if (pu.y > H) return false;
        if (p.dead <= 0 && overlaps({ x: pu.x - 4, y: pu.y - 4, w: 9, h: 9 }, playerRect(g))) {
            applyPower(g, pu.kind, beep);
            return false;
        }
        return true;
    });

    // The formation reaching the ship's row ends the run outright.
    if (g.phase === "playing" && alive.some((e) => e.alive && e.dive === null && enemyRect(g, e).y + enemyRect(g, e).h >= PLAYER_Y - 2)) {
        g.shield = false;
        g.lives = 1;
        hitPlayer(g, beep);
    }

    if (g.phase === "playing" && !g.boss && !g.enemies.some((e) => e.alive)) {
        spawnWave(g);
        beep.wave();
    }
}

const pad = (n: number) => String(n).padStart(6, "0");

function drawPowerIcon(ctx: CanvasRenderingContext2D, kind: PowerKind, x: number, y: number) {
    const { color, letter } = POWERS[kind];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 9, 1); ctx.fillRect(x, y + 8, 9, 1); ctx.fillRect(x, y, 1, 9); ctx.fillRect(x + 8, y, 1, 9);
    text(ctx, letter, x + 3, y + 2, 1, "left", color);
}

function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, color: string) {
    ctx.fillStyle = "#3b0d1a";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(1, Math.round(w * ratio)), h);
}

function draw(ctx: CanvasRenderingContext2D, g: Game, sprites: Sprites) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (g.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * g.shake * 8), Math.round((Math.random() - 0.5) * g.shake * 8));

    for (const s of g.stars) {
        ctx.fillStyle = `rgba(255,255,255,${s.shade})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
    }

    if (g.phase !== "title") {
        ctx.fillStyle = "#4ade80";
        for (const k of g.bunkers) {
            k.cells.forEach((row, cy) => row.forEach((on, cx) => {
                if (on) ctx.fillRect(k.x + cx * BUNKER_CELL, BUNKER_Y + cy * BUNKER_CELL, BUNKER_CELL, BUNKER_CELL);
            }));
        }
    }

    const frozen = g.effects.freeze > 0;
    for (const e of g.enemies) {
        if (!e.alive) continue;
        const r = enemyRect(g, e);
        ctx.drawImage(sprites.enemies[e.type][g.animFrame], Math.round(r.x), Math.round(r.y));
        if (frozen) {
            ctx.fillStyle = "rgba(147,197,253,0.45)";
            ctx.fillRect(Math.round(r.x), Math.round(r.y), r.w, r.h);
        }
        if (e.hp < e.maxHp) drawHealthBar(ctx, Math.round(r.x), Math.round(r.y) - 3, r.w, 2, e.hp / e.maxHp, "#4ade80");
    }

    if (g.boss) {
        const r = bossRect(g.boss);
        ctx.drawImage(g.boss.flash > 0 ? sprites.bossFlash : sprites.boss, Math.round(r.x), r.y);
        text(ctx, "BOSS", 4, 17, 1, "left", BOSS_COLOR);
        drawHealthBar(ctx, 24, 17, W - 28, 4, g.boss.hp / g.boss.maxHp, g.boss.flash > 0 ? "#ffffff" : BOSS_COLOR);
    }

    const p = g.player;
    const visible = p.dead <= 0 && (p.invulnerable <= 0 || Math.floor(p.invulnerable * 10) % 2 === 0);
    if (g.phase !== "title" && visible) {
        ctx.drawImage(sprites.player, Math.round(p.x - PLAYER[0].length / 2), PLAYER_Y);
        if (g.shield) {
            ctx.fillStyle = POWERS.shield.color;
            for (let i = 0; i <= 16; i++) {
                const a = Math.PI * (i / 16);
                ctx.fillRect(Math.round(p.x + Math.cos(a) * 9), Math.round(PLAYER_Y + 6 - Math.sin(a) * 9), 1, 1);
            }
        }
    }

    for (const b of g.bullets) {
        ctx.fillStyle = b.mine ? "#ffffff" : "#fb7185";
        ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, 4);
    }
    for (const pu of g.powerups) drawPowerIcon(ctx, pu.kind, Math.round(pu.x) - 4, Math.round(pu.y) - 4);
    for (const q of g.particles) {
        ctx.fillStyle = q.color;
        ctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2);
    }
    for (const f of g.floaters) text(ctx, f.text, f.x, f.y, 1, "center", f.color);
    ctx.restore();

    // HUD
    text(ctx, `SCORE ${pad(g.score)}`, 4, 4, 2);
    text(ctx, `HI ${pad(g.high)}`, W - 4, 4, 2, "right");
    if (g.phase !== "title") {
        for (let i = 0; i < g.lives; i++) ctx.drawImage(sprites.player, 4 + i * 11, H - 12, 8, 6);
        text(ctx, `WAVE ${g.wave}`, W - 4, H - 11, 1, "right", "rgba(224,247,250,0.7)");
        let x = W / 2 - 20;
        for (const kind of ["rapid", "spread", "freeze"] as const) {
            const left = g.effects[kind];
            if (left <= 0) continue;
            const tag = `${POWERS[kind].letter}${Math.ceil(left)}`;
            text(ctx, tag, x, H - 11, 1, "left", POWERS[kind].color);
            x += textWidth(tag, 1) + 5;
        }
    }
    if (g.banner > 0 && g.phase === "playing") text(ctx, g.bannerText, W / 2, H / 2 - 8, 3, "center");

    const blinkOn = Math.floor(g.blink * 2) % 2 === 0;
    const dim = "rgba(224,247,250,0.55)";
    if (g.phase === "title") {
        text(ctx, "SPACE", W / 2, 54, 5, "center");
        text(ctx, "DEFENDER", W / 2, 86, 5, "center", "#22d3ee");
        text(ctx, "YOU FOUND THE EASTER EGG", W / 2, 120, 1, "center", dim);
        ENEMY_TYPES.forEach((t, i) => {
            const y = 138 + i * 14;
            ctx.drawImage(sprites.enemies[i][blinkOn ? 0 : 1], 92 - Math.round(t.frames[0][0].length / 2), y);
            text(ctx, `= ${t.points} PTS`, 104, y + 1, 1);
        });
        ctx.drawImage(sprites.boss, 82, 180);
        text(ctx, `= ${BOSS_POINTS} PTS`, 104, 183, 1);
        POWER_KINDS.forEach((k, i) => {
            const x = 22 + i * 42;
            drawPowerIcon(ctx, k, x, 204);
            text(ctx, k === "life" ? "1UP" : k, x + 11, 206, 1, "left", dim);
        });
        if (blinkOn) text(ctx, "PRESS SPACE OR TAP TO START", W / 2, 236, 2, "center");
        text(ctx, "< > MOVE   SPACE FIRE   P PAUSE", W / 2, 266, 1, "center", dim);
        text(ctx, "M SOUND   ESC QUIT", W / 2, 276, 1, "center", dim);
    } else if (g.phase === "paused") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        text(ctx, "PAUSED", W / 2, 140, 4, "center");
        if (blinkOn) text(ctx, "PRESS P TO CONTINUE", W / 2, 180, 2, "center");
    } else if (g.phase === "over") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        text(ctx, "GAME OVER", W / 2, 110, 4, "center", "#fb7185");
        text(ctx, `SCORE ${g.score}`, W / 2, 146, 2, "center");
        text(ctx, `REACHED WAVE ${g.wave}`, W / 2, 162, 2, "center", dim);
        if (g.score > 0 && g.score >= g.high) text(ctx, "NEW HIGH SCORE!", W / 2, 182, 2, "center", "#facc15");
        if (blinkOn) text(ctx, "PRESS SPACE OR TAP TO RETRY", W / 2, 216, 2, "center");
    }
}

const read = (key: string) => {
    try { return localStorage.getItem(key); } catch { return null; }
};

export default function SpaceShooter({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    // A callback ref, not useRef: the dialog's portal mounts a render after this
    // component, so a plain ref would still be null when the effect first runs.
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!open || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const beep = new Beeper();
        beep.muted = read(MUTE_KEY) === "1";
        const g = createGame(Number(read(HIGH_KEY)) || 0);
        const sprites = buildSprites();
        // Dev only: lets the check scripts read and drive the game state.
        const debug = window as unknown as { __spaceDefender?: Game };
        if (process.env.NODE_ENV !== "production") debug.__spaceDefender = g;

        const begin = () => {
            if (g.phase === "playing") return;
            if (g.phase === "paused") { g.phase = "playing"; return; }
            startRun(g);
            beep.wave();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft": case "a": case "A": g.input.left = true; break;
                case "ArrowRight": case "d": case "D": g.input.right = true; break;
                case " ": case "ArrowUp": case "Enter":
                    if (g.phase === "playing") g.input.fire = true; else begin();
                    break;
                case "p": case "P":
                    if (g.phase === "playing") g.phase = "paused"; else if (g.phase === "paused") g.phase = "playing";
                    break;
                case "m": case "M":
                    beep.muted = !beep.muted;
                    try { localStorage.setItem(MUTE_KEY, beep.muted ? "1" : "0"); } catch { /* ignore */ }
                    break;
                default: return;
            }
            e.preventDefault();
        };
        const onKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft": case "a": case "A": g.input.left = false; break;
                case "ArrowRight": case "d": case "D": g.input.right = false; break;
                case " ": case "ArrowUp": case "Enter": g.input.fire = false; break;
            }
        };

        // The canvas is letterboxed inside its box (object-fit: contain); map pointer x into game space.
        const gameX = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            const scale = Math.min(r.width / W, r.height / H);
            const left = r.left + (r.width - W * scale) / 2;
            return Math.max(0, Math.min(W, (e.clientX - left) / scale));
        };
        const onPointerDown = (e: PointerEvent) => {
            canvas.setPointerCapture(e.pointerId);
            if (g.phase !== "playing") { begin(); return; }
            g.input.pointerX = gameX(e);
        };
        const onPointerMove = (e: PointerEvent) => {
            if (g.input.pointerX !== null) g.input.pointerX = gameX(e);
        };
        const onPointerUp = () => { g.input.pointerX = null; };
        const onBlur = () => { if (g.phase === "playing") g.phase = "paused"; };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", onBlur);
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);

        let raf = 0;
        let last = performance.now();
        const frame = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            update(g, dt, beep);
            draw(ctx, g, sprites);
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", onBlur);
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            saveHigh(g);
            beep.close();
            delete debug.__spaceDefender;
        };
    }, [open, canvas]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[calc(100vw-2rem)] max-w-md border-white/10 bg-black p-4 text-white sm:p-6"
                onOpenAutoFocus={(e) => { e.preventDefault(); (e.target as HTMLElement).querySelector("canvas")?.focus(); }}
            >
                <DialogTitle className="eyebrow text-white/60">Space Defender</DialogTitle>
                <DialogDescription className="sr-only">
                    A small retro space shooter. Arrow keys move, space fires, P pauses, M toggles sound, escape closes.
                </DialogDescription>
                <div className="relative">
                    <canvas
                        ref={setCanvas}
                        width={W}
                        height={H}
                        tabIndex={0}
                        role="img"
                        aria-label="Space Defender game"
                        className="block h-[min(68vh,560px)] w-full touch-none outline-none"
                        style={{ imageRendering: "pixelated", objectFit: "contain" }}
                    />
                    {/* Scanlines and a soft vignette for the CRT look. */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(0deg,rgba(0,0,0,0.28)_0_1px,transparent_1px_3px),radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5)_100%)]"
                    />
                </div>
                <p className="text-center text-[11px] text-white/50">
                    <span className="hidden sm:inline">← → move · space fire · P pause · M sound · esc quit</span>
                    <span className="sm:hidden">Press and drag to fly, it fires by itself</span>
                </p>
            </DialogContent>
        </Dialog>
    );
}
