export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // ISO string — JSON serializable
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}