import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EazoProvider } from "@eazo/sdk/react";
import { Toaster } from "@/components/ui/sonner";
import { UserSyncEffect } from "@/components/user-profile/user-sync-effect";
import { AuthInit } from "@/components/auth/auth-init";
import { NavigationShell } from "@/components/navigation/navigation-shell";

const SITE_TITLE = "时空缝合手帐";
const SITE_DESCRIPTION = "AI 自动将旅途照片与语音缝合成温暖手帐与 Vlog。";

const SITE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "https://eazo.ai/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "时空缝合手帐",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body
        suppressHydrationWarning
        className="min-h-svh flex flex-col bg-[#FAF7F2]"
      >
        <EazoProvider>
          <AuthInit />
          <UserSyncEffect />
          <NavigationShell>{children}</NavigationShell>
          <Toaster />
        </EazoProvider>
      </body>
    </html>
  );
}
