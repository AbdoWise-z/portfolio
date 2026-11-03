"use client";

import React, {useRef} from 'react';
import {motion, useMotionTemplate, useScroll, useTransform} from "framer-motion";

/** Fixed landing background that parallax-scrolls over the first two viewports. */
const MovingBg = () => {
    // Invisible scroll target: the second viewport of the page.
    const scrollTargetRef = useRef<HTMLDivElement>(null);
    const scroll = useScroll({
        target: scrollTargetRef,
        offset: ["start end", "end end"],
    });
    const tV = useTransform(scroll.scrollYProgress , [0 , 1] , [0 , 350]);
    const template = useMotionTemplate`-${tV}px`;

    return (
        <div className={"overflow-x-hidden p-0 m-0"} aria-hidden>
            <motion.div
                className={"block left-0 top-0 h-[200vh] w-[100vw] z-[-20]"}
                style={{
                    backgroundImage: `url(/firefly-generated-landing-bg.jpg)`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    position: "fixed",
                    backgroundPositionY: template,
                    backgroundPositionX: "50%",
                }}
            />

            <div className={"flex absolute flex-col left-0 top-0 h-[200vh] z-[-100]"}>
                <div className={"h-[100vh]"}/>
                <div ref={scrollTargetRef} className={"h-[100vh]"}/>
            </div>
        </div>
    );
};

export default MovingBg;
