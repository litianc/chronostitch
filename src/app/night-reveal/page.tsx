"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: "🎐",
    title: "古镇屋檐下 · 清远古韵微茫",
    desc: "清晨 09:12 AI 录制了 12秒铜铃与风的共振频率，还原了一场空山新雨后的静寂。",
  },
  {
    icon: "🚲",
    title: "洱海听涛线 · 少年随风而骑",
    desc: "下午 14:35 以照片中 5 只掠海红嘴鸥为意象，全自适应编译了一段风向手记与落日轨迹。",
  },
  {
    icon: "🔥",
    title: "沙溪暖红火 · 自主情绪缝合",
    desc: "晚上 19:40 捕捉了民谣炭香、老人歌谣与篝火噼啪碎裂声，已转化为专属的治愈拼图段落。",
  },
];

export default function NightRevealPage() {
  const router = useRouter();

  return (
    <div className="min-h-svh paper-bg flex flex-col relative">
      {/* Toast banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring" as const, stiffness: 250, damping: 25 }}
        className="mx-4 mt-4 bg-[#2D321F] text-white p-3.5 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">✦</span>
          <div>
            <h4 className="text-xs font-bold font-heading">今天的 8 段时空缝合已完成 ✦</h4>
            <p className="text-[9px] text-white/60">温暖极简手帐与 Vlog 已在后台安静备好</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => router.push("/journal")}
          className="px-2.5 py-1 bg-[#D97D54] text-white text-[9px] font-bold rounded-lg shrink-0"
        >
          点击查看
        </motion.button>
      </motion.div>

      {/* Sheet card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: "spring" as const, stiffness: 250, damping: 28 }}
        className="mx-4 mt-4 bg-[#FAF7F2] rounded-[2rem] border border-[rgba(45,50,31,0.12)] p-5 space-y-4 shadow-xl"
      >
        <div className="w-10 h-1 bg-[rgba(45,50,31,0.1)] rounded-full mx-auto" />
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest text-[#D97D54] uppercase font-bold font-heading">
              夜阑微澜集
            </span>
            <h3 className="font-heading text-lg font-bold text-[#2D321F] leading-tight">
              {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })} · 听大理的风在倾诉
            </h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            aria-label="关闭"
            className="w-7 h-7 rounded-full bg-[#2D321F]/5 text-[#5C624E] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Highlights */}
        <div className="space-y-3 bg-white/50 border border-[rgba(45,50,31,0.12)] p-4 rounded-2xl">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${i > 0 ? "border-t border-[rgba(45,50,31,0.08)] pt-2.5" : ""}`}>
              <span className="text-xs mt-0.5">{h.icon}</span>
              <div>
                <h4 className="text-xs font-bold font-heading text-[#2D321F]">{h.title}</h4>
                <p className="text-[10px] text-[#5C624E] mt-0.5 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="py-2.5 bg-[#2D321F]/5 hover:bg-[#2D321F]/10 text-[#2D321F] font-semibold rounded-xl text-xs transition-colors"
          >
            留作明日晨吟
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/journal")}
            className="py-2.5 bg-[#D97D54] hover:bg-[#2D321F] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <span>立刻合拢手帐</span>
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
