import { Suspense } from "react";
import { JournalScreen } from "@/components/screens/JournalScreen";

export default function JournalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-svh bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-[#8E947A] text-sm font-heading">正在生成手帐...</div>
      </div>
    }>
      <JournalScreen />
    </Suspense>
  );
}
