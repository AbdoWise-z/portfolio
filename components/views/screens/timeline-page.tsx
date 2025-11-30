import React from 'react';
import {Timeline, TimelineItemData} from "@/components/views/time-line";
import {Briefcase, CircuitBoard, GraduationCap, Laptop, Shield, Trophy} from "lucide-react";


import bg1 from "@/public/banners/abstract_geometric_cyber_aesthetic_background.png";
import bg2 from "@/public/banners/modern_minimal_office_workspace_background.png";
import bg3 from "@/public/banners/creative_fluid_gradient_background.png";
import bg4 from "@/public/banners/futuristic_circuit_board_background.png";
import SecretIndicatorFade from "@/components/views/secret-indicator-fade";


const timelineData: TimelineItemData[] = [
    {
        id: "education-master",
        type: "Major",
        title: "M.Sc. in Artificial Intelligence",
        subtitle: "Università degli Studi di Milano-Bicocca",
        description: "Specializing in Artificial Intelligence for Science and Technology. Focusing on advanced machine learning architectures and their application in scientific domains.",
        date: "Oct 2025 – Present",
        icon: <GraduationCap className="w-6 h-6" />,
        background: bg1.src,
        color: "#3b82f6",
        widget: (
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/80">
                    <span className="font-semibold">Status:</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs border border-green-500/30">In Progress</span>
                </div>
            </div>
        )
    },
    {
        id: "education-bachelor",
        type: "Major",
        title: "B.Sc. Computer Engineering",
        subtitle: "Cairo University",
        description: "Graduated with Excellence (GPA 3.9). Built a strong foundation in software engineering, embedded systems, and computer architecture.",
        date: "Oct 2020 – July 2025",
        icon: <GraduationCap className="w-6 h-6" />,
        background: bg2.src,
        color: "#f59e0b",
        certificateUrl: "https://drive.google.com/file/d/1oG5ux8oD1ZkFj_x35hcfE2rLuEcc3RKx/view?usp=sharing",
        widget: (
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <Trophy className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">Excellence with Honors</p>
                    <p className="text-xs text-muted-foreground">GPA 3.9 / 4.0</p>
                </div>
            </div>
        )
    },
    {
        id: "intern-siemens",
        type: "Major",
        title: "Software R&D Intern",
        subtitle: "Siemens",
        description: "Worked in the HAV team developing critical debugging and profiling tools for threading and ethernet communications. Enhanced system reliability and diagnostic capabilities.",
        date: "Sep 2024 – Dec 2025",
        icon: <Briefcase className="w-6 h-6" />,
        background: bg4.src,
        color: "#06b6d4", // Cyan
        certificateUrl: "https://drive.google.com/file/d/1YaMegP1iBODK0qmDokjOPm_8blHV414V/view?usp=sharing",
        widget: (
            <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/20">R&D</span>
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/20">Profiling Tools</span>
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/20">System Optimization</span>
            </div>
        )
    },
    {
        id: "achievement-micromouse",
        type: "Minor",
        title: "1st Place Robotics Competition",
        subtitle: "Department Competition",
        description: "Led a team of 11 to victory in the Micro-Mouse maze solving competition. Also secured 3rd place in the line follower category.",
        date: "May 2024",
        icon: <Trophy className="w-6 h-6" />,
        background: bg3.src,
        color: "#eab308",
        certificateUrl: "https://drive.google.com/file/d/1IugZwRHJt7UMvncCf4AXls_BDQ4ftINv/view?usp=sharing",
        widget: (
            <div className="flex items-center gap-4 p-2">
                <div className="text-center">
                    <div className="text-2xl font-bold text-foreground text-yellow-500">1st</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Maze Solver</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                    <div className="text-2xl font-bold text-foreground text-orange-500">3rd</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Line Follower</div>
                </div>
            </div>
        )
    },
    {
        id: "intern-cargas",
        type: "Minor",
        title: "Software Developer Intern",
        subtitle: "Cargas Egypt",
        description: "Developed a shop application demo, gaining hands-on experience with enterprise software development workflows.",
        date: "July 2023",
        icon: <Laptop className="w-6 h-6" />,
        background: bg2, // Reusing office bg
        color: "#8b5cf6",
        certificateUrl: "https://drive.google.com/file/d/1IuKFmnVtWqV0gP1PFSP6b9ZBz3zR6Ggf/view?usp=sharing"
    },
    {
        id: "course-cybersec",
        type: "Minor",
        title: "Cybersecurity Certification",
        subtitle: "Cairo University",
        description: "Intensive summer course covering cryptography, penetration testing, malware analysis, and reverse engineering.",
        date: "July 2023 – Sep 2023",
        icon: <Shield className="w-6 h-6" />,
        background: bg1, // Reusing cyber bg
        color: "#ef4444",
        certificateUrl: "https://drive.google.com/file/d/1IqPiM7XrMclm1gA1NuW77hna6EOZv94s/view?usp=sharing",
    },
    {
        id: "course-embedded",
        type: "Minor",
        title: "Embedded Systems Training",
        subtitle: "IEEE",
        description: "Deep dive into AVR microcontrollers and embedded system architecture.",
        date: "June 2023 – Aug 2023",
        icon: <CircuitBoard className="w-6 h-6" />,
        background: bg4, // Reusing circuit bg
        color: "#10b981",
        //certificateUrl: "#",
    }
];

const TimelinePage = () => {
    return (
        <SecretIndicatorFade className={"w-full h-full"}>
            <div id={"TIMELINE_SECTION"}>
                {/*<div className="relative bg-background py-12 text-center z-20 border-t border-white/5">*/}
                {/*    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Journey & Achievements</h2>*/}
                {/*    <p className="text-muted-foreground max-w-xl mx-auto">Education, experience, and milestones</p>*/}
                {/*</div>*/}
                <Timeline items={timelineData} />
            </div>
        </SecretIndicatorFade>
    );
};

export default TimelinePage;