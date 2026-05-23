"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { PocketFragment } from "./pocket-types";
import { WaveForm } from "./wave-form";

type TimelineCardProps = {
  fragment: PocketFragment;
  index: number;
};

export function TimelineCard({ fragment, index }: TimelineCardProps) {
  const time = new Date(fragment.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const completed = fragment.status === "ready";
  const dotColors = ["#D97D54", "#4E8E6F", "#2D321F"];
  const dotColor = dotColors[index % dotColors.length];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, type: "spring" as const, stiffness: 280, damping: 30 }}
    >
      <div
        className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <div className="bg-white border border-[rgba(45,50,31,0.12)] p-3 rounded-2xl space-y-2 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-bold font-heading text-[#2D321F]">
              {fragment.location ?? "未知地点"}
            </p>
            <p className="text-[9px] text-[#8E947A] mt-0.5">
              {time} · {fragment.mediaType === "audio" ? "多元声纹识别" : "智能视觉解析"}
            </p>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-heading ${
            completed
              ? "bg-[#4E8E6F]/10 text-[#4E8E6F]"
              : "bg-[#2D321F]/5 text-[#5C624E]"
          }`}>
            {completed ? "已完成行程" : fragment.mediaType === "audio" ? "声音片段" : "视觉片段"}
          </span>
        </div>

        <p className="text-[11px] font-heading text-[#5C624E] leading-relaxed">
          {fragment.description ?? "AI 正在为这段旅途编织文字..."}
        </p>

        {fragment.mediaType === "audio" && (
          <div className="flex items-center gap-3 bg-[#FAF7F2] p-2 rounded-xl border border-[rgba(45,50,31,0.08)]">
            <button
              aria-label="播放录音"
              className="w-6 h-6 rounded-full bg-[#2D321F] text-white flex items-center justify-center text-xs hover:scale-105 transition-transform"
            >
              <Play className="w-3 h-3 fill-white" />
            </button>
            <WaveForm />
            <span className="text-[9px] text-[#8E947A] font-mono">12&apos;&apos;</span>
          </div>
        )}

        {fragment.mediaType === "image" && fragment.mediaUrl && (
          <div className="relative rounded-xl overflow-hidden border border-[rgba(45,50,31,0.12)]">
            <img
              src={fragment.mediaUrl}
              alt={fragment.location ?? "旅途片段"}
              className="w-full h-32 object-cover"
            />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 text-[9px] text-white rounded backdrop-blur-sm">
              {fragment.location ?? "旅途片段"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
