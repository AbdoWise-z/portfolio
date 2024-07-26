"use client";

import React from 'react';
import {
  Sheet, SheetClose,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {motion} from "framer-motion";
import {Menu} from "lucide-react";
import SecretContent from "@/components/views/secret-content";

const RightNav = () => {
  const handleAboutClick = () => {
    document.querySelector("#ABOUT_ME_SECTION")!.scrollIntoView({ behavior: 'smooth' });
  }

  const handleProjectsClick = () => {
    document.querySelector("#PROJECTS_SECTION")!.scrollIntoView({ behavior: 'smooth' });
  }

  const handleContactClick = () => {
    document.querySelector("#CONTACT_ME_SECTION")!.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className={"flex fixed right-0 top-0 gap-3 p-8 flex-col h-full md:w-[200px]"}>
      <div className={"md:hidden"}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className={"flex flex-col"}>
              <SheetClose asChild>
                <button className={"text-black"} onClick={handleAboutClick}>About</button>
              </SheetClose>

              <SheetClose asChild>
                <button className={"text-black"} onClick={handleProjectsClick}>Projects</button>
              </SheetClose>

              <SheetClose asChild>
                <button className={"text-black"} onClick={handleContactClick}>Contact</button>
              </SheetClose>

            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className={"hidden md:block w-[100%] h-full justify-end content-end pb-20"}>
        <SecretContent focusMaskWidth={60} secret={<p className={"text-black text-2xl mr-20"}>Content</p>}>
          <p className={"text-white text-2xl mr-20"}>Content</p>
        </SecretContent>
        <motion.div
          className={"items-end justify-items-end place-items-end"}
          style={{
            opacity: 0.7,
            scale: 1,
          }}
          whileHover={{
            opacity: 1,
            scale: 1.2,
          }}
        >
          <SecretContent focusMaskWidth={0}
                         secret={<button className={"text-black"} onClick={handleAboutClick}>About</button>}>
            <button className={"text-white"} onClick={handleAboutClick}>About</button>
          </SecretContent>
        </motion.div>

        <motion.div
          style={{
            opacity: 0.7,
            scale: 1,
          }}
          whileHover={{
            opacity: 1,
            scale: 1.2,
          }}
        >
          <SecretContent focusMaskWidth={0}
                         secret={<button className={"text-black"} onClick={handleProjectsClick}>Projects</button>}>
            <button className={"text-white"} onClick={handleProjectsClick}>Projects</button>
          </SecretContent>
        </motion.div>

        <motion.div
          style={{
            opacity: 0.7,
            scale: 1,
          }}
          whileHover={{
            opacity: 1,
            scale: 1.2,
          }}
        >
          <SecretContent focusMaskWidth={0}
                         secret={<button className={"text-black"} onClick={handleContactClick}>Contact</button>}>
            <button className={"text-white"} onClick={handleContactClick}>Contact</button>
          </SecretContent>
        </motion.div>

        <div className={"h-[40px]"}/>
        <a href={"/my_cv.pdf"} target="_blank" rel="noopener noreferrer">
          <SecretContent
                         secret={<Button variant={"default"} className={"px-12 rounded-full"}>My CV</Button>}>
            <Button variant={"outline"} className={"px-12 rounded-full"}>My CV</Button>
          </SecretContent>
        </a>
      </div>
    </div>
  )
};


export default RightNav;