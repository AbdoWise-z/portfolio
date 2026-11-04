"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Activity, BookMarked, ExternalLink, GitFork, Star, Users } from "lucide-react";
import { useSectionProgress } from "@/hooks/use-section-progress";
import { SECTIONS, SOCIAL_LINKS } from "@/lib/site";
import type { GithubData, GithubDay } from "@/lib/github";
import { cn } from "@/lib/utils";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572a5", "C++": "#f34b7d", C: "#555555", Java: "#b07219",
  Kotlin: "#a97bff", Dart: "#00b4ab", HTML: "#e34c26", CSS: "#563d7c", Verilog: "#b2b7f8", SystemVerilog: "#dae1c2",
  VHDL: "#adb2cb", "Jupyter Notebook": "#da5b0b", Rust: "#dea584", Go: "#00add8", Shell: "#89e051", "C#": "#178600",
  Swift: "#f05138", Assembly: "#6e4c13", Makefile: "#427819", CMake: "#da3434", GLSL: "#5686a5", Lua: "#000080",
};
const languageColor = (name: string) => LANGUAGE_COLORS[name] ?? "#64748b";

/** Calendar cell colours by level; complete class strings so Tailwind keeps them. */
const LEVEL_CLASS = [
  "bg-foreground/10",
  "bg-cyan-700/35 dark:bg-cyan-400/30",
  "bg-cyan-700/55 dark:bg-cyan-400/50",
  "bg-cyan-700/80 dark:bg-cyan-400/75",
  "bg-cyan-800 dark:bg-cyan-300",
];

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const panel = "rounded-2xl border border-foreground/10 bg-background/40 p-5 md:p-6";

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <motion.div variants={card} className={cn(panel, "flex items-center gap-4 p-4 md:p-5")}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 text-cyan-700 dark:text-cyan-300">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block text-2xl font-bold tabular-nums text-slate-900 dark:text-cyan-50">{value}</span>
      <span className="block truncate text-xs text-muted-foreground">{label}</span>
    </span>
  </motion.div>
);

const Calendar = ({ weeks }: { weeks: GithubDay[][] }) => (
  <div className="overflow-x-auto pb-1">
    <div className="flex w-max gap-[3px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((d, di) => (
            <span
              key={d.date || `pad-${wi}-${di}`}
              title={d.date ? `${d.count} on ${d.date}` : undefined}
              className={cn("h-[11px] w-[11px] rounded-[2px]", d.date ? LEVEL_CLASS[d.level] : "invisible")}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * GitHub sheet: profile summary, activity calendar, languages and the most
 * starred repositories. The data comes from the server (see lib/github.ts);
 * when GitHub cannot be reached the section still renders with a link.
 */
const Github = ({ data }: { data: GithubData | null }) => {
  const ref = useRef<HTMLElement>(null);
  // Curtain entry over the Skills sheet, like Contact; recede as Contact rises.
  const { scrollYProgress: entry } = useScroll({ target: ref, offset: ["start end", "start 0.3"] });
  const y = useTransform(entry, [0, 1], [80, 0]);
  const radius = useTransform(entry, [0, 1], [48, 0]);
  const cover = useSectionProgress(SECTIONS.contact, ["start 0.8", "start 0.25"]);
  const scale = useTransform(cover, [0, 1], [1, 0.965]);
  const opacity = useTransform(cover, [0, 1], [1, 0.55]);

  const calendarTitle = data?.calendar.source === "contributions"
    ? `${data.calendar.total.toLocaleString("en-US")} contributions in the last year`
    : `${data?.calendar.total ?? 0} public events in the last 90 days`;

  return (
    <motion.section
      ref={ref}
      id={SECTIONS.github}
      style={{ y, borderTopLeftRadius: radius, borderTopRightRadius: radius }}
      className="section-gutter section-panel sheet relative z-[36] scroll-mt-24 pb-32 pt-24 md:pb-44 md:pt-32"
    >
      <motion.div style={{ scale, opacity }} data-nav-focus className="mx-auto w-full max-w-5xl origin-top">
        <h2 className="eyebrow mb-4">05 · GitHub</h2>

        {!data ? (
          <div className="max-w-2xl">
            <p className="text-2xl font-bold text-slate-900 dark:text-cyan-50 md:text-4xl">The code lives on GitHub.</p>
            <p className="mt-4 text-muted-foreground">GitHub could not be reached just now, so here is the direct way in.</p>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-foreground/20 px-6 text-sm font-semibold transition-colors hover:bg-foreground/10"
            >
              Open the profile <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ staggerChildren: 0.07 }}
            className="space-y-5"
          >
            {/* Profile */}
            <motion.div variants={card} className="flex flex-wrap items-center gap-5">
              <Image
                src={data.user.avatar}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 rounded-full border border-foreground/10 md:h-[72px] md:w-[72px]"
              />
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-2xl font-bold text-slate-900 dark:text-cyan-50 md:text-4xl">
                  {data.user.name} <span className="font-medium text-muted-foreground">/ {data.user.login}</span>
                </p>
                <p className="mt-1 max-w-2xl text-muted-foreground">
                  {data.user.bio ?? "Building things in public."} Shipping on GitHub since {data.user.since}.
                </p>
              </div>
              <a
                href={data.user.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/20 px-6 text-sm font-semibold transition-colors hover:bg-foreground/10"
              >
                View profile <ExternalLink className="h-4 w-4" />
              </a>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <Stat icon={<BookMarked className="h-5 w-5" />} label="Repositories" value={data.user.publicRepos} />
              <Stat icon={<Star className="h-5 w-5" />} label="Stars earned" value={data.totals.stars} />
              <Stat icon={<Users className="h-5 w-5" />} label="Followers" value={data.user.followers} />
              <Stat
                icon={<Activity className="h-5 w-5" />}
                label={data.calendar.source === "contributions" ? "Contributions" : "Events in 90 days"}
                value={data.calendar.total.toLocaleString("en-US")}
              />
            </div>

            {/* Calendar */}
            <motion.div variants={card} className={panel}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-cyan-50">{calendarTitle}</h3>
                <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-hidden>
                  Less
                  {LEVEL_CLASS.map((c) => <span key={c} className={cn("h-[11px] w-[11px] rounded-[2px]", c)} />)}
                  More
                </span>
              </div>
              <Calendar weeks={data.calendar.weeks} />
            </motion.div>

            {/* Languages */}
            {data.languages.length > 0 && (
              <motion.div variants={card} className={panel}>
                <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-cyan-50">Languages across my repositories</h3>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-foreground/10" aria-hidden>
                  {data.languages.map((l) => (
                    <span key={l.name} style={{ width: `${l.share * 100}%`, background: languageColor(l.name) }} />
                  ))}
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {data.languages.map((l) => (
                    <li key={l.name} className="flex items-center gap-2 text-foreground/80">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: languageColor(l.name) }} aria-hidden />
                      {l.name}
                      <span className="text-xs tabular-nums text-muted-foreground">{Math.round(l.share * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Top repositories */}
            {data.repos.length > 0 && (
              <div>
                <motion.h3 variants={card} className="mb-3 text-base font-bold text-slate-900 dark:text-cyan-50">Most starred</motion.h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.repos.map((r) => (
                    <motion.li key={r.name} variants={card}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(panel, "group flex h-full flex-col gap-3 p-4 transition-colors hover:border-foreground/30 md:p-5")}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="truncate font-bold text-slate-900 group-hover:underline dark:text-cyan-50">{r.name}</span>
                          <span className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" aria-hidden />{r.stars}</span>
                            <span className="flex items-center gap-1"><GitFork className="h-3.5 w-3.5" aria-hidden />{r.forks}</span>
                          </span>
                        </span>
                        <span className="line-clamp-2 flex-1 text-sm text-muted-foreground">{r.description ?? "No description yet."}</span>
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {r.language && (
                            <span className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: languageColor(r.language) }} aria-hidden />
                              {r.language}
                            </span>
                          )}
                          <span>Updated {r.updated}</span>
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  );
};

export default Github;
