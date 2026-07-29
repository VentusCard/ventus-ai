// Vercel serverless function — AI meeting-prep brief on demand (Merrill's "AI-Powered
// Meeting Journey" analogue). Given one household's signal, return a concise brief.
declare const process: { env: Record<string, string | undefined> };

export const maxDuration = 30;

const PREP_MODEL = process.env.OPENROUTER_PREP_MODEL || "openai/gpt-4.1-mini";

function apiKey(): string | undefined {
  return (process.env.OPENROUTER_API_KEY || process.env.openrouter_api_key || process.env.OPENROUTER)?.trim() || undefined;
}

function isAppClient(request: Request): boolean {
  return request.headers.get("x-ventus-client") === "web-app";
}

const SYSTEM_PROMPT = `You prepare a concise meeting brief for a Merrill financial advisor about to contact a household.
Use the supplied signal. Be specific, compliant (Reg BI best-interest), and human — acknowledge the client's situation, don't hard-sell.
Return ONLY JSON: {"summary": one sentence, "agenda": [3 short bullets], "talkingPoints": [3 short bullets], "nextStep": short phrase}.`;

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

export async function POST(request: Request): Promise<Response> {
  if (process.env.ENABLE_INTERNAL_MODEL_EVAL !== "true") {
    return Response.json({ error: "model evaluation disabled" }, { status: 404 });
  }
  if (!isAppClient(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const key = apiKey();
  if (!key) return Response.json({ error: "OPENROUTER_API_KEY is not configured" }, { status: 503 });

  let body: { household?: unknown };
  try {
    body = (await request.json()) as { household?: unknown };
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.household) return Response.json({ error: "household required" }, { status: 400 });

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://ventusai.com",
        "X-Title": "Ventus Meeting Prep",
      },
      body: JSON.stringify({
        model: PREP_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Household signal:\n${JSON.stringify(body.household)}` },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return Response.json({ error: `${res.status} ${errText.slice(0, 120)}` }, { status: 502 });
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = safeParse(typeof content === "string" ? content : JSON.stringify(content));
    if (!parsed) return Response.json({ error: "unparseable" }, { status: 502 });
    return Response.json({ ...parsed, model: PREP_MODEL });
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 120) }, { status: 500 });
  }
}
