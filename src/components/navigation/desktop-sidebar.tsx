"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, BookOpen } from "lucide-react";

function BackpackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z" />
      <rect x="4" y="5" width="16" height="16" rx="4" />
      <path d="M9 12h6" />
    </svg>
  );
}

const tabs = [
  { href: "/chat", label: "旅途聊天", icon: MessageCircle, activePattern: /^\/chat/ },
  { href: "/pocket", label: "智能锦囊", icon: BackpackIcon, activePattern: /^\/pocket/ },
  { href: "/journal", label: "手帐成果", icon: BookOpen, activePattern: /^\/journal/ },
];

function DesktopSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const tripSuffix = tripId && tripId !== "undefined" ? `?tripId=${encodeURIComponent(tripId)}` : "";
  const isOnboarding = pathname === "/";
  if (isOnboarding) return null;

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-[#F4EFE8] border-r border-[rgba(45,50,31,0.12)] z-20">
      <div className="flex flex-col flex-1 py-8 px-4 gap-1">
        {/* App brand */}
        <div className="px-3 mb-8">
          <h1 className="text-lg font-heading font-medium text-[#2D321F] leading-tight">
            时空缝合
          </h1>
          <p className="text-[10px] text-[#8E947A] tracking-widest uppercase mt-0.5">
            ChronoStitch
          </p>
        </div>

        {tabs.map((tab) => {
          const isActive = tab.activePattern.test(pathname);
          const Icon = tab.icon;
          return (
            <motion.div key={tab.href} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={`${tab.href}${tripSuffix}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#FAF7F2] text-[#2D321F] shadow-sm"
                    : "text-[#5C624E] hover:bg-[#FAF7F2]/60"
                }`}
              >
                <Icon
                  className={`flex-shrink-0 ${isActive ? "text-[#D97D54]" : "text-[#8E947A]"}`}
                />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D97D54]"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom brand note */}
      <div className="px-4 py-4 border-t border-[rgba(45,50,31,0.08)]">
        <p className="text-[10px] text-[#8E947A] leading-relaxed">
          AI 在后台静默编织，<br />你只需享受旅途。
        </p>
      </div>
    </aside>
  );
}

export function DesktopSidebar() {
  return (
    <Suspense fallback={null}>
      <DesktopSidebarContent />
    </Suspense>
  );
}
