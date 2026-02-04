import { socials } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      id="footer"
      className="relative flex flex-col h-full w-full text-center mt-auto mb-2/5 bg-[#05193B]"
    >
      <Image
        src={"/img/bg-earth.webp"}
        alt="bg"
        fill
        className="absolute inset-0 top-10 z-50 opacity-35 w-full h-full object-cover pointer-events-none select-none"
        priority
        draggable={false}
      />
      <Image
        src={"/img/bg-stars2.webp"}
        alt="bg"
        fill
        className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none select-none opacity-10"
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
      <div className="flex flex-col items-start gap-2 p-4 md:p-8 relative z-200 text-left w-full">
        <Link
          href="/"
          className="flex items-center space-x-2 select-none cursor-pointer"
        >
          <div className="relative overflow-hidden rounded">
            <Image
              src="/img/logo.webp"
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
        <p className="text-gray-300 text-sm max-w-lg">
          We&apos;re finding new gen Dexters to build the next-gen products.
          Register now to be a part of the DEXTRIEX 5.0!
        </p>

        <div className="flex flex-col">
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
            </Link>{" "}
            from TechnoJam
          </span>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 my-5 gap-20">
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white">Quick Links</span>
              <Link href={"#hero"} className="hover:text-secondary text-gray-400">
                Home
              </Link>
              <Link
                href={"#about"}
                className="hover:text-secondary text-gray-400"
              >
                About
              </Link>
              <Link
                href={"#schedule"}
                className="hover:text-secondary text-gray-400"
              >
                Schedule
              </Link>
              <Link
                href={"#events"}
                className="hover:text-secondary text-gray-400"
              >
                Events
              </Link>
              <Link
                href={"#sponsor"}
                className="hover:text-secondary text-gray-400"
              >
                Sponsors
              </Link>
              <Link
                href={"#prize"}
                className="hover:text-secondary text-gray-400"
              >
                Prizes
              </Link>
              <Link
                href={"#contact"}
                className="hover:text-secondary text-gray-400"
              >
                Contact
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white">Connect</span>
              <Link
                href={socials.x}
                className="hover:text-secondary text-gray-400"
              >
                X (Twitter)
              </Link>
              <Link
                href={socials.discord}
                className="hover:text-secondary text-gray-400"
              >
                Discord
              </Link>
              <Link
                href={socials.insta}
                className="hover:text-secondary text-gray-400"
              >
                Instagram
              </Link>
              <Link
                href={socials.linkedin}
                className="hover:text-secondary text-gray-400"
              >
                LinkedIn
              </Link>
              <Link
                href={socials.email}
                className="hover:text-secondary text-gray-400"
              >
                Email
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white">Resources</span>
              <Link href={"https://drive.google.com/file/d/1BOJiTp_Ms9sBKN36NTd7s9coyrL9KQhb/view?usp=drive_link"} className="hover:text-secondary text-gray-400">
                Sponsorship Brochure
              </Link>

              <Link href={"#"} className="hover:text-secondary text-gray-400">
                Code of Conduct
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white">Archives</span>

              <Link href={"https://www.instagram.com/p/B5ZB_tbnaVw/?img_index=1"} className="hover:text-secondary text-gray-400">
                DEXTRIEX 2.0
              </Link>

              <Link href={"https://www.instagram.com/p/CgCTkF2MAM9/?img_index=1"} className="hover:text-secondary text-gray-400">
                DEXTRIEX 3.0
              </Link>

              <Link href={"https://www.instagram.com/p/C5hhV4gPDax/?igsh=MWVvMjczeWZreDdwdw=="} className="hover:text-secondary text-gray-400">
                DEXTRIEX 4.0
              </Link>

              <Link href={"https://www.instagram.com/p/CjNY8ypvmeX/?img_index=1"} className="hover:text-secondary text-gray-400">
                NASA Space Apps Challenge
              </Link>

              <Link href={"https://www.instagram.com/p/DOD-1YcAYDY/?igsh=MW1yaTJodWdsanU0eA=="} className="hover:text-secondary text-gray-400">
                SMART INDIA HACKATHON 2025
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
