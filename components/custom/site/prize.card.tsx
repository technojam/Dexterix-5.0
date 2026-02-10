"use client";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Rocket, Sparkles } from "lucide-react";
import Image from "next/image";

interface PrizeCardProps {
  rank: 1 | 2 | 3 | 4 | 5;
  image: string;
  prizeName: string;
  prizeValue: string;
  winnerName?: string;
}

const rankStyles = {
  1: {
    gradient: "from-yellow-400/30 via-amber-500/20 to-yellow-600/30",
    border: "border-yellow-400/50",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
    textGradient: "from-yellow-200 via-yellow-400 to-amber-500",
    badgeBg: "bg-gradient-to-br from-yellow-400 to-amber-600",
    size: "w-72 md:w-80",
    imageSize: "w-40 h-40 md:w-48 md:h-48",
    icon: Trophy,
    ring: "ring-2 ring-yellow-400/30",
  },
  2: {
    gradient: "from-slate-300/30 via-gray-400/20 to-slate-500/30",
    border: "border-slate-400/50",
    glow: "shadow-[0_0_25px_rgba(148,163,184,0.25)]",
    textGradient: "from-slate-200 via-gray-300 to-slate-400",
    badgeBg: "bg-gradient-to-br from-slate-300 to-gray-500",
    size: "w-64 md:w-72",
    imageSize: "w-32 h-32 md:w-40 md:h-40",
    icon: Medal,
    ring: "ring-2 ring-slate-400/30",
  },
  3: {
    gradient: "from-amber-600/30 via-orange-700/20 to-amber-800/30",
    border: "border-amber-600/50",
    glow: "shadow-[0_0_25px_rgba(217,119,6,0.25)]",
    textGradient: "from-amber-400 via-orange-500 to-amber-700",
    badgeBg: "bg-gradient-to-br from-amber-600 to-orange-800",
    size: "w-64 md:w-72",
    imageSize: "w-32 h-32 md:w-40 md:h-40",
    icon: Award,
    ring: "ring-2 ring-amber-600/30",
  },
  4: {
    gradient: "from-purple-500/30 via-violet-600/20 to-purple-700/30",
    border: "border-purple-500/50",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    textGradient: "from-purple-300 via-violet-400 to-purple-600",
    badgeBg: "bg-gradient-to-br from-purple-500 to-violet-700",
    size: "w-56 md:w-64",
    imageSize: "w-28 h-28 md:w-32 md:h-32",
    icon: Rocket,
    ring: "ring-2 ring-purple-500/30",
  },
  5: {
    gradient: "from-blue-500/30 via-cyan-600/20 to-blue-700/30",
    border: "border-blue-500/50",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    textGradient: "from-blue-300 via-cyan-400 to-blue-600",
    badgeBg: "bg-gradient-to-br from-blue-500 to-cyan-700",
    size: "w-56 md:w-64",
    imageSize: "w-28 h-28 md:w-32 md:h-32",
    icon: Sparkles,
    ring: "ring-2 ring-blue-500/30",
  },
};

const rankOrdinal = ["", "Winner", "Runner up", "Second Runner up", "All Best Girls team", ""];

const PrizeCard = ({
  rank,
  image,
  prizeValue,
}: PrizeCardProps) => {
  const styles = rankStyles[rank];
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: rank === 1 ? 0.2 : rank <= 3 ? 0.4 : 0.6,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { duration: 0.3 },
      }}
      className={`${styles.size} relative group`}
    >
      {/* Glassmorphic Card */}
      <div
        className={`
        relative p-6 rounded-2xl overflow-hidden
        bg-gradient-to-br ${styles.gradient}
        backdrop-blur-xl
        border ${styles.border}
        ${styles.glow}
        ${styles.ring}
        transition-all duration-300
      `}
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rank Badge */}
        <motion.div
          className={`
            absolute -top-3 -right-3 w-12 h-12 rounded-full
            ${styles.badgeBg}
            flex items-center justify-center
            font-bold text-white text-xl
            shadow-lg z-10
            border-2 border-white/20
          `}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {rank}
        </motion.div>

        {/* Decorative Icon */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 left-4 opacity-20 z-0"
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Prize Image Container */}
        <div className="flex flex-col items-center relative z-10">
          <motion.div
            className={`
              ${styles.imageSize} 
              rounded-xl overflow-hidden mb-6 
              relative
              ring-4 ring-white/10
              shadow-2xl
            `}
            animate={{ // Reduced animation complexity
                y: [0, -4, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src={image}
              alt={`${rankOrdinal[rank]} Place Prize`}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />

            {/* Image overlay with gradient */}
            <div
              className={`
              absolute inset-0 
              bg-gradient-to-t from-black/40 via-transparent to-transparent
            `}
            />

            {/* Shimmer effect for ALL ranks, but slightly different delays to avoid uniform movement */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" // Reduced opacity
                animate={{
                  translateX: ["-100%", "100%"], // Using translateX is better for performance than x string %
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 2 + (rank * 0.5), // Staggered delays
                }}
              />
          </motion.div>

          {/* Prize Info */}
          <div className="text-center w-full">
            <h3
              className={`
              font-bold text-xl md:text-2xl mb-2
              bg-gradient-to-r ${styles.textGradient}
              bg-clip-text text-transparent
              drop-shadow-lg
            `}
            >
              {rankOrdinal[rank]}
            </h3>

            {/* <p className="text-white/80 text-sm md:text-base mb-3 font-medium">
              {prizeName}
            </p> */}

            <div
              className={`
              text-2xl md:text-3xl font-bold
              bg-gradient-to-r ${styles.textGradient}
              bg-clip-text text-transparent
              drop-shadow-lg
            `}
            >
              {prizeValue}
            </div>

            {/* {winnerName && (
              <p className="text-white/60 text-xs mt-3 italic">{winnerName}</p>
            )} */}
          </div>
        </div>

        {/* Sparkle effects for ALL ranks */}
          <>
            <motion.div
              className="absolute top-8 right-12"
              animate={{
                opacity: [0, 0.8, 0], // Reduced max opacity
                scale: [0.5, 1, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 + (rank * 0.2) }} // Staggered
            >
              <Sparkles className={`w-5 h-5 ${rank === 1 ? 'text-yellow-300' : 'text-white/40'}`} />
            </motion.div>
            <motion.div
              className="absolute bottom-16 left-8"
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 + (rank * 0.2) }} // Staggered
            >
              <Sparkles className={`w-4 h-4 ${rank === 1 ? 'text-yellow-300' : 'text-white/40'}`} />
            </motion.div>
          </>
      </div>
    </motion.div>
  );
};

export default PrizeCard;