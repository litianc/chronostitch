import { Suspense } from "react";
import { SmartPocketScreen } from "@/components/screens/SmartPocketScreen";

export default function PocketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-svh paper-bg flex items-center justify-center">
        <div className="text-[#8E947A] text-sm font-heading">正在整理锦囊…</div>
      </div>
    }>
      <SmartPocketScreen />
    </Suspense>
  );
}
