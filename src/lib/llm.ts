// OpenAI-compatible chat/completions client.
//
// Works with any OpenAI-compatible endpoint: OpenAI direct, Azure OpenAI,
// OpenRouter, deepinfra, or Chinese AI proxies like free.v36.cm.
//
// Reads ANTHROPIC_API_KEY (any "Bearer" key), ANTHROPIC_BASE_URL (defaults to
// https://api.openai.com), and LLM_MODEL (defaults to gpt-4o-mini).

const BASE_URL =
  process.env.ANTHROPIC_BASE_URL?.replace(/\/+$/, "") || "https://api.openai.com";
const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const DEFAULT_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";

export type LlmErrorKind =
  | "missing_key"
  | "auth"
  | "rate_limit"
  | "model_unavailable"
  | "bad_response"
  | "other";

export class LlmError extends Error {
  constructor(
    message: string,
    public status: number,
    public kind: LlmErrorKind
  ) {
    super(message);
    this.name = "LlmError";
  }
}

type LlmOptions = {
  system: string;
  user: string;
  expectJson?: boolean;
  maxTokens?: number;
  model?: string;
};

export async function llmComplete(opts: LlmOptions): Promise<string> {
  if (!API_KEY) {
    throw new LlmError(
      "ANTHROPIC_API_KEY not configured on the server.",
      500,
      "missing_key"
    );
  }

  const body: Record<string, unknown> = {
    model: opts.model || DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  };

  if (opts.expectJson) {
    body.response_format = { type: "json_object" };
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new LlmError(
      `Network error reaching LLM: ${e instanceof Error ? e.message : "unknown"}`,
      0,
      "other"
    );
  }

  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      throw new LlmError(
        "Invalid ANTHROPIC_API_KEY on the server",
        401,
        "auth"
      );
    }
    if (res.status === 429) {
      throw new LlmError("Rate limited by upstream", 429, "rate_limit");
    }
    if (res.status === 503 || /渠道|channel/i.test(text)) {
      throw new LlmError(
        `Model unavailable on this proxy: ${text.slice(0, 200)}`,
        503,
        "model_unavailable"
      );
    }
    throw new LlmError(
      `LLM API error (${res.status}): ${text.slice(0, 300)}`,
      res.status,
      "other"
    );
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = JSON.parse(text);
  } catch {
    throw new LlmError(
      "LLM returned non-JSON envelope",
      res.status,
      "bad_response"
    );
  }
  return data.choices?.[0]?.message?.content || "";
}

// Helper to surface friendly NextResponse JSON for an LlmError-or-anything.
export function llmErrorPayload(e: unknown): {
  status: number;
  body: { error: string };
} {
  if (e instanceof LlmError) {
    return {
      status: e.status === 0 ? 500 : e.status,
      body: { error: e.message },
    };
  }
  const msg = e instanceof Error ? e.message : "Unknown error";
  return { status: 500, body: { error: msg } };
}
