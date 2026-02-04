"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

import Image from "next/image";

interface ImageStackItem {
  id: number;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface ImageStackCarouselProps {
  images: ImageStackItem[];
  autoplayDelay?: number;
  className?: string;
}

const ImageStackCarousel = ({
  images,
  autoplayDelay = 5000,
  className = "",
}: ImageStackCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Autoplay logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [currentIndex, isAutoPlaying, autoplayDelay, handleNext]);

  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handlePrevious();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
  };



  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  return (
    <div className={`relative w-full z-5000 mx-auto ${className}`}>
      {/* Main carousel container */}
      <div 
        className="relative aspect-[16/9] md:aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Image stack with animation */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 35 },
              opacity: { duration: 0.25 },
              scale: { duration: 0.25 },
              rotateY: { duration: 0.25 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragStart={() => setIsAutoPlaying(false)}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Image
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              fill
              className="object-cover"
              priority
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Image info overlay */}
            {(images[currentIndex].title ||
              images[currentIndex].description) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
              >
                {images[currentIndex].title && (
                  <h3 className="text-3xl md:text-5xl font-bold font-lora text-white mb-2 drop-shadow-lg">
                    {images[currentIndex].title}
                  </h3>
                )}
                {images[currentIndex].description && (
                  <p className="hidden md:block text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-lg">
                    {images[currentIndex].description}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>




      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`
              relative h-2 rounded-full transition-all duration-300
              ${
                index === currentIndex
                  ? "w-8 bg-gradient-to-r from-blue-400 to-purple-500"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }
            `}
            aria-label={`Go to image ${index + 1}`}
          >
            {index === currentIndex && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg shadow-blue-500/50"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Image counter */}
      <div className="text-center mt-4">
        <p className="text-white/60 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
};

export default ImageStackCarousel;
