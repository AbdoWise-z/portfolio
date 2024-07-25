"use client";

import React from 'react';
import SecretContent from "@/components/views/secret-content";
import {useScroll, motion, useTransform, useMotionTemplate, useMotionValueEvent} from "framer-motion";

const AboutMe = () => {
  const scroll = useScroll();

  const text1_TV = useTransform(scroll.scrollYProgress , [0 , 1] , [100 , 0]);

  const bgPositionT1 = useMotionTemplate`${text1_TV}% 0%`;

  useMotionValueEvent(scroll.scrollY, "change", (latest) => {
    console.log("Page scroll: ", latest)
  });

  return (
    <div className="relative h-[95vh] flex flex-col content-center items-center justify-center">
      <div className="flex flex-col w-[65%] h-fit content-start items-start">
        <h1 className={"text-cyan-100 font-bold text-center mb-10"}> About Me </h1>
        <motion.div
          style={{
            opacity: 0.8,
          }}
          whileInView={{
            opacity: 1,
          }}
        >
          <div className={"text-6xl text-cyan-100 font-bold"}>
            {"I'm a "}
            <SecretContent className={"inline-block"} focusMaskWidth={240} secret={(
              <h1 className={"text-black inline-block"}>{"Just one more"}</h1>
            )}>
              <h1 className={"text-cyan-800 inline-block"}>{"4th-year senior"}</h1>
            </SecretContent>
            {" student at "}
            <SecretContent className={"inline-block"} focusMaskWidth={240} secret={(
              <h1 className={"text-red-800 inline-block"}>{"Hell On Earth"}</h1>
            )}>
              <h1 className={"text-cyan-800 inline-block"}>{"Cairo University"}</h1>
            </SecretContent>
            {". I'm a passionate developer with Knowledge in Fields such as "}
            <h1 className={"text-orange-400 inline-block"}>{"FullStack Development"}</h1>
            {", "}
            <h1 className={"text-orange-500 inline-block"}>{"AI"}</h1>
            {", "}
            <h1 className={"text-orange-600 inline-block"}>{"Cross-platform Development"}</h1>
            {", "}
            <h1 className={"text-orange-700 inline-block"}>{"Logic design"}</h1>
            {", "}
            {"and "}
            <h1 className={"text-orange-800 inline-block"}>{"Circuits design"}</h1>
            {". I focus on creating "}
            <SecretContent className={"inline-block"} focusMaskWidth={240} secret={(
              <h1 className={"text-yellow-500 inline-block "}><s style={{
                textDecorationThickness: "10px",
                textDecorationColor: "gold",
              }}>{"high-quality"}</s></h1>
            )}>
              <h1 className={"text-yellow-500 inline-block"}>{"high-quality"}</h1>
            </SecretContent>
            {" projects that can change the world."}
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AboutMe;