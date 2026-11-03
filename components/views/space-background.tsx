"use client";

import React, { useEffect, useRef } from "react";

/**
 * Interactive starfield drawn on a fixed, full-viewport canvas.
 *
 * - Three parallax layers of twinkling stars that shift with the pointer and scroll.
 * - Soft nebula tints pre-rendered once per resize.
 * - Shooting stars at random intervals, and one from wherever the user clicks or taps.
 * - Pauses while the tab is hidden; draws a single static frame under reduced motion.
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

const TINTS = ["255,255,255", "190,220,255", "255,236,200", "170,240,255"];
const NEBULA_BLOBS = [
  { x: 0.18, y: 0.28, r: 0.55, c: "120,40,170" },
  { x: 0.82, y: 0.22, r: 0.5, c: "0,110,200" },
  { x: 0.66, y: 0.82, r: 0.6, c: "200,40,120" },
  { x: 0.14, y: 0.86, r: 0.45, c: "0,170,190" },
];

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

    let width = 0;
    let height = 0;
    let layers: Layer[] = [];
    let nebula: HTMLCanvasElement | null = null;
    const shooters: Shooter[] = [];

    // Pointer offset from the viewport centre, normalised to [-1, 1], smoothed per frame.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollTarget = window.scrollY;
    let scroll = scrollTarget;

    let raf = 0;
    let running = false;
    let last = performance.now();
    let nextShooterIn = rand(1500, 4000);

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = coarsePointer ? 1 / 9000 : 1 / 6000; // stars per CSS px²
      const total = Math.min(Math.round(width * height * density), 700);
      const depths = [0.25, 0.55, 1];
      const share = [0.5, 0.3, 0.2];
      layers = depths.map((depth, i) => ({
        depth,
        stars: Array.from({ length: Math.round(total * share[i]) }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.3, 0.8) + depth * rand(0.2, 1.1),
          base: rand(0.35, 1),
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.4, 1.6),
          tint: Math.floor(Math.random() * TINTS.length),
        })),
      }));

      // Nebula: a few large radial gradients, rendered once at half resolution.
      nebula = document.createElement("canvas");
      nebula.width = Math.ceil(width / 2);
      nebula.height = Math.ceil(height / 2);
      const nctx = nebula.getContext("2d");
      if (nctx) {
        const nw = nebula.width;
        const nh = nebula.height;
        for (const b of NEBULA_BLOBS) {
          const radius = b.r * Math.max(nw, nh);
          const g = nctx.createRadialGradient(b.x * nw, b.y * nh, 0, b.x * nw, b.y * nh, radius);
          g.addColorStop(0, `rgba(${b.c},0.26)`);
          g.addColorStop(0.45, `rgba(${b.c},0.09)`);
          g.addColorStop(1, `rgba(${b.c},0)`);
          nctx.fillStyle = g;
          nctx.fillRect(0, 0, nw, nh);
        }
      }
    };

    const spawnShooter = (x?: number, y?: number) => {
      const fromClick = x !== undefined && y !== undefined;
      const angle = fromClick ? rand(0, Math.PI * 2) : rand(Math.PI * 0.15, Math.PI * 0.35) * (Math.random() < 0.5 ? 1 : -1) + Math.PI / 2;
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
      scroll += (scrollTarget - scroll) * Math.min(1, dt * 6);

      ctx.fillStyle = "#05070f";
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
      for (const layer of layers) {
        const ox = -pointer.x * 28 * layer.depth;
        const oy = -pointer.y * 18 * layer.depth - scroll * 0.22 * layer.depth;
        for (const s of layer.stars) {
          const sx = (((s.x + ox) % width) + width) % width;
          const sy = (((s.y + oy) % height) + height) % height;
          const twinkle = reducedMotion ? 1 : 0.65 + 0.35 * Math.sin(s.phase + t * s.speed * 2.2);
          const alpha = s.base * twinkle;
          const colour = TINTS[s.tint];
          if (s.r > 1.3) {
            ctx.fillStyle = `rgba(${colour},${(alpha * 0.14).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, s.r * 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = `rgba(${colour},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

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
        g.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
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

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / width - 0.5) * 2;
      pointer.ty = (e.clientY / height - 0.5) * 2;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      pointer.tx = (t.clientX / width - 0.5) * 2;
      pointer.ty = (t.clientY / height - 0.5) * 2;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion) return;
      spawnShooter(e.clientX, e.clientY);
    };

    const onScroll = () => {
      scrollTarget = window.scrollY;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    build();
    if (reducedMotion) {
      draw(performance.now(), 0);
    } else {
      start();
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-20] h-full w-full bg-[#05070f]"
    />
  );
};

export default SpaceBackground;
