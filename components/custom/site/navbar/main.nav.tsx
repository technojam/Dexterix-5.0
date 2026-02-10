"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function MainNavbar() {
  return (
    <div className="flex">
      <Link
        href="/"
        draggable={false}
        className="mr-8 flex items-center space-x-2"
      >
        <Image
          src="/img/logo.webp"
          alt="Logo"
          width={40}
          height={40}
          className="h-10 w-10 rounded-sm"
        />
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-lg font-bold font-lora">
        <Link
          href={"/"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          Home
        </Link>

        <Link
          href={"/#about"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          About
        </Link>

        <Link
          href={"/#schedule"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          Schedule
        </Link>

        <Link
          href={"/#events"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          Events
        </Link>

        <Link
          href={"/#sponsor"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          Sponsor
        </Link>

        <Link
          href={"/#prize"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          Prize
        </Link>

        <Link
          href={"/#contact"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          Contact
        </Link>
        <Link
          href={"/hub"}
          draggable={false}
          className={cn(
            "transition-colors hover:text-secondary/80 text-secondary",
          )}
        >
          Hackathon Hub
        </Link>
      </nav>
    </div>
  );
}
