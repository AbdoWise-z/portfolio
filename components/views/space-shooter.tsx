"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * Space Defender: a small retro shooter, the hero's easter egg. Everything is
 * drawn on a 240x320 canvas that is scaled up with crisp pixels. Arrow keys or
 * A/D move, space fires, M toggles the bleeps; on touch, press and drag to move
 * (firing is automatic while pressed). Escape closes the dialog.
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
const MAX_MY_BULLETS = 3;

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

/** Enemy types by formation row; the top row is worth the most. Two frames each for the shuffle. */
const ENEMY_TYPES: { color: string; points: number; frames: [Sprite, Sprite] }[] = [
    {
        color: "#f472b6",
        points: 30,
        frames: [
            ["...##...", "..####..", ".######.", "##.##.##", "########", "..#..#..", ".#.##.#.", "#.#..#.#"],
            ["...##...", "..####..", ".######.", "##.##.##", "########", ".#.##.#.", "#......#", ".#....#."],
        ],
    },
    {
        color: "#22d3ee",
        points: 20,
        frames: [
            ["..#.....#..", "...#...#...", "..#######..", ".##.###.##.", "###########", "#.#######.#", "#.#.....#.#", "...##.##..."],
            ["..#.....#..", "#..#...#..#", "#.#######.#", "###.###.###", "###########", ".#########.", "..#.....#..", ".#.......#."],
        ],
    },
    {
        color: "#facc15",
        points: 10,
        frames: [
            ["....####....", ".##########.", "############", "###..##..###", "############", "...##..##...", "..##.##.##..", "##........##"],
            ["....####....", ".##########.", "############", "###..##..###", "############", "..###..###..", ".##..##..##.", "..##....##.."],
        ],
    },
];

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

type Sprites = { player: HTMLCanvasElement; enemies: [HTMLCanvasElement, HTMLCanvasElement][] };

const buildSprites = (): Sprites => ({
    player: rasterize(PLAYER, "#e0f7fa"),
    enemies: ENEMY_TYPES.map((t) => [rasterize(t.frames[0], t.color), rasterize(t.frames[1], t.color)]),
});

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
    die() { this.tone(320, 40, 0.5, "square", 0.07); }
    wave() { this.tone(420, 900, 0.3, "triangle", 0.06); }
    close() { void this.ctx?.close(); }
}

interface Enemy { type: number; col: number; row: number; alive: boolean }
interface Bullet { x: number; y: number; vy: number; mine: boolean }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }
interface Star { x: number; y: number; speed: number; shade: number }

interface Game {
    phase: "title" | "playing" | "over";
    score: number;
    high: number;
    lives: number;
    wave: number;
    player: { x: number; cooldown: number; invulnerable: number; dead: number };
    enemies: Enemy[];
    formation: { x: number; y: number; dir: 1 | -1 };
    bullets: Bullet[];
    particles: Particle[];
    stars: Star[];
    fireTimer: number;
    animTimer: number;
    animFrame: 0 | 1;
    banner: number;
    bannerText: string;
    blink: number;
    input: { left: boolean; right: boolean; fire: boolean; pointerX: number | null };
}

const createGame = (high: number): Game => ({
    phase: "title",
    score: 0,
    high,
    lives: 3,
    wave: 0,
    player: { x: W / 2, cooldown: 0, invulnerable: 0, dead: 0 },
    enemies: [],
    formation: { x: 0, y: 0, dir: 1 },
    bullets: [],
    particles: [],
    stars: Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 8 + Math.random() * 30,
        shade: 0.25 + Math.random() * 0.6,
    })),
    fireTimer: 1,
    animTimer: 0,
    animFrame: 0,
    banner: 0,
    bannerText: "",
    blink: 0,
    input: { left: false, right: false, fire: false, pointerX: null },
});

function spawnWave(g: Game) {
    g.wave += 1;
    g.enemies = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) g.enemies.push({ type: row, col, row, alive: true });
    }
    g.formation = { x: (W - FORMATION_W) / 2, y: 36, dir: 1 };
    g.bullets = [];
    g.fireTimer = 1.2;
    g.banner = 1.4;
    g.bannerText = `WAVE ${g.wave}`;
}

function startRun(g: Game) {
    g.phase = "playing";
    g.score = 0;
    g.lives = 3;
    g.wave = 0;
    g.player = { x: W / 2, cooldown: 0, invulnerable: 0, dead: 0 };
    g.particles = [];
    spawnWave(g);
}

const enemySize = (e: Enemy) => {
    const s = ENEMY_TYPES[e.type].frames[0];
    return { w: s[0].length, h: s.length };
};

const enemyRect = (g: Game, e: Enemy) => {
    const { w, h } = enemySize(e);
    return { x: g.formation.x + e.col * CELL_W + (CELL_W - w) / 2, y: g.formation.y + e.row * CELL_H, w, h };
};

function burst(g: Game, x: number, y: number, color: string, count = 10) {
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 20 + Math.random() * 60;
        g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + Math.random() * 0.3, color });
    }
}

function saveHigh(g: Game) {
    if (g.score <= g.high) return;
    g.high = g.score;
    try { localStorage.setItem(HIGH_KEY, String(g.high)); } catch { /* private mode */ }
}

function update(g: Game, dt: number, beep: Beeper) {
    g.blink += dt;
    for (const s of g.stars) {
        s.y += s.speed * dt;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    }
    g.particles = g.particles.filter((p) => (p.life -= dt) > 0);
    for (const p of g.particles) { p.x += p.vx * dt; p.y += p.vy * dt; }
    if (g.phase !== "playing") return;

    const p = g.player;
    const { input } = g;

    // Player: respawn countdown, movement, firing.
    if (p.dead > 0) {
        p.dead -= dt;
        if (p.dead <= 0) { p.x = W / 2; p.invulnerable = 2; }
    } else {
        if (input.pointerX !== null) {
            const d = input.pointerX - p.x;
            p.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt);
        } else {
            p.x += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * PLAYER_SPEED * dt;
        }
        p.x = Math.max(6, Math.min(W - 6, p.x));
        p.cooldown -= dt;
        const firing = input.fire || input.pointerX !== null;
        if (firing && p.cooldown <= 0 && g.bullets.filter((b) => b.mine).length < MAX_MY_BULLETS) {
            g.bullets.push({ x: p.x, y: PLAYER_Y - 2, vy: -220, mine: true });
            p.cooldown = 0.3;
            beep.shoot();
        }
    }
    p.invulnerable = Math.max(0, p.invulnerable - dt);

    g.animTimer += dt;
    if (g.animTimer > 0.45) { g.animTimer = 0; g.animFrame = g.animFrame ? 0 : 1; }

    const alive = g.enemies.filter((e) => e.alive);

    // Formation: faster with each wave and as it thins out; steps down at the edges.
    if (g.banner > 0) {
        g.banner -= dt;
    } else if (alive.length) {
        const speed = 16 * (1 + 0.18 * (g.wave - 1)) * (1 + 2.5 * (1 - alive.length / (COLS * ROWS)));
        g.formation.x += g.formation.dir * speed * dt;
        const minCol = Math.min(...alive.map((e) => e.col));
        const maxCol = Math.max(...alive.map((e) => e.col));
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
            const shooter = alive[Math.floor(Math.random() * alive.length)];
            const lowest = alive.filter((e) => e.col === shooter.col).sort((a, b) => b.row - a.row)[0];
            const r = enemyRect(g, lowest);
            g.bullets.push({ x: r.x + r.w / 2, y: r.y + r.h, vy: 90 + 6 * g.wave, mine: false });
        }
    }

    for (const b of g.bullets) b.y += b.vy * dt;
    g.bullets = g.bullets.filter((b) => b.y > -6 && b.y < H + 6);

    // Hits.
    for (const b of g.bullets) {
        if (b.mine) {
            for (const e of alive) {
                if (!e.alive) continue;
                const r = enemyRect(g, e);
                if (b.x >= r.x && b.x <= r.x + r.w && b.y >= r.y && b.y <= r.y + r.h) {
                    e.alive = false;
                    b.y = -100;
                    g.score += ENEMY_TYPES[e.type].points;
                    burst(g, r.x + r.w / 2, r.y + r.h / 2, ENEMY_TYPES[e.type].color);
                    beep.hit();
                    break;
                }
            }
        } else if (p.dead <= 0 && p.invulnerable <= 0) {
            if (Math.abs(b.x - p.x) <= 4 && b.y >= PLAYER_Y + 1 && b.y <= PLAYER_Y + 8) {
                b.y = H + 100;
                loseLife(g, beep);
            }
        }
    }
    g.bullets = g.bullets.filter((b) => b.y > -6 && b.y < H + 6);

    // An enemy reaching the player's row ends the run.
    if (alive.some((e) => e.alive && enemyRect(g, e).y + enemyRect(g, e).h >= PLAYER_Y)) {
        g.lives = 1;
        loseLife(g, beep);
    }

    if (g.phase === "playing" && !g.enemies.some((e) => e.alive)) {
        spawnWave(g);
        beep.wave();
    }
}

function loseLife(g: Game, beep: Beeper) {
    const p = g.player;
    burst(g, p.x, PLAYER_Y + 4, "#e0f7fa", 16);
    beep.die();
    g.lives -= 1;
    if (g.lives <= 0) {
        g.phase = "over";
        saveHigh(g);
        return;
    }
    p.dead = 1.2;
}

const pad = (n: number) => String(n).padStart(6, "0");

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
    ":": ["...", ".#.", "...", ".#.", "..."], "<": ["..#", ".#.", "#..", ".#.", "..#"], ">": ["#..", ".#.", "..#", ".#.", "#.."],
};

/** Draw a string in the pixel font; (x, y) is the top edge, align picks which edge x refers to. */
function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, scale = 1, align: "left" | "center" | "right" = "left", color = "#e0f7fa") {
    const chars = s.toUpperCase().split("");
    const width = chars.length * 4 * scale - scale;
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

function draw(ctx: CanvasRenderingContext2D, g: Game, sprites: Sprites) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    for (const s of g.stars) {
        ctx.fillStyle = `rgba(255,255,255,${s.shade})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
    }

    for (const e of g.enemies) {
        if (!e.alive) continue;
        const r = enemyRect(g, e);
        ctx.drawImage(sprites.enemies[e.type][g.animFrame], Math.round(r.x), Math.round(r.y));
    }

    const p = g.player;
    const visible = p.dead <= 0 && (p.invulnerable <= 0 || Math.floor(p.invulnerable * 10) % 2 === 0);
    if (g.phase !== "title" && visible) {
        ctx.drawImage(sprites.player, Math.round(p.x - PLAYER[0].length / 2), PLAYER_Y);
    }

    for (const b of g.bullets) {
        ctx.fillStyle = b.mine ? "#ffffff" : "#fb7185";
        ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, 4);
    }
    for (const q of g.particles) {
        ctx.fillStyle = q.color;
        ctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2);
    }

    // HUD
    text(ctx, `SCORE ${pad(g.score)}`, 4, 4, 2);
    text(ctx, `HI ${pad(g.high)}`, W - 4, 4, 2, "right");
    if (g.phase !== "title") {
        for (let i = 0; i < g.lives; i++) ctx.drawImage(sprites.player, 4 + i * 14, H - 12, 8, 6);
        text(ctx, `WAVE ${g.wave}`, W - 4, H - 11, 1, "right", "rgba(224,247,250,0.7)");
    }
    if (g.banner > 0 && g.phase === "playing") text(ctx, g.bannerText, W / 2, H / 2 - 8, 3, "center");

    const blinkOn = Math.floor(g.blink * 2) % 2 === 0;
    if (g.phase === "title") {
        text(ctx, "SPACE", W / 2, 92, 5, "center");
        text(ctx, "DEFENDER", W / 2, 124, 5, "center", "#22d3ee");
        text(ctx, "YOU FOUND THE EASTER EGG", W / 2, 164, 2, "center", "rgba(224,247,250,0.6)");
        if (blinkOn) text(ctx, "PRESS SPACE OR TAP TO START", W / 2, 210, 2, "center");
        text(ctx, "< > MOVE   SPACE FIRE", W / 2, 258, 2, "center", "rgba(224,247,250,0.5)");
        text(ctx, "M SOUND   ESC QUIT", W / 2, 274, 2, "center", "rgba(224,247,250,0.5)");
    } else if (g.phase === "over") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        text(ctx, "GAME OVER", W / 2, 118, 4, "center", "#fb7185");
        text(ctx, `SCORE ${g.score}`, W / 2, 150, 2, "center");
        if (g.score > 0 && g.score >= g.high) text(ctx, "NEW HIGH SCORE!", W / 2, 168, 2, "center", "#facc15");
        if (blinkOn) text(ctx, "PRESS SPACE OR TAP TO RETRY", W / 2, 210, 2, "center");
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

        const begin = () => {
            if (g.phase === "playing") return;
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

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
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
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            saveHigh(g);
            beep.close();
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
                    A small retro space shooter. Arrow keys move, space fires, M toggles sound, escape closes.
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
                    <span className="hidden sm:inline">← → move · space fire · M sound · esc quit</span>
                    <span className="sm:hidden">Press and drag to fly, it fires by itself</span>
                </p>
            </DialogContent>
        </Dialog>
    );
}
