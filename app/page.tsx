import HeroSec from "@/components/custom/site/sections/hero.sec";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <section id="hero" className="border-b border-secondary bg-[#05193B]">
        <HeroSec />
      </section>

      <section id="numbers" className="border-b border-secondary bg-[#05193B]">
        {/* <NumbersSec /> */}
      </section>
    </div>
  );
}
