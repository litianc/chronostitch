import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addMessage, getFragmentsByTrip, createFragment } from "@/lib/db/queries/trips";
import { getTripById } from "@/lib/db/queries/trips";

const MAX_IMAGE_DATA_URL_LENGTH = 3_000_000;
const MAX_AUDIO_DATA_URL_LENGTH = 3_500_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "无效行程ID" }, { status: 400 });

  const trip = await getTripById(id);
  if (!trip || trip.userId !== auth.user.id) {
    return NextResponse.json({ error: "未找到该行程" }, { status: 404 });
  }

  const fragments = await getFragmentsByTrip(id);
  return NextResponse.json(fragments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const { tripId } = await params;
  const id = parseInt(tripId, 10);

  const trip = await getTripById(id);
  if (!trip || trip.userId !== auth.user.id) {
    return NextResponse.json({ error: "未找到该行程" }, { status: 404 });
  }

  const body = await request.json();
  const mediaType = typeof body.mediaType === "string" ? body.mediaType : undefined;
  if (mediaType && mediaType !== "image" && mediaType !== "audio") {
    return NextResponse.json({ error: "仅支持图片或语音片段" }, { status: 400 });
  }

  if (body.mediaUrl && typeof body.mediaUrl === "string") {
    if (mediaType === "audio") {
      if (!body.mediaUrl.startsWith("data:audio/")) {
        return NextResponse.json({ error: "仅支持语音文件" }, { status: 400 });
      }
      if (body.mediaUrl.length > MAX_AUDIO_DATA_URL_LENGTH) {
        return NextResponse.json({ error: "语音过长，请控制在 60 秒以内" }, { status: 413 });
      }
    } else {
      if (!body.mediaUrl.startsWith("data:image/")) {
        return NextResponse.json({ error: "仅支持图片文件" }, { status: 400 });
      }
      if (body.mediaUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
        return NextResponse.json({ error: "图片过大，请选择较小的图片" }, { status: 413 });
      }
    }
  }

  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : mediaType === "image"
        ? "今日旅途照片已记录，等待你补充地点与心情。"
        : mediaType === "audio"
          ? "今日语音记录已保存，等待你稍后补充地点与心情。"
        : undefined;

  const fragment = await createFragment({
    tripId: id,
    timestamp: new Date(body.timestamp ?? Date.now()),
    location: typeof body.location === "string" ? body.location.trim() : undefined,
    description,
    mediaUrl: body.mediaUrl,
    mediaType,
    status: mediaType === "image" || mediaType === "audio" ? "ready" : "pending",
  });

  if (body.createMessages === true) {
    const userText = mediaType === "image"
      ? `我上传了一张今日旅途照片。${description ? `\n\n${description}` : ""}`
      : mediaType === "audio"
        ? `我发送了一段今日旅途语音。${description ? `\n\n${description}` : ""}`
        : description ?? "我记录了一段今日旅途片段。";
    const assistantText = mediaType === "image"
      ? "照片已收进今日行程。我会把它作为旅途片段，稍后一起织进智能锦囊。"
      : mediaType === "audio"
        ? "语音已收进今日行程。我会把它作为现场记录，稍后和对话、照片一起整理进智能锦囊。"
        : "这段旅途片段已记录，会一起编入今日行程。";

    const user = await addMessage({ tripId: id, role: "user", content: userText });
    const assistant = await addMessage({ tripId: id, role: "assistant", content: assistantText });

    return NextResponse.json({ fragment, user, assistant }, { status: 201 });
  }

  return NextResponse.json({ fragment }, { status: 201 });
}
