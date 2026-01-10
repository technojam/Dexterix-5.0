import AboutSec from "@/components/custom/site/sections/about.sec";
import HeroSec from "@/components/custom/site/sections/hero.sec";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <section id="hero" className="bg-[#05193B]">
        <HeroSec />
      </section>

      <section id="about" className="bg-[#05193B]">
        <AboutSec />
      </section>
    </div>
  );
}
