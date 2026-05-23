"use client";

import { motion, AnimatePresence } from "framer-motion";

type PocketTriggerProps = {
  visible: boolean;
  onOpen: () => void;
};

export function PocketTrigger({ visible, onOpen }: PocketTriggerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring" as const, stiffness: 250, damping: 25 }}
          className="fixed bottom-[calc(8.75rem+env(safe-area-inset-bottom))] left-4 right-4 z-20 lg:bottom-6 lg:left-auto lg:right-20 lg:w-80"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpen}
            className="w-full p-3 bg-[#D97D54] text-white rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">锦</span>
              <div className="text-left">
                <h4 className="text-[11px] font-bold font-heading">智能锦囊有新编织片段</h4>
                <p className="text-[9px] text-white/80">今日旅程拼图已归档</p>
              </div>
            </div>
            <span className="text-xs">→</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
