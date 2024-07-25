"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {motion} from "framer-motion";
import {Menu} from "lucide-react";
import SecretContent from "@/components/views/secret-content";
import SecretIndicatorFade from "@/components/views/secret-indicator-fade";

const RightNav = () => {
  const handleAboutClick = () => {
    //TODO:
  }

  const handleProjectsClick = () => {
    //TODO
  }

  const handleContactClick = () => {
    //TODO
  }

  return (
    <div className={"flex fixed right-0 top-0 gap-3 p-8 flex-col h-full md:w-[240px]"}>
      <div className={"md:hidden"}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className={"flex flex-col"}>
              <button className={"text-black"} onClick={handleAboutClick}>About</button>
              <button className={"text-black"} onClick={handleProjectsClick}>Projects</button>
              <button className={"text-black"} onClick={handleContactClick}>Contact</button>
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
          <SecretContent focusMaskWidth={0} secret={<button className={"text-black"} onClick={handleAboutClick}>About</button>}>
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
          <SecretContent focusMaskWidth={0} secret={<button className={"text-black"} onClick={handleProjectsClick}>Projects</button>}>
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
          <SecretContent focusMaskWidth={0} secret={<button className={"text-black"} onClick={handleContactClick}>Contact</button>}>
            <button className={"text-white"} onClick={handleContactClick}>Contact</button>
          </SecretContent>
        </motion.div>
      </div>
    </div>
  )
};

const RightNavContent = () => {
  return (
    <>
      <p>Item 1</p>
      <p>Item 2</p>
      <p>Item 3</p>
    </>
  );
}

export default RightNav;