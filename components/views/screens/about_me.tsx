"use client";

import React, { useRef } from "react";
import SecretContent from "@/components/views/secret-content";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
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

/**
 * The paragraph as a flat list of "words". A Flip counts as one word. A word
 * that starts with punctuation glues to the previous one (no space before it).
 */
type WordToken = { node: React.ReactNode; glue: boolean };

const words = (s: string): WordToken[] =>
  s.split(" ").filter(Boolean).map((w) => ({ node: w, glue: /^[,.]/.test(w) }));

const WORDS: WordToken[] = [
  ...words("Hi! I'm"),
  { node: <Flip className={cyan} secret="The one who suffers">Abdelrahman Mahmoud</Flip>, glue: false },
  ...words(", a"),
  { node: <Flip className={cyan} secret="mad scientist of AI">master’s student in AI</Flip>, glue: false },
  ...words("from"),
  { node: <span className="text-orange-700 dark:text-orange-400">Milano-Bicocca</span>, glue: false },
  ...words(". I once built"),
  { node: <Flip className={orange} secret="a robot army">a maze-solving robot</Flip>, glue: false },
  ...words(", designed CPUs, made games, and coded a Discord clone. Basically, I make things that"),
  { node: <Flip className={orange} secret="hardly">actually</Flip>, glue: false },
  ...words("work."),
];

const Word = ({ index, progress, children }: { index: number; progress: MotionValue<number>; children: React.ReactNode }) => {
  const start = index / WORDS.length;
  const end = Math.min(1, start + 2 / WORDS.length);
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
};

/** About sheet: slides over the pinned hero; the copy lights up word by word as you read. */
const AboutMe = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  return (
    <section
      id={SECTIONS.about}
      className="section-gutter section-panel sheet relative z-10 scroll-mt-24 pb-32 pt-24 md:pb-44 md:pt-32"
    >
      <div className="mx-auto w-full max-w-5xl select-none">
        <h2 className="eyebrow mb-8">01 · About Me</h2>

        {/* A div, not a p: SecretContent renders block elements, which are invalid inside <p>. */}
        <div
          ref={ref}
          role="paragraph"
          className="text-xl font-bold leading-snug text-slate-900 dark:text-cyan-50 md:text-3xl lg:text-4xl xl:text-[2.75rem] xl:leading-snug"
        >
          {WORDS.map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 && !w.glue && " "}
              <Word index={i} progress={scrollYProgress}>{w.node}</Word>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
