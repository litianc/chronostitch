"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

type PocketActionsProps = {
  onNightReveal: () => void;
  onOpenJournal: () => void;
};

export function PocketActions({ onNightReveal, onOpenJournal }: PocketActionsProps) {
  return (
    <div className="space-y-2.5 pt-2">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onNightReveal}
        className="w-full py-1.5 border border-[#D97D54] text-[#D97D54] bg-white text-[10px] font-semibold rounded-xl flex items-center justify-center gap-1 hover:bg-[#D97D54]/5 transition-colors"
      >
        模拟夜间降临（唤醒弹窗）
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onOpenJournal}
        className="w-full py-3 bg-[#D97D54] hover:bg-[#2D321F] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        <span>生成并精制今日行旅手帐</span>
      </motion.button>
    </div>
  );
}
