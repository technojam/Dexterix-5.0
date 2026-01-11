import { StarsBackground } from "@/components/ui/stars-bg";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FrameTitle,
} from "@/components/ui/frame";
import Image from "next/image";

export default function AboutSec() {
  return (
    <div className="relative flex min-h-screen items-center justify-center w-full overflow-hidden">
      <StarsBackground
        starDensity={0.005}
        minTwinkleSpeed={1}
        className="flex z-300"
      />
      <Image
        src={"/img/bg-planets2.png"}
        alt="bg"
        fill
        className="absolute inset-0 top-10 z-100 w-full h-full object-cover pointer-events-none select-none"
        priority
        draggable={false}
      />
      <Image
        src={"/img/bg-stars2.png"}
        alt="bg"
        fill
        className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none select-none opacity-25"
        priority
        draggable={false}
      />

      {/* Half moon glow emerging from bottom - responsive */}
      <div
        className="pointer-events-none absolute left-1/2 top-0
          h-32 w-full sm:h-48 sm:w-[110%] md:h-64 md:w-[115%] lg:h-72 lg:w-[120%]
          -translate-x-1/2
          rounded-b-full
          bg-[radial-gradient(circle_at_50%_0%,rgba(120,170,255,0.95)_0%,rgba(70,130,255,0.65)_35%,rgba(40,90,210,0.35)_60%,rgba(0,0,0,0)_78%)]
          blur-xl sm:blur-2xl opacity-80 sm:opacity-85 md:opacity-90"
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
      <div className="flex items-center justify-center w-full h-full z-200">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20">
          <Frame className="relative flex h-full md:min-w-5xl mx-auto px-5">
            {/* Top right image - adjust src and sizes as needed */}
            <div className="absolute -top-3 md:-top-20 right-4 z-20">
              <Image
                src="/img/astronut.png"
                alt="Decorative"
                width={100}
                height={100}
                className="object-contain w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                draggable={false}
                priority
              />
            </div>
            <FrameHeader>
              <FrameTitle className="text-4xl text-center font-lora text-secondary font-bold drop-shadow-lg">
                About
              </FrameTitle>
              <FrameDescription className="text-lg md:text-xl tracking-tight mt-2 font-lora italic text-secondary text-justify">
                Organized by Team TechnoJam, the University’s student-led
                Technical Club, in collaboration with the School of Computing
                Science and Engineering, Dexterix 5.0 promises an electrifying
                36-hour immersion into the future of technology and innovation.
                Building on the remarkable success of its previous editions,
                Dexterix 5.0 is poised to welcome over 600 participants from
                more than 100 colleges and universities across India, bringing
                together some of the brightest young minds in engineering,
                design, and entrepreneurship.
                <br />
                <br />
                Since its inception in 2018, Dexterix has evolved from a
                grassroots initiative into a nationally recognized platform that
                fosters creativity, technical excellence, and cross-disciplinary
                collaboration. The event serves as a catalyst for transforming
                bold ideas into impactful solutions, encouraging participants to
                experiment, learn, and push the boundaries of what’s possible.
                By cultivating a vibrant ecosystem of innovators, mentors, and
                industry experts, Dexterix continues to ignite curiosity,
                nurture entrepreneurial ambition, and inspire the next
                generation of technology leaders.
              </FrameDescription>
            </FrameHeader>
          </Frame>
        </div>
      </div>
    </div>
  );
}
