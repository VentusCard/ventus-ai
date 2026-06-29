// Vercel serverless function — AI-native worklist ranking. The advisor states a
// priority in plain language; one model scores/orders the opportunities against it and
// returns a short reason per item. Key stays server-side. Mirrors the EBC pattern.
declare const process: { env: Record<string, string | undefined> };

export const maxDuration = 30;

const RANK_MODEL = process.env.OPENROUTER_RANK_MODEL || "openai/gpt-4.1-mini";

function apiKey(): string | undefined {
  return (process.env.OPENROUTER_API_KEY || process.env.openrouter_api_key || process.env.OPENROUTER)?.trim() || undefined;
}

function isAppClient(request: Request): boolean {
  return request.headers.get("x-ventus-client") === "web-app";
}

const SYSTEM_PROMPT = `You help a Merrill financial advisor work their book. The advisor's text may be a PRIORITY (rank these for me) or a QUERY (find the ones that match), or both.
Given that text and a list of opportunities, return ONLY JSON:
{"ranking":[{"id":string,"score":number 0-100,"why":short phrase under 6 words,"match":boolean}]}
- "score" = how well the opportunity fits the text. Order best-first.
- "match" = true if the opportunity satisfies the request; false if it clearly does not (use for query/filter-style asks). For a pure priority with no filter, set match=true for all.
- "why" explains the fit in plain language. Include every id exactly once.`;

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
  if (!isAppClient(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const key = apiKey();
  if (!key) return Response.json({ error: "OPENROUTER_API_KEY is not configured" }, { status: 503 });

  let body: { priority?: unknown; items?: unknown };
  try {
    body = (await request.json()) as { priority?: unknown; items?: unknown };
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const priority = typeof body.priority === "string" ? body.priority.slice(0, 400) : "";
  const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (!priority || items.length === 0) {
    return Response.json({ error: "priority (string) and items[] required" }, { status: 400 });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://ventusai.com",
        "X-Title": "Ventus Worklist Prioritization",
      },
      body: JSON.stringify({
        model: RANK_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Priority: ${priority}\n\nOpportunities:\n${JSON.stringify(items)}` },
        ],
        temperature: 0,
        max_tokens: 600,
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
    const ranking = Array.isArray(parsed?.ranking) ? parsed!.ranking : [];
    return Response.json({ ranking, model: RANK_MODEL });
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 120) }, { status: 500 });
  }
}
