"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { PocketSummary } from "@/lib/api";

type SummaryCardProps = {
  summary: PocketSummary | null;
  disabled: boolean;
  summarizing: boolean;
  onSummarize: () => void;
};

export function SummaryCard({ summary, disabled, summarizing, onSummarize }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="bg-white/70 border border-[rgba(45,50,31,0.12)] rounded-2xl p-3.5 space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-[#8E947A] uppercase">
            AI 行程整理
          </p>
          <h3 className="mt-1 font-heading text-base font-bold text-[#2D321F]">
            当前进展与下一站
          </h3>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onSummarize}
          disabled={disabled || summarizing}
          className="shrink-0 rounded-xl bg-[#2D321F] px-3 py-2 text-[11px] font-semibold text-[#FAF7F2] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {summarizing ? "整理中..." : "整理当前进展"}
        </motion.button>
      </div>

      {summary ? (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-[#5C624E] font-heading">
            {summary.progress}
          </p>
          <div className="grid gap-2">
            <div>
              <p className="text-[10px] font-bold text-[#2D321F]">已记录亮点</p>
              <ul className="mt-1 space-y-1">
                {summary.highlights.map((item) => (
                  <li key={item} className="text-[11px] text-[#5C624E] leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#2D321F]">下一站建议</p>
              <ul className="mt-1 space-y-1">
                {summary.nextStops.map((item) => (
                  <li key={item} className="text-[11px] text-[#5C624E] leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[11px] leading-relaxed text-[#8E947A]">
          点击按钮后，AI 会根据今天的聊天与上传照片整理进展，并提示下一站怎么走。
        </p>
      )}
    </motion.div>
  );
}
