"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  generatePocketSummary,
  getTripFragments,
  type PocketSummary,
} from "@/lib/api";
import { NightRevealOverlay } from "./pocket/night-reveal-overlay";
import { PocketActions } from "./pocket/pocket-actions";
import { PocketProgressBanner } from "./pocket/pocket-progress-banner";
import type { PocketFragment } from "./pocket/pocket-types";
import { SummaryCard } from "./pocket/summary-card";
import { TimelineList } from "./pocket/timeline-list";

// Demo fragments if no real data
const DEMO_FRAGMENTS: PocketFragment[] = [
  {
    id: 1,
    tripId: 0,
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    location: "喜洲古镇 · 转角屋檐下",
    description:
      "清晨的古老铜铃在微风中轻碰，隔断尘世的安详。耳边隐隐传来卖饵块的吆喝声。",
    mediaUrl: null,
    mediaType: "audio",
    status: "ready",
  },
  {
    id: 2,
    tripId: 0,
    timestamp: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    location: "洱海滨水骑行公路",
    description:
      "逆着温热的海风向前，掠过层层翻滚的浅水波纹，天边飞掠而过一两只秋日海鸥。",
    mediaUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=480&q=80",
    mediaType: "image",
    status: "ready",
  },
  {
    id: 3,
    tripId: 0,
    timestamp: new Date(Date.now() - 0.5 * 3600 * 1000).toISOString(),
    location: "沙溪古镇 · 寺登街角",
    description:
      "碳火噼里啪啦，老奶奶在细心地煮着瓦罐奶茶。空气里有一股焦糖的香气。",
    mediaUrl: null,
    mediaType: "audio",
    status: "ready",
  },
];

export function SmartPocketScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const activeTripId = tripId && tripId !== "undefined" ? tripId : null;
  const hasTrip = activeTripId !== null;
  const [fragments, setFragments] = useState<PocketFragment[]>(DEMO_FRAGMENTS);
  const [summary, setSummary] = useState<PocketSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showNightReveal, setShowNightReveal] = useState(false);
  const stitchProgress = Math.min(96, Math.max(24, fragments.length * 28));

  useEffect(() => {
    if (!activeTripId) return;
    getTripFragments(activeTripId)
      .then((data) => {
        setFragments(data.length > 0 ? data : []);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "加载锦囊失败");
      });
  }, [activeTripId]);

  const summarizePocket = async () => {
    if (!activeTripId || summarizing) return;
    setSummarizing(true);
    try {
      const data = await generatePocketSummary(activeTripId);
      setSummary(data);
      toast.success("锦囊已整理");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "整理锦囊失败");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="min-h-svh paper-bg flex flex-col relative">
      <div className="px-4 py-5 flex flex-col gap-4 pb-24">
        <PocketProgressBanner count={fragments.length} progress={stitchProgress} />
        <SummaryCard
          summary={summary}
          disabled={!hasTrip}
          summarizing={summarizing}
          onSummarize={summarizePocket}
        />
        <TimelineList fragments={fragments} />
        <PocketActions
          onNightReveal={() => setShowNightReveal(true)}
          onOpenJournal={() => router.push(activeTripId ? `/journal?tripId=${activeTripId}` : "/journal")}
        />
      </div>

      <NightRevealOverlay
        visible={showNightReveal}
        onClose={() => setShowNightReveal(false)}
        onOpenJournal={() => {
          setShowNightReveal(false);
          router.push(activeTripId ? `/journal?tripId=${activeTripId}` : "/journal");
        }}
      />
    </div>
  );
}
