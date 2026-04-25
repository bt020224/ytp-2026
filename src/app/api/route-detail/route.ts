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

const MODE_NAME: Record<string, string> = {
  walk: "walking",
  ubike: "YouBike",
  mrt: "Taipei Metro (MRT)",
  bus: "Taipei city bus",
  taxi: "taxi",
};

const SYSTEM = `You are a Taipei transit expert helping a "Play Taipei" tourism app generate concrete, step-by-step travel directions for a planned route.

You will receive: origin lat/lng, destination attraction name, and a list of planned route segments (mode, distance, estimated minutes, estimated fare).

For each segment provide CONCRETE Taipei-specific guidance:

- **MRT segments**: Name the most likely line (Bannan Line 板南線, Tamsui-Xinyi Line 淡水信義線, Songshan-Xindian Line 松山新店線, Wenhu Line 文湖線, Zhonghe-Xinlu Line 中和新蘆線, Circular Line 環狀線). Include origin station, destination station, and any transfer point. State typical headway (peak hours 06:30–09:00 and 17:00–19:30: 4–6 min; off-peak: 6–8 min). Note operating hours (around 06:00–24:00).
- **Bus segments**: Suggest 2–3 likely city bus route numbers commonly serving that corridor in Taipei. State typical headway (10–20 min). Mention boarding side (front for one-segment fare).
- **Walking segments**: Give rough direction (e.g. "head south on Zhongxiao W. Rd") and any major landmark.
- **YouBike**: Mention there is usually a YouBike 2.0 dock near MRT station exits and major attractions.
- **Taxi**: Mention typical hailing locations or call apps (Yahoo TAXI, 55688).

Format as a numbered list. Keep total response under 250 words.

IMPORTANT: If you are not confident about a specific station name, line, or bus route number, say "check the station map" or list 2–3 likely options instead of inventing names. Do not fabricate.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on the server." },
      { status: 500 }
    );
  }

  let body: {
    originLat?: number;
    originLng?: number;
    destinationId?: string;
    route?: { id: string; segments: Array<{ mode: string; km: number; minutes: number; fare: number }> };
    lang?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { originLat, originLng, destinationId, route, lang } = body;
  if (
    typeof originLat !== "number" ||
    typeof originLng !== "number" ||
    !destinationId ||
    !route ||
    !Array.isArray(route.segments)
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const dest = TAIPEI_ATTRACTIONS.find((a) => a.id === destinationId);
  if (!dest) {
    return NextResponse.json({ error: "Unknown attraction" }, { status: 404 });
  }

  const segDesc = route.segments
    .map(
      (s, i) =>
        `${i + 1}. ${MODE_NAME[s.mode] ?? s.mode}: ${s.km.toFixed(2)} km, ~${s.minutes} min, NT$${s.fare}`
    )
    .join("\n");

  const langInstr = LANG_INSTRUCTIONS[lang ?? "en"] ?? LANG_INSTRUCTIONS.en;

  const userMsg = `Origin coordinates: ${originLat.toFixed(5)}, ${originLng.toFixed(5)}
Destination: ${dest.nameZh} / ${dest.nameEn} (lat ${dest.lat}, lng ${dest.lng})
Planned route ID: ${route.id}
Segments:
${segDesc}

${langInstr}`;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMsg }],
    });

    const detail = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ detail });
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
