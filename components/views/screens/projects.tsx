"use client";

import {useState, useEffect, useCallback, useRef} from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { useSectionProgress } from "@/hooks/use-section-progress";
import { Github, Layers, Smartphone, Cpu, ChevronLeft, ChevronRight, Gamepad2, Truck, Type, MessageSquare, Search, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image, {StaticImageData} from "next/image";
import {useSwipe} from "@/hooks/use-swipe";
import {SECTIONS} from "@/lib/site";

import project1 from "@/public/banners/reinforcement_learning_agent_simulation.webp";
import project2 from "@/public/banners/cpu_architecture_schematic.webp";
import project3 from "@/public/banners/3d_platformer_game_level.webp";
import project4 from "@/public/banners/robotics_maze_solver.webp";
import project5 from "@/public/banners/arabic_calligraphy_ai_detection.webp";
import project6 from "@/public/banners/discord_interface_clone.webp";
import project7 from "@/public/banners/cross_platform_mobile_app_dev.webp";
import project8 from "@/public/banners/search_engine_architecture.webp";
import project9 from "@/public/banners/creative_writing_platform.webp";

interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    image: StaticImageData;
    icon: React.ReactNode;
    tags: string[];
    color: string;
    source?: string;
}

const projects: Project[] = [
    {
        id: "pearl",
        title: "PEARL",
        category: "AI & Reinforcement Learning",
        description: "A benchmarking framework for evaluating RL agents using explainability methods (SHAP, LIME, LMUT). Built in collaboration with Ericsson to improve trust in autonomous systems.",
        image: project1,
        icon: <Cpu className="h-6 w-6" />,
        tags: ["Python", "C++", "ImGui", "Reinforcement Learning"],
        color: "from-blue-500/20 to-purple-500/20",
        source: "https://github.com/P-E-A-R-L"
    },
    {
        id: "epic",
        title: "EPIC CPU",
        category: "Chip Design",
        description: "Designed a 5-stage pipelined CPU executing 32+ instructions. Created a custom assembly language and compiler to run complex operations on the architecture.",
        image: project2,
        icon: <Layers className="h-6 w-6" />,
        tags: ["Verilog", "Java", "Assembly", "ModelSim"],
        color: "from-yellow-500/20 to-amber-500/20",
        source: "https://github.com/AbdoWise-z/the-epic-cpu"
    },
    {
        id: "paimon",
        title: "Paimon: No Way Home",
        category: "Game Engine Dev",
        description: "Custom 3D game engine built from scratch with C++ & OpenGL. Features Bloom, Forward Rendering, and illusion-based platforming mechanics.",
        image: project3,
        icon: <Gamepad2 className="h-6 w-6" />,
        tags: ["C++", "OpenGL", "Game Physics", "Graphics Programming"],
        color: "from-pink-500/20 to-rose-500/20",
        source: "https://github.com/AbdoWise-z/Paimon-No-Way-Home"
    },
    {
        id: "truck-chan",
        title: "Truck-Chan",
        category: "Embedded Systems",
        description: "Autonomous maze-solving robot. Won 1st place in departmental maze competition. Features custom vision application and swift motor control algorithms.",
        image: project4,
        icon: <Truck className="h-6 w-6" />,
        tags: ["Embedded C", "Java", "Kotlin", "Robotics"],
        color: "from-green-500/20 to-emerald-500/20",
        source: "https://github.com/Truck-chan"
    },
    {
        id: "arabic-font",
        title: "Font Detector",
        category: "AI & Computer Vision",
        description: "AI pipeline detecting Arabic font types with 99.8% accuracy. Handles various scales and rotations, securing 1st place in department rankings.",
        image: project5,
        icon: <Type className="h-6 w-6" />,
        tags: ["Python", "OpenCV", "Deep Learning", "Jupyter"],
        color: "from-orange-500/20 to-red-500/20",
        source: "https://github.com/AbdoWise-z/Arabic-Font-Type-Detector"
    },
    {
        id: "discordo",
        title: "Discordo",
        category: "Fullstack Web",
        description: "Complete Discord clone featuring real-time voice/video chat, server management, and live messaging using modern web sockets.",
        image: project6,
        icon: <MessageSquare className="h-6 w-6" />,
        tags: ["TypeScript", "Next.js", "Prisma", "MongoDB"],
        color: "from-indigo-500/20 to-blue-500/20",
        source: "https://github.com/AbdoWise-z/discordo"
    },
    {
        id: "gigachat",
        title: "GigaChat",
        category: "Cross-Platform Mobile",
        description: "Twitter (X) clone built with Flutter. Led an Agile team of 5 to deliver real-time feeds, trending topics, and messaging in under 3 months.",
        image: project7,
        icon: <Smartphone className="h-6 w-6" />,
        tags: ["Flutter", "Restful APIs", "Agile", "Mobile"],
        color: "from-cyan-500/20 to-sky-500/20",
        source: "https://github.com/AbdoWise-z/GigaChat-Cross-platform"
    },
    {
        id: "irminsul",
        title: "Irminsul Search",
        category: "Search Engine",
        description: "High-performance search engine with sub-50ms response time. Implemented custom crawling, indexing, and ranking algorithms.",
        image: project8,
        icon: <Search className="h-6 w-6" />,
        tags: ["Java", "Spring Boot", "MongoDB", "Flutter"],
        color: "from-emerald-500/20 to-teal-500/20",
        source: "https://github.com/AbdoWise-z/Irminsul-ui"
    },
    {
        id: "promptopia",
        title: "Promptopia",
        category: "Fullstack Web",
        description: "Platform for sharing and discovering AI prompts. Built in 4 days featuring user profiles, search, and tag management.",
        image: project9,
        icon: <Edit3 className="h-6 w-6" />,
        tags: ["JavaScript", "Next.js", "React", "MongoDB"],
        color: "from-violet-500/20 to-purple-500/20",
        source: "https://github.com/AbdoWise-z/Promptopia"
    }
];

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 1.1,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
    })
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Full-screen project slideshow with arrow keys, swipe, and on-screen controls. */
export default function ProjectsPage() {
    const [[page, direction], setPage] = useState([0, 0]);

    // Positive modulo so paging below zero still wraps in the right direction.
    const projectIndex = ((page % projects.length) + projects.length) % projects.length;
    const currentProject = projects[projectIndex];

    const paginate = useCallback((newDirection: number) => {
        setPage(([p]) => [p + newDirection, newDirection]);
    }, []);

    const goTo = (index: number) => {
        setPage([index, index > projectIndex ? 1 : -1]);
    };

    const ref = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.5 });

    // Entry: slides over the timeline with a rounded leading edge that flattens as it pins.
    const { scrollYProgress: entry } = useScroll({ target: wrapRef, offset: ["start end", "start start"] });
    // Exit: recedes while the contact sheet covers it.
    const cover = useSectionProgress(SECTIONS.contact, ["start end", "start start"]);
    const borderRadius = useTransform([entry, cover], ([e, c]: number[]) => Math.max((1 - e) * 44, c * 32));
    const scale = useTransform(cover, [0, 1], [1, 0.94]);
    const filter = useTransform(cover, (c) => `brightness(${(1 - c * 0.7).toFixed(3)})`);
    // Dissolve as the contact sheet rises, so nothing bleeds through its translucent panel.
    const opacity = useTransform(cover, [0, 0.15, 0.65], [1, 1, 0]);

    // Arrow keys only drive the slideshow while it is on screen.
    useEffect(() => {
        if (!inView) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") paginate(1);
            else if (event.key === "ArrowLeft") paginate(-1);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [inView, paginate]);

    useSwipe(ref, {
        onSwipeLeft: () => paginate(1),
        onSwipeRight: () => paginate(-1),
    });

    return (
        <div ref={wrapRef} id="projects-stack" className="relative z-30 -mt-[100vh] h-[200vh] w-full">
            <motion.section
                ref={ref}
                id={SECTIONS.projects}
                aria-label="Projects"
                aria-roledescription="carousel"
                className="sticky top-0 h-screen w-full overflow-hidden bg-black text-white"
                style={{ borderRadius, scale, filter, opacity }}
            >
                <p className="section-gutter absolute left-0 top-24 z-20 text-xs font-semibold uppercase tracking-[0.3em] text-white/60 md:top-8" aria-hidden>
                    03 · Projects
                </p>
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.4 },
                        }}
                        className="absolute inset-0 h-full w-full"
                        aria-roledescription="slide"
                        aria-label={`${projectIndex + 1} of ${projects.length}: ${currentProject.title}`}
                    >
                        <div className="absolute inset-0 z-0" aria-hidden>
                            <Image
                                src={currentProject.image}
                                alt=""
                                fill
                                sizes="100vw"
                                className="object-cover"
                            />
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-overlay", currentProject.color)} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
                        </div>

                        <div className="section-gutter pointer-events-none absolute inset-0 z-10 flex flex-col justify-center pb-24 pt-24 md:pt-0">
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="pointer-events-auto mx-auto w-full max-w-6xl space-y-6 md:space-y-8"
                            >
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-2xl">
                                        {currentProject.icon}
                                    </div>
                                    <Badge className="border-white/10 bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20">
                                        {currentProject.category}
                                    </Badge>
                                </div>

                                <h3 className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-7xl lg:text-8xl">
                                    {currentProject.title}
                                </h3>

                                <p className="max-w-2xl text-base leading-relaxed text-gray-300 md:text-xl">
                                    {currentProject.description}
                                </p>

                                <ul className="flex flex-wrap gap-2 md:gap-3" aria-label="Technologies">
                                    {currentProject.tags.map((tag) => (
                                        <li
                                            key={tag}
                                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 md:px-4 md:py-2 md:text-sm"
                                        >
                                            {tag}
                                        </li>
                                    ))}
                                </ul>

                                {currentProject.source && (
                                    <div className="flex gap-4 pt-2">
                                        <a
                                            href={currentProject.source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-12 select-none items-center rounded-full border border-white/20 px-6 text-white transition-colors hover:bg-white/10"
                                        >
                                            <Github className="mr-2 h-5 w-5" /> Source
                                        </a>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Controls: previous, dots, next, counter */}
                <div className="section-gutter absolute inset-x-0 bottom-6 z-20 md:bottom-10">
                    <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Previous project"
                            className="h-11 w-11 rounded-full border border-white/10 bg-black/30 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                            onClick={() => paginate(-1)}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>

                        <div className="flex items-center gap-2" role="tablist" aria-label="Choose project">
                            {projects.map((project, index) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={index === projectIndex}
                                    aria-label={project.title}
                                    onClick={() => goTo(index)}
                                    className={cn(
                                        "h-2.5 rounded-full transition-all duration-300",
                                        index === projectIndex ? "w-8 bg-white" : "w-2.5 bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Next project"
                            className="h-11 w-11 rounded-full border border-white/10 bg-black/30 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                            onClick={() => paginate(1)}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>

                        <span className="ml-auto text-xs tabular-nums text-white/50" aria-live="polite">
                            {pad(projectIndex + 1)} / {pad(projects.length)}
                        </span>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
