"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image, { StaticImageData } from "next/image";

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

const TimelineWidgetDisplay = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-4 w-full max-w-md overflow-hidden rounded-xl border border-border/50 bg-card/80 p-4 shadow-lg">
        {children}
    </div>
);

interface TimelineProps {
    items: TimelineItemData[];
}

/**
 * Scroll-driven timeline. The outer container is N viewports tall; a sticky
 * viewport inside it shows one item at a time as the user scrolls through.
 */
export function Timeline({ items }: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            const step = 1 / items.length;
            setActiveIndex(Math.min(Math.floor(latest / step), items.length - 1));
        });
        return () => unsubscribe();
    }, [scrollYProgress, items.length]);

    return (
        <div ref={containerRef} className="relative" style={{ height: `${items.length * 100}vh` }}>
            <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">

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
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                            <Image src={item.background} alt="" fill sizes="100vw" className="object-cover" />
                            <div className="absolute inset-0 bg-black/65" />
                        </motion.div>
                    ))}
                </div>

                {/* Content layer */}
                <div className="section-gutter relative z-10 flex h-full w-full items-center">
                    <div className="mx-auto flex w-full max-w-6xl items-center">

                        {/* Progress line and points */}
                        <div className="relative mr-5 flex shrink-0 flex-col justify-between py-8 md:mr-12" style={{ height: "60vh" }}>
                            <div className="absolute bottom-0 right-[15px] top-0 w-0.5 overflow-hidden rounded-full bg-white/20" aria-hidden>
                                <motion.div
                                    className="w-full origin-top bg-primary"
                                    style={{ height: "100%", scaleY: smoothProgress }}
                                />
                            </div>

                            {items.map((item, index) => {
                                const isMajor = item.type === "Major";
                                const isActive = index <= activeIndex;
                                const isCurrent = index === activeIndex;

                                return (
                                    <motion.div
                                        key={`point-${item.id}`}
                                        className="relative z-10 flex items-center justify-end gap-4"
                                        initial={false}
                                        animate={{ opacity: isActive ? 1 : 0.5 }}
                                    >
                                        <span className={cn(
                                            "hidden whitespace-nowrap text-[11px] transition-colors duration-300 md:inline",
                                            isCurrent ? "font-bold text-white" : "text-white/50"
                                        )}>
                                            {item.date}
                                        </span>

                                        <motion.div
                                            className="relative flex w-8 items-center justify-center"
                                            animate={{ scale: isCurrent ? 1.2 : 1 }}
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center rounded-full border-2 transition-colors duration-300",
                                                    isMajor ? "h-6 w-6" : "h-3 w-3",
                                                    isActive ? "border-primary bg-primary" : "border-white/40 bg-transparent",
                                                    isCurrent && "ring-4 ring-primary/20"
                                                )}
                                            >
                                                {isMajor && isActive && <Check className="h-3 w-3 text-primary-foreground" />}
                                            </div>
                                            {isCurrent && (
                                                <div className={cn(
                                                    "absolute animate-ping rounded-full bg-primary/50 opacity-75",
                                                    isMajor ? "h-6 w-6" : "h-3 w-3"
                                                )} />
                                            )}
                                        </motion.div>
                                    </motion.div>
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
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{
                                            opacity: isCurrent ? 1 : 0,
                                            y: isCurrent ? 0 : activeIndex > index ? -50 : 50,
                                            pointerEvents: isCurrent ? "auto" : "none"
                                        }}
                                        transition={{ duration: 0.6, ease: "circOut" }}
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
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: isCurrent ? 1 : 0, scale: isCurrent ? 1 : 0.9 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
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

                <motion.div
                    className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50"
                    animate={{ opacity: activeIndex === items.length - 1 ? 0 : 1 }}
                    aria-hidden
                >
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <div className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
                </motion.div>
            </div>
        </div>
    );
}
