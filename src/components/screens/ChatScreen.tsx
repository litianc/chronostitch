"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { memory } from "@eazo/sdk";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createTripFragment,
  getTripMessages,
  sendTripMessage,
  type TripMessage,
} from "@/lib/api";
import { blobToDataUrl, chooseAudioMimeType } from "@/utils/audio-recording";
import { compressImageToDataUrl } from "@/utils/image-upload";
import { ChatInputDock } from "./chat/chat-input-dock";
import { ChatMessageBubble } from "./chat/chat-message-bubble";
import { NoTripCard } from "./chat/no-trip-card";
import { PocketTrigger } from "./chat/pocket-trigger";

type Message = TripMessage;

export function ChatScreen() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const router = useRouter();
  const activeTripId = tripId && tripId !== "undefined" ? tripId : null;
  const hasTrip = activeTripId !== null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [savingAudio, setSavingAudio] = useState(false);
  const [pocketVisible, setPocketVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!activeTripId) return;
    getTripMessages(activeTripId)
      .then((data) => {
        setMessages(data);
        // 如果已经有三条以上消息，显示锦囊入口
        if (data.length >= 3) setPocketVisible(true);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "加载聊天记录失败");
      });
  }, [activeTripId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeTripId || loading) return;
    setLoading(true);
    const userContent = inputText.trim();
    setInputText("");

    const tempMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const data = await sendTripMessage(activeTripId, userContent);

      setMessages((prev) => [...prev.slice(0, -1), data.user, data.assistant]);

      memory.reportAction({
        content: `用户在旅途聊天中发送了消息："${userContent}"`,
        event_type: "create",
        page: "chat",
        metadata: { type: "send_message", trip_id: activeTripId },
      }).catch(() => {});

      if (data.assistant.content.includes("锦囊") || messages.length + 2 >= 3) {
        setPocketVisible(true);
      }
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      toast.error(err instanceof Error ? err.message : "发送消息失败");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!activeTripId || uploadingImage) return;
    setUploadingImage(true);
    try {
      const mediaUrl = await compressImageToDataUrl(file);
      const description = `今日上传照片：${file.name}`;
      const data = await createTripFragment(activeTripId, {
        timestamp: new Date().toISOString(),
        description,
        mediaUrl,
        mediaType: "image",
        createMessages: true,
      });

      if (data.user && data.assistant) {
        setMessages((prev) => [...prev, data.user!, data.assistant!]);
      }
      setPocketVisible(true);

      memory.reportAction({
        content: `用户上传了一张今日旅途照片："${file.name}"`,
        event_type: "create",
        page: "chat",
        metadata: { type: "upload_trip_image", trip_id: activeTripId, fragment_id: data.fragment.id },
      }).catch(() => {});
      toast.success("照片已记录到今日行程");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传照片失败");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const saveAudioClip = async (blob: Blob) => {
    if (!activeTripId) return;
    setSavingAudio(true);
    try {
      const mediaUrl = await blobToDataUrl(blob);
      const description = "今日发送语音：一段旅途现场记录，稍后可在锦囊中结合对话和照片整理。";
      const data = await createTripFragment(activeTripId, {
        timestamp: new Date().toISOString(),
        description,
        mediaUrl,
        mediaType: "audio",
        createMessages: true,
      });

      if (data.user && data.assistant) {
        setMessages((prev) => [...prev, data.user!, data.assistant!]);
      }
      setPocketVisible(true);

      memory.reportAction({
        content: "用户发送了一段今日旅途语音",
        event_type: "create",
        page: "chat",
        metadata: { type: "upload_trip_audio", trip_id: activeTripId, fragment_id: data.fragment.id },
      }).catch(() => {});
      toast.success("语音已记录到今日行程");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存语音失败");
    } finally {
      setSavingAudio(false);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const toggleAudioRecording = async () => {
    if (!activeTripId || savingAudio) return;
    if (recordingAudio) {
      stopRecording();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("当前浏览器不支持录音");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = chooseAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecordingAudio(false);
        const audioType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: audioType });
        if (blob.size > 0) void saveAudioClip(blob);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecordingAudio(false);
        toast.error("录音失败，请重试");
      };

      recorder.start();
      setRecordingAudio(true);
      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 60_000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "无法开启麦克风");
    }
  };

  return (
    <div className="h-[100svh] paper-bg flex flex-col relative overflow-hidden">
      {/* Date tag */}
      <div className="text-center py-3">
        <span className="text-[9px] font-mono tracking-widest text-white bg-[#8E947A]/80 px-2.5 py-0.5 rounded-full uppercase">
          {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Messages scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-40 space-y-4">
        {!hasTrip ? (
          <NoTripCard onBack={() => router.push("/")} />
        ) : messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={scrollRef} />
      </div>

      <PocketTrigger
        visible={pocketVisible}
        onOpen={() => router.push(`/pocket?tripId=${activeTripId}`)}
      />

      <ChatInputDock
        inputText={inputText}
        loading={loading}
        uploadingImage={uploadingImage}
        recordingAudio={recordingAudio}
        savingAudio={savingAudio}
        disabled={!hasTrip}
        imageInputRef={imageInputRef}
        onInputChange={setInputText}
        onSend={sendMessage}
        onUpload={(file) => void uploadImage(file)}
        onToggleRecording={() => void toggleAudioRecording()}
      />
    </div>
  );
}
