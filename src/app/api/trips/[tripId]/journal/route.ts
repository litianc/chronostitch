import { NextRequest, NextResponse } from "next/server";
import { ai } from "@eazo/sdk";
import { requireAuth } from "@/lib/auth";
import { getFragmentsByTrip, getMessagesByTrip, getTripById } from "@/lib/db/queries/trips";

ai.configure({ privateKey: process.env.EAZO_PRIVATE_KEY! });

type JournalResponse = {
  title: string;
  subtitle: string;
  date: string;
  destination: string;
  coverNote: string;
  paragraphs: string[];
  photos: Array<{
    src: string;
    alt: string;
    label: string;
    caption: string;
  }>;
  highlights: string[];
  stats: {
    conversations: number;
    images: number;
    audioClips: number;
    fragments: number;
  };
};

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function displayDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
  }).format(date);
}

function parseJournal(text: string): Pick<JournalResponse, "title" | "subtitle" | "coverNote" | "paragraphs" | "highlights"> | null {
  try {
    const parsed = JSON.parse(text) as Partial<JournalResponse>;
    if (!parsed.title || !parsed.coverNote || !Array.isArray(parsed.paragraphs)) return null;
    return {
      title: parsed.title,
      subtitle: parsed.subtitle ?? "今日旅途已经被整理成册。",
      coverNote: parsed.coverNote,
      paragraphs: parsed.paragraphs.slice(0, 3),
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 5) : [],
    };
  } catch {
    return null;
  }
}

export async function GET(
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
  const imageFragments = todayFragments.filter((fragment) => fragment.mediaType === "image");
  const audioFragments = todayFragments.filter((fragment) => fragment.mediaType === "audio");
  const fragmentDescriptions = todayFragments
    .map((fragment) => fragment.description)
    .filter((description): description is string => Boolean(description));

  const fallbackText = {
    title: `${trip.destination}今日手帐`,
    subtitle: "由今日锦囊生成",
    coverNote:
      todayFragments.length > 0
        ? "AI 已将今天的对话、照片和语音整理成一页可回看的旅途手帐。"
        : "今天还没有足够片段，先记录一句心情、上传一张照片或录一段现场声音。",
    paragraphs: [
      todayMessages.length > 0
        ? `今天关于${trip.destination}共留下 ${todayMessages.length} 条对话，旅途线索已经从这些即时记录中展开。`
        : `今天的${trip.destination}还在等待第一条现场记录。`,
      fragmentDescriptions.length > 0
        ? fragmentDescriptions.slice(0, 3).join(" ")
        : "当你补充图片、语音或地点后，这里会生成更完整的旅行叙事。",
    ],
    highlights: fragmentDescriptions.length > 0
      ? fragmentDescriptions.slice(0, 5)
      : ["暂无明确片段，建议从当前位置开始记录。"],
  };

  let aiText = fallbackText;
  try {
    const result = await ai.chat({
      model: "deepseek.v3.1",
      messages: [
        {
          role: "system",
          content:
            "你是旅行手帐编辑。只输出 JSON，不要 Markdown。字段为 title:string, subtitle:string, coverNote:string, paragraphs:string[], highlights:string[]。内容来自用户当天锦囊，不要编造不存在的地点。",
        },
        {
          role: "user",
          content: JSON.stringify({
            destination: trip.destination,
            date: today,
            conversations: todayMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            fragments: todayFragments.map((fragment) => ({
              type: fragment.mediaType,
              location: fragment.location,
              description: fragment.description,
            })),
          }),
        },
      ],
    });
    aiText = parseJournal(result.choices[0].message.content ?? "") ?? fallbackText;
  } catch (err) {
    console.error("[journal] ai.chat failed", err);
  }

  const response: JournalResponse = {
    ...aiText,
    date: displayDate(new Date()),
    destination: trip.destination,
    photos: imageFragments.slice(0, 4).map((fragment, index) => ({
      src: fragment.mediaUrl ?? "",
      alt: fragment.location ?? `${trip.destination}照片 ${index + 1}`,
      label: fragment.location ?? "旅途照片",
      caption: fragment.description ?? "今日旅途中留下的一张照片",
    })).filter((photo) => photo.src),
    stats: {
      conversations: todayMessages.length,
      images: imageFragments.length,
      audioClips: audioFragments.length,
      fragments: todayFragments.length,
    },
  };

  return NextResponse.json(response);
}
