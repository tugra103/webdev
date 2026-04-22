import { useCallback, useRef, useState } from "react";
import { Message } from "@/types";
import { useConversations } from "./useConversations";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useChat(selectedModel: string) {
  const convs = useConversations(selectedModel);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      setError(null);

      // Aktif conversation al ya da oluştur
      const convId = convs.getOrCreate(selectedModel);
      const conversation = convs.conversations.find((c) => c.id === convId);

      // User mesajını ekle
      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      convs.addMessage(convId, userMsg);

      // Boş assistant mesajı ekle (stream dolduracak)
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        model: selectedModel,
      };
      convs.addMessage(convId, assistantMsg);

      setIsLoading(true);

      try {
        abortRef.current = new AbortController();

        const history = [
          ...(conversation?.messages ?? []).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user" as const, content },
        ];

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, model: selectedModel }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Request failed");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          for (const line of decoder.decode(value).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              fullContent += delta;
              convs.updateMessage(convId, assistantMsg.id, fullContent);
            } catch { /* malformed chunk */ }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        convs.removeMessage(convId, assistantMsg.id); // hata varsa boş mesajı sil
      } finally {
        setIsLoading(false);
      }
    },
    [convs, selectedModel]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    // Conversation CRUD — direkt expose et
    ...convs,
    // Chat state
    isLoading,
    error,
    sendMessage,
    stopGeneration,
  };
}