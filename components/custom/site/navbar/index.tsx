"use client";
import Link from "next/link";
import { MainNavbar } from "./main.nav";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { constants } from "@/lib/constants";

export function SiteNavbar() {
  return (
    <header className="fixed top-5 w-5/6 z-500 border border-border/40 bg-secondary/10 backdrop-blur-sm supports-backdrop-filter:bg-secondary/10 dark:border-border rounded-xl">
      <div className="container flex h-12 max-w-screen items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <MainNavbar />
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href={constants.socials.insta}
            target="_blank"
            rel="noreferrer"
            className="flex"
          >
            <div
              className={cn(
                buttonVariants({
                  variant: "secondary",
                }),
                "h-8 w-8 px-0 bg-secondary hover:bg-secondary/80",
              )}
            >
              <Image
                src={"/svg/insta.webp"}
                height={40}
                width={40}
                alt="ig"
                className="h-5 w-5 fill-current"
              />
              <span className="sr-only">Insta</span>
            </div>
          </Link>
          <Link
            href={constants.socials.discord}
            target="_blank"
            rel="noreferrer"
            className="flex"
          >
            <div
              className={cn(
                buttonVariants({
                  variant: "secondary",
                }),
                "h-8 w-8 px-0 bg-secondary hover:bg-secondary/80",
              )}
            >
              <Image
                src={"/svg/discord.webp"}
                height={40}
                width={40}
                alt="ig"
                className="h-5 w-5 fill-current"
              />
              <span className="sr-only">Discord</span>
            </div>
          </Link>
          <Link
            href={constants.socials.x}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex"
          >
            <div
              className={cn(
                buttonVariants({
                  variant: "secondary",
                }),
                "h-8 w-8 px-0 bg-secondary hover:bg-secondary/80",
              )}
            >
              <Image
                src={"/svg/x.webp"}
                height={40}
                width={40}
                alt="ig"
                className="h-5 w-5 fill-current"
              />
              <span className="sr-only">Twitter</span>
            </div>
          </Link>
          <Link
            href={constants.socials.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex"
          >
            <div
              className={cn(
                buttonVariants({
                  variant: "secondary",
                }),
                "h-8 w-8 px-0 bg-secondary hover:bg-secondary/80",
              )}
            >
              <Image
                src={"/svg/linkedin.webp"}
                height={40}
                width={40}
                alt="ig"
                className="h-5 w-5 fill-current"
              />
              <span className="sr-only">LinkedIn</span>
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}
