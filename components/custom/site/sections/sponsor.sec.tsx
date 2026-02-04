import { StarsBackground } from "@/components/ui/stars-bg";
// import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { FloatingPlanets } from "../sub/floating-planets";

const sponsors = Array(10).fill(".xyz");

export default function SponsorSec() {
  return (
    <div className="relative flex min-h-[50vh] w-full flex-col items-center justify-center overflow-hidden py-20">
      <StarsBackground
        starDensity={0.005}
        minTwinkleSpeed={1}
        className="flex z-300"
      />
      <FloatingPlanets layoutId={1} />

      {/* Content */}
      <div className="relative z-200 flex flex-col items-center justify-center w-full gap-10">
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-10">
          Sponsors
        </h2>

        <Marquee className="[--duration:20s] w-full" pauseOnHover>
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="mx-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-8 py-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <span className="text-xl font-semibold text-white/80">
                {sponsor}
              </span>
            </div>
          ))}
        </Marquee>

        <Marquee reverse className="[--duration:20s] w-full" pauseOnHover>
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="mx-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-8 py-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <span className="text-xl font-semibold text-white/80">
                {sponsor}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
