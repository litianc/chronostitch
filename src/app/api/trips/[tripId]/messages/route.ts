import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMessagesByTrip, addMessage } from "@/lib/db/queries/trips";
import { getTripById } from "@/lib/db/queries/trips";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "无效的行程ID" }, { status: 400 });

  // Verify ownership
  const trip = await getTripById(id);
  if (!trip || trip.userId !== auth.user.id) {
    return NextResponse.json({ error: "未找到该行程" }, { status: 404 });
  }

  const msgs = await getMessagesByTrip(id);

  // Inject welcome message if no messages yet
  if (msgs.length === 0) {
    const welcome = await addMessage({
      tripId: id,
      role: "assistant",
      content: `你好，${trip.destination}的追风人。在这里，你尽可敞开心扉。随时说说话、拍张照片，或者是随便两句吐槽，AI 在后台会默默将它们时空缝合起来。今天感觉如何？`,
    });
    return NextResponse.json([welcome]);
  }

  return NextResponse.json(msgs);
}
