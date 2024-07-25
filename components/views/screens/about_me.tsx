"use client";

import React, {useRef} from 'react';
import SecretContent from "@/components/views/secret-content";
import {useScroll, motion , useMotionValueEvent} from "framer-motion";

const AboutMe = () => {
  const ref = useRef<HTMLDivElement>(null);
  // const scroll = useScroll({
  //   target: ref,
  //   offset: ["start end", "end end"],
  // });

  // useMotionValueEvent(scroll.scrollYProgress, "change", (latest) => {
  //   console.log("Page scroll: ", latest);
  // });


  return (
    <div className="relative flex flex-col content-center items-center justify-center" ref={ref}>
      <div className="absolute h-[100%] w-[100%] bg-neutral-900 z-[-1]"/>
      <div className="flex flex-col mb-20 mt-20 w-[65%] h-fit content-start items-start">
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
              <h1 className={"text-black inline"}>{"Just one more"}</h1>
            )}>
              <h1 className={"text-cyan-800 inline"}>{"4th-year senior"}</h1>
            </SecretContent>
            {" student at "}
            <SecretContent className={"inline-block"} focusMaskWidth={240} secret={(
              <h1 className={"text-red-800 inline"}>{"Hell On Earth"}</h1>
            )}>
              <h1 className={"text-cyan-800 inline"}>{"Cairo University"}</h1>
            </SecretContent>
            {". I'm a passionate developer with Knowledge in Fields such as "}
            <h1 className={"text-orange-400 inline"}>{"FullStack Development"}</h1>
            {", "}
            <h1 className={"text-orange-500 inline"}>{"AI"}</h1>
            {", "}
            <h1 className={"text-orange-600 inline"}>{"Cross-platform Development"}</h1>
            {", "}
            <h1 className={"text-orange-700 inline"}>{"Logic design"}</h1>
            {", "}
            {"and "}
            <h1 className={"text-orange-800 inline"}>{"Circuits design"}</h1>
            {". I focus on creating "}
            <SecretContent className={"inline-block"} focusMaskWidth={240} secret={(
              <h1 className={"text-yellow-500 inline"}><s style={{
                textDecorationThickness: "10px",
                textDecorationColor: "gold",
              }}>{"high-quality"}</s></h1>
            )}>
              <h1 className={"text-yellow-500 inline"}>{"high-quality"}</h1>
            </SecretContent>
            {" projects that can change the world."}
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AboutMe;