"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#about", label: "About" },
    { href: "/#schedule", label: "Schedule" },
    { href: "/#events", label: "Events" },
    { href: "/#sponsor", label: "Sponsor" },
    { href: "/#prize", label: "Prize" },
    { href: "/#contact", label: "Contact" },
    { href: "/hub", label: "Hackathon Hub" },
  ];

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        onClick={() => setIsOpen(true)}
        aria-label="Open Menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05193B] bg-opacity-95 backdrop-blur-sm"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-6 left-6 text-white hover:bg-white/10 scale-125"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Menu"
                >
                  <X className="h-8 w-8" />
                </Button>

                <nav className="flex flex-col items-center gap-8 p-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="text-3xl font-bold font-lora text-white/90 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}


