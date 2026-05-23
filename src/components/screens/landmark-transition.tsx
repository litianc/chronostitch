"use client";

import { motion } from "framer-motion";

export function LandmarkTransition() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center gap-6 py-12"
    >
      <svg
        width="180"
        height="80"
        viewBox="0 0 180 80"
        fill="none"
        className="text-[#D97D54] opacity-40"
      >
        <polyline
          points="10,65 45,20 70,45 90,10 115,42 140,22 170,65"
          stroke="#2D321F"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M5,72 C50,60 130,60 175,72"
          stroke="#D97D54"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        <circle cx="22" cy="65" r="3" fill="#2D321F" opacity="0.5" />
        <circle cx="158" cy="65" r="3" fill="#D97D54" />
        <circle cx="90" cy="38" r="8" stroke="#D97D54" strokeWidth="1" opacity="0.5" />
        <line x1="90" y1="32" x2="90" y2="44" stroke="#D97D54" strokeWidth="1" opacity="0.5" />
        <line x1="84" y1="38" x2="96" y2="38" stroke="#D97D54" strokeWidth="1" opacity="0.5" />
      </svg>
      <p className="text-sm font-heading text-[#5C624E] tracking-wide">
        正在为旅途调好经纬…
      </p>
    </motion.div>
  );
}
