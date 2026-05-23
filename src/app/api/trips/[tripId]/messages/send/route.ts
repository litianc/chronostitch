import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addMessage, getMessagesByTrip, getTripById } from "@/lib/db/queries/trips";
import { ai } from "@eazo/sdk";

ai.configure({ privateKey: process.env.EAZO_PRIVATE_KEY! });

// Keywords that trigger pocket (smart bag) visibility
const POCKET_KEYWORDS = [
  "景点", "美食", "古镇", "博物馆", "寺庙", "公园", "广场", "街道",
  "餐厅", "小吃", "咖啡", "茶馆", "酒店", "民宿", "青旅",
  "拍了", "照片", "录了", "声音", "风景", "日落", "日出",
  "遇见", "看到", "感受", "发现", "体验",
];

function containsTravelSignal(text: string): boolean {
  return POCKET_KEYWORDS.some((kw) => text.includes(kw));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const { tripId } = await params;
  const id = parseInt(tripId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "无效的行程ID" }, { status: 400 });

  const trip = await getTripById(id);
  if (!trip || trip.userId !== auth.user.id) {
    return NextResponse.json({ error: "未找到该行程" }, { status: 404 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "消息内容不能为空" }, { status: 400 });
  }

  // Save user message
  const userMsg = await addMessage({ tripId: id, role: "user", content: content.trim() });

  // Get conversation history (last 10 messages)
  const history = await getMessagesByTrip(id);
  const recentHistory = history.slice(-10);

  const hasTravelSignal = containsTravelSignal(content);

  // Build AI response
  const systemPrompt = `你是「时空缝合手帐」的 AI 旅行伙伴，为用户记录前往「${trip.destination}」的旅程（${trip.startDate.toLocaleDateString("zh-CN")}至${trip.endDate.toLocaleDateString("zh-CN")}）。

角色特点：
- 温暖、细腻、善于捕捉旅途细节
- 用诗意但不做作的语言回应
- 当用户提到景点、美食、感受时，简短确认并告知已加入智能锦囊编织
- 不超过 60 字，保持对话轻盈
- 使用中文回复`;

  const aiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...recentHistory.slice(0, -1).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: content.trim() },
  ];

  let aiText = "已收到，继续记录你的旅途吧。";
  try {
    const result = await ai.chat({ model: "deepseek.v3.1", messages: aiMessages });
    aiText = result.choices[0].message.content ?? aiText;
  } catch (err) {
    console.error("[trip-message] ai.chat failed", err);
    aiText = hasTravelSignal
      ? "我先把这段旅途记录下来，稍后会和照片、地点一起整理进锦囊。"
      : "我先记下来了。你可以继续补充今天的地点、照片或心情。";
  }

  // Append pocket hint if travel signal detected
  if (hasTravelSignal) {
    aiText += "\n\n✦ 已悄悄织入今日锦囊。";
  }

  const assistantMsg = await addMessage({ tripId: id, role: "assistant", content: aiText });

  return NextResponse.json({
    user: userMsg,
    assistant: assistantMsg,
    pocketTriggered: hasTravelSignal,
  });
}
