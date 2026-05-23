"use client";

import { motion } from "framer-motion";

type PocketProgressBannerProps = {
  count: number;
  progress: number;
};

export function PocketProgressBanner({ count, progress }: PocketProgressBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-3.5 bg-white/50 backdrop-blur-sm border border-[rgba(45,50,31,0.12)] rounded-2xl"
    >
      <div className="flex justify-between items-center text-[10px] text-[#5C624E]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4E8E6F] animate-pulse" />
          今日微光片段 {count} 段编排就绪
        </span>
        <span className="font-heading font-bold text-[#D97D54]">
          时空缝合中 {progress}%
        </span>
      </div>
      <div className="mt-2.5 h-[3px] bg-[#2D321F]/5 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#D97D54] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <p className="text-[9px] text-[#8E947A] mt-1.5 leading-relaxed">
        今日对话与照片会在这里沉淀成可回看的行程进展。
      </p>
    </motion.div>
  );
}
