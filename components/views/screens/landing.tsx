import SecretContent from "@/components/views/secret-content";
import React from "react";

const Landing = () => {
  return (
    <div className="relative mb-20 h-[100vh] flex flex-col content-center items-center justify-center">
      <SecretContent focusMaskWidth={420} className={"items-center content-center justify-center"} secret={(
        <div className={"content-center justify-center items-center w-full"}>
          <h1 className={"text-black font-bold text-center mb-10"}> Abdulrahman Mohammed </h1>
          <h1 className={"text-black font-bold text-center text-8xl"}> Fixing </h1>
          <h1 className={"text-black font-bold text-center text-8xl"}> Bugs That    </h1>
          <h1 className={"text-black font-bold text-center text-8xl"}> I Created </h1>

        </div>
      )}>
        <div className={"content-center justify-center items-center w-full"}>
          <h1 className={"text-cyan-100 font-bold text-center mb-10"}> Abdulrahman Mohammed </h1>
          <h1 className={"text-cyan-100 font-bold text-center text-8xl"}> Building </h1>
          <h1 className={"text-cyan-800 font-bold text-center text-8xl"}> Application </h1>
          <h1 className={"text-cyan-800 font-bold text-center text-8xl"}> & Websites </h1>
        </div>
      </SecretContent>
      <h1 className={"text-cyan-100 font-bold text-center text-8xl"}> Since </h1>
      <h1 className={"text-cyan-100 font-bold text-center text-8xl"}> 2019 </h1>
    </div>
  );
};

export default Landing;