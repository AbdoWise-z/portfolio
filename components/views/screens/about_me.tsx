"use client";

import React from "react";
import SecretContent from "@/components/views/secret-content";
import { motion } from "framer-motion";
import { SECTIONS } from "@/lib/site";

/** A word or phrase that flips to its "secret" version inside the mask. */
const Flip = ({ children, secret, className }: { children: string; secret: string; className: string }) => (
  <SecretContent
    className="inline-block align-baseline"
    focusMaskWidth={240}
    secret={<span className={className.replace(/text-\S+/, "text-black")}>{secret}</span>}
  >
    <span className={className}>{children}</span>
  </SecretContent>
);

const AboutMe = () => {
  return (
    <section
      id={SECTIONS.about}
      className="section-gutter relative scroll-mt-24 bg-[#080b14]/80 py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-5xl select-none">
        <h2 className="eyebrow mb-8">About Me</h2>

        <motion.div
          initial={{ opacity: 0.6, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-xl font-bold leading-snug text-cyan-50 md:text-3xl lg:text-4xl xl:text-[2.75rem] xl:leading-snug"
        >
          {"Hi! I'm "}
          <Flip className="text-cyan-400" secret="The one who suffers">Abdelrahman Mahmoud</Flip>
          {", a "}
          <Flip className="text-cyan-400" secret="mad scientist of AI">master’s student in AI</Flip>
          {" from "}
          <span className="text-orange-400">Milano-Bicocca</span>
          {". I once built "}
          <Flip className="text-orange-500" secret="a robot army">a maze-solving robot</Flip>
          {", designed CPUs, made games, and coded a Discord clone. Basically, I make things that "}
          <Flip className="text-orange-500" secret="hardly">actually</Flip>
          {" work."}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMe;
