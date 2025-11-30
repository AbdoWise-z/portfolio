"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Circle, Briefcase, GraduationCap, Code, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {StaticImageData} from "next/image";

// --- Types ---
export type TimelinePointType = "Major" | "Minor";

export interface TimelineItemData {
    id: string;
    type: TimelinePointType;
    title: string;
    subtitle?: string;
    description: string;
    date: string;
    icon: React.ReactNode;
    background: string | StaticImageData;
    color: string; // Hex or tailwind class for accents
    widget?: React.ReactNode; // The react widget area
    certificateUrl?: string; // Link to certificate
}

// --- Mock Data ---
// We will use the generated images here.
// Assuming the tool returns paths like attached_assets/generated_images/...
// I will use placeholders first and update them if I can, or just use the import alias if I knew the filenames.
// Since I don't know the filenames yet, I will pass them as props or update this file after generation.
// For now, I'll assume standard names or use CSS gradients as fallbacks.

// --- Components ---

const TimelineWidgetDisplay = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-lg mt-4 w-full max-w-md overflow-hidden">
        {children}
    </div>
);

const ExampleWidget1 = () => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Skill Proficiency</span>
            <span className="text-xs text-muted-foreground">85%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "85%" }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-primary"
            />
        </div>
        <div className="flex gap-2 mt-2">
            <Badge variant="outline">React</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Node.js</Badge>
        </div>
    </div>
);

const ExampleWidget2 = () => (
    <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm">Recent Achievement</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                <Star className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-medium">Employee of the Month</p>
                <p className="text-xs text-muted-foreground">March 2024</p>
            </div>
        </CardContent>
    </Card>
);

const ExampleWidget3 = () => (
    <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="w-full">View Project</Button>
        <Button size="sm" className="w-full">Github Repo</Button>
    </div>
);


// --- Main Timeline Component ---

interface TimelineProps {
    items: TimelineItemData[];
}

export function Timeline({ items }: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Track scroll progress of the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Smooth out the progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Update active index based on scroll
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Calculate which item is currently "active" based on scroll percentage
            // We divide the scroll space (0-1) into N segments
            const itemsCount = items.length;
            const step = 1 / itemsCount;
            const index = Math.min(
                Math.floor(latest / step),
                itemsCount - 1
            );
            setActiveIndex(index);
        });
        return () => unsubscribe();
    }, [scrollYProgress, items.length]);

    // Derived transformations for background
    // We can't easily map specific images to a continuous range dynamically with simple output range unless we hardcode.
    // Instead, we'll fade images in/out based on activeIndex in the render loop.

    return (
        <div ref={containerRef} className="relative" style={{ height: `${items.length * 100}vh` }}>

            {/* Sticky Viewport */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">

                {/* Background Layer */}
                <div className="absolute inset-0">
                    {items.map((item, index) => (
                        <motion.div
                            key={`bg-${item.id}`}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${item.background})`,
                                zIndex: index
                            }}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: (activeIndex - index) <= 1 && (activeIndex - index) >= 0 ? 1 : 0,
                                scale: activeIndex === index ? 1.05 : 1
                            }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                            {/* Overlay for readability */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                        </motion.div>
                    ))}
                </div>

                {/* Content Layer */}
                <div className="relative z-10 flex h-full w-full max-w-7xl mx-auto pl-4 pr-6 md:pl-48 md:pr-12 items-center">

                    {/* Left: Progress Line & Indicators */}
                    <div className="relative w-8 md:w-32 flex flex-col items-center justify-center mr-8 md:mr-16 shrink-0" style={{ height: "60vh" }}>
                        {/* The Line */}
                        <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="w-full bg-primary origin-top"
                                style={{ height: "100%", scaleY: smoothProgress }}
                            />
                        </div>

                        {/* The Points */}
                        <div className="flex flex-col justify-between h-full w-full items-center py-10">
                            {items.map((item, index) => {
                                const isMajor = item.type === "Major";
                                const isActive = index <= activeIndex;
                                const isCurrent = index === activeIndex;

                                return (
                                    <motion.div
                                        key={`point-${item.id}`}
                                        className="relative flex items-center justify-center z-10"
                                        initial={false}
                                        animate={{
                                            scale: isCurrent ? 1.2 : 1,
                                            opacity: isActive ? 1 : 0.5
                                        }}
                                    >
                                        {/* Dot */}
                                        <div
                                            className={cn(
                                                "rounded-full border-2 transition-colors duration-300 flex items-center justify-center",
                                                isMajor ? "w-6 h-6" : "w-3 h-3",
                                                isActive ? "border-primary bg-primary" : "border-white/40 bg-transparent",
                                                isCurrent && "ring-4 ring-primary/20"
                                            )}
                                        >
                                            {isMajor && isActive && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </div>

                                        {/* Label (visible on hover or always?) - Let's keep it clean for now, maybe date? */}
                                        <div className="absolute right-8 text-right w-32 pr-4 pointer-events-none hidden md:visible">
                        <span className={cn(
                            "text-xs font-mono transition-colors duration-300",
                            isCurrent ? "text-white font-bold" : "text-white/50"
                        )}>
                          {item.date}
                        </span>
                                        </div>

                                        {/* Pulsing Effect for Current */}
                                        {isCurrent && (
                                            <div className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75" />
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right: Content Area */}
                    <div className="flex-1 h-[60vh] relative perspective-[1000px]">
                        {items.map((item, index) => (
                            <motion.div
                                key={`content-${item.id}`}
                                className="absolute inset-0 flex flex-col justify-center"
                                initial={{ opacity: 0, y: 50, rotateX: -10 }}
                                animate={{
                                    opacity: activeIndex === index ? 1 : 0,
                                    y: activeIndex === index ? 0 : activeIndex > index ? -50 : 50,
                                    rotateX: activeIndex === index ? 0 : activeIndex > index ? 10 : -10,
                                    pointerEvents: activeIndex === index ? "auto" : "none"
                                }}
                                transition={{ duration: 0.6, ease: "circOut" }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={cn("p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white")}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h2 className={cn(
                                            "font-bold text-white leading-tight break-words hyphens-auto",
                                            item.type === "Major" ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
                                        )}>
                                            {item.title}
                                        </h2>
                                        {item.subtitle && (
                                            <h3 className="text-xl text-primary font-medium mt-1">{item.subtitle}</h3>
                                        )}
                                    </div>
                                </div>

                                <p className="text-lg text-white/80 max-w-2xl leading-relaxed mb-8">
                                    {item.description}
                                </p>

                                {/* Widget Area */}
                                {(item.widget || item.certificateUrl) && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{
                                            opacity: activeIndex === index ? 1 : 0,
                                            scale: activeIndex === index ? 1 : 0.9
                                        }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
                                    >
                                        <TimelineWidgetDisplay>
                                            {item.widget}
                                            {item.certificateUrl && (
                                                <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                                                    <span className="text-xs text-muted-foreground">Certificate:</span>
                                                    <a
                                                        href={item.certificateUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors"
                                                    >
                                                        View →
                                                    </a>
                                                </div>
                                            )}
                                        </TimelineWidgetDisplay>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                </div>

                {/* Scroll Hint */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
                    animate={{ opacity: activeIndex === items.length - 1 ? 0 : 1 }}
                >
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
                </motion.div>

            </div>
        </div>
    );
}
