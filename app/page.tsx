import HeroSec from "@/components/custom/site/sections/hero.sec";
import dynamic from "next/dynamic";

const AboutSec = dynamic(() => import("@/components/custom/site/sections/about.sec"), {
  loading: () => <div className="h-[50vh] w-full bg-transparent" />,
});
const ContactSec = dynamic(() => import("@/components/custom/site/sections/contact.sec"));
const EventsSec = dynamic(() => import("@/components/custom/site/sections/events.sec"));
const PrizeSec = dynamic(() => import("@/components/custom/site/sections/prize.sec"));
const ScheduleSec = dynamic(() => import("@/components/custom/site/sections/schedule.sec"));
const SponsorSec = dynamic(() => import("@/components/custom/site/sections/sponsor.sec"));

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
