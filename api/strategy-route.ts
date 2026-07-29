// Vercel serverless function for exec-level response-path ranking. This keeps
// OpenRouter keys server-side while letting the Merrill demo ask a frontier model
// to rank strategic paths against an explicit leadership objective.
declare const process: { env: Record<string, string | undefined> };

export const maxDuration = 60;

type ResponsePath = {
  name?: unknown;
  impact?: unknown;
  tradeoff?: unknown;
};

function apiKey(): string | undefined {
  return (process.env.OPENROUTER_API_KEY || process.env.openrouter_api_key || process.env.OPENROUTER)?.trim() || undefined;
}

function model(): string {
  return (process.env.OPENROUTER_STRATEGY_MODEL || process.env.OPENROUTER_RANK_MODEL || "openai/gpt-4.1-mini").trim();
}

function isAppClient(request: Request): boolean {
  return request.headers.get("x-ventus-client") === "web-app";
}

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 600) : fallback;
}

function safePaths(value: unknown): Array<{ name: string; impact: string; tradeoff: string }> {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 5).map((item: ResponsePath) => ({
    name: safeString(item?.name, "Response path"),
    impact: safeString(item?.impact, "Impact not estimated"),
    tradeoff: safeString(item?.tradeoff, "Tradeoff not estimated"),
  }));
}

function safeParse(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

const SYSTEM_PROMPT = `You are a Merrill wealth-management strategy ranking engine.
Given a market-level transaction signal, a leadership objective, and candidate response paths, rank the paths.
Do not recommend individual client outreach. This is for exec-level product, coverage, and pilot planning.
Return ONLY compact JSON:
{"recommendedPath": string, "impactForecast": string, "rationale": string, "confidence": number, "keyRisks": string[]}`;

export async function POST(request: Request): Promise<Response> {
  if (process.env.ENABLE_INTERNAL_MODEL_EVAL !== "true") {
    return Response.json({ error: "model evaluation disabled" }, { status: 404 });
  }
  if (!isAppClient(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const key = apiKey();
  if (!key) return Response.json({ error: "OPENROUTER_API_KEY is not configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const payload = {
    objective: safeString(body.objective, "Maximize NNA retention"),
    signal: safeString(body.signal),
    households: safeString(body.households),
    candidateResponse: safeString(body.candidateResponse),
    evidence: safeString(body.evidence),
    owner: safeString(body.owner),
    responsePaths: safePaths(body.responsePaths),
  };

  if (!payload.signal || !payload.responsePaths.length) {
    return Response.json({ error: "signal and responsePaths are required" }, { status: 400 });
  }

  const routeModel = model();
  const started = Date.now();
  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://ventusai.com",
      "X-Title": "Ventus Merrill Strategy Ranking",
    },
    body: JSON.stringify({
      model: routeModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(payload) },
      ],
      temperature: 0,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  const latencyMs = Date.now() - started;
  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return Response.json({ error: `${upstream.status} ${errText.slice(0, 180)}`, model: routeModel, latencyMs }, { status: 502 });
  }

  const data = await upstream.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = safeParse(typeof content === "string" ? content : JSON.stringify(content));
  if (!parsed) return Response.json({ error: "unparseable model response", model: routeModel, latencyMs }, { status: 502 });

  return Response.json({
    recommendedPath: safeString(parsed.recommendedPath),
    impactForecast: safeString(parsed.impactForecast),
    rationale: safeString(parsed.rationale),
    confidence: Number(parsed.confidence) || null,
    keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks.slice(0, 4).map((item) => safeString(item)) : [],
    model: routeModel,
    latencyMs,
  });
}
