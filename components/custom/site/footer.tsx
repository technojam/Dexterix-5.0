import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      id="footer"
      className="flex flex-col w-full border-t border-solid border-[rgba(55,50,47,0.12)] shadow-[0_-1px_0px_0px_white] text-center mt-auto mb-2/5 bg-[#05193B]"
    >
      <section
        id="footer-bottom"
        className="flex flex-col md:flex-row items-center justify-between gap-6 p-5"
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
            <span className="text-2xl text-muted-foreground font-semibold">
              DEXTRIEX 5.0
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Send transactional and marketing emails with AutoSend—clean API for
            developers, simple campaign tools for marketers.
          </p>
          <span className="font-lora mt-2 text-muted-foreground">
            Built with ❤️ by{" "}
            <Link
              href={
                "https://l.devwtf.in/x?utm_source=technojam_dextrix&utm_medium=footer&utm_campaign=brand"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              <span className="font-semibold italic text-primary">
                Saidev Dhal
              </span>
            </Link>
          </span>
        </div>
        <div className="flex flex-col items-center md:items-end text-center md:text-right mt-4 md:mt-0 w-full md:w-auto">
          <Button variant="outline" size="lg" className="mb-2">
            Register Today!
          </Button>
          <p className="text-sm font-lora italic text-muted-foreground">
            Private Repositories Shared Securely
          </p>
        </div>
      </section>
    </footer>
  );
}
