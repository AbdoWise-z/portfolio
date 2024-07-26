import SecretContent from "@/components/views/secret-content";
import SecretContentIndicator from "@/components/views/secret-content-indicator";
import React from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import Landing from "@/components/views/screens/landing";
import LeftNav from "@/components/views/nav/left-nav";
import RightNav from "@/components/views/nav/right-nav";
import AboutMe from "@/components/views/screens/about_me";
import MovingBg from "@/components/views/screens/moving-bg";
import Projects from "@/components/views/screens/projects";
import ContactMe from "@/components/views/screens/contact_me";

export default function Home() {

  return (
    <>
      <div className={"relative"}>
        <MovingBg/>
        <SecretContentIndicator/>
        <Landing/>
        <AboutMe/>
        <Projects/>
        <ContactMe/>
      </div>

      <LeftNav/>
      <RightNav/>
    </>

  );
}
