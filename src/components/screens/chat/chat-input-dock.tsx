"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import { Mic, Image as ImageIcon, Send } from "lucide-react";

type ChatInputDockProps = {
  inputText: string;
  loading: boolean;
  uploadingImage: boolean;
  recordingAudio: boolean;
  savingAudio: boolean;
  disabled: boolean;
  imageInputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onUpload: (file: File) => void;
  onToggleRecording: () => void;
};

export function ChatInputDock({
  inputText,
  loading,
  uploadingImage,
  recordingAudio,
  savingAudio,
  disabled,
  imageInputRef,
  onInputChange,
  onSend,
  onUpload,
  onToggleRecording,
}: ChatInputDockProps) {
  return (
    <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 bg-[#FAF7F2] border-t border-[rgba(45,50,31,0.12)] p-4 lg:bottom-0 lg:relative">
      <div className="flex gap-2 items-center max-w-2xl mx-auto">
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label={recordingAudio ? "停止录音" : "录制语音"}
          onClick={onToggleRecording}
          disabled={disabled || savingAudio}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
            recordingAudio
              ? "bg-[#D97D54] text-white"
              : "bg-[#2D321F]/5 hover:bg-[#2D321F]/10 text-[#2D321F]"
          }`}
        >
          {savingAudio ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="上传照片"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImage || disabled}
          className="w-10 h-10 rounded-full bg-[#2D321F]/5 hover:bg-[#2D321F]/10 text-[#2D321F] flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {uploadingImage ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </motion.button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        <input
          type="text"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="此时此地，你在想什么…"
          disabled={loading || disabled}
          className="flex-1 bg-white text-sm px-3 py-2.5 rounded-xl border border-[rgba(45,50,31,0.12)] focus:outline-none focus:border-[#D97D54] transition-colors placeholder:text-[#8E947A] disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSend}
          disabled={loading || disabled || !inputText.trim()}
          aria-label="发送消息"
          className="w-10 h-10 rounded-xl bg-[#2D321F] hover:bg-[#3d4429] disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
