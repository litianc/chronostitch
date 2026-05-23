import { NextRequest, NextResponse } from "next/server";
import { ai } from "@eazo/sdk";
import { requireAuth } from "@/lib/auth";
import { getFragmentsByTrip, getMessagesByTrip, getTripById } from "@/lib/db/queries/trips";

ai.configure({ privateKey: process.env.EAZO_PRIVATE_KEY! });

type PocketSummary = {
  progress: string;
  highlights: string[];
  nextStops: string[];
  reminders: string[];
};

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function fallbackSummary(args: {
  destination: string;
  messageCount: number;
  imageCount: number;
  audioCount: number;
  fragmentDescriptions: string[];
}): PocketSummary {
  const hasMaterial = args.messageCount > 0 || args.imageCount > 0 || args.audioCount > 0;
  return {
    progress: hasMaterial
      ? `今天关于${args.destination}已记录 ${args.messageCount} 条对话、${args.audioCount} 段语音和 ${args.imageCount} 张图片，可先围绕已出现的地点、声音和心情继续补全时间线。`
      : `今天的${args.destination}行程还没有足够记录，可以先发送文字、录一段语音或上传当前照片。`,
    highlights: args.fragmentDescriptions.length > 0
      ? args.fragmentDescriptions.slice(0, 3)
      : ["当前还缺少明确片段，建议先记录一个地点、一张照片和一句感受。"],
    nextStops: [
      "选择离当前位置最近的一处景点，补一张环境照片",
      "在下一站记录交通方式、抵达时间和一句即时心情",
      "晚间回到锦囊页整理当天路线，生成手帐草稿",
    ],
    reminders: [
      "图片和语音会作为今日片段进入锦囊",
      "聊天中提到的地点、体验和下一站意图会影响规划建议",
    ],
  };
}

function parseSummary(text: string): PocketSummary | null {
  try {
    const parsed = JSON.parse(text) as PocketSummary;
    if (!parsed.progress || !Array.isArray(parsed.highlights) || !Array.isArray(parsed.nextStops)) {
      return null;
    }
    return {
      progress: parsed.progress,
      highlights: parsed.highlights.slice(0, 4),
      nextStops: parsed.nextStops.slice(0, 4),
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders.slice(0, 4) : [],
    };
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
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

  const [messages, fragments] = await Promise.all([
    getMessagesByTrip(id),
    getFragmentsByTrip(id),
  ]);
  const today = dateKey(new Date());
  const todayMessages = messages.filter((message) => dateKey(message.createdAt) === today);
  const todayFragments = fragments.filter((fragment) => dateKey(fragment.timestamp) === today);
  const imageCount = todayFragments.filter((fragment) => fragment.mediaType === "image").length;
  const audioCount = todayFragments.filter((fragment) => fragment.mediaType === "audio").length;
  const fragmentDescriptions = todayFragments
    .map((fragment) => fragment.description)
    .filter((description): description is string => Boolean(description));

  const fallback = fallbackSummary({
    destination: trip.destination,
    messageCount: todayMessages.length,
    imageCount,
    audioCount,
    fragmentDescriptions,
  });

  try {
    const result = await ai.chat({
      model: "deepseek.v3.1",
      messages: [
        {
          role: "system",
          content:
            "你是旅行锦囊规划助手。只输出 JSON，不要 Markdown。JSON 字段为 progress:string, highlights:string[], nextStops:string[], reminders:string[]。",
        },
        {
          role: "user",
          content: JSON.stringify({
            destination: trip.destination,
            date: today,
            totals: {
              conversations: todayMessages.length,
              images: imageCount,
              audioClips: audioCount,
            },
            conversations: todayMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            fragments: todayFragments.map((fragment) => ({
              type: fragment.mediaType,
              location: fragment.location,
              description: fragment.description,
              hasMedia: Boolean(fragment.mediaUrl),
            })),
          }),
        },
      ],
    });
    const text = result.choices[0].message.content ?? "";
    return NextResponse.json(parseSummary(text) ?? fallback);
  } catch (err) {
    console.error("[pocket-summary] ai.chat failed", err);
    return NextResponse.json(fallback);
  }
}
