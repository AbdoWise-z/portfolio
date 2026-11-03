import SecretContent from "@/components/views/secret-content";
import React from "react";

const line = "text-center text-4xl font-bold leading-tight md:text-7xl xl:text-8xl";

/** Hero: name plus the tagline that flips inside the secret-content mask. */
const Landing = () => {
  return (
    <section className="relative flex h-[100svh] select-none flex-col items-center justify-center px-6">
      <SecretContent
        focusMaskWidth={420}
        className="items-center justify-center"
        secret={
          <div className="w-full">
            <p className="eyebrow mb-8 text-center text-black/70">Abdelrahman Mahmoud</p>
            <p className={`${line} text-black`}>Fixing</p>
            <p className={`${line} text-black`}>Bugs That</p>
            <p className={`${line} text-black`}>I Created</p>
          </div>
        }
      >
        <div className="w-full">
          <h1 className="eyebrow mb-8 text-center">Abdelrahman Mahmoud</h1>
          <p className={`${line} text-cyan-50`}>Building</p>
          <p className={`${line} text-cyan-400`}>Applications</p>
          <p className={`${line} text-cyan-400`}>& Websites</p>
        </div>
      </SecretContent>
      <p className={`${line} text-cyan-50`}>Since</p>
      <p className={`${line} text-cyan-50`}>2019</p>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition-colors hover:text-white"
        aria-label="Scroll to the About section"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <span className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
      </a>
    </section>
  );
};

export default Landing;
