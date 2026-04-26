import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { TAIPEI_ATTRACTIONS } from "@/lib/attractions";

export const runtime = "nodejs";

const LANG_INSTRUCTIONS: Record<string, string> = {
  zh: "請以繁體中文撰寫每站推薦理由。",
  en: "Write each stop's rationale in English.",
  ja: "各立ち寄り先の推薦理由を日本語で書いてください。",
  ko: "각 방문지의 추천 이유를 한국어로 작성하세요.",
};

const THEMES: Record<string, string> = {
  food: "Night-market food and street eats; emphasize variety and signature dishes",
  family: "Family-friendly with kids; gentle pacing, indoor backups for rain",
  culture: "Hipster / cultural strolling; historic neighborhoods, indie cafes, design",
  hidden: "Hidden gems & nature; viewpoints, hikes, less-touristy spots",
  shopping: "Shopping districts and major markets; fashion, gadgets",
  perf: "Performing arts and venues; mix anchor with adjacent food/coffee",
};

const SYSTEM = `You are a Taipei trip planner for the "Play Taipei" tourism app.

Given a list of available attractions, a theme, and a target stop count, pick the best subset and order them into a single-day itinerary.

Rules:
- ALL chosen attractionId values MUST come from the provided list — do not invent IDs.
- Order them in a geographically efficient flow (cluster nearby stops, minimize backtracking).
- Pick attractions that match the theme. If the theme calls for night-market food, end the day at a night market. If family-friendly, avoid late-night-only spots.
- For each stop, write a SHORT (under 25 words) reasoning in the requested language explaining why it's at that position in the trip.
- If user provides anchor coordinates, prefer attractions closer to that anchor for the FIRST stop.

Return strict JSON matching the provided schema. No prose outside JSON.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on the server." },
      { status: 500 }
    );
  }

  let body: {
    theme?: string;
    numStops?: number;
    anchorLat?: number;
    anchorLng?: number;
    excludeIds?: string[];
    lang?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const themeKey = body.theme ?? "culture";
  const themeDesc = THEMES[themeKey] ?? THEMES.culture;
  const numStops = Math.max(2, Math.min(6, body.numStops ?? 4));
  const lang = body.lang ?? "en";
  const exclude = new Set(body.excludeIds ?? []);
  const candidates = TAIPEI_ATTRACTIONS.filter((a) => !exclude.has(a.id));
  const langInstr = LANG_INSTRUCTIONS[lang] ?? LANG_INSTRUCTIONS.en;

  const attractionList = candidates
    .map(
      (a) =>
        `- id="${a.id}" | ${a.nameZh} (${a.nameEn}) | ${a.categoryEn} | lat ${a.lat} lng ${a.lng} | ticket ${a.ticket === 0 ? "free" : `NT$${a.ticket}`}`
    )
    .join("\n");

  const userMsg = `Theme: ${themeKey} — ${themeDesc}
Number of stops: ${numStops}
${
  typeof body.anchorLat === "number" && typeof body.anchorLng === "number"
    ? `Anchor coordinates (start near here): ${body.anchorLat.toFixed(5)}, ${body.anchorLng.toFixed(5)}`
    : "No anchor coordinates."
}

Available attractions (you may ONLY use these IDs):
${attractionList}

${langInstr}`;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMsg }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              itinerary: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    attractionId: { type: "string" },
                    reasoning: { type: "string" },
                  },
                  required: ["attractionId", "reasoning"],
                  additionalProperties: false,
                },
              },
            },
            required: ["itinerary"],
            additionalProperties: false,
          },
        },
      },
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed: { itinerary: { attractionId: string; reasoning: string }[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    // Filter out any hallucinated IDs (defensive)
    const validIds = new Set(candidates.map((a) => a.id));
    const cleaned = parsed.itinerary.filter((s) => validIds.has(s.attractionId));

    return NextResponse.json({ itinerary: cleaned });
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
