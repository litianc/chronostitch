"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, BookOpen } from "lucide-react";

// Backpack icon inline SVG — lucide doesn't have a clean backpack
function BackpackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
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
  {
    href: "/chat",
    label: "旅途",
    icon: MessageCircle,
    activePattern: /^\/chat/,
  },
  {
    href: "/pocket",
    label: "锦囊",
    icon: BackpackIcon,
    activePattern: /^\/pocket/,
  },
  {
    href: "/journal",
    label: "手帐",
    icon: BookOpen,
    activePattern: /^\/journal/,
  },
];

function BottomTabBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const tripSuffix = tripId && tripId !== "undefined" ? `?tripId=${encodeURIComponent(tripId)}` : "";
  const isOnboarding = pathname === "/";
  if (isOnboarding) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#FAF7F2]/90 backdrop-blur-md border-t border-[rgba(45,50,31,0.12)] pb-[env(safe-area-inset-bottom)] z-20">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = tab.activePattern.test(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={`${tab.href}${tripSuffix}`}
              className="flex flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center relative px-3"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-0.5"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-[#D97D54]" : "text-[#8E947A]"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-[#D97D54]" : "text-[#8E947A]"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-3 right-3 h-0.5 bg-[#D97D54] rounded-full"
                  transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BottomTabBar() {
  return (
    <Suspense fallback={null}>
      <BottomTabBarContent />
    </Suspense>
  );
}
