import SecretContent from "@/components/views/secret-content";
import SecretContentIndicator from "@/components/views/secret-content-indicator";
import React from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import Landing from "@/components/views/screens/landing";
import LeftNav from "@/components/views/nav/left-nav";
import RightNav from "@/components/views/nav/right-nav";
import AboutMe from "@/components/views/screens/about_me";

export default function Home() {
  return (
    <>
      <div className="w-[100vw] h-[100vh]">
        <ScrollArea className={"relative bg-neutral-900 w-[100vw] h-[100vh]"}>
          <SecretContentIndicator/>

          <Landing/>
          <AboutMe/>
        </ScrollArea>
      </div>

      <LeftNav/>
      <RightNav/>
    </>

  );
}
