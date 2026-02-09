"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const PLANETS = [
  "/svg/planet01.webp",
  "/svg/planet02.webp",
  "/svg/planet03.webp",
  "/svg/planet04.webp",
  "/svg/planet05.webp",
  "/svg/planet06.webp",
  "/svg/planet07.webp",
  "/svg/planet08.webp",
];

interface PlanetData {
  id: number;
  src: string;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

// 6 Hardcoded Layouts
const LAYOUTS: PlanetData[][] = [
  // Layout 1: Balanced spread
  [
    { id: 0, src: PLANETS[0], top: 10, left: 10, size: 200, delay: 0, duration: 20 },
    { id: 1, src: PLANETS[1], top: 20, left: 85, size: 160, delay: 1, duration: 18 },
    { id: 2, src: PLANETS[2], top: 60, left: 5, size: 100, delay: 0.5, duration: 22 },
    { id: 3, src: PLANETS[3], top: 70, left: 80, size: 300, delay: 1.5, duration: 19 },
    { id: 4, src: PLANETS[4], top: 15, left: 45, size: 50, delay: 2, duration: 25 },
    { id: 5, src: PLANETS[5], top: 80, left: 30, size: 160, delay: 0.8, duration: 21 },
  ],
  // Layout 2: Corner focused
  [
    { id: 0, src: PLANETS[6], top: 5, left: 5, size: 160, delay: 0, duration: 24 },
    { id: 1, src: PLANETS[7], top: 10, left: 20, size: 60, delay: 1, duration: 20 },
    { id: 2, src: PLANETS[0], top: 80, left: 85, size: 110, delay: 0.5, duration: 22 },
    { id: 3, src: PLANETS[1], top: 70, left: 75, size: 120, delay: 1.5, duration: 18 },
    { id: 4, src: PLANETS[2], top: 40, left: 90, size: 160, delay: 2, duration: 25 },
    { id: 5, src: PLANETS[3], top: 50, left: 10, size: 40, delay: 0.2, duration: 15 },
  ],
  // Layout 3: Top heavy
  [
    { id: 0, src: PLANETS[4], top: 5, left: 15, size: 90, delay: 0, duration: 20 },
    { id: 1, src: PLANETS[5], top: 10, left: 35, size: 70, delay: 1.2, duration: 18 },
    { id: 2, src: PLANETS[6], top: 8, left: 60, size: 100, delay: 0.5, duration: 23 },
    { id: 3, src: PLANETS[7], top: 12, left: 85, size: 80, delay: 1.8, duration: 19 },
    { id: 4, src: PLANETS[0], top: 80, left: 20, size: 50, delay: 2.5, duration: 25 },
    { id: 5, src: PLANETS[1], top: 75, left: 70, size: 60, delay: 0.9, duration: 21 },
  ],
  // Layout 4: Side columns
  [
    { id: 0, src: PLANETS[2], top: 10, left: 5, size: 70, delay: 0, duration: 19 },
    { id: 1, src: PLANETS[3], top: 40, left: 8, size: 90, delay: 1, duration: 22 },
    { id: 2, src: PLANETS[4], top: 70, left: 5, size: 80, delay: 0.4, duration: 20 },
    { id: 3, src: PLANETS[5], top: 15, left: 88, size: 85, delay: 1.4, duration: 21 },
    { id: 4, src: PLANETS[6], top: 45, left: 85, size: 75, delay: 2.1, duration: 24 },
    { id: 5, src: PLANETS[7], top: 75, left: 89, size: 60, delay: 0.7, duration: 17 },
  ],
  // Layout 5: Center ring (avoiding middle)
  [
    { id: 0, src: PLANETS[0], top: 20, left: 30, size: 160, delay: 0, duration: 20 },
    { id: 1, src: PLANETS[1], top: 20, left: 70, size: 420, delay: 1.5, duration: 22 },
    { id: 2, src: PLANETS[2], top: 70, left: 30, size: 180, delay: 0.6, duration: 19 },
    { id: 3, src: PLANETS[3], top: 70, left: 70, size: 200, delay: 2.0, duration: 23 },
    { id: 4, src: PLANETS[4], top: 10, left: 50, size: 160, delay: 1.0, duration: 25 },
    { id: 5, src: PLANETS[5], top: 85, left: 50, size: 200, delay: 0.3, duration: 21 },
  ],
  // Layout 6: Big & Small contrast
  [
    { id: 0, src: PLANETS[6], top: 15, left: 15, size: 150, delay: 0, duration: 28 },
    { id: 1, src: PLANETS[7], top: 70, left: 80, size: 140, delay: 1.2, duration: 26 },
    { id: 2, src: PLANETS[0], top: 30, left: 85, size: 40, delay: 0.5, duration: 18 },
    { id: 3, src: PLANETS[1], top: 60, left: 10, size: 45, delay: 1.8, duration: 19 },
    { id: 4, src: PLANETS[2], top: 5, left: 60, size: 30, delay: 2.4, duration: 15 },
    { id: 5, src: PLANETS[3], top: 90, left: 40, size: 35, delay: 0.9, duration: 16 },
  ],
];

interface FloatingPlanetsProps {
  layoutId?: 1 | 2 | 3 | 4 | 5 | 6;
  noOfPlanets?: number;
}

export function FloatingPlanets({
  layoutId = 1,
  noOfPlanets,
}: FloatingPlanetsProps) {
  // Use layoutId - 1 because arrays are 0-indexed
  const fullLayout = LAYOUTS[layoutId - 1] || LAYOUTS[0];
  const currentLayout = noOfPlanets
    ? fullLayout.slice(0, noOfPlanets)
    : fullLayout;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-[100] overflow-hidden pointer-events-none">
      {currentLayout.map((planet) => (
        <motion.div
          key={planet.id}
          className="absolute"
          style={{
            top: `${planet.top}%`,
            left: `${planet.left}%`,
            width: planet.size,
            height: planet.size,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            opacity: { duration: 1 },
            y: {
              duration: planet.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: planet.delay,
            },
            rotate: {
              duration: planet.duration * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: planet.delay,
            },
          }}
        >
          <Image
            src={planet.src}
            alt="planet"
            width={planet.size}
            height={planet.size}
            className="w-full h-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-500"
          />
        </motion.div>
      ))}
    </div>
  );
}
