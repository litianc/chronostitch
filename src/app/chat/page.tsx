import { Suspense } from "react";
import { ChatScreen } from "@/components/screens/ChatScreen";

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-svh paper-bg flex items-center justify-center">
        <div className="text-[#8E947A] text-sm font-heading">正在打开旅途…</div>
      </div>
    }>
      <ChatScreen />
    </Suspense>
  );
}
