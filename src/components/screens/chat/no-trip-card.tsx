"use client";

type NoTripCardProps = {
  onBack: () => void;
};

export function NoTripCard({ onBack }: NoTripCardProps) {
  return (
    <div className="mx-auto mt-16 max-w-sm rounded-3xl border border-[rgba(45,50,31,0.12)] bg-white/70 p-5 text-center shadow-sm">
      <p className="text-xs font-semibold tracking-widest text-[#8E947A] uppercase">
        尚未选择旅程
      </p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-[#2D321F]">
        先创建一段旅途
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-[#5C624E]">
        聊天记录需要绑定到具体行程，返回首页填写目的地后即可开始记录。
      </p>
      <button
        onClick={onBack}
        className="mt-4 rounded-2xl bg-[#2D321F] px-4 py-2 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#3d4429]"
      >
        回到旅程入口
      </button>
    </div>
  );
}
