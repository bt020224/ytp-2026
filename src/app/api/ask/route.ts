import { NextResponse } from "next/server";
import { TAIPEI_ATTRACTIONS } from "@/lib/attractions";
import { llmComplete, llmErrorPayload } from "@/lib/llm";

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

  const langInstr = LANG_INSTRUCTIONS[lang ?? "en"] ?? LANG_INSTRUCTIONS.en;
  const system = `${SYSTEM_PROMPT_BASE}\n\nLanguage: ${langInstr}`;

  const user = `Attraction: ${attraction.nameZh} / ${attraction.nameEn}
Category: ${attraction.categoryEn}
Coordinates: ${attraction.lat}, ${attraction.lng}
Ticket: ${attraction.ticket === 0 ? "Free" : `NT$${attraction.ticket}`}

User question: ${question}`;

  try {
    const answer = await llmComplete({ system, user, maxTokens: 1024 });
    return NextResponse.json({ answer });
  } catch (e) {
    const { status, body: errorBody } = llmErrorPayload(e);
    return NextResponse.json(errorBody, { status });
  }
}
