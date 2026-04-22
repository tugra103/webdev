import { useState, useCallback, useEffect } from "react";
import { Conversation, Message } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

function makeTitle(content: string): string {
  return content.length > 50 ? content.slice(0, 50) + "…" : content;
}

const STORAGE_KEY = "openrouter_conversations";

function loadFromStorage(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    console.warn("localStorage full or unavailable");
  }
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useConversations(defaultModel: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // localStorage'dan yükle (sadece client'ta)
  useEffect(() => {
    const stored = loadFromStorage();
    setConversations(stored);
    if (stored.length > 0) setActiveId(stored[0].id);
  }, []);

  // Her değişiklikte kaydet
  useEffect(() => {
    if (conversations.length > 0) saveToStorage(conversations);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  // ── CREATE ──────────────────────────────────────────────────────
  const createConversation = useCallback(
    (model?: string): Conversation => {
      const conv: Conversation = {
        id: generateId(),
        title: "New Conversation",
        messages: [],
        model: model ?? defaultModel,
        createdAt: now(),
        updatedAt: now(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      return conv;
    },
    [defaultModel]
  );

  // ── DELETE ──────────────────────────────────────────────────────
  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        // localStorage'ı da temizle
        if (next.length === 0) localStorage.removeItem(STORAGE_KEY);
        return next;
      });

      // Silinen aktifse, bir öncekine geç
      setActiveId((prev) => {
        if (prev !== id) return prev;
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining[0]?.id ?? null;
      });
    },
    [conversations]
  );

  // ── RENAME ──────────────────────────────────────────────────────
  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: title.trim() || "Untitled", updatedAt: now() } : c
      )
    );
  }, []);

  // ── CLEAR ALL ───────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── ADD MESSAGE (chat hook'u bunu çağırır) ───────────────────────
  const addMessage = useCallback(
    (conversationId: string, message: Message) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                // İlk gerçek mesajsa otomatik başlık üret
                title:
                  c.messages.length === 0 && message.role === "user"
                    ? makeTitle(message.content)
                    : c.title,
                messages: [...c.messages, message],
                updatedAt: now(),
              }
            : c
        )
      );
    },
    []
  );

  // ── UPDATE MESSAGE (streaming için) ─────────────────────────────
  const updateMessage = useCallback(
    (conversationId: string, messageId: string, content: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, content } : m
                ),
                updatedAt: now(),
              }
            : c
        )
      );
    },
    []
  );

  // ── REMOVE MESSAGE (hata durumunda geri al) ──────────────────────
  const removeMessage = useCallback(
    (conversationId: string, messageId: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
            : c
        )
      );
    },
    []
  );

  // ── GET OR CREATE (mesaj atılmadan önce) ─────────────────────────
  const getOrCreate = useCallback(
    (model?: string): string => {
      if (activeId && conversations.find((c) => c.id === activeId)) {
        return activeId;
      }
      const conv = createConversation(model);
      return conv.id;
    },
    [activeId, conversations, createConversation]
  );

  return {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    // CRUD
    createConversation,
    deleteConversation,
    renameConversation,
    clearAll,
    // Message ops
    addMessage,
    updateMessage,
    removeMessage,
    getOrCreate,
  };
}