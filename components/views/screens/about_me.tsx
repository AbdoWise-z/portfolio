"use client";

import React from 'react';
import SecretContent from "@/components/views/secret-content";
import { motion } from "framer-motion";

const AboutMe = () => {
  return (
      <div className="relative flex flex-col items-center justify-center">
          {/* Background */}
          <div className="absolute h-full w-full bg-neutral-900 z-[-1]" />

          <div className="flex flex-col mb-20 mt-20 w-[65%] h-fit items-start select-none">
              <h1 className="text-cyan-100 font-bold text-center mb-10 pt-10" id="ABOUT_ME_SECTION">
                  About Me
              </h1>

              <motion.div style={{ opacity: 0.8 }} whileInView={{ opacity: 1 }}>
                  <div className="text-xl md:text-4xl lg:text-5xl xl:text-6xl text-cyan-100 font-bold">
                      {"Hi! I'm "}
                      <SecretContent
                          className="inline-block"
                          focusMaskWidth={240}
                          secret={<h1 className="text-black inline">{"The one who suffers"}</h1>}
                      >
                          <h1 className="text-cyan-800 inline">{"Abdelrahman Mahmoud"}</h1>
                      </SecretContent>
                      {", a "}
                      <SecretContent
                          className="inline-block"
                          focusMaskWidth={240}
                          secret={<h1 className="text-red-800 inline">{"mad scientist of AI"}</h1>}
                      >
                          <h1 className="text-cyan-800 inline">{"master’s student in AI"}</h1>
                      </SecretContent>
                      {" from "}
                      <h1 className="text-orange-400 inline">{"Milano-Bicocca"}</h1>
                      {". I once built "}
                      <SecretContent
                          className="inline-block"
                          focusMaskWidth={240}
                          secret={<h1 className="text-yellow-500 inline">{"a robot army"}</h1>}
                      >
                          <h1 className="text-orange-500 inline">{"a maze-solving robot"}</h1>
                      </SecretContent>
                      {", designed CPUs, made games, and coded a Discord clone. Basically, "}
                      {"I make things that "}
                      <SecretContent
                          className="inline-block"
                          focusMaskWidth={240}
                          secret={<h1 className="text-yellow-500 inline">{"hardly"}</h1>}
                      >
                          <h1 className="text-orange-600 inline">{"actually"}</h1>
                      </SecretContent>
                      {" Work."}
                  </div>
              </motion.div>
          </div>
      </div>

  );
};

export default AboutMe;