"use client";

import SecretContent from "@/components/views/secret-content";
import SecretContentIndicator from "@/components/views/secret-content-indicator";
import React, {useEffect} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import Landing from "@/components/views/screens/landing";
import LeftNav from "@/components/views/nav/left-nav";
import RightNav from "@/components/views/nav/right-nav";
import AboutMe from "@/components/views/screens/about_me";
import MovingBg from "@/components/views/screens/moving-bg";
import Projects from "@/components/views/screens/projects";
import ContactMe from "@/components/views/screens/contact_me";
import TimelinePage from "@/components/views/screens/timeline-page";

export default function Home() {

    // useEffect(() => {
    //     let timeout: NodeJS.Timeout | null = null;
    //
    //     const onScroll = () => {
    //         if (timeout) clearTimeout(timeout);
    //
    //         timeout = setTimeout(() => {
    //             // Height of one page (your project slideshow takes full height)
    //             const pageHeight = window.innerHeight;
    //
    //             // Current scroll position
    //             const scrollY = window.scrollY;
    //
    //             // Nearest aligned page boundary
    //             if (Math.abs(scrollY / pageHeight - Math.round(scrollY / pageHeight)) < 0.1) {
    //                 const target = Math.round(scrollY / pageHeight) * pageHeight;
    //
    //                 window.scrollTo({
    //                     top: target,
    //                     behavior: "smooth"
    //                 });
    //             }
    //         }, 250); // 0.25 seconds
    //     };
    //
    //     window.addEventListener("scroll", onScroll, { passive: true });
    //
    //     return () => window.removeEventListener("scroll", onScroll);
    // }, []);


    return (
        <>
            <div className={"relative"}>
                <MovingBg/>
                <SecretContentIndicator/>
                <Landing/>
                <AboutMe/>
                <TimelinePage/>
                <Projects/>
                <ContactMe/>
            </div>

            <LeftNav/>
            <RightNav/>
        </>

    );
}
