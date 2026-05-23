"use client";

import { motion } from "framer-motion";
import type { TripMessage } from "@/lib/api";

type ChatMessageBubbleProps = {
  message: TripMessage;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const d = new Date(message.createdAt);
  const time = d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-2.5 ${message.role === "user" ? "ml-auto justify-end max-w-[85%]" : "max-w-[85%]"}`}
    >
      {message.role === "assistant" && (
        <div className="w-7 h-7 rounded-full bg-[#2D321F] text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
          AI
        </div>
      )}
      <div
        className={`rounded-2xl p-3.5 ${
          message.role === "user"
            ? "bg-[#D97D54]/10 border border-[#D97D54]/20 rounded-tr-none"
            : "bg-white border border-[rgba(45,50,31,0.12)] rounded-tl-none"
        }`}
      >
        <p className="text-xs font-heading text-[#2D321F] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <span className="text-[9px] text-[#8E947A] block mt-1.5 font-mono">
          {time}
        </span>
      </div>
      {message.role === "user" && (
        <div className="w-7 h-7 rounded-full bg-[#D97D54] text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
          我
        </div>
      )}
    </motion.div>
  );
}
