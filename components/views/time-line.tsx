"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useSectionProgress } from "@/hooks/use-section-progress";

export type TimelinePointType = "Major" | "Minor";

export interface TimelineItemData {
    id: string;
    type: TimelinePointType;
    title: string;
    subtitle?: string;
    description: string;
    date: string;
    icon: React.ReactNode;
    background: StaticImageData;
    widget?: React.ReactNode;
    certificateUrl?: string;
}

/** Scroll distance, as a fraction of the viewport height, that each item occupies. */
const STEP_VH = 55;
/** Extra scroll at the end during which the section stays pinned while the next sheet covers it. */
const TAIL_VH = 100;

const TimelineWidgetDisplay = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-4 w-full max-w-md overflow-hidden rounded-xl border border-border/50 bg-card/80 p-4 shadow-lg">
        {children}
    </div>
);

interface TimelineProps {
    items: TimelineItemData[];
    /** Id of the element that slides over this section, used to make it recede. */
    coveredBy: string;
}

/**
 * Scroll-driven timeline. It enters as an inset card that expands to full
 * bleed, then a sticky viewport shows one item at a time (about half a screen
 * of scroll each, switching at the midpoint). At the end it stays pinned and
 * recedes while the next section slides over it. Points and dates are clickable.
 */
export function Timeline({ items, coveredBy }: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const last = items.length - 1;
    const contentVh = last * STEP_VH;

    // Progress through the whole wrapper; the items occupy the first part, the tail the rest.
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });
    const contentProgress = useTransform(scrollYProgress, (p) =>
        Math.min(1, (p * (contentVh + TAIL_VH)) / contentVh),
    );
    const smoothProgress = useSpring(contentProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });

    useEffect(() => {
        const unsubscribe = contentProgress.on("change", (latest) => {
            setActiveIndex(Math.max(0, Math.min(last, Math.round(latest * last))));
        });
        return () => unsubscribe();
    }, [contentProgress, last]);

    // Entry: an inset, rounded card that grows to fill the screen as it scrolls in.
    const { scrollYProgress: entry } = useScroll({
        target: containerRef,
        offset: ["start end", "start start"],
    });
    const clipPath = useTransform(entry, (p) => {
        const k = 1 - p;
        return `inset(${(k * 7).toFixed(2)}% ${(k * 4).toFixed(2)}% round ${(k * 36).toFixed(1)}px)`;
    });

    // Exit: recede while the next sheet covers this one.
    const cover = useSectionProgress(coveredBy, ["start end", "start start"]);
    const scale = useTransform(cover, [0, 1], [1, 0.94]);
    const filter = useTransform(cover, (c) => `brightness(${(1 - c * 0.65).toFixed(3)})`);
    const borderRadius = useTransform(cover, [0, 1], [0, 32]);

    const jumpTo = useCallback((index: number) => {
        const container = containerRef.current;
        if (!container) return;
        const top = container.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + (index * window.innerHeight * STEP_VH) / 100, behavior: "smooth" });
    }, []);

    // Arrow keys step between items while the timeline is on screen.
    // Watch the pinned viewport, not the tall wrapper, so the threshold is meaningful.
    const inView = useInView(stickyRef, { amount: 0.6 });
    useEffect(() => {
        if (!inView) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                if (activeIndex < last) { event.preventDefault(); jumpTo(activeIndex + 1); }
            } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                if (activeIndex > 0) { event.preventDefault(); jumpTo(activeIndex - 1); }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [inView, activeIndex, last, jumpTo]);

    return (
        <div ref={containerRef} className="relative" style={{ height: `calc(100vh + ${contentVh + TAIL_VH}vh)` }}>
            <motion.div
                ref={stickyRef}
                className="sticky top-0 flex h-screen supports-[height:100dvh]:h-dvh w-full flex-col overflow-hidden bg-black text-white"
                style={{ clipPath, scale, filter, borderRadius }}
            >

                {/* Background layer: the current image fades in over the previous one. */}
                <div className="absolute inset-0" aria-hidden>
                    {items.map((item, index) => (
                        <motion.div
                            key={`bg-${item.id}`}
                            className="absolute inset-0"
                            style={{ zIndex: index }}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: activeIndex - index <= 1 && activeIndex - index >= 0 ? 1 : 0,
                                scale: activeIndex === index ? 1.05 : 1
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <Image src={item.background} alt="" fill sizes="100vw" className="object-cover" />
                            <div className="absolute inset-0 bg-black/65" />
                        </motion.div>
                    ))}
                </div>

                <p className="section-gutter absolute left-0 top-24 z-10 text-xs font-semibold uppercase tracking-[0.3em] text-white/60 md:top-8" aria-hidden>
                    02 · Timeline
                </p>

                {/* Content layer */}
                <div className="section-gutter relative z-10 flex h-full w-full items-center">
                    <div className="mx-auto flex w-full max-w-6xl items-center">

                        {/* Progress line and points */}
                        <div className="relative mr-5 flex shrink-0 flex-col justify-between py-8 md:mr-12" style={{ height: "60vh" }}>
                            <div className="absolute bottom-0 right-[15px] top-0 w-0.5 overflow-hidden rounded-full bg-white/20" aria-hidden>
                                <motion.div
                                    className="w-full origin-top bg-white"
                                    style={{ height: "100%", scaleY: smoothProgress }}
                                />
                            </div>

                            {items.map((item, index) => {
                                const isMajor = item.type === "Major";
                                const isActive = index <= activeIndex;
                                const isCurrent = index === activeIndex;

                                return (
                                    <motion.button
                                        type="button"
                                        key={`point-${item.id}`}
                                        onClick={() => jumpTo(index)}
                                        aria-label={`${item.title}, ${item.date}`}
                                        aria-current={isCurrent ? "step" : undefined}
                                        className="group relative z-10 flex items-center justify-end gap-4 rounded-full"
                                        initial={false}
                                        animate={{ opacity: isActive ? 1 : 0.55 }}
                                        whileHover={{ opacity: 1 }}
                                    >
                                        <span className={cn(
                                            "hidden whitespace-nowrap text-[11px] transition-colors duration-200 group-hover:text-white md:inline",
                                            isCurrent ? "font-bold text-white" : "text-white/50"
                                        )}>
                                            {item.date}
                                        </span>

                                        <motion.span
                                            className="relative flex w-8 items-center justify-center"
                                            animate={{ scale: isCurrent ? 1.2 : 1 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <span
                                                className={cn(
                                                    "flex items-center justify-center rounded-full border-2 transition-colors duration-200",
                                                    isMajor ? "h-6 w-6" : "h-3 w-3",
                                                    isActive ? "border-white bg-white" : "border-white/40 bg-transparent group-hover:border-white/70",
                                                    isCurrent && "ring-4 ring-white/20"
                                                )}
                                            >
                                                {isMajor && isActive && <Check className="h-3 w-3 text-black" />}
                                            </span>
                                            {isCurrent && (
                                                <span className={cn(
                                                    "absolute animate-ping rounded-full bg-white/50 opacity-75",
                                                    isMajor ? "h-6 w-6" : "h-3 w-3"
                                                )} />
                                            )}
                                        </motion.span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Item content */}
                        <div className="relative h-[60vh] min-w-0 flex-1">
                            {items.map((item, index) => {
                                const isCurrent = activeIndex === index;
                                return (
                                    <motion.div
                                        key={`content-${item.id}`}
                                        className="absolute inset-0 flex flex-col justify-center"
                                        initial={false}
                                        animate={{
                                            opacity: isCurrent ? 1 : 0,
                                            y: isCurrent ? 0 : activeIndex > index ? -40 : 40,
                                            pointerEvents: isCurrent ? "auto" : "none"
                                        }}
                                        transition={{ duration: 0.35, ease: "easeOut" }}
                                        aria-hidden={!isCurrent}
                                    >
                                        <div className="mb-4 flex items-start gap-4">
                                            <div className="shrink-0 rounded-xl border border-white/20 bg-white/10 p-3 text-white">
                                                {item.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={cn(
                                                    "break-words font-bold leading-tight text-white",
                                                    item.type === "Major" ? "text-2xl md:text-4xl lg:text-5xl" : "text-xl md:text-2xl lg:text-3xl"
                                                )}>
                                                    {item.title}
                                                </h3>
                                                {item.subtitle && (
                                                    <p className="mt-1 text-base font-medium text-cyan-300 md:text-xl">{item.subtitle}</p>
                                                )}
                                                <p className="mt-1 text-xs text-white/60 md:hidden">{item.date}</p>
                                            </div>
                                        </div>

                                        <p className="mb-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                                            {item.description}
                                        </p>

                                        {(item.widget || item.certificateUrl) && (
                                            <motion.div
                                                initial={false}
                                                animate={{ opacity: isCurrent ? 1 : 0, scale: isCurrent ? 1 : 0.95 }}
                                                transition={{ delay: 0.1, duration: 0.3 }}
                                            >
                                                <TimelineWidgetDisplay>
                                                    {item.widget}
                                                    {item.certificateUrl && (
                                                        <div className={cn("flex items-center gap-2", item.widget && "mt-3 border-t border-border/30 pt-3")}>
                                                            <span className="text-xs text-muted-foreground">Certificate:</span>
                                                            <a
                                                                href={item.certificateUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary transition-colors hover:text-primary/80 hover:underline"
                                                            >
                                                                View →
                                                            </a>
                                                        </div>
                                                    )}
                                                </TimelineWidgetDisplay>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Scroll hint and position */}
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50 md:bottom-8" aria-hidden>
                    <span className="text-xs tabular-nums">{activeIndex + 1} / {items.length}</span>
                    <motion.div
                        className="flex flex-col items-center gap-2"
                        animate={{ opacity: activeIndex === last ? 0 : 1 }}
                    >
                        <span className="text-xs uppercase tracking-widest">Scroll</span>
                        <div className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
