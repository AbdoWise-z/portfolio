"use client";

import React from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CV_PATH, SECTIONS } from "@/lib/site";

const LINKS = [
  { label: "About", id: SECTIONS.about },
  { label: "Timeline", id: SECTIONS.timeline },
  { label: "Projects", id: SECTIONS.projects },
  { label: "Contact", id: SECTIONS.contact },
];

/**
 * Section navigation. A sheet menu behind a button below the lg breakpoint,
 * a vertical list in the bottom-right corner from lg up. Drawn white with
 * difference blending so it stays readable over any section in either theme.
 */
const RightNav = () => {
  return (
    <div className="pointer-events-none fixed right-0 top-0 z-30 flex h-full flex-col gap-3 p-6 text-white mix-blend-difference md:p-8 lg:w-[210px]">
      {/* Small screens: sheet menu */}
      <div className="pointer-events-auto lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
              className="border-white/50 bg-transparent text-white hover:bg-white/15 hover:text-white"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav aria-label="Sections" className="mt-8 flex flex-col gap-2">
              {LINKS.map((link, i) => (
                <React.Fragment key={link.id}>
                  {(i === 1 || i === 3) && <Separator className="my-2" />}
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="rounded-full">
                      <a href={`#${link.id}`}>{link.label}</a>
                    </Button>
                  </SheetClose>
                </React.Fragment>
              ))}

              <div className="h-10" />
              <div className="flex w-full justify-end">
                <SheetClose asChild>
                  <Button asChild variant="default" className="rounded-full px-12">
                    <a href={CV_PATH} target="_blank" rel="noopener noreferrer">My CV</a>
                  </Button>
                </SheetClose>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Large screens: vertical list */}
      <nav aria-label="Sections" className="pointer-events-auto mt-auto hidden w-full pb-20 lg:block">
        <p className="eyebrow mb-3 text-white/60">Menu</p>

        {LINKS.map((link) => (
          <motion.div key={link.id} className="w-fit origin-left" style={{ opacity: 0.8 }} whileHover={{ opacity: 1, scale: 1.12 }}>
            <a className="text-white" href={`#${link.id}`}>{link.label}</a>
          </motion.div>
        ))}

        <div className="h-10" />
        <Button
          asChild
          variant="outline"
          className="rounded-full border-white/60 bg-transparent px-12 text-white hover:bg-white/15 hover:text-white"
        >
          <a href={CV_PATH} target="_blank" rel="noopener noreferrer">My CV</a>
        </Button>
      </nav>
    </div>
  );
};

export default RightNav;
