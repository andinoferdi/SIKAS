"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Bot, Trash2 } from "lucide-react";
import { type ModelSelection } from "@/types/chatbot";
import {
  LANDING_QUICK_REPLIES,
  DASHBOARD_QUICK_REPLIES,
} from "@/services/chatbot";
import { useChatMessages } from "@/components/chatbot/hooks/use-chat-messages";
import { useChatActions } from "@/components/chatbot/hooks/use-chat-actions";
import { useChatModels } from "@/components/chatbot/hooks/use-chat-models";
import { ChatMessages } from "@/components/chatbot/chat-messages";
import { ChatInput } from "@/components/chatbot/chat-input";
import { ModelSelector } from "@/components/chatbot/model-selector";
import { useCurrentUser } from "@/hooks/use-user";

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
  const pathname = usePathname();
  const isOnDashboard = pathname?.startsWith("/dashboard") ?? false;
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: models = [] } = useChatModels();
  const userId = user?.id ?? null;

  const [input, setInput] = useState("");
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    mode: "auto",
  });

  const {
    pendingAction,
    isExecuting,
    setPendingAction,
    handleConfirmAction,
    handleCancelAction,
  } = useChatActions({
    onAddMessage: (message) => addMessage(message),
  });

  const {
    messages,
    isLoading,
    showQuickReplies,
    initializeMessages,
    addMessage,
    sendMessage,
    clearMessages,
  } = useChatMessages({
    includePersonalContext: Boolean(userId),
    userId,
    isUserLoading,
    onPendingAction: setPendingAction,
    onClearPendingAction: () => setPendingAction(null),
  });

  useEffect(() => {
    if (isOpen) {
      initializeMessages();
    }
  }, [isOpen, initializeMessages]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    const content = input;
    setInput("");
    await sendMessage(content, modelSelection);
  }, [input, sendMessage, modelSelection]);

  const handleQuickReply = useCallback(
    (message: string) => {
      sendMessage(message, modelSelection);
    },
    [sendMessage, modelSelection],
  );

  const handleClearMessages = useCallback(() => {
    setPendingAction(null);
    clearMessages();
  }, [clearMessages, setPendingAction]);

  if (!isOpen) return null;

  const quickReplies = isOnDashboard
    ? DASHBOARD_QUICK_REPLIES
    : LANDING_QUICK_REPLIES;
  const quickRepliesLabel = isOnDashboard
    ? "Aksi cepat:"
    : "Pertanyaan populer:";
  const combinedLoading = isLoading || isExecuting;

  return (
    /*
     * LAYOUT FIXES:
     *
     * MOBILE (default, < sm):
     *   - Gunakan `inset-x-0 bottom-0` + `h-[100dvh]` agar panel memenuhi
     *     seluruh dynamic viewport (memperhitungkan browser toolbar yang
     *     muncul/hilang). `top-0` di-implisit-kan oleh `h-[100dvh]` + `bottom-0`.
     *   - Hindari `inset-0` karena `top:0` di beberapa mobile browser masuk ke
     *     area di balik status bar / notch jika tidak ada safe-area handling.
     *
     * DESKTOP (sm+):
     *   - Hapus fixed height `sm:h-182` yang kaku.
     *   - Ganti `sm:max-h-[90vh]` → `sm:max-h-[calc(100dvh-8rem)]` agar panel
     *     tidak pernah lebih tinggi dari viewport dikurangi offset atas (browser
     *     chrome + sedikit breathing room). `dvh` = dynamic viewport height,
     *     aman di Chrome/Firefox/Safari modern.
     *   - Tambah `sm:min-h-[24rem]` agar panel tidak terlalu kecil di viewport
     *     sangat pendek.
     *   - `sm:bottom-[5.5rem]`: button tingginya 56px (h-14) + bottom-4 (16px)
     *     = 72px. Tambah gap 16px → 88px = 5.5rem. Lebih presisi dari bottom-24
     *     (96px) yang terlalu agresif di zoom tinggi.
     *   - `sm:right-4` (16px dari kanan) lebih aman dari `sm:right-6` (24px)
     *     supaya tidak overflow di viewport sempit seperti 1024px.
     *
     * INTERNAL SCROLLING:
     *   - Panel sudah `flex flex-col`. `ChatMessages` harus punya `flex-1
     *     min-h-0 overflow-y-auto` di implementasinya agar area pesan bisa
     *     scroll dan tidak mendorong `ChatInput` keluar panel.
     *
     * Z-INDEX:
     *   - Panel: z-50, Button: z-50, BottomNav: z-40 → urutan sudah benar.
     *     Panel dan button di layer yang sama (keduanya z-50) tapi button
     *     di-render setelah panel di DOM, jadi button akan di atas panel
     *     jika tumpang tindih — aman karena posisinya memang tidak overlap.
     */
    <div
      className={[
        // Base: posisi fixed, full-width
        "fixed z-50",
        // --- Mobile: full-screen panel ---
        // bottom-0 + h-[100dvh] = panel dari atas sampai bawah viewport
        // dvh memperhitungkan browser toolbar dinamis (mobile Safari/Chrome)
        "inset-x-0 bottom-0 h-[100dvh]",
        // --- Desktop (sm+): floating panel di kanan bawah ---
        // Reset mobile inset, gunakan positioning eksplisit
        "sm:inset-auto",
        // Jarak dari bawah: button (h-14=56px) + bottom-4 (16px) + gap (16px) = 88px = 5.5rem
        "sm:bottom-[5.5rem]",
        // Jarak dari kanan: 16px lebih aman dari 24px di layar ~1024px
        "sm:right-4",
        // Lebar 22rem (≈352px) — lebih ramping dari sebelumnya (26rem)
        "sm:w-[22rem]",
        // Tinggi: auto, dibatasi oleh max-height
        "sm:h-auto",
        // Max-height: kurangi offset jadi 7rem (dari 9rem) → panel lebih tinggi
        // dvh = dynamic viewport height, akurat di browser modern
        "sm:max-h-[calc(100dvh-7rem)]",
        // Min-height agar panel tidak terlalu kecil di viewport sangat pendek
        "sm:min-h-[24rem]",
        // Styling
        "bg-card sm:rounded-2xl shadow-2xl sm:border sm:border-border",
        "flex flex-col overflow-hidden",
        // Animasi
        "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
      ].join(" ")}
    >
      {/* Header — selalu shrink-0 agar tidak tercompress */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-on-surface-subtle flex items-center justify-center">
            <Bot className="w-4 h-4 text-on-surface" />
          </div>
          <div>
            <h3 className="font-semibold text-on-surface text-sm">SIKAS Bot</h3>
            <p className="text-xs text-on-surface-variant">
              Asisten Keuangan Anda
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearMessages}
            className="w-8 h-8 rounded-full hover:bg-on-surface-subtle flex items-center justify-center transition-colors cursor-pointer"
            title="Hapus riwayat chat"
          >
            <Trash2 className="w-4 h-4 text-on-surface" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-on-surface-subtle flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-on-surface" />
          </button>
        </div>
      </div>

      {/* Model selector — shrink-0 agar tidak tercompress */}
      <div className="px-4 py-2 border-b border-border bg-muted/30 shrink-0">
        <ModelSelector
          models={models}
          currentSelection={modelSelection}
          onSelectionChange={setModelSelection}
        />
      </div>

      {/*
       * ChatMessages harus punya class berikut di implementasinya:
       *   className="flex-1 min-h-0 overflow-y-auto"
       * `min-h-0` wajib ada pada flex child agar browser tidak menghitung
       * min-content height dan membuat panel membengkak melewati max-height.
       */}
      <ChatMessages
        messages={messages}
        showQuickReplies={showQuickReplies}
        quickReplies={quickReplies}
        onQuickReplySelect={handleQuickReply}
        pendingAction={pendingAction}
        onConfirmAction={handleConfirmAction}
        onCancelAction={handleCancelAction}
        isLoading={combinedLoading}
        quickRepliesLabel={quickRepliesLabel}
      />

      {/* ChatInput — shrink-0 agar selalu terlihat di bawah */}
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={combinedLoading}
      />
    </div>
  );
}
