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
      <section id="hero">
        <HeroSec />
      </section>

      <section id="about">
        <AboutSec />
      </section>

      <section id="schedule">
        <ScheduleSec />
      </section>

      <section id="events">
        <EventsSec />
      </section>

      <section id="sponsor">
        <SponsorSec />
      </section>

      <section id="prize">
        <PrizeSec />
      </section>

      <section id="contact">
        <ContactSec />
      </section>
    </div>
  );
}
