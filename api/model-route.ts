// Vercel serverless function — mirrors the EBC coach pattern (Web Request/Response,
// key from process.env, simple client-header guard). Fans one enrichment task out to
// several OpenRouter models so the demo can show live multi-LLM routing. The API key
// never reaches the browser.
declare const process: { env: Record<string, string | undefined> };

export const maxDuration = 60;

const DEFAULT_MODELS = [
  "openai/gpt-4.1-mini",
  "google/gemini-2.5-flash-lite",
  "qwen/qwen3-235b-a22b-2507",
  "z-ai/glm-5.2",
];

function models(): string[] {
  return (process.env.OPENROUTER_MODELS || DEFAULT_MODELS.join(","))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function apiKey(): string | undefined {
  return (process.env.OPENROUTER_API_KEY || process.env.openrouter_api_key || process.env.OPENROUTER)?.trim() || undefined;
}

function isAppClient(request: Request): boolean {
  return request.headers.get("x-ventus-client") === "web-app";
}

const SYSTEM_PROMPT = `You are a bank transaction enrichment engine. Given ONE raw transaction descriptor, infer the merchant and behavioral classification.
Respond with ONLY a compact JSON object and no prose:
{"merchant": string, "pillar": one of ["Income","Wealth","Cash","Business","Family & Community","Travel & Exploration","Health & Wellness","Food & Dining","Home & Living","Technology & Digital Life","Miscellaneous"], "category": string, "tag": short behavioral-signal phrase, "flow": "income" | "spend", "confidence": number between 0 and 1}`;

function clamp01(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0.5;
  return Math.max(0, Math.min(1, v));
}

function safeParse(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

async function callModel(model: string, input: string, key: string) {
  const start = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://ventusai.com",
        "X-Title": "Ventus Model Routing Demo",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Descriptor: ${input}` },
        ],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { model, ok: false, latencyMs, error: `${res.status} ${errText.slice(0, 120)}` };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = safeParse(typeof content === "string" ? content : JSON.stringify(content));
    if (!parsed) return { model, ok: false, latencyMs, error: "unparseable response" };
    return {
      model,
      ok: true,
      latencyMs,
      merchant: String(parsed.merchant ?? "").slice(0, 48),
      pillar: String(parsed.pillar ?? "Miscellaneous"),
      category: String(parsed.category ?? ""),
      tag: String(parsed.tag ?? ""),
      flow: parsed.flow === "income" ? "income" : "spend",
      confidence: clamp01(parsed.confidence),
    };
  } catch (e) {
    return { model, ok: false, latencyMs: Date.now() - start, error: String(e).slice(0, 120) };
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!isAppClient(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const key = apiKey();
  if (!key) return Response.json({ error: "OPENROUTER_API_KEY is not configured" }, { status: 503 });

  let body: { input?: unknown; model?: unknown };
  try {
    body = (await request.json()) as { input?: unknown; model?: unknown };
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const input = typeof body.input === "string" ? body.input.slice(0, 200) : "";
  if (!input) return Response.json({ error: "input (string) required" }, { status: 400 });

  const allowed = models();

  // Single-model mode — lets the client fan out per-model for progressive reveal.
  if (typeof body.model === "string" && body.model) {
    if (!allowed.includes(body.model)) return Response.json({ error: "model not allowed" }, { status: 400 });
    const verdict = await callModel(body.model, input, key);
    return Response.json(verdict);
  }

  const results = await Promise.all(allowed.map((m) => callModel(m, input, key)));
  const ok = results.filter((r) => r.ok) as Array<{ pillar: string; confidence: number }>;
  const selected = ok.slice().sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null;
  const tally: Record<string, number> = {};
  ok.forEach((r) => (tally[r.pillar] = (tally[r.pillar] ?? 0) + 1));
  const consensusPillar = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const agreement = ok.length ? Math.round((ok.filter((r) => r.pillar === consensusPillar).length / ok.length) * 100) : 0;

  return Response.json({ input, models: results, selected, consensusPillar, agreement });
}
