"use client";

import { motion } from "framer-motion";

export function WaveForm() {
  const bars = [40, 70, 20, 90, 50, 30, 80, 60, 45, 75, 25, 85, 55, 35, 65];

  return (
    <div className="flex items-end gap-0.5 flex-1 h-5">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-[#8E947A]"
          style={{ height: `${h}%` }}
          animate={{ height: [`${h}%`, `${Math.max(20, h - 20)}%`, `${h}%`] }}
          transition={{ duration: 1.5, delay: i * 0.08, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
