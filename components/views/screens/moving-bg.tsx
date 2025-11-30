"use client";

import React, {useRef} from 'react';
import {motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform} from "framer-motion";

const MovingBg = () => {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = useScroll({
        target: ref,
        offset: ["start end", "end end"],
    });
    const tV = useTransform(scroll.scrollYProgress , [0 , 1] , [0 , 350]);
    const template = useMotionTemplate`-${tV}px`;

    return (
        <div className={"overflow-x-hidden p-0 m-0"}>
            <motion.div
                ref={ref}
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

            <div
                className={"flex absolute flex-col left-0 top-0 h-[200vh] z-[-100]"}
            >
                <div className={"h-[100vh]"}></div>

                <div ref={ref} className={"h-[100vh]"}>

                </div>
            </div>
        </div>
    );
};

export default MovingBg;