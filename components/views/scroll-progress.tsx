"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/** Thin page-progress line along the top edge. Difference-blended so it reads on any section. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[46] h-0.5 origin-left bg-white mix-blend-difference"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
