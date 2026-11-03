"use client";

import React from "react";
import SecretContent from "@/components/views/secret-content";
import { motion } from "framer-motion";
import { SECTIONS } from "@/lib/site";

/** A word or phrase that flips to its "secret" version inside the lens. */
const Flip = ({ children, secret, className }: { children: string; secret: string; className: string }) => (
  <SecretContent
    className="inline-block align-baseline"
    focusMaskWidth={240}
    secret={<span className="secret-ink">{secret}</span>}
  >
    <span className={className}>{children}</span>
  </SecretContent>
);

const cyan = "text-cyan-700 dark:text-cyan-400";
const orange = "text-orange-700 dark:text-orange-500";

/** About sheet: slides over the pinned hero. */
const AboutMe = () => {
  return (
    <section
      id={SECTIONS.about}
      className="section-gutter section-panel sheet relative z-10 scroll-mt-24 py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-5xl select-none">
        <h2 className="eyebrow mb-8">01 · About Me</h2>

        <motion.div
          initial={{ opacity: 0.4, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-xl font-bold leading-snug text-slate-900 dark:text-cyan-50 md:text-3xl lg:text-4xl xl:text-[2.75rem] xl:leading-snug"
        >
          {"Hi! I'm "}
          <Flip className={cyan} secret="The one who suffers">Abdelrahman Mahmoud</Flip>
          {", a "}
          <Flip className={cyan} secret="mad scientist of AI">master’s student in AI</Flip>
          {" from "}
          <span className="text-orange-700 dark:text-orange-400">Milano-Bicocca</span>
          {". I once built "}
          <Flip className={orange} secret="a robot army">a maze-solving robot</Flip>
          {", designed CPUs, made games, and coded a Discord clone. Basically, I make things that "}
          <Flip className={orange} secret="hardly">actually</Flip>
          {" work."}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMe;
