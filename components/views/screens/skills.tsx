"use client";

import React from "react";
import { motion, useTransform } from "framer-motion";
import { useSectionProgress } from "@/hooks/use-section-progress";
import { Cpu, Monitor, Server, Sparkles } from "lucide-react";
import SecretContent from "@/components/views/secret-content";
import { CV_PATH, SECTIONS } from "@/lib/site";

type SkillGroup = {
  title: string;
  /** What the group title turns into inside the lens. */
  secret: string;
  icon: React.ReactNode;
  items: string[];
};

/** Skill groups, matching the "Skills" section of the CV in public/my_cv.pdf. */
const GROUPS: SkillGroup[] = [
  {
    title: "Front-end",
    secret: "Pixel pushing",
    icon: <Monitor className="h-5 w-5" />,
    items: ["React", "Next.js", "Tailwind", "HTML", "CSS", "Flutter", "Android (Java / Kotlin)"],
  },
  {
    title: "Back-end",
    secret: "Where bugs live",
    icon: <Server className="h-5 w-5" />,
    items: ["Spring Boot", "Node.js", "Express", "Prisma (MySQL / MongoDB)"],
  },
  {
    title: "Hardware",
    secret: "Smoke & magic",
    icon: <Cpu className="h-5 w-5" />,
    items: ["SystemVerilog / Verilog", "VHDL", "Logic design", "AVR", "Arduino"],
  },
  {
    title: "AI & misc",
    secret: "Everything else",
    icon: <Sparkles className="h-5 w-5" />,
    items: ["Artificial intelligence", "Machine learning", "Reinforcement learning", "Image processing (OpenCV)", "C / C++", "OpenGL", "Git"],
  },
];

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/** Skills sheet: slides over the pinned projects slideshow. */
const Skills = () => {
  // Recede slightly once the contact curtain is well over the bottom edge.
  const cover = useSectionProgress(SECTIONS.contact, ["start 0.8", "start 0.25"]);
  const scale = useTransform(cover, [0, 1], [1, 0.965]);
  const opacity = useTransform(cover, [0, 1], [1, 0.55]);

  return (
    <section
      id={SECTIONS.skills}
      className="section-gutter section-panel sheet relative z-[35] -mt-[100vh] scroll-mt-24 pb-32 pt-24 md:pb-44 md:pt-32"
    >
      <motion.div style={{ scale, opacity }} data-nav-focus className="mx-auto w-full max-w-5xl origin-top">
        <h2 className="eyebrow mb-4">04 · Skills</h2>
        <p className="mb-12 max-w-2xl text-2xl font-bold text-slate-900 dark:text-cyan-50 md:text-4xl">
          Tools I reach for, from the browser down to the silicon.
        </p>

        <motion.ul
          className="grid gap-4 sm:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.08 }}
        >
          {GROUPS.map((group) => (
            <motion.li
              key={group.title}
              variants={card}
              className="group rounded-2xl border border-foreground/10 bg-background/40 p-5 transition-colors hover:border-foreground/25 md:p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 text-cyan-700 dark:text-cyan-300">
                  {group.icon}
                </span>
                <SecretContent
                  focusMaskWidth={200}
                  secret={<span className="secret-ink block text-lg font-bold">{group.secret}</span>}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-cyan-50">{group.title}</h3>
                </SecretContent>
              </div>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/80 md:text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </motion.ul>

        <p className="mt-16 text-sm text-muted-foreground">
          The full list, with the projects each one was used on, is in my{" "}
          <a
            href={CV_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-800 underline-offset-4 transition-colors hover:text-cyan-950 hover:underline dark:text-cyan-300 dark:hover:text-cyan-100"
          >
            CV
          </a>
          .
        </p>
      </motion.div>
    </section>
  );
};

export default Skills;
