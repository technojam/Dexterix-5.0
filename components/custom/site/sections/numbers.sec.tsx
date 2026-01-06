import React from "react";
import { NumberTicker } from "../../../ui/number-ticker";

export default function NumbersSec() {
  return (
    <div className="self-stretch border-[rgba(55,50,47,0.12)] flex justify-center items-start border-t border-b-0">
      <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
        {/* Left decorative pattern */}
        <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="self-stretch h-3 sm:h-4 rotate-45 origin-top-left outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
            />
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
        {/* Four sections in one row */}
        <div
          className={`
                          h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex flex-col justify-center items-center gap-1 xs:gap-2 sm:gap-3
                          border-b border-r last:border-r-0 border-[#E3E2E1]
                        `}
        >
          <NumberTicker
            value={100}
            startValue={80}
            className="text-5xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white text-center"
          />
          <div className="text-center flex font-semibold justify-center flex-col text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl leading-tight md:leading-9 font-sans">
            Registrations
          </div>
        </div>

        <div
          className={`
                          h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex flex-col justify-center items-center gap-1 xs:gap-2 sm:gap-3
                          border-b border-r last:border-r-0 border-[#E3E2E1]
                        `}
        >
          <NumberTicker
            value={100}
            startValue={80}
            className="text-5xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white text-center"
          />
          <div className="text-center flex font-semibold justify-center flex-col text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl leading-tight md:leading-9 font-sans">
            Participants
          </div>
        </div>

        <div
          className={`
                          h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex flex-col justify-center items-center gap-1 xs:gap-2 sm:gap-3
                          border-b border-r last:border-r-0 border-[#E3E2E1]
                        `}
        >
          <NumberTicker
            value={100}
            startValue={80}
            className="text-5xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white text-center"
          />
          <div className="text-center flex font-semibold justify-center flex-col text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl leading-tight md:leading-9 font-sans">
            Volunteers
          </div>
        </div>

        <div
          className={`
                          h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex flex-col justify-center items-center gap-1 xs:gap-2 sm:gap-3
                          border-b border-r last:border-r-0 border-[#E3E2E1]
                        `}
        >
          <NumberTicker
            value={100}
            startValue={80}
            className="text-5xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white text-center"
          />
          <div className="text-center flex font-semibold justify-center flex-col text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl leading-tight md:leading-9 font-sans">
            Projects
          </div>
        </div>
      </div>

      <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
        {/* Right decorative pattern */}
        <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="self-stretch h-3 sm:h-4 rotate-45 origin-top-left outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
