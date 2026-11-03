"use client";

import React, { useEffect, useRef } from "react";

/**
 * Interactive starfield drawn on a fixed, full-viewport canvas.
 *
 * - Three parallax layers of twinkling stars that drift slowly, shift with the
 *   pointer and scroll, and stretch into streaks when the page scrolls fast.
 * - Stars near the pointer are pulled toward it, brighten, and link up into a
 *   small constellation. Bright stars get a four-point flare.
 * - Soft nebula tints pre-rendered once per resize.
 * - Shooting stars at random intervals. A click or tap sends a ripple through
 *   the stars and launches a shooting star from that point.
 * - Follows the light/dark theme, pauses while the tab is hidden, and draws a
 *   single static frame under reduced motion.
 */

type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
  tint: number;
};

type Layer = { depth: number; stars: Star[] };

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
};

type Ripple = { x: number; y: number; life: number };

type NearStar = { x: number; y: number; w: number };

type Palette = {
  bg: string;
  tints: string[];
  alpha: number;
  line: string;
  shooter: string;
  ripple: string;
  nebulaAlpha: number;
  /** Colour of the faint diagonal band. */
  band: string;
  nebula: { x: number; y: number; r: number; c: string }[];
};

const DARK: Palette = {
  bg: "#05070f",
  tints: ["255,255,255", "190,220,255", "255,236,200", "170,240,255"],
  alpha: 1,
  line: "170,230,255",
  shooter: "255,255,255",
  ripple: "170,230,255",
  nebulaAlpha: 0.26,
  band: "150,170,230",
  nebula: [
    { x: 0.18, y: 0.28, r: 0.55, c: "120,40,170" },
    { x: 0.82, y: 0.22, r: 0.5, c: "0,110,200" },
    { x: 0.66, y: 0.82, r: 0.6, c: "200,40,120" },
    { x: 0.14, y: 0.86, r: 0.45, c: "0,170,190" },
  ],
};

const LIGHT: Palette = {
  bg: "#f3f5fb",
  tints: ["30,41,59", "37,99,235", "124,58,237", "8,145,178"],
  alpha: 0.8,
  line: "37,99,235",
  shooter: "30,41,59",
  ripple: "37,99,235",
  nebulaAlpha: 0.15,
  band: "120,140,220",
  nebula: [
    { x: 0.18, y: 0.28, r: 0.55, c: "167,139,250" },
    { x: 0.82, y: 0.22, r: 0.5, c: "96,165,250" },
    { x: 0.66, y: 0.82, r: 0.6, c: "244,114,182" },
    { x: 0.14, y: 0.86, r: 0.45, c: "45,212,191" },
  ],
};

const CONSTELLATION_RADIUS = 170;
const CONSTELLATION_LINK = 110;
const GRAVITY_RADIUS = 240;
const GRAVITY_PULL = 16;
const RIPPLE_SPEED = 420; // px per second
const RIPPLE_LIFE = 0.9; // seconds
const RIPPLE_WIDTH = 70;
const RIPPLE_PUSH = 22;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    let palette: Palette = document.documentElement.classList.contains("dark") ? DARK : LIGHT;
    let width = 0;
    let height = 0;
    let layers: Layer[] = [];
    let nebula: HTMLCanvasElement | null = null;
    const shooters: Shooter[] = [];
    const ripples: Ripple[] = [];

    // Pointer offset from the viewport centre, normalised to [-1, 1], smoothed per frame.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    // Pointer position in viewport pixels, for the constellation and gravity effects.
    const pointerPx = { x: -1e4, y: -1e4, active: false };
    let scrollTarget = window.scrollY;
    let scroll = scrollTarget;
    let scrollVelocity = 0; // px per second, smoothed

    let raf = 0;
    let running = false;
    let last = performance.now();
    let nextShooterIn = rand(1500, 4000);

    const buildNebula = () => {
      nebula = document.createElement("canvas");
      nebula.width = Math.ceil(width / 2);
      nebula.height = Math.ceil(height / 2);
      const nctx = nebula.getContext("2d");
      if (!nctx) return;
      const nw = nebula.width;
      const nh = nebula.height;
      for (const b of palette.nebula) {
        const radius = b.r * Math.max(nw, nh);
        const g = nctx.createRadialGradient(b.x * nw, b.y * nh, 0, b.x * nw, b.y * nh, radius);
        g.addColorStop(0, `rgba(${b.c},${palette.nebulaAlpha})`);
        g.addColorStop(0.45, `rgba(${b.c},${(palette.nebulaAlpha * 0.35).toFixed(3)})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        nctx.fillStyle = g;
        nctx.fillRect(0, 0, nw, nh);
      }

      // A faint diagonal band, like a distant galaxy arm.
      nctx.save();
      nctx.translate(nw / 2, nh / 2);
      nctx.rotate(-0.42);
      const band = nctx.createLinearGradient(0, -nh * 0.32, 0, nh * 0.32);
      const bc = palette.band;
      band.addColorStop(0, `rgba(${bc},0)`);
      band.addColorStop(0.35, `rgba(${bc},${(palette.nebulaAlpha * 0.5).toFixed(3)})`);
      band.addColorStop(0.5, `rgba(${bc},${(palette.nebulaAlpha * 0.8).toFixed(3)})`);
      band.addColorStop(0.65, `rgba(${bc},${(palette.nebulaAlpha * 0.5).toFixed(3)})`);
      band.addColorStop(1, `rgba(${bc},0)`);
      nctx.fillStyle = band;
      nctx.fillRect(-nw, -nh * 0.32, nw * 2, nh * 0.64);
      nctx.restore();
    };

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = coarsePointer ? 1 / 7000 : 1 / 4500; // stars per CSS px²
      const total = Math.min(Math.round(width * height * density), 900);
      const depths = [0.25, 0.55, 1];
      const share = [0.5, 0.3, 0.2];
      // The band in screen space (same angle as the gradient), with a soft width.
      const bandY = (x: number) => height / 2 - Math.tan(0.42) * (x - width / 2);
      layers = depths.map((depth, i) => ({
        depth,
        stars: Array.from({ length: Math.round(total * share[i]) }, (_, k) => {
          const x = Math.random() * width;
          // Every fourth far star hugs the band, giving it a dusty core.
          const onBand = i === 0 && k % 4 === 0;
          const y = onBand ? bandY(x) + (Math.random() - 0.5) * height * 0.18 : Math.random() * height;
          return { x, y,
          r: rand(0.3, 0.8) + depth * rand(0.2, 1.1),
          base: rand(0.35, 1),
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.4, 1.6),
          tint: Math.floor(Math.random() * 4),
          };
        }),
      }));

      buildNebula();
    };

    const spawnShooter = (x?: number, y?: number) => {
      const fromClick = x !== undefined && y !== undefined;
      const angle = fromClick
        ? rand(0, Math.PI * 2)
        : rand(Math.PI * 0.15, Math.PI * 0.35) * (Math.random() < 0.5 ? 1 : -1) + Math.PI / 2;
      const speed = rand(700, 1100);
      shooters.push({
        x: fromClick ? x! : rand(0, width),
        y: fromClick ? y! : rand(-20, height * 0.4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: rand(0.5, 0.9),
        len: rand(90, 180),
      });
    };

    const draw = (now: number, dt: number) => {
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
      const prevScroll = scroll;
      scroll += (scrollTarget - scroll) * Math.min(1, dt * 6);
      if (dt > 0) scrollVelocity += ((scroll - prevScroll) / dt - scrollVelocity) * Math.min(1, dt * 8);

      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);

      if (nebula) {
        const pad = 24;
        ctx.drawImage(
          nebula,
          -pad - pointer.x * 14,
          -pad - pointer.y * 10,
          width + pad * 2,
          height + pad * 2,
        );
      }

      const t = now * 0.001;
      const interactive = !reducedMotion && pointerPx.active;
      const near: NearStar[] = [];
      // Streak length from scroll speed, clamped; sign follows the direction.
      const warp = reducedMotion ? 0 : Math.max(-36, Math.min(36, scrollVelocity * 0.01));

      for (const layer of layers) {
        const drift = reducedMotion ? 0 : t * 2.5 * layer.depth;
        const ox = -pointer.x * 28 * layer.depth + drift;
        const oy = -pointer.y * 18 * layer.depth - scroll * 0.22 * layer.depth;
        const streak = warp * layer.depth;

        for (const s of layer.stars) {
          let sx = (((s.x + ox) % width) + width) % width;
          let sy = (((s.y + oy) % height) + height) % height;
          const twinkle = reducedMotion ? 1 : 0.65 + 0.35 * Math.sin(s.phase + t * s.speed * 2.2);
          let alpha = s.base * twinkle * palette.alpha;

          if (interactive) {
            const dx = pointerPx.x - sx;
            const dy = pointerPx.y - sy;
            const d = Math.hypot(dx, dy);
            if (d < GRAVITY_RADIUS && d > 0.001) {
              // Ease toward the pointer; strongest for the nearest layer.
              const g = (1 - d / GRAVITY_RADIUS) ** 2 * GRAVITY_PULL * layer.depth;
              sx += (dx / d) * g;
              sy += (dy / d) * g;
            }
            const d2 = Math.hypot(pointerPx.x - sx, pointerPx.y - sy);
            if (d2 < CONSTELLATION_RADIUS) {
              const w = 1 - d2 / CONSTELLATION_RADIUS;
              alpha = Math.min(1, alpha + w * 0.7);
              near.push({ x: sx, y: sy, w });
            }
          }

          // Ripples push stars outward as the wavefront passes.
          for (const rp of ripples) {
            const radius = rp.life * RIPPLE_SPEED;
            const dx = sx - rp.x;
            const dy = sy - rp.y;
            const d = Math.hypot(dx, dy);
            const band = Math.abs(d - radius);
            if (band < RIPPLE_WIDTH && d > 0.001) {
              const f = (1 - band / RIPPLE_WIDTH) * (1 - rp.life / RIPPLE_LIFE) * RIPPLE_PUSH;
              sx += (dx / d) * f;
              sy += (dy / d) * f;
              alpha = Math.min(1, alpha + f / RIPPLE_PUSH * 0.5);
            }
          }

          const colour = palette.tints[s.tint];

          if (Math.abs(streak) > 1.5) {
            ctx.strokeStyle = `rgba(${colour},${(alpha * 0.7).toFixed(3)})`;
            ctx.lineWidth = Math.max(0.6, s.r * 0.9);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx, sy + streak);
            ctx.stroke();
            continue;
          }

          if (s.r > 1.3) {
            ctx.fillStyle = `rgba(${colour},${(alpha * 0.14).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, s.r * 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
          if (s.r > 1.6) {
            // Four-point flare on the brightest stars.
            const len = s.r * 4.5 * twinkle;
            ctx.strokeStyle = `rgba(${colour},${(alpha * 0.45).toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(sx - len, sy);
            ctx.lineTo(sx + len, sy);
            ctx.moveTo(sx, sy - len);
            ctx.lineTo(sx, sy + len);
            ctx.stroke();
          }
          ctx.fillStyle = `rgba(${colour},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Constellation: link nearby stars to the pointer and to each other.
      if (near.length > 0) {
        ctx.lineWidth = 0.8;
        ctx.lineCap = "round";
        for (const a of near) {
          ctx.strokeStyle = `rgba(${palette.line},${(a.w * 0.45).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(pointerPx.x, pointerPx.y);
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
        }
        for (let i = 0; i < near.length; i++) {
          for (let j = i + 1; j < near.length; j++) {
            const a = near[i];
            const b = near[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d > CONSTELLATION_LINK) continue;
            const w = (1 - d / CONSTELLATION_LINK) * Math.min(a.w, b.w);
            ctx.strokeStyle = `rgba(${palette.line},${(w * 0.5).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Ripple rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.life += dt;
        if (rp.life >= RIPPLE_LIFE) {
          ripples.splice(i, 1);
          continue;
        }
        const k = rp.life / RIPPLE_LIFE;
        ctx.strokeStyle = `rgba(${palette.ripple},${((1 - k) * 0.35).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.life * RIPPLE_SPEED, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.life += dt;
        if (sh.life >= sh.maxLife) {
          shooters.splice(i, 1);
          continue;
        }
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        const speed = Math.hypot(sh.vx, sh.vy);
        const tailX = sh.x - (sh.vx / speed) * sh.len;
        const tailY = sh.y - (sh.vy / speed) * sh.len;
        const a = Math.sin((Math.PI * sh.life) / sh.maxLife);
        const g = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        g.addColorStop(0, `rgba(${palette.shooter},${a.toFixed(3)})`);
        g.addColorStop(1, `rgba(${palette.shooter},0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      nextShooterIn -= dt * 1000;
      if (nextShooterIn <= 0) {
        spawnShooter();
        nextShooterIn = rand(2500, 7000);
      }
      draw(now, dt);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onResize = () => {
      const dw = Math.abs(window.innerWidth - width);
      const dh = Math.abs(window.innerHeight - height);
      // Mobile browsers resize the viewport when the URL bar hides; ignore small height changes.
      if (dw === 0 && dh < 140) return;
      build();
      if (reducedMotion) draw(performance.now(), 0);
    };

    const setPointer = (x: number, y: number) => {
      pointer.tx = (x / width - 0.5) * 2;
      pointer.ty = (y / height - 0.5) * 2;
      pointerPx.x = x;
      pointerPx.y = y;
      pointerPx.active = true;
    };

    const clearPointer = () => {
      pointerPx.active = false;
    };

    const onPointerMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY);

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      setPointer(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion) return;
      ripples.push({ x: e.clientX, y: e.clientY, life: 0 });
      spawnShooter(e.clientX, e.clientY);
    };

    const onScroll = () => {
      scrollTarget = window.scrollY;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    // Follow the theme class that next-themes sets on <html>.
    const themeObserver = new MutationObserver(() => {
      const next = document.documentElement.classList.contains("dark") ? DARK : LIGHT;
      if (next === palette) return;
      palette = next;
      buildNebula();
      if (reducedMotion) draw(performance.now(), 0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    build();
    if (reducedMotion) {
      draw(performance.now(), 0);
    } else {
      start();
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", clearPointer, { passive: true });
    window.addEventListener("touchcancel", clearPointer, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.addEventListener("mouseleave", clearPointer);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", clearPointer);
      window.removeEventListener("touchcancel", clearPointer);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("mouseleave", clearPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-20] h-full w-full bg-[#f3f5fb] dark:bg-[#05070f]"
    />
  );
};

export default SpaceBackground;
