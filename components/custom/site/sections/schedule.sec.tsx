import { StarsBackground } from "@/components/ui/stars-bg";
import { Timeline } from "@/components/ui/timeline";
import Image from "next/image";
import { FloatingPlanets } from "../sub/floating-planets";

export default function ScheduleSec() {
  const data = [
    {
      title: "Registration Begins",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Kickstart your journey by registering your team. Join over 600
            participants ready to innovate.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://assets.aceternity.com/templates/startup-1.webp"
              alt="registration"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-sm md:h-32 lg:h-40"
            />
            <div className="h-20 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center md:h-32 lg:h-40">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Opening Ceremony",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Welcome address, keynote speeches by industry leaders, and hackathon
            rules briefing.
          </p>
          <Image
            src="https://assets.aceternity.com/pro/hero-sections.png"
            alt="opening ceremony"
            width={500}
            height={500}
            className="h-40 w-full rounded-lg object-cover shadow-sm md:h-60"
          />
        </div>
      ),
    },
    {
      title: "Hacking Starts",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            The 36-hour timer begins! Collaborate, code, and bring your
            innovative ideas to life.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300 mb-2">
            ✅ Theme Announcement
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
            ✅ Team Formation Finalized
          </div>
        </div>
      ),
    },
    {
      title: "Mentoring Round 1",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Expert mentors review your initial concepts and provide critical
            feedback to refine your approach.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://assets.aceternity.com/features-section.png"
              alt="mentoring"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-sm md:h-32 lg:h-40"
            />
            <Image
              src="https://assets.aceternity.com/pro/bento-grids.png"
              alt="brainstorming"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-sm md:h-32 lg:h-40"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Final Submission",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Code freeze! Submit your project repositories and presentation decks
            for evaluation.
          </p>
          <div className="h-24 w-full rounded-lg bg-indigo-900/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-secondary font-bold">
              🏁 Submission Deadline
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Closing & Awards",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Celebrating the winners! Prizes distribution and networking with
            sponsors and judges.
          </p>
          <Image
            src="https://assets.aceternity.com/cards.png"
            alt="awards"
            width={500}
            height={500}
            className="h-40 w-full rounded-lg object-cover shadow-sm md:h-60"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center w-full overflow-hidden">
      {/* <StarsBackground
        starDensity={0.005}
        minTwinkleSpeed={1}
        className="flex z-300"
      /> */}
      <FloatingPlanets layoutId={5} />
      {/* <Image
        src={"/img/bg-stars.png"}
        alt="bg"
        fill
        className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none select-none opacity-10"
        priority
        draggable={false}
      /> */}
      {/* Top left gradient - responsive size and position */}
      {/* <div className="absolute bottom-0 left-[-20%] sm:left-[-15%] md:left-[-10%] right-0 top-[-10%] sm:top-[-5%] h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(211,211,211,0.15),rgba(255,255,255,0))] opacity-30 sm:opacity-35 md:opacity-40" /> */}
      {/* Half moon glow emerging from bottom - responsive */}
      {/* <div
        className="pointer-events-none absolute left-1/2 top-0
          h-32 w-full sm:h-48 sm:w-[110%] md:h-64 md:w-[115%] lg:h-72 lg:w-[120%]
          -translate-x-1/2
          rounded-b-full
          bg-[radial-gradient(circle_at_50%_0%,rgba(120,170,255,0.95)_0%,rgba(70,130,255,0.65)_35%,rgba(40,90,210,0.35)_60%,rgba(0,0,0,0)_78%)]
          blur-xl sm:blur-2xl opacity-80 sm:opacity-85 md:opacity-90"
      />
      <div
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
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] sm:bg-[radial-gradient(ellipse_70%_45%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] md:bg-[radial-gradient(ellipse_80%_50%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)]"></div> */}

      {/* Medium blue oval focus light - responsive gradient sizes */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] sm:bg-[radial-gradient(ellipse_80%_35%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] md:bg-[radial-gradient(ellipse_90%_40%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)]"></div> */}

      {/* Content */}
      <div className="relative w-full z-200 flex flex-col items-center">
        <div className="flex flex-col items-center justify-center pt-20 pb-10">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Schedules
          </h2>
        </div>
        <Timeline data={data} />
      </div>
    </div>
  );
}
