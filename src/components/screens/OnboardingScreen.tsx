"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request } from "@/lib/api/request";
import { auth, memory } from "@eazo/sdk";
import { useEazo } from "@eazo/sdk/react";
import { toast } from "sonner";
import { LandmarkTransition } from "./landmark-transition";

type OnboardingScreenProps = {
  initialStartDate: string;
  initialEndDate: string;
};

const SKIP_AUTH_IN_DEV = process.env.NODE_ENV === "development";

export function OnboardingScreen({
  initialStartDate,
  initialEndDate,
}: OnboardingScreenProps) {
  const router = useRouter();
  const user = useEazo((s) => s.auth.user);

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleSubmit = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    try {
      if (!user && !SKIP_AUTH_IN_DEV) {
        await auth.login();
      }

      const res = await request("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, startDate, endDate }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body && typeof body === "object" && "error" in body
            ? String((body as { error: unknown }).error)
            : `HTTP ${res.status}`;
        throw new Error(message);
      }

      const trip = await res.json();
      if (!trip?.id) {
        throw new Error("Trip response did not include an id");
      }

      memory.reportAction({
        content: `用户开启了前往"${destination}"的旅行，日期 ${startDate} 至 ${endDate}`,
        event_type: "create",
        page: "onboarding",
        metadata: { type: "create_trip", trip_id: trip.id, destination },
      }).catch(() => {});

      setTransitioning(true);
      setTimeout(() => {
        router.push(`/chat?tripId=${trip.id}`);
      }, 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "开启旅程失败，请稍后再试");
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setTransitioning(true);
    setTimeout(() => {
      router.push("/chat");
    }, 800);
  };

  return (
    <div className="min-h-svh paper-bg flex flex-col px-5 py-6 max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {transitioning ? (
          <motion.div
            key="transition"
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LandmarkTransition />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className="flex flex-col justify-between min-h-svh"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Top brand area */}
            <div className="text-center py-8 flex flex-col items-center">
              <span className="text-[10px] tracking-widest text-[#8E947A] uppercase font-semibold mb-2">
                无感多模态编织
              </span>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-[#2D321F] leading-snug">
                织线成书
                <br />
                <span className="text-[#D97D54] font-normal italic text-3xl">
                  缝合旅途流光
                </span>
              </h1>
              {/* Decorative line art */}
              <svg
                className="w-36 h-14 mt-4 opacity-30"
                viewBox="0 0 100 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M10,35 C30,15 50,38 70,18 C80,8 90,20 100,30"
                  strokeLinecap="round"
                  stroke="#2D321F"
                />
                <line
                  x1="30"
                  y1="20"
                  x2="70"
                  y2="20"
                  stroke="#8E947A"
                  strokeDasharray="3 3"
                />
                <circle cx="30" cy="20" r="2.5" fill="#2D321F" />
                <circle cx="70" cy="20" r="2.5" fill="#D97D54" />
              </svg>
            </div>

            {/* Form card */}
            <div className="bg-white/60 backdrop-blur-sm border border-[rgba(45,50,31,0.12)] rounded-3xl p-5 space-y-4 shadow-sm">
              {/* Destination */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-[#8E947A] uppercase tracking-wider">
                  目的地
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="哪里是心之所向…"
                  className="w-full bg-[#FAF7F2]/60 text-sm font-heading text-[#2D321F] border border-[rgba(45,50,31,0.12)] rounded-xl py-2.5 px-3 focus:outline-none focus:border-[#D97D54] transition-colors placeholder:text-[#8E947A]"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-[#8E947A] uppercase tracking-wider">
                    启程日期
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#FAF7F2]/60 text-xs text-[#2D321F] border border-[rgba(45,50,31,0.12)] rounded-xl py-2 px-2.5 focus:outline-none focus:border-[#D97D54] transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-[#8E947A] uppercase tracking-wider">
                    重返日常
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#FAF7F2]/60 text-xs text-[#2D321F] border border-[rgba(45,50,31,0.12)] rounded-xl py-2 px-2.5 focus:outline-none focus:border-[#D97D54] transition-colors"
                  />
                </div>
              </div>

              {/* Screenshot import */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="stitch-border hover:border-[#D97D54] bg-[#FAF7F2]/40 hover:bg-[#FAF7F2]/80 rounded-2xl p-4 text-center cursor-pointer transition-all"
              >
                <p className="text-xs font-heading text-[#5C624E] font-semibold">
                  导入机票或行程截图
                </p>
                <p className="text-[10px] text-[#8E947A] mt-1">
                  AI 将为您精准编织对应时序节点
                </p>
              </motion.div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={loading || !destination.trim()}
                className="w-full py-3 bg-[#2D321F] hover:bg-[#3d4429] disabled:opacity-50 text-[#FAF7F2] text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    编织中…
                  </span>
                ) : (
                  <>
                    <span>开启 AI 无感编织之旅</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>

            {/* Skip */}
            <div className="text-center pt-4 pb-6">
              <button
                onClick={handleSkip}
                className="text-[11px] font-heading text-[#8E947A] hover:text-[#D97D54] underline underline-offset-4 transition-colors"
              >
                直接进入，随手记录碎片
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
