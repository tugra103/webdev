import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

// ─── Validation Schema ────────────────────────────────────────────
const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(32_000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(100),
  model: z.string().min(1).max(100),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().int().min(1).max(8192).optional().default(2048),
  tools: z.array(z.any()).optional(),
});

// ─── Handler ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. API key env'den — client asla görmez
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  // 2. Body parse et
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Validate
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { messages, model, temperature, max_tokens, tools } = parsed.data;

  // 4. OpenRouter'a ilet
  let openrouterRes: Response;
  try {
    openrouterRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.get("origin") ?? "http://localhost:3000",
          "X-Title": "OpenRouter Chat",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: true,
          ...(tools && tools.length > 0 && { tools, tool_choice: "auto" }),
        }),
      }
    );
  } catch (err) {
    console.error("OpenRouter fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach OpenRouter" },
      { status: 502 }
    );
  }

  // 5. OpenRouter hata döndürdüyse ilet
  if (!openrouterRes.ok) {
    let message = "OpenRouter error";
    try {
      const errBody = await openrouterRes.json();
      message = errBody?.error?.message ?? message;
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: message },
      { status: openrouterRes.status }
    );
  }

  // 6. Stream'i olduğu gibi client'a pipe et
  return new NextResponse(openrouterRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", // Nginx varsa buffering'i kapat
    },
  });
}