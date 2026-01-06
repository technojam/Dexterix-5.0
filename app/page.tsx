import HeroSec from "@/components/custom/site/sections/hero.sec";
import NumbersSec from "@/components/custom/site/sections/numbers.sec";

export default function Home() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <section id="hero">
        <HeroSec />
      </section>

      <section id="numbers">
        <NumbersSec />
      </section>
    </div>
  );
}
