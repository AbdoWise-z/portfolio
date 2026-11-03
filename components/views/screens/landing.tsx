import SecretContent from "@/components/views/secret-content";
import React from "react";

const line = "text-center text-4xl font-bold leading-tight md:text-7xl xl:text-8xl";
const ink = "text-slate-900 dark:text-cyan-50";
const accent = "text-cyan-600 dark:text-cyan-400";

/** Hero: name plus the tagline that flips inside the lens. */
const Landing = () => {
  return (
    <section className="relative flex h-[100svh] select-none flex-col items-center justify-center px-6">
      <SecretContent
        focusMaskWidth={420}
        className="items-center justify-center"
        secret={
          <div className="w-full">
            <p className="eyebrow secret-ink mb-8 text-center">Abdelrahman Mahmoud</p>
            <p className={`${line} secret-ink`}>Fixing</p>
            <p className={`${line} secret-ink`}>Bugs That</p>
            <p className={`${line} secret-ink`}>I Created</p>
          </div>
        }
      >
        <div className="w-full">
          <h1 className="eyebrow mb-8 text-center">Abdelrahman Mahmoud</h1>
          <p className={`${line} ${ink}`}>Building</p>
          <p className={`${line} ${accent}`}>Applications</p>
          <p className={`${line} ${accent}`}>& Websites</p>
        </div>
      </SecretContent>
      <p className={`${line} ${ink}`}>Since</p>
      <p className={`${line} ${ink}`}>2019</p>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-foreground/50 transition-colors hover:text-foreground"
        aria-label="Scroll to the About section"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <span className="h-8 w-px bg-gradient-to-b from-foreground/50 to-transparent" />
      </a>
    </section>
  );
};

export default Landing;
