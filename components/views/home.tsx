"use client";

import React from "react";
import SecretContentIndicator from "@/components/views/secret-content-indicator";
import Landing from "@/components/views/screens/landing";
import LeftNav from "@/components/views/nav/left-nav";
import RightNav from "@/components/views/nav/right-nav";
import AboutMe from "@/components/views/screens/about_me";
import SpaceBackground from "@/components/views/space-background";
import Grain from "@/components/views/grain";
import ScrollProgress from "@/components/views/scroll-progress";
import Projects from "@/components/views/screens/projects";
import Skills from "@/components/views/screens/skills";
import Github from "@/components/views/screens/github";
import ContactMe from "@/components/views/screens/contact_me";
import TimelinePage from "@/components/views/screens/timeline-page";
import EasterEgg from "@/components/views/easter-egg";
import type { GithubData } from "@/lib/github";

/**
 * The sections stack like sheets: each one slides over the previous, which
 * stays pinned and recedes. Z-order therefore increases down the page, and the
 * fixed chrome (navs, lens) sits above all of them. The GitHub data is fetched
 * by the server page and handed in.
 */
export default function Home({ github }: { github: GithubData | null }) {
    return (
        <>
            <SpaceBackground/>
            <Grain/>
            <main id="main" className="relative">
                <Landing/>
                <AboutMe/>
                <TimelinePage/>
                <Projects/>
                <Skills/>
                <Github data={github}/>
                <ContactMe/>
            </main>

            <LeftNav/>
            <RightNav/>
            <ScrollProgress/>
            <SecretContentIndicator/>
            <EasterEgg/>
        </>
    );
}
