"use client";

import React from 'react';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {ArrowRightCircle, GithubIcon, List} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import SecretIndicatorFade from "@/components/views/secret-indicator-fade";
import {cn} from "@/lib/utils";
import Image from "next/image";
import ProjectItem, {ProjectData} from "@/components/views/screens/project-item";
import {Badge} from "@/components/ui/badge";


type ProjectCardItem = {
  name: string;
  disc: string;
  image: string;
};

const ProjectsCardInfo:ProjectCardItem[] = [
  {
    name: "Discordo",
    disc: "A fullstack discord clone",
    image: "/projects_logos/discordo.png",
  },

  {
    name: "Irminsul",
    disc: "Search Engine",
    image: "/projects_logos/irminsul.png",
  },

  {
    name: "Gigachat",
    disc: "A fullstack X (formally twitter) clone",
    image: "/projects_logos/gigachat.png",
  },

  {
    name: "Font Type Detector",
    disc: "An AI pipeline.",
    image: "/projects_logos/ftd.svg",
  },

  {
    name: "Promptopia",
    disc: "Public platform",
    image: "/projects_logos/promptopia.svg",
  },
];

const ProjectsData: ProjectData[] = [
  {
    name: "Discordo",
    disc: (
      <div className={"text-white"}>
        A full stack discord clone written in react using NextJS framework, this clone features the following: <br/>
        - Live Chats <br/>
        - Voice & Audio Chats <br/>
        - Server management & moderation <br/>
        <br/>
      </div>
    ),
    tech: [
      <Badge key={"React"}>React</Badge>,
      <Badge key={"Next"}>Next</Badge>,
      <Badge key={"MongoDB"}>MongoDB</Badge>,
      <Badge key={"Prisma"}>Prisma</Badge>,
      <Badge key={"Tailwind"}>Tailwind</Badge>,
      <Badge key={"LiveKit"}>LiveKit</Badge>,
      <Badge key={"Uploadthing"}>Uploadthing</Badge>,

    ],
    previewUrl: "https://raw.githubusercontent.com/AbdoWise-z/discordo/master/images/create_server_2.png",
    action: [
      {
        text: "Github",
        target: "https://github.com/AbdoWise-z/discordo",
        icon: <GithubIcon />,
      },
      {
        text: "Live Demo",
        target: "https://discordo-production.up.railway.app/",
        icon: <ArrowRightCircle />,
      },
    ]
  },

  {
    name: "Irminsul",
    disc: (
      <div className={"text-white"}>
        Irminsul is a fullstack search engine, the front-end is written <p
        className={"text-blue-500 inline"}>{"Flutter "}</p>
        while the backend is written in <p className={"text-red-500 inline"}>{"Java "}</p> SpringBot.
      </div>
    ),
    tech: [
      <Badge key={"Flutter"}>Flutter</Badge>,
      <Badge key={"MongoDB"}>MongoDB</Badge>,
      <Badge key={"Java"}>Java</Badge>,
      <Badge key={"SpringBot"}>SpringBot</Badge>,
      <Badge key={"Search Engines"}>Search Engines</Badge>,
      <Badge key={"Cross-platform"}>Cross-platform</Badge>,
    ],
    action: [
      {
        text: "Backend",
        target: "https://github.com/AbdoWise-z/Irminsul-backend",
        icon: <GithubIcon />,
      },

      {
        text: "Frontend",
        target: "https://github.com/AbdoWise-z/Irminsul-ui",
        icon: <GithubIcon />,
      },
    ],
    previewUrl: "https://github.com/AbdoWise-z/Irminsul-ui/blob/master/images/search.gif?raw=true",
  },


  {
    name: "GigaChat",
    disc: (
      <div className={"text-white"}>
        A cross-functional team developed a full-featured Twitter clone, encompassing front-end,
        back-end, cross-platform, testing, and DevOps. The project focused on replicating core Twitter functionalities while introducing innovative features to improve user experience.
        <br/>
      </div>
    ),
    tech: [
      <Badge key={"Flutter"}>Flutter</Badge>,
      <Badge key={"MongoDB"}>MongoDB</Badge>,
      <Badge key={"Cross-platform"}>Cross-platform</Badge>,
    ],
    action: [
      {
        text: "Github",
        target: "https://github.com/CMP25-SWE-TEAM1/Cross-platform",
        icon: <GithubIcon />,
      },
    ]
  },

  {
    name: "Font Type Detector",
    disc: (
      <div className={"text-white"}>
        An AI Pipeline to detect the type of font of a text that exists on an image, reaching a accuracy of <p className={"inline text-orange-500"} >99.8%</p> on our university test set, securing the first place
        among all other presented projects for the same problem in our department.
      </div>
    ),
    tech: [
      <Badge key={"Python"}>Python</Badge>,
      <Badge key={"AI"}>AI</Badge>,
      <Badge key={"Image Processing"}>Image Processing</Badge>,
      <Badge key={"ML"}>ML</Badge>,
    ],
    action: [
      {
        text: "Github",
        target: "https://github.com/AbdoWise-z/Arabic-Font-Type-Detector",
        icon: <GithubIcon />,
      },

      {
        text: "Live Demo",
        target: "http://xabdomo.pythonanywhere.com/",
        icon: <ArrowRightCircle />,
      },
    ],
  },

  {
    name: "Promptopia",
    disc: (
      <div className={"text-white"}>
        A platform where people can share public posts to the world, it features the following: <br/>
        - Creating post with tags.
        - Authentication & Users Profiles.
        - Post Delete / Edit / Search etc..
        <br/>
      </div>
    ),
    tech: [
      <Badge key={"React"}>React</Badge>,
      <Badge key={"Next"}>Next</Badge>,
      <Badge key={"MongoDB"}>MongoDB</Badge>,
      <Badge key={"Prisma"}>Prisma</Badge>,
      <Badge key={"Tailwind"}>Tailwind</Badge>,
    ],
    action: [
      {
        text: "Github",
        target: "https://github.com/AbdoWise-z/Promptopia",
        icon: <GithubIcon />,
      },
      {
        text: "Live Demo",
        target: "https://promptopia-eight-black.vercel.app/",
        icon: <ArrowRightCircle />,
      },
    ]
  },
]

const Projects = () => {
  const [currentSelectedProject, setCurrentSelectedProject] = React.useState(0);

  return (
    <div className="relative flex flex-col h-auto min-h-[100vh] w-full content-center items-center justify-center">
      <div className="absolute h-[100%] w-[100%] bg-neutral-900 z-[-1]"/>
      <div className="flex flex-col mt-10 w-[65%] h-fit content-start items-start">
        <h1 className={"text-cyan-100 font-bold text-center mb-10"} id={"PROJECTS_SECTION"}> Previous Projects </h1>
      </div>
      <div className={"flex flex-1 flex-col w-[65%]"}>
        {/*projects cards*/}
        <div className={"w-full md:w-[85%]"}>
          <Carousel className="w-full max-w-[100%] md:translate-x-[10%]">
            <CarouselContent>
              {ProjectsCardInfo.map((item, index) => (
                <CarouselItem key={index} className={"md:basis-1/2 lg:basis-1/3"}>
                  <SecretIndicatorFade className={"w-full"}>
                    <div className={"p-1"}>
                      <div
                        onClick={() => setCurrentSelectedProject(index)}
                        className={cn(
                          "w-full px-2 py-4 bg-neutral-700 rounded-2xl flex flex-row items-start content-start justify-start border-neutral-500 border-2 transition-all",
                          "hover:bg-neutral-800 hover:rounded-xl",
                          ((currentSelectedProject == index) && "bg-neutral-800 border-blue-300"),
                        )}
                      >
                        <Image src={item.image} alt={item.name} width={48} height={48}/>
                        <div className={"flex-1 flex flex-col h-full ml-2"}>
                          <h1 className={"font-bold text-white"}>{item.name}</h1>
                          <p className={"text-sm text-neutral-200"}>{item.disc}</p>
                        </div>
                      </div>
                    </div>
                  </SecretIndicatorFade>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious/>
            <CarouselNext/>
          </Carousel>
        </div>
        {/*actual projects*/}
        <div className={"relative flex w-full h-full mb-16 mt-2"}>
          <AnimatePresence mode={"wait"}>
            {ProjectsData.map((item, index) => (
              index == currentSelectedProject && <motion.div
                key={index}
                className={"flex flex-row w-full h-full content-center justify-center items-center"}
                initial={{opacity: 0, translateX: "140px"}}
                animate={{opacity: 1, translateX: "0px"}}
                exit={{opacity: 0, translateX: "-140px"}}
                transition={{
                  duration: 0.125,
                }}
                layout
              >
                <ProjectItem
                  data={ProjectsData[currentSelectedProject]}
                />
              </motion.div>
            ))})
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Projects;