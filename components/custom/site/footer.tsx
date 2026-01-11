import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      id="footer"
      className="relative flex flex-col h-full w-full text-center mt-auto mb-2/5 bg-[#05193B]"
    >
      <Image
        src={"/img/bg-earth.png"}
        alt="bg"
        fill
        className="absolute inset-0 top-10 z-50 opacity-45 w-full h-full object-cover pointer-events-none select-none"
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
          h-32 w-full
          -translate-x-1/2
          rounded-b-full
          bg-[radial-gradient(circle_at_50%_0%,rgba(120,170,255,0.95)_0%,rgba(70,130,255,0.65)_35%,rgba(40,90,210,0.35)_60%,rgba(0,0,0,0)_78%)]
          blur-xl sm:blur-2xl opacity-80 sm:opacity-85 md:opacity-90"
      />
      <section
        id="footer-bottom"
        className="flex flex-col z-300 md:flex-row items-center justify-between gap-6 p-5"
      >
        <div className="flex flex-col w-full md:max-w-sm text-center items-center md:items-start md:text-start">
          <Link
            href="/"
            className="flex items-center space-x-2 select-none cursor-pointer"
          >
            <div className="relative overflow-hidden rounded">
              <Image
                src="/img/logo.png"
                alt="logo"
                className="object-center object-cover"
                width={60}
                height={60}
                priority
              />
            </div>
            <span className="text-2xl text-secondary font-lora drop-shadow-2xl font-bold">
              DEXTRIEX 5.0
            </span>
          </Link>
          <p className="text-sm text-secondary">
            © 2026 Dextrix. All rights reserved by Team TechnoJam.
          </p>
          <span className="font-lora mt-2 text-secondary">
            Built with ❤️ by{" "}
            <Link
              href={
                "https://l.devwtf.in/x?utm_source=technojam_dextrix&utm_medium=footer&utm_campaign=brand"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              <span className="font-semibold italic text-secondary">
                Saidev Dhal
              </span>
            </Link>
            {" "} from TechnoJam
          </span>
        </div>
        <div className="flex flex-col items-center md:items-end text-center md:text-right mt-4 md:mt-0 w-full md:w-auto">
          <Button variant="outline" size="lg" className="mb-2">
            Register Today!
          </Button>
          <p className="text-sm font-lora italic text-secondary">
            Build. Break. Repeat.
          </p>
        </div>
      </section>
    </footer>
  );
}
