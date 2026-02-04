"use client";
import { StarsBackground } from "@/components/ui/stars-bg";
import PrizeCard from "../prize.card";
import { FloatingPlanets } from "../sub/floating-planets";

export default function PrizeSec() {
  const prizes = [
    {
      rank: 1 as const,
      image: "/img/prize-1st.webp",
      prizeName: "Galactic Champion",
      prizeValue: "₨ 50,000`",
      winnerName: "Commander Nova",
    },
    {
      rank: 2 as const,
      image: "/img/prize-2nd.webp",
      prizeName: "Space Pioneer",
      prizeValue: "₨ 35,000`",
      winnerName: "Captain Stellar",
    },
    {
      rank: 3 as const,
      image: "/img/prize-3rd.webp",
      prizeName: "Cosmic Explorer",
      prizeValue: "₨ 20,000`",
      winnerName: "Lt. Orion",
    },
    {
      rank: 4 as const,
      image: "/img/prize-4th.webp",
      prizeName: "Nebula Navigator",
      prizeValue: "₨ 7,500`",
      winnerName: "Pilot Aurora",
    },
    // {
    //   rank: 5 as const,
    //   image: "/img/prize-5th.webp",
    //   prizeName: "Starlight Voyager",
    //   prizeValue: "$500",
    //   winnerName: "Cadet Luna",
    // },
  ];

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <StarsBackground
        starDensity={0.005}
        minTwinkleSpeed={1}
        className="flex z-300"
      />
      <FloatingPlanets layoutId={1} />
      {/* <Image
        src={"/img/bg-stars.webp"}
        alt="bg"
        fill
        className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none select-none opacity-10"
        priority
        draggable={false}
      /> */}
      {/* Top left gradient - responsive size and position */}
      <div className="absolute bottom-0 left-[-20%] sm:left-[-15%] md:left-[-10%] right-0 top-[-10%] sm:top-[-5%] h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(211,211,211,0.15),rgba(255,255,255,0))] opacity-30 sm:opacity-35 md:opacity-40" />
      {/* Half moon glow emerging from bottom - responsive */}
      {/* <div
        className="pointer-events-none absolute left-1/2 top-0
          h-32 w-full sm:h-48 sm:w-[110%] md:h-64 md:w-[115%] lg:h-72 lg:w-[120%]
          -translate-x-1/2
          rounded-b-full
          bg-[radial-gradient(circle_at_50%_0%,rgba(120,170,255,0.95)_0%,rgba(70,130,255,0.65)_35%,rgba(40,90,210,0.35)_60%,rgba(0,0,0,0)_78%)]
          blur-xl sm:blur-2xl opacity-80 sm:opacity-85 md:opacity-90"
      /> */}
      {/* Bottom center gradient - responsive */}
      {/* <div
        className="
              pointer-events-none
              absolute bottom-0 left-1/2
              h-32 w-[150px] sm:h-48 sm:w-[200px] md:h-64 md:w-[250px] lg:h-72 lg:w-[290px]
              -translate-x-1/2
              bg-[radial-gradient(circle_80rem_at_60%_140%,oklch(0.49_0.22_264)_10%,oklch(0.49_0.22_264/0.7)_65%,oklch(0.49_0.22_264/0.45)_20%,rgba(5,10,40,0)_85%)]
              blur-xl sm:blur-2xl opacity-90 sm:opacity-95
            "
      /> */}
      {/* <div
        className="pointer-events-none absolute left-1/2 -bottom-16 sm:-bottom-24 md:-bottom-32
          h-32 w-full sm:h-48 sm:w-[110%] md:h-64 md:w-[115%] lg:h-72 lg:w-[120%]
          -translate-x-1/2
          rounded-t-full
          bg-[radial-gradient(circle_at_50%_100%,rgba(120,170,255,0.95)_0%,rgba(70,130,255,0.65)_35%,rgba(40,90,210,0.35)_60%,rgba(0,0,0,0)_78%)]
          blur-xl sm:blur-2xl opacity-80 sm:opacity-85 md:opacity-90"
      /> */}
      {/* Purple oval focus light - responsive gradient sizes */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] sm:bg-[radial-gradient(ellipse_70%_45%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] md:bg-[radial-gradient(ellipse_80%_50%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)]"></div> */}

      {/* Medium blue oval focus light - responsive gradient sizes */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] sm:bg-[radial-gradient(ellipse_80%_35%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] md:bg-[radial-gradient(ellipse_90%_40%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)]"></div> */}

      {/* Content - Pyramid Layout */}
      <div className="flex items-center justify-center w-full h-full z-200">
        <div className="flex flex-col items-center gap-6 md:gap-8 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-10">
            Prizes
          </h2>
          {/* Row 1: 1st Place */}
          <div className="flex justify-center w-full">
            {prizes
              .filter((p) => p.rank === 1)
              .map((prize) => (
                <PrizeCard key={prize.rank} {...prize} />
              ))}
          </div>

          {/* Row 2: 2nd, 3rd, and 4th Place */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-16 lg:gap-8 w-full flex-wrap">
            {prizes
              .filter((p) => p.rank >= 2 && p.rank <= 4)
              .sort((a, b) => a.rank - b.rank)
              .map((prize) => (
                <PrizeCard key={prize.rank} {...prize} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
