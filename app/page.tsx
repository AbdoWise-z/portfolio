"use client";

import React from "react";
import SecretContentIndicator from "@/components/views/secret-content-indicator";
import Landing from "@/components/views/screens/landing";
import LeftNav from "@/components/views/nav/left-nav";
import RightNav from "@/components/views/nav/right-nav";
import AboutMe from "@/components/views/screens/about_me";
import SpaceBackground from "@/components/views/space-background";
import Projects from "@/components/views/screens/projects";
import ContactMe from "@/components/views/screens/contact_me";
import TimelinePage from "@/components/views/screens/timeline-page";

export default function Home() {
    return (
        <>
            <SpaceBackground/>
            <main id="main" className="relative">
                <SecretContentIndicator/>
                <Landing/>
                <AboutMe/>
                <TimelinePage/>
                <Projects/>
                <ContactMe/>
            </main>

            <LeftNav/>
            <RightNav/>
        </>
    );
}
