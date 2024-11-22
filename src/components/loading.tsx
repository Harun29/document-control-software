"use client";
import { Progress } from "@/components/ui/progress";

const Loading = ({ progress }: { progress: number }) => {
  return (
    <div className="z-50 fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-white">
      <div className="w-96 max-w-md text-center">
        <div className="flex items-center justify-center">
          <img className="w-24" src="dcs-logo.png" alt="dcs" />
          <div className="flex flex-col justify-start items-start align-start">
            <h1 className="text-center text-xl">Document Control Software</h1>
            <p className="text-[#888888]">v1.0</p>
          </div>
        </div>
        <Progress className="w-full h-2 mt-5" value={progress} />
      </div>
      <div className="fixed bottom-0 w-full flex items-center justify-center mb-5">
        <img className="w-14" src="FSK_logo.png" alt="fsk" />
        <p className="ml-5 text-base">FSK-UNSA | NMSI</p>
      </div>
    </div>
  );
};

export default Loading;
