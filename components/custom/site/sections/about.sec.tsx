import { StarsBackground } from "@/components/ui/stars-bg";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export default function AboutSec() {
  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <StarsBackground
        starDensity={0.005}
        minTwinkleSpeed={1}
        className="flex z-300"
      />
      {/* Top left gradient - responsive size and position */}
      <div className="absolute bottom-0 left-[-20%] sm:left-[-15%] md:left-[-10%] right-0 top-[-10%] sm:top-[-5%] h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(211,211,211,0.15),rgba(255,255,255,0))] opacity-30 sm:opacity-35 md:opacity-40" />
      {/* Bottom center gradient - responsive */}
      <div
        className="
          pointer-events-none
          absolute bottom-0 left-1/2
          h-32 w-[150px] sm:h-48 sm:w-[200px] md:h-64 md:w-[250px] lg:h-72 lg:w-[290px]
          -translate-x-1/2
          bg-[radial-gradient(circle_80rem_at_60%_140%,oklch(0.49_0.22_264)_10%,oklch(0.49_0.22_264/0.7)_65%,oklch(0.49_0.22_264/0.45)_20%,rgba(5,10,40,0)_85%)]
          blur-xl sm:blur-2xl opacity-90 sm:opacity-95
        "
      />

      {/* Purple oval focus light - responsive gradient sizes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] sm:bg-[radial-gradient(ellipse_70%_45%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] md:bg-[radial-gradient(ellipse_80%_50%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)]"></div>

      {/* Medium blue oval focus light - responsive gradient sizes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] sm:bg-[radial-gradient(ellipse_80%_35%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] md:bg-[radial-gradient(ellipse_90%_40%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)]"></div>

      {/* Content */}
      <div className="flex items-center justify-center w-full h-full z-10">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20">
          {/* <h1 className="text-4xl font-lora font-bold text-secondary drop-shadow-lg">
            About
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-lora max-w-3xl text-secondary text-justify">
            Organized by Team TechnoJam, the University&apos;s student-run
            Technical Club, and the School of Computing Science and Engineering,
            Dexterix 5.0 promises an electrifying 36-hour journey into the
            future of technology. Following the success of previous editions,
            Dexterix 5.0 is all set to welcome over 600 participants from across
            100+ colleges and universities in India. From its humble beginnings
            in 2018, Dexterix has fostered a thriving community of innovators
            and collaborators, igniting passions and nurturing entrepreneurial
            dreams.
          </p> */}

<Frame className="flex h-full min-w-5xl">
      <FrameHeader>
        <FrameTitle className="text-4xl font-lora text-secondary font-bold drop-shadow-lg">About</FrameTitle>
        <FrameDescription className="text-muted">Brief description about the section</FrameDescription>
      </FrameHeader>
      <FramePanel>
        <h2 className="font-semibold text-sm">Section title</h2>
        <p className="text-muted-foreground text-sm">Section description</p>
      </FramePanel>
    </Frame>
        </div>
      </div>
    </div>
  );
}
