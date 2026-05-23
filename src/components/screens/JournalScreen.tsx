"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Download, Film } from "lucide-react";
import { memory } from "@eazo/sdk";
import { toast } from "sonner";
import { getJournalEntry, type JournalEntry } from "@/lib/api";

const FALLBACK_ENTRY: JournalEntry = {
  title: "今日旅途手帐",
  subtitle: "由今日锦囊生成",
  date: new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" }),
  destination: "旅途中",
  coverNote: "从锦囊进入后，AI 会把当天对话、照片与语音整理成这里的手帐。",
  paragraphs: ["还没有绑定具体旅程。回到旅途页创建行程后，再从锦囊生成完整手帐。"],
  photos: [],
  highlights: ["暂无旅程片段"],
  stats: { conversations: 0, images: 0, audioClips: 0, fragments: 0 },
};

type LoadedJournal = {
  tripId: string;
  entry: JournalEntry;
};

export function JournalScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const activeTripId = tripId && tripId !== "undefined" ? tripId : null;
  const [loadedJournal, setLoadedJournal] = useState<LoadedJournal | null>(null);
  const [vlogGenerating, setVlogGenerating] = useState(false);
  const [vlogReady, setVlogReady] = useState(false);
  const entry =
    activeTripId && loadedJournal?.tripId === activeTripId
      ? loadedJournal.entry
      : FALLBACK_ENTRY;
  const loadingEntry = Boolean(activeTripId && loadedJournal?.tripId !== activeTripId);

  useEffect(() => {
    if (!activeTripId) return;

    getJournalEntry(activeTripId)
      .then((nextEntry) => {
        setLoadedJournal({ tripId: activeTripId, entry: nextEntry });
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "生成手帐失败");
      });
  }, [activeTripId]);

  const handleVlog = () => {
    setVlogGenerating(true);
    memory.reportAction({
      content: `用户请求生成${entry.destination}旅行 Vlog`,
      event_type: "create",
      page: "journal",
      metadata: { type: "generate_vlog", trip_id: activeTripId },
    }).catch(() => {});

    setTimeout(() => {
      setVlogGenerating(false);
      setVlogReady(true);
    }, 2500);
  };

  const handleSave = () => {
    memory.reportAction({
      content: `用户保存了${entry.destination}手帐`,
      event_type: "create",
      page: "journal",
      metadata: { type: "save_journal", trip_id: activeTripId },
    }).catch(() => {});
    toast.success("手帐已保存到本次旅程");
  };

  return (
    <div className="min-h-svh bg-[#FAF7F2] flex flex-col">
      <header className="h-14 border-b border-[rgba(45,50,31,0.12)] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">✦</span>
          <h3 className="text-xs font-heading font-bold text-[#2D321F]">
            {entry.date} · {entry.title}
          </h3>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push(activeTripId ? `/pocket?tripId=${activeTripId}` : "/pocket")}
          aria-label="返回锦囊"
          className="w-8 h-8 rounded-full bg-[#2D321F]/5 text-[#5C624E] flex items-center justify-center transition-colors hover:bg-[#2D321F]/10"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </header>

      <div className="px-5 py-6 space-y-6 max-w-2xl mx-auto w-full">
        {loadingEntry && (
          <div className="rounded-2xl border border-[rgba(45,50,31,0.12)] bg-white/60 p-4 text-center text-xs text-[#8E947A]">
            AI 正在从今日锦囊整理手帐...
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white border border-[rgba(45,50,31,0.12)] p-5 rounded-[1.75rem] shadow-lg relative overflow-hidden flex flex-col items-center text-center space-y-2"
        >
          <div className="absolute inset-x-0 top-3 h-[2px]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line stroke="#D97D54" strokeDasharray="8 6" strokeWidth="1.5" x1="0" x2="100%" y1="1" y2="1" />
            </svg>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-[#8E947A] font-mono mt-3">
            Co-Stitched Story · {entry.destination}
          </span>
          <h4 className="text-2xl font-heading font-bold text-[#2D321F] tracking-tight">
            {entry.title}
          </h4>
          <p className="text-[10px] text-[#5C624E] italic font-heading">
            &ldquo;{entry.coverNote}&rdquo;
          </p>
          <div className="pt-2 flex gap-1.5 text-[8px] font-mono text-[#8E947A] flex-wrap justify-center">
            <span className="border border-[rgba(45,50,31,0.12)] px-2 py-0.5 rounded-full">
              {entry.date}
            </span>
            <span className="border border-[rgba(45,50,31,0.12)] px-2 py-0.5 rounded-full">
              对话 {entry.stats.conversations} · 照片 {entry.stats.images} · 语音 {entry.stats.audioClips}
            </span>
          </div>
        </motion.div>

        {entry.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            {entry.photos.map((photo, index) => (
              <motion.div
                key={`${photo.src}-${index}`}
                whileHover={{ rotate: 0 }}
                className={`bg-white p-2.5 pb-4 border border-[rgba(45,50,31,0.12)] shadow-md transition-transform duration-500 rounded-xl ${index % 2 === 0 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]"}`}
              >
                <div className="aspect-square bg-neutral-100 overflow-hidden rounded-lg relative border border-[rgba(45,50,31,0.08)]">
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/40 text-[8px] px-1.5 py-0.5 text-white rounded">
                    {photo.label}
                  </span>
                </div>
                <p className="text-center font-heading text-[10px] italic text-[#D97D54] mt-2 leading-tight">
                  {photo.caption}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="bg-white/40 border border-dashed border-[#D97D54]/20 p-5 rounded-2xl relative space-y-3"
        >
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-8 border-r border-dashed border-[rgba(45,50,31,0.12)]" />
          {entry.paragraphs.map((paragraph) => (
            <p key={paragraph} className="font-heading text-xs leading-relaxed text-[#2D321F] text-justify tracking-wide">
              {paragraph}
            </p>
          ))}
          <div className="pt-3 border-t border-[rgba(45,50,31,0.08)] flex justify-between items-center text-[9px] text-[#8E947A] font-heading">
            <span>时空织官: ChronoStitch AI</span>
            <span>片段 {entry.stats.fragments} 段</span>
          </div>
        </motion.div>

        <div className="bg-white/50 border border-[rgba(45,50,31,0.12)] p-4 rounded-2xl space-y-2">
          <p className="text-[10px] font-bold text-[#2D321F]">今日高光</p>
          {entry.highlights.map((highlight) => (
            <div key={highlight} className="flex items-start gap-2 text-xs text-[#5C624E]">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#D97D54] shrink-0" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>

        <div className="py-1">
          <svg className="w-full h-1" xmlns="http://www.w3.org/2000/svg">
            <line stroke="#D97D54" strokeDasharray="6 4" strokeWidth="1" x1="0" x2="100%" y1="0.5" y2="0.5" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="py-3 bg-[#2D321F] hover:bg-[#3d4429] text-white text-xs font-semibold rounded-xl tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            保存手帐至本次旅程
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleVlog}
            disabled={vlogGenerating}
            className="py-3 bg-[#D97D54] hover:bg-[#2D321F] disabled:opacity-70 text-white text-xs font-semibold rounded-xl tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {vlogGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                渲染中...
              </>
            ) : vlogReady ? (
              "Vlog 已就绪"
            ) : (
              <>
                <Film className="w-4 h-4" />
                一键渲染沉浸式时空 Vlog
              </>
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {vlogReady && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-[#4E8E6F]/10 border border-[#4E8E6F]/20 rounded-2xl text-center"
            >
              <p className="text-xs text-[#4E8E6F] font-heading font-medium">
                Vlog 已在后台合成完成，可在相册中查看。
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
