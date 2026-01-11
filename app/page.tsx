import AboutSec from "@/components/custom/site/sections/about.sec";
import ContactSec from "@/components/custom/site/sections/contact.sec";
import EventsSec from "@/components/custom/site/sections/events.sec";
import HeroSec from "@/components/custom/site/sections/hero.sec";
import PrizeSec from "@/components/custom/site/sections/prize.sec";
import ScheduleSec from "@/components/custom/site/sections/schedule.sec";
import SponsorSec from "@/components/custom/site/sections/sponsor.sec";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <section id="hero" className="bg-[#05193B]">
        <HeroSec />
      </section>

      <section id="about" className="bg-[#05193B]">
        <AboutSec />
      </section>

      <section id="schedule" className="bg-[#05193B]">
        <ScheduleSec />
      </section>

      <section id="events" className="bg-[#05193B]">
        <EventsSec />
      </section>

      <section id="sponsor" className="bg-[#05193B]">
        <SponsorSec />
      </section>

      <section id="prize" className="bg-[#05193B]">
        <PrizeSec />
      </section>

      <section id="contact" className="bg-[#05193B]">
        <ContactSec />
      </section>
    </div>
  );
}
