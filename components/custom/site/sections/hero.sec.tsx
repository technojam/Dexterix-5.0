import { Button } from "@/components/ui/button";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default function HeroSec() {
  return (
  <div className="flex items-center justify-center h-full w-full mt-20">
    <div className="flex items-center justify-center gap-8 p-20">
        <div className="flex flex-col gap-4 max-w-3xl items-center text-center">
        <TypingAnimation className="text-4xl md:text-6xl font-bold text-foreground text-center">
            DEXTRIX 2025
            </TypingAnimation>
            <p className="text-lg md:text-xl text-foreground/70 text-center">
            Join us for an unforgettable experience of innovation, creativity, and technology. Explore cutting-edge projects, attend inspiring talks, and connect with fellow tech enthusiasts.
            </p>
            <div className="flex justify-center">
            <Button size={"lg"} className="mt-4">
            Register Now
            </Button>
        </div>
        </div>
    </div>
  </div>
);
}
