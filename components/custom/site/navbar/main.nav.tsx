"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNavbar() {
  const pathname = usePathname();

  return (
    <div className="flex">
      <Link
        href="/"
        draggable={false}
        className="mr-8 flex items-center space-x-2"
      >
        <Image
          src="/img/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="h-10 w-10 rounded-sm"
        />
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
        <Link
          href={"/"}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/home")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Home
        </Link>

        <Link
          href={"/about"}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/about")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          About
        </Link>

        <Link
          href={"/schedule"}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/schedule")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Schedule
        </Link>

        <Link
          href={"/events"}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/events")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Events
        </Link>

        <Link
          href={"/sponsor"}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/sponsor")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Sponsor
        </Link>

        <Link
          href={"/prize"}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/prize")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Prize
        </Link>

        <Link
          href={"/contact"}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/contact")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Contact
        </Link>
      </nav>
    </div>
  );
}
