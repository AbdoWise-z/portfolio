import SecretContent from "@/views/secret-content";
import SecretContentIndicator from "@/views/secret-content-indicator";
import React from "react";
import {ScrollArea} from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <div className="w-[100vw] h-[100vh] relative bg-red-200 overflow-auto">
      <ScrollArea>
        <SecretContentIndicator/>

        <div className="z-1 relative h-[100vh]">
          <SecretContent secret={(
            <p>This is fake</p>
          )}>
            <p>This is real</p>
          </SecretContent>
          <SecretContent secret={(
            <p>This is fake</p>
          )}>
            <p>This is real</p>
          </SecretContent>

          <div className="flex">
            <h1> Watch me </h1>
            <SecretContent secret={(
              <h1 className={"text-2xl text-blue-800"}>Suffer</h1>
            )}
            >
              <h1 className={"text-2xl text-red-800"}>Do it</h1>
            </SecretContent>
          </div>
        </div>

        <div className="z-1 relative h-[100vh] w-[100vw] flex justify-center items-center">

          <h1 className={"text-4xl text-emerald-600"}>
            Page 2,
            <SecretContent className={"inline-block"} focusMaskWidth={250} secret={(<h1 className={"text-4xl text-red-600"}>
              Not Coming
            </h1>)}>
              Coming Soon
            </SecretContent>
          </h1>
        </div>

      </ScrollArea>
    </div>
  );
}
