import { request } from "./request";

export type TripMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type TripFragment = {
  id: number;
  tripId: number;
  timestamp: string;
  location: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  status: string;
};

export type SendTripMessageResult = {
  user: TripMessage;
  assistant: TripMessage;
  pocketTriggered: boolean;
};

export type CreateTripFragmentResult = {
  fragment: TripFragment;
  user?: TripMessage;
  assistant?: TripMessage;
};

export type PocketSummary = {
  progress: string;
  highlights: string[];
  nextStops: string[];
  reminders: string[];
};

export type JournalEntry = {
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

async function parseJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : fallbackMessage;
    throw new Error(message);
  }
  return body as T;
}

export async function getTripMessages(tripId: string): Promise<TripMessage[]> {
  const res = await request(`/api/trips/${tripId}/messages`);
  return parseJsonResponse<TripMessage[]>(res, "加载聊天记录失败");
}

export async function sendTripMessage(
  tripId: string,
  content: string,
): Promise<SendTripMessageResult> {
  const res = await request(`/api/trips/${tripId}/messages/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return parseJsonResponse<SendTripMessageResult>(res, "发送消息失败");
}

export async function getTripFragments(tripId: string): Promise<TripFragment[]> {
  const res = await request(`/api/trips/${tripId}/fragments`);
  return parseJsonResponse<TripFragment[]>(res, "加载旅程片段失败");
}

export async function createTripFragment(
  tripId: string,
  input: {
    timestamp?: string;
    location?: string;
    description?: string;
    mediaUrl?: string;
    mediaType?: "image" | "audio";
    createMessages?: boolean;
  },
): Promise<CreateTripFragmentResult> {
  const res = await request(`/api/trips/${tripId}/fragments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonResponse<CreateTripFragmentResult>(res, "记录旅程片段失败");
}

export async function generatePocketSummary(tripId: string): Promise<PocketSummary> {
  const res = await request(`/api/trips/${tripId}/pocket/summary`, {
    method: "POST",
  });
  return parseJsonResponse<PocketSummary>(res, "整理锦囊失败");
}

export async function getJournalEntry(tripId: string): Promise<JournalEntry> {
  const res = await request(`/api/trips/${tripId}/journal`);
  return parseJsonResponse<JournalEntry>(res, "生成手帐失败");
}
