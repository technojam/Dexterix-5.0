import { Highlighter } from "@/components/ui/highlighter";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { StarsBackground } from "@/components/ui/stars-bg";
import Image from "next/image";
import { FloatingPlanets } from "@/components/custom/site/sub/floating-planets";
import Link from "next/link";

export default function HeroSec() {
  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <StarsBackground
        starDensity={0.0015}
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
        className="pointer-events-none absolute left-1/2 -bottom-16 sm:-bottom-24 md:-bottom-32
          h-32 w-full sm:h-48 sm:w-[110%] md:h-64 md:w-[115%] lg:h-72 lg:w-[120%]
          -translate-x-1/2
          rounded-t-full
          bg-[radial-gradient(circle_at_50%_100%,rgba(120,170,255,0.95)_0%,rgba(70,130,255,0.65)_35%,rgba(40,90,210,0.35)_60%,rgba(0,0,0,0)_78%)]
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

      {/* Purple oval focus light - responsive gradient sizes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] sm:bg-[radial-gradient(ellipse_70%_45%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] md:bg-[radial-gradient(ellipse_80%_50%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)]"></div>

      {/* Medium blue oval focus light - responsive gradient sizes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] sm:bg-[radial-gradient(ellipse_80%_35%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] md:bg-[radial-gradient(ellipse_90%_40%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)]"></div>

      {/* Content */}
      <div className="flex items-center justify-center w-full h-full mt-20 md:mt-5 z-300">
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20">
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 max-w-3xl items-center text-center">
            <Image
              src={"/img/logo.webp"}
              alt="logo"
              height={400}
              width={400}
              draggable={false}
              className="object-cover w-[300px] h-[300px] lg:w-[350px] lg:h-[350px] xl:w-[400px] xl:h-[400px]"
            />
            <h1 className="flex text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl max-w-2xl font-bold text-secondary text-center font-lora italic px-4 sm:px-6 md:px-8 drop-shadow-lg">
              FINDING THE NEXT GEN DEXTERS
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href={"https://techxpo.technojam.in/events/b0848c3f-9cd8-444d-a0a7-70cc22700512"} target="_blank" rel="noopener noreferrer">
            <ShimmerButton background="#EE2D78" className="h-10 w-50 shadow-xl">
              <span className="text-center font-lora font-semibold text-sm leading-none tracking-tight whitespace-pre-wrap text-white lg:text-lg">
                Register Now
              </span>
            </ShimmerButton>
            </Link>
            <Link href={"/hub"}>
              <ShimmerButton background="#4F46E5" className="h-10 w-50 shadow-xl">
                <span className="text-center font-lora font-semibold text-sm leading-none tracking-tight whitespace-pre-wrap text-white lg:text-lg">
                  Hackathon Hub
                </span>
              </ShimmerButton>
            </Link>
            </div>
            <p className="hidden md:flex text-lg mt-10 font-lora max-w-2xl text-secondary text-center items-center gap-2 justify-center">
              Brought to you by{" "}
              <Highlighter action="underline" color="#ffffff">
                <span className="flex items-center gap-2 mb-1">
                  <Image
                    src={"/svg/tj.webp"}
                    alt="tj logo"
                    width={32}
                    height={32}
                    className="object-contain w-8 h-8 md:w-12 md:h-12"
                  />
                  <span>Team Technojam</span>
                </span>
              </Highlighter>
            </p>

            <p className="flex md:hidden mt-10 text-lg max-w-2xl text-secondary text-center font-sans items-center gap-2 justify-center">
              Brought to you by{" "}
              <span className="flex items-center gap-2 mb-1">
                <Image
                  src={"/svg/tj.webp"}
                  alt="tj logo"
                  width={32}
                  height={32}
                  className="object-contain w-8 h-8 md:w-12 md:h-12"
                />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
