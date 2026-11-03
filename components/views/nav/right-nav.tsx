"use client";

import React from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import SecretContent from "@/components/views/secret-content";
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
 * a vertical list in the bottom-right corner from lg up.
 */
const RightNav = () => {
  return (
    <div className="pointer-events-none fixed right-0 top-0 flex h-full flex-col gap-3 p-6 md:p-8 lg:w-[210px]">
      {/* Small screens: sheet menu */}
      <div className="pointer-events-auto lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav aria-label="Sections" className="mt-8 flex flex-col gap-2">
              {LINKS.map((link, i) => (
                <React.Fragment key={link.id}>
                  {i === 1 && <Separator className="my-2" />}
                  {i === 3 && <Separator className="my-2" />}
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="rounded-full transition-all hover:bg-neutral-700">
                      <a href={`#${link.id}`}>{link.label}</a>
                    </Button>
                  </SheetClose>
                </React.Fragment>
              ))}

              <div className="h-10" />
              <div className="flex w-full justify-end">
                <SheetClose asChild>
                  <a href={CV_PATH} target="_blank" rel="noopener noreferrer">
                    <Button variant="default" className="rounded-full px-12">My CV</Button>
                  </a>
                </SheetClose>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Large screens: vertical list */}
      <nav aria-label="Sections" className="pointer-events-auto mt-auto hidden w-full pb-20 lg:block">
        <SecretContent focusMaskWidth={60} secret={<p className="eyebrow mb-3 text-black/70">Menu</p>}>
          <p className="eyebrow mb-3">Menu</p>
        </SecretContent>

        {LINKS.map((link) => (
          <motion.div key={link.id} className="w-fit origin-left" style={{ opacity: 0.75 }} whileHover={{ opacity: 1, scale: 1.12 }}>
            <SecretContent
              focusMaskWidth={0}
              secret={<a className="text-black" href={`#${link.id}`}>{link.label}</a>}
            >
              <a className="text-white" href={`#${link.id}`}>{link.label}</a>
            </SecretContent>
          </motion.div>
        ))}

        <div className="h-10" />
        <a href={CV_PATH} target="_blank" rel="noopener noreferrer" className="inline-block">
          <SecretContent secret={<Button variant="default" className="rounded-full px-12" tabIndex={-1}>My CV</Button>}>
            <Button variant="outline" className="rounded-full px-12" tabIndex={-1}>My CV</Button>
          </SecretContent>
        </a>
      </nav>
    </div>
  );
};

export default RightNav;
