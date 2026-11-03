import React from 'react';
import {Timeline, TimelineItemData} from "@/components/views/time-line";
import {Briefcase, CircuitBoard, GraduationCap, Laptop, Shield, Trophy} from "lucide-react";
import {SECTIONS} from "@/lib/site";

import bgCyber from "@/public/banners/abstract_geometric_cyber_aesthetic_background.webp";
import bgOffice from "@/public/banners/modern_minimal_office_workspace_background.webp";
import bgFluid from "@/public/banners/creative_fluid_gradient_background.webp";
import bgCircuit from "@/public/banners/futuristic_circuit_board_background.webp";

const Tag = ({children}: {children: React.ReactNode}) => (
    <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">{children}</span>
);

const timelineData: TimelineItemData[] = [
    {
        id: "education-master",
        type: "Major",
        title: "M.Sc. in Artificial Intelligence",
        subtitle: "Università degli Studi di Milano-Bicocca",
        description: "Specializing in Artificial Intelligence for Science and Technology. Focusing on advanced machine learning architectures and their application in scientific domains.",
        date: "Oct 2025 – Present",
        icon: <GraduationCap className="h-6 w-6" />,
        background: bgCyber,
        widget: (
            <div className="flex items-center gap-2 text-sm text-white/80">
                <span className="font-semibold">Status:</span>
                <span className="rounded border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-xs text-green-400">In Progress</span>
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
        icon: <GraduationCap className="h-6 w-6" />,
        background: bgOffice,
        certificateUrl: "https://drive.google.com/file/d/1oG5ux8oD1ZkFj_x35hcfE2rLuEcc3RKx/view?usp=sharing",
        widget: (
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
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
        date: "Sep 2024 – Dec 2024",
        icon: <Briefcase className="h-6 w-6" />,
        background: bgCircuit,
        certificateUrl: "https://drive.google.com/file/d/1YaMegP1iBODK0qmDokjOPm_8blHV414V/view?usp=sharing",
        widget: (
            <div className="flex flex-wrap gap-2">
                <Tag>R&D</Tag>
                <Tag>Profiling Tools</Tag>
                <Tag>System Optimization</Tag>
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
        icon: <Trophy className="h-6 w-6" />,
        background: bgFluid,
        certificateUrl: "https://drive.google.com/file/d/1IugZwRHJt7UMvncCf4AXls_BDQ4ftINv/view?usp=sharing",
        widget: (
            <div className="flex items-center gap-4 p-2">
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">1st</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Maze Solver</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">3rd</div>
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
        icon: <Laptop className="h-6 w-6" />,
        background: bgOffice,
        certificateUrl: "https://drive.google.com/file/d/1IuKFmnVtWqV0gP1PFSP6b9ZBz3zR6Ggf/view?usp=sharing"
    },
    {
        id: "course-cybersec",
        type: "Minor",
        title: "Cybersecurity Certification",
        subtitle: "Cairo University",
        description: "Intensive summer course covering cryptography, penetration testing, malware analysis, and reverse engineering.",
        date: "July 2023 – Sep 2023",
        icon: <Shield className="h-6 w-6" />,
        background: bgCyber,
        certificateUrl: "https://drive.google.com/file/d/1IqPiM7XrMclm1gA1NuW77hna6EOZv94s/view?usp=sharing",
    },
    {
        id: "course-embedded",
        type: "Minor",
        title: "Embedded Systems Training",
        subtitle: "IEEE",
        description: "Deep dive into AVR microcontrollers and embedded system architecture.",
        date: "June 2023 – Aug 2023",
        icon: <CircuitBoard className="h-6 w-6" />,
        background: bgCircuit,
    }
];

const TimelinePage = () => {
    return (
        <section id={SECTIONS.timeline} aria-labelledby="timeline-heading" className="relative z-20">
            <h2 id="timeline-heading" className="sr-only">Timeline</h2>
            <Timeline items={timelineData} coveredBy="projects-stack" />
        </section>
    );
};

export default TimelinePage;
