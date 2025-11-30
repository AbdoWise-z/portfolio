"use client";

import {useState, useEffect, useCallback, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Layers, Smartphone, Cpu, ChevronLeft, ChevronRight, Gamepad2, Truck, Type, MessageSquare, Search, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import project1 from "@/public/banners/reinforcement_learning_agent_simulation.png";
import project2 from "@/public/banners/cpu_architecture_schematic.png";
import project3 from "@/public/banners/3d_platformer_game_level.png";
import project4 from "@/public/banners/robotics_maze_solver.png";
import project5 from "@/public/banners/arabic_calligraphy_ai_detection.png";
import project6 from "@/public/banners/discord_interface_clone.png";
import project7 from "@/public/banners/cross_platform_mobile_app_dev.png";
import project8 from "@/public/banners/search_engine_architecture.png";
import project9 from "@/public/banners/creative_writing_platform.png";

import Image, {StaticImageData} from "next/image";
import SecretIndicatorFade from "@/components/views/secret-indicator-fade";
import {useSwipe} from "@/hooks/use-swipe";


interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string | StaticImageData;
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
        icon: <Cpu className="w-6 h-6" />,
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
        icon: <Layers className="w-6 h-6" />,
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
        icon: <Gamepad2 className="w-6 h-6" />,
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
        icon: <Truck className="w-6 h-6" />,
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
        icon: <Type className="w-6 h-6" />,
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
        icon: <MessageSquare className="w-6 h-6" />,
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
        icon: <Smartphone className="w-6 h-6" />,
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
        icon: <Search className="w-6 h-6" />,
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
        icon: <Edit3 className="w-6 h-6" />,
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
        filter: "blur(10px)"
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)"
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
        filter: "blur(10px)"
    })
};

export default function ProjectsPage() {
    const [[page, direction], setPage] = useState([0, 0]);

    // Ensure positive modulo for infinite wrapping or safe clamping
    const projectIndex = Math.abs(page % projects.length);
    const currentProject = projects[projectIndex];

    const paginate = useCallback((newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    }, [page]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === "ArrowRight") {
            paginate(1);
        } else if (event.key === "ArrowLeft") {
            paginate(-1);
        } else if (event.key === "Escape") {
            // Navigate back or handle escape
        }
    }, [paginate]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const ref = useRef<HTMLDivElement>(null);
    useSwipe(
        ref, {
        onSwipeLeft: () => paginate(1),
        onSwipeRight: () => paginate(-1),
    });

    if (!currentProject) return null;

    return (
        <SecretIndicatorFade className={"relative w-full h-[120vh]"}>
            <div ref={ref} className="sticky top-0 w-full h-screen overflow-hidden bg-black text-white" id={"PROJECTS_SECTION"}>

                {/* Slideshow */}
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
                            filter: { duration: 0.4 }
                        }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={currentProject.image}
                                alt={currentProject.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlays */}
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-overlay", currentProject.color)} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                        </div>

                        {/* Content Container */}
                        <div className="absolute inset-0 z-10 flex flex-col justify-center px-12 md:px-32 max-w-7xl mx-auto pointer-events-none">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="space-y-8 pointer-events-auto"
                            >
                                {/* Category & Icon */}
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white shadow-2xl">
                                        {currentProject.icon}
                                    </div>
                                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/10 px-4 py-1.5 text-sm backdrop-blur-md">
                                        {currentProject.category}
                                    </Badge>
                                </div>

                                {/* Title */}
                                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
                                    {currentProject.title}
                                </h1>

                                {/* Description */}
                                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                                    {currentProject.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-3">
                                    {currentProject.tags.map((tag, i) => (
                                        <span
                                            key={tag}
                                            className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/80 backdrop-blur-sm"
                                        >
                     {tag}
                   </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    {/*<Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 rounded-full font-semibold text-base h-12">*/}
                                    {/*    View Case Study*/}
                                    {/*</Button>*/}
                                    {/*<Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full h-12 px-6">*/}
                                    {/*    <Github className="mr-2 w-5 h-5" /> Source*/}
                                    {/*</Button>*/}

                                    {
                                        currentProject.source && <a
                                            href={currentProject.source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={
                                                "border border-input bg-background hover:bg-accent hover:text-accent-foreground" +
                                                "border-white/20 text-white hover:bg-white/10 rounded-full h-12 px-6 flex content-center items-center select-none"
                                            }
                                        >
                                            <Github className="mr-2 w-5 h-5" /> Source
                                        </a>
                                    }
                                </div>
                            </motion.div>
                        </div>

                    </motion.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                <div className="absolute inset-y-0 left-48 w-24 z-40 items-center justify-center group hidden md:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-14 h-14 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md text-white/50 hover:text-white border border-transparent hover:border-white/20 transition-all duration-300"
                        onClick={() => paginate(-1)}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                </div>

                <div className="absolute inset-y-0 right-48 w-24 z-40 items-center justify-center group hidden md:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-14 h-14 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md text-white/50 hover:text-white border border-transparent hover:border-white/20 transition-all duration-300"
                        onClick={() => paginate(1)}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>

                {/* Bottom Progress Indicators */}
                <div className="absolute bottom-12 left-0 right-0 z-50 flex justify-center gap-3">
                    {projects.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                const newDirection = index > projectIndex ? 1 : -1;
                                setPage([index, newDirection]);
                            }}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                                index === projectIndex
                                    ? "bg-white w-8"
                                    : "bg-white/20 hover:bg-white/40"
                            )}
                        />
                    ))}
                </div>

            </div>
        </SecretIndicatorFade>
    );
}