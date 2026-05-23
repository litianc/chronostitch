"use client";

import { motion, AnimatePresence } from "framer-motion";

type NightRevealOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onOpenJournal: () => void;
};

export function NightRevealOverlay({ visible, onClose, onOpenJournal }: NightRevealOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#2D321F]/60 z-30 flex flex-col justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F2] rounded-t-3xl px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <div className="w-10 h-1 bg-[rgba(45,50,31,0.2)] rounded-full mx-auto mb-4" />
            <div className="text-center mb-4">
              <p className="text-[10px] tracking-widest text-[#8E947A] uppercase font-semibold mb-1">
                今日已归
              </p>
              <h2 className="font-heading text-xl font-medium text-[#2D321F]">
                8 段旅程已编织完成
              </h2>
            </div>
            <div className="space-y-2 mb-5">
              {["喜洲古镇铜铃早晨", "洱海骑行逆光", "沙溪篝火暖茶"].map((highlight) => (
                <div key={highlight} className="flex items-center gap-2 text-xs text-[#5C624E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97D54] shrink-0" />
                  {highlight}
                </div>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onOpenJournal}
              className="w-full py-3 bg-[#2D321F] text-[#FAF7F2] text-sm font-semibold rounded-2xl transition-colors"
            >
              生成完整手帐
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
