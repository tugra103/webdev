// app/actions/chat.ts
"use server";

import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function sendMessage(messages: any[]) {
  const res = await client.chat.send({
    chatRequest: {
      model: "openai/gpt-oss-120b:free",
      messages,                  
    },
  });

  return res.choices?.[0]?.message?.content || "";
}