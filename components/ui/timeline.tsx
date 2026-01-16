"use client";
import { useScroll, useTransform, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDotRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current && lastDotRef.current) {
        const rect = ref.current.getBoundingClientRect();
        const lastDotRect = lastDotRef.current.getBoundingClientRect();
        // Calculate height from top of container to center (or bottom) of last dot
        // Relative top of last dot = lastDotRect.top - rect.top
        // Add half height to center it, or full height to encompass it.
        // Let's go with center for "touch & end".
        const newHeight = lastDotRect.top - rect.top + lastDotRect.height;
        setHeight(newHeight);
      } else if (ref.current) {
        // Fallback if no dot ref (shouldn't happen with data)
        const rect = ref.current.getBoundingClientRect();
        setHeight(rect.height);
      }
    };

    updateHeight();
    // Need to wait for layout paint potentially? A small timeout or ResizeObserver is better, but stick to resize + init for now.
    // Actually, calling it immediately might be too early for rects if rendering is expensive.
    // A simplistic approach is usually fine in React effect, but let's add a small delay if needed.
    // For now, standard effect call.

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 50%", "end 100%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-transparent font-sans px-4 md:px-10"
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {/* Central Line */}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute left-8 md:left-1/2 top-0 -ml-[1px] w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-full bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>

        {data.map((item, index) => {
          const isRight = index % 2 === 0;

          return (
            <div
              key={index}
              className="relative grid grid-cols-[auto_1fr] md:grid-cols-[1fr_auto_1fr] items-start gap-x-4 md:gap-x-10 py-10 md:py-20"
            >
              {/* Left Column - Desktop Only */}
              <div
                className={`hidden md:flex flex-col ${isRight ? "opacity-0" : "text-right items-end"}`}
              >
                {!isRight && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="md:pr-4 bg-white/5 backdrop-blur-sm border border-neutral-200/20 dark:border-neutral-700/50 rounded-2xl p-6 shadow-xl w-full"
                  >
                    <h3 className="text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                      {item.title}
                    </h3>
                    {item.content}
                  </motion.div>
                )}
              </div>

              {/* Center Dot */}
              <div className="relative flex flex-col items-center z-20 w-16 md:w-auto">
                <div
                  ref={index === data.length - 1 ? lastDotRef : null}
                  className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 mt-8 md:mt-10 shadow-sm"
                />
              </div>

              {/* Right Column - Mobile & Desktop */}
              <div
                className={`flex flex-col ${!isRight ? "md:hidden" : "text-left items-start"} w-full`}
              >
                {/* Desktop Right (Even) OR Mobile Right (Even) */}
                {isRight && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="md:pl-4 bg-white/5 backdrop-blur-sm border border-neutral-200/20 dark:border-neutral-700/50 rounded-2xl p-6 shadow-xl w-full"
                  >
                    <h3 className="text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                      {item.title}
                    </h3>
                    {item.content}
                  </motion.div>
                )}
                {/* Mobile Left (Odd) - Shown here on mobile */}
                {!isRight && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="md:hidden text-left pl-0 bg-white/5 backdrop-blur-sm border border-neutral-200/20 dark:border-neutral-700/50 rounded-2xl p-6 shadow-xl w-full"
                  >
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                      {item.title}
                    </h3>
                    {item.content}
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
