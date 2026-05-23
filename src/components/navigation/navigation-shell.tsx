"use client";

import { BottomTabBar } from "./bottom-tab-bar";
import { DesktopSidebar } from "./desktop-sidebar";
import { usePathname } from "next/navigation";

export function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/";

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar — hidden on mobile */}
      {!isOnboarding && <DesktopSidebar />}

      {/* Main content — offset on large desktop when nav is present */}
      <main className={`flex-1 ${!isOnboarding ? "lg:ml-60" : ""} pb-16 lg:pb-0 min-h-svh`}>
        {children}
      </main>

      {/* Mobile bottom tab bar — hidden on desktop */}
      <BottomTabBar />
    </div>
  );
}
