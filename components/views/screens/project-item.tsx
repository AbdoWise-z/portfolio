"use client";

import React, {ReactNode} from 'react';
import {cn} from "@/lib/utils";
import {Separator} from "@/components/ui/separator";
import SecretIndicatorFade from "@/components/views/secret-indicator-fade";
import {Button} from "@/components/ui/button";

export type ProjectAction = {
  text: string;
  target: string;
  icon: ReactNode;
}

export type ProjectData = {
  name: string;
  tech: ReactNode[];
  disc: ReactNode;
  previewUrl?: string;
  action: ProjectAction[]
}

const ProjectItem = (
  { data } : {
    data: ProjectData;
  }
) => {
  return (
    <div
      className={cn(
        "relative flex flex-col w-full h-auto min-h-[20%]",
        "rounded-xl overflow-auto",
        !data.previewUrl && "w-full md:w-[70%]"
      )}
    >
      <div className={"absolute top-0 left-0 w-full h-full bg-neutral-800 z-[-1]"}/>
      <div className={"h-full w-full flex flex-col md:flex-row"}>
        <div className={cn(
          "h-auto w-full md:w-[50%] lg:w-[50%] p-2 flex flex-col",
          !data.previewUrl && "w-full md:w-[100%] lg:w-[100%]"
        )}>
          <h1 className={"text-white text-xl font-bold pl-2"}>{data.name}</h1>
          <Separator className={"my-2"}/>
          <div className={"px-2 mt-1 gap-1 flex flex-wrap"}>
            {...data.tech}
          </div>
          <div className={"pt-2 px-2"}>
            {data.disc}
          </div>

          <div className={"flex flex-row gap-3 mt-auto"}>
            {data.action.map((item, index) => (
              <a
                key={index}
                href={item.target}
                target="_blank"
                rel="noopener noreferrer"
                className={"group bg-neutral-900 rounded-md hover:bg-neutral-200 transition-all"}
              >
                <SecretIndicatorFade>
                  <div className={"p-2 flex-row flex gap-1 text-white group-hover:text-black"}>
                    {item.icon}
                    {item.text}
                  </div>
                </SecretIndicatorFade>
              </a>
            ))}
          </div>
        </div>

        {data.previewUrl &&
          <div
            className={"relative block rounded-r-xl rounded-l-xl w-auto aspect-square md:aspect-auto md:flex-1 md:h-[180px] lg:h-[320px] m-2"}
            style={{
              backgroundImage: `url(${data.previewUrl})`,
              backgroundClip: "border-box",
              backgroundColor: "white",
              backgroundSize: "cover",
              backgroundPositionX: "50%",
              backgroundPositionY: "50%",
            }}
          >
            <SecretIndicatorFade className={"w-full h-full"}>
              <></>
            </SecretIndicatorFade>
          </div>
        }
      </div>
    </div>
  );
};

export default ProjectItem;