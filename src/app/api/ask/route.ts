import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { TAIPEI_ATTRACTIONS } from "@/lib/attractions";

export const runtime = "nodejs";

const LANG_INSTRUCTIONS: Record<string, string> = {
  zh: "請以繁體中文回答。",
  en: "Respond in English.",
  ja: "日本語で答えてください。",
  ko: "한국어로 답변해 주세요.",
};

const SYSTEM_PROMPT_BASE = `You are a knowledgeable, friendly Taipei tourism assistant for the "Play Taipei" travel app.

For each user question about a Taipei attraction, give practical, specific tips: opening hours, must-see highlights, signature food/drink, photo spots, transportation, cultural background, and tips to avoid crowds.

Rules:
- Keep responses concise (under 150 words).
- Use bullet points or short paragraphs.
- If the question is unrelated to the attraction, politely steer back.
- Do not invent prices or hours you are not sure about — say "check the official site" instead.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on the server." },
      { status: 500 }
    );
  }

  let body: { attractionId?: string; question?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { attractionId, question, lang } = body;
  if (!attractionId || !question || typeof question !== "string") {
    return NextResponse.json(
      { error: "Missing attractionId or question" },
      { status: 400 }
    );
  }
  if (question.length > 500) {
    return NextResponse.json(
      { error: "Question too long (max 500 chars)" },
      { status: 400 }
    );
  }

  const attraction = TAIPEI_ATTRACTIONS.find((a) => a.id === attractionId);
  if (!attraction) {
    return NextResponse.json({ error: "Unknown attraction" }, { status: 404 });
  }

  const langInstr =
    LANG_INSTRUCTIONS[lang ?? "en"] ?? LANG_INSTRUCTIONS.en;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: `${SYSTEM_PROMPT_BASE}\n\nLanguage: ${langInstr}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Attraction: ${attraction.nameZh} / ${attraction.nameEn}
Category: ${attraction.categoryEn}
Coordinates: ${attraction.lat}, ${attraction.lng}
Ticket: ${attraction.ticket === 0 ? "Free" : `NT$${attraction.ticket}`}

User question: ${question}`,
        },
      ],
    });

    const answer = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ answer });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid ANTHROPIC_API_KEY on the server" },
        { status: 500 }
      );
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error (${e.status})` },
        { status: 500 }
      );
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
