import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { TAIPEI_ATTRACTIONS } from "@/lib/attractions";

export const runtime = "nodejs";

const LANG_INSTRUCTIONS: Record<string, string> = {
  zh: "請以繁體中文撰寫所有任務、提示與故事敘述。",
  en: "Write all tasks, hints, and narrative in English.",
  ja: "すべてのタスク、ヒント、ナレーションを日本語で書いてください。",
  ko: "모든 임무, 힌트, 내러티브를 한국어로 작성하세요.",
};

const CHARACTER_BRIEFS: Record<string, string> = {
  detective:
    "Player is a detective unravelling a mystery in Taipei. Tasks involve finding clues, observing details, identifying suspects (figuratively), and piecing together a noir-ish narrative arc.",
  explorer:
    "Player is an adventurous explorer mapping hidden trails, viewpoints, and lesser-known cultural pockets of Taipei. Tasks involve hiking, finding specific viewpoints, photographing landmarks at unusual angles, and feeling like Indiana Jones.",
  foodie:
    "Player is a food critic on a mission to crown the best night-market bite. Tasks involve eating specific dishes, comparing flavors, asking vendors signature questions, and assembling a personal flavor map.",
};

const SYSTEM = `You are a Taipei tourism game master designing a 5-stop story-driven quest for the "Play Taipei" game mode.

Given a player character role and a list of available attractions, write a coherent 5-quest adventure where:
- ALL chosen attractionId values MUST come from the provided list — never invent IDs.
- Order quests in a geographically reasonable flow.
- Each quest must thematically suit BOTH its attraction AND the character role.
- Each quest has 4 fields:
  - "task": the in-character objective at this stop (1-2 sentences, action-oriented).
  - "hint": a subtle hint that helps without giving away the answer (1 sentence).
  - "completion": a concrete observable thing the player must DO/SEE/PHOTOGRAPH/EAT to mark the stop complete (1 sentence).
  - "xp": integer 50-200 reward points based on perceived difficulty.
- Also write:
  - "storyTitle": a punchy adventure title (under 30 chars).
  - "storyHook": opening narrative addressed to the player (2-3 sentences setting the scene).
  - "ending": triumphant closing narrative played after the 5th quest is done (2-3 sentences).

Return strict JSON matching the provided schema. No prose outside JSON.

Make it FUN and gamey — use second person, evocative language, mystery/discovery framing.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on the server." },
      { status: 500 }
    );
  }

  let body: { character?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const characterKey = body.character ?? "detective";
  const characterBrief =
    CHARACTER_BRIEFS[characterKey] ?? CHARACTER_BRIEFS.detective;
  const lang = body.lang ?? "en";
  const langInstr = LANG_INSTRUCTIONS[lang] ?? LANG_INSTRUCTIONS.en;

  const attractionList = TAIPEI_ATTRACTIONS.map(
    (a) =>
      `- id="${a.id}" | ${a.nameZh} (${a.nameEn}) | ${a.categoryEn} | lat ${a.lat} lng ${a.lng}`
  ).join("\n");

  const userMsg = `Character role: ${characterKey}
Character brief: ${characterBrief}
Number of quests: 5

Available attractions (use ONLY these IDs):
${attractionList}

${langInstr}`;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 3000,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userMsg }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              storyTitle: { type: "string" },
              storyHook: { type: "string" },
              ending: { type: "string" },
              quests: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    attractionId: { type: "string" },
                    task: { type: "string" },
                    hint: { type: "string" },
                    completion: { type: "string" },
                    xp: { type: "integer" },
                  },
                  required: ["attractionId", "task", "hint", "completion", "xp"],
                  additionalProperties: false,
                },
              },
            },
            required: ["storyTitle", "storyHook", "ending", "quests"],
            additionalProperties: false,
          },
        },
      },
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed: {
      storyTitle: string;
      storyHook: string;
      ending: string;
      quests: { attractionId: string; task: string; hint: string; completion: string; xp: number }[];
    };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    // Defensive: drop quests with hallucinated IDs
    const validIds = new Set(TAIPEI_ATTRACTIONS.map((a) => a.id));
    const cleanedQuests = parsed.quests.filter((q) =>
      validIds.has(q.attractionId)
    );

    return NextResponse.json({
      character: characterKey,
      storyTitle: parsed.storyTitle,
      storyHook: parsed.storyHook,
      ending: parsed.ending,
      quests: cleanedQuests,
    });
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
