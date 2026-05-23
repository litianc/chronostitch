"use client";

import type { PocketFragment } from "./pocket-types";
import { TimelineCard } from "./timeline-card";

type TimelineListProps = {
  fragments: PocketFragment[];
};

export function TimelineList({ fragments }: TimelineListProps) {
  return (
    <div className="relative pl-4 border-l border-dashed border-[rgba(45,50,31,0.2)] ml-2 space-y-4">
      {fragments.length > 0 ? (
        fragments.map((fragment, index) => (
          <TimelineCard key={fragment.id} fragment={fragment} index={index} />
        ))
      ) : (
        <div className="bg-white/60 border border-dashed border-[rgba(45,50,31,0.16)] rounded-2xl p-4 text-center">
          <p className="text-xs text-[#8E947A]">还没有今日片段，回到聊天页上传照片或记录一句行程。</p>
        </div>
      )}
    </div>
  );
}
