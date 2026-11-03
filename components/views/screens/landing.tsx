"use client";

import SecretContent from "@/components/views/secret-content";
import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useSectionProgress } from "@/hooks/use-section-progress";
import { SECTIONS } from "@/lib/site";

const line = "text-center text-4xl font-bold leading-tight md:text-7xl xl:text-8xl";
const ink = "text-slate-900 dark:text-cyan-50";
const accent = "text-cyan-700 dark:text-cyan-400";

const intro = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Hero. It stays pinned while the About sheet slides over it, receding and
 * fading as it is covered. The lines rise into place on first load.
 */
const Landing = () => {
  const cover = useSectionProgress(SECTIONS.about, ["start end", "start 0.25"]);
  const opacity = useTransform(cover, [0, 1], [1, 0]);
  const scale = useTransform(cover, [0, 1], [1, 0.9]);
  const y = useTransform(cover, [0, 1], [0, -60]);
  const hintOpacity = useTransform(cover, [0, 0.5], [1, 0]);

  // Mild pointer parallax: the headline drifts a few pixels against the mouse.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const parallaxX = useSpring(px, { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(py, { stiffness: 60, damping: 20 });
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * -14);
      py.set((e.clientY / window.innerHeight - 0.5) * -10);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);

  return (
    <section className="sticky top-0 z-0 flex h-screen supports-[height:100dvh]:h-dvh select-none flex-col items-center justify-center px-6">
      <motion.div style={{ opacity, scale, y }} className="flex flex-col items-center">
        <motion.div
          style={{ x: parallaxX, y: parallaxY }}
          className="flex flex-col items-center"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
        >
          <motion.div variants={intro}>
            <SecretContent
              focusMaskWidth={420}
              className="items-center justify-center"
              secret={
                <div className="w-full">
                  <p className="eyebrow secret-ink mb-8 text-center">Abdelrahman Mahmoud</p>
                  <p className={`${line} secret-ink`}>Fixing</p>
                  <p className={`${line} secret-ink`}>Bugs That</p>
                  <p className={`${line} secret-ink`}>I Created</p>
                </div>
              }
            >
              <div className="w-full">
                <h1 className="eyebrow mb-8 text-center">Abdelrahman Mahmoud</h1>
                <p className={`${line} ${ink}`}>Building</p>
                <p className={`${line} ${accent}`}>Applications</p>
                <p className={`${line} ${accent}`}>& Websites</p>
              </div>
            </SecretContent>
          </motion.div>
          <motion.p variants={intro} className={`${line} ${ink}`}>Since</motion.p>
          <motion.p variants={intro} className={`${line} ${ink}`}>2019</motion.p>
        </motion.div>
      </motion.div>

      {/* Scroll hint: the outer div fades in on load, the inner one fades out with the hero.
          They are separate elements so no animated key shares a MotionValue. */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.a
          href={`#${SECTIONS.about}`}
          style={{ opacity: hintOpacity }}
          className="flex flex-col items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
          aria-label="Scroll to the About section"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <span className="h-8 w-px bg-gradient-to-b from-foreground/60 to-transparent" />
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Landing;
