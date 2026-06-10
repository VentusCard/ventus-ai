import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_MOODS = [
  "Editorial calm",
  "Quiet luxury",
  "Warm domestic",
  "Architectural minimal",
  "Outdoor leisure",
  "Considered craft",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      productName,
      productPositioning,
      selectedSignals = [],
      lifeEvents = [],
      pillars = [],
      demographics = {},
      financialSignals = [],
      riskSignals = [],
      demographicSignals = [],
      audienceSize,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const signalLines = (selectedSignals as Array<{ label: string; description?: string }>)
      .map((s) => `- ${s.label}${s.description ? `: ${s.description}` : ""}`)
      .join("\n") || "(none selected)";

    const userPrompt = `Generate exactly 3 microsegment personas for an upsell campaign.

Product: ${productName}
Positioning: ${productPositioning ?? "n/a"}
Audience size: ${audienceSize ? `~${audienceSize.toLocaleString()}` : "unknown"}

Selected lifestyle asset signals (Behavioral family):
${signalLines}

Life event signals: ${(lifeEvents as string[]).join(", ") || "(none)"}
Lifestyle pillars: ${(pillars as string[]).join(", ") || "(none)"}
Financial signals: ${(financialSignals as string[]).join(", ") || "(none)"}
Risk signals (inclusion filters — audience meets ALL of these): ${(riskSignals as string[]).join(", ") || "(none)"}
Demographics: ${JSON.stringify(demographics)}

The audience is the intersection of all 5 Ventus signal families above. For each persona, distribute the selected behavioral signals (signalLabels must be a subset of the labels above), reflect the financial and risk posture in the message tone, write a personalized message, and produce a stock-image brief.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert bank marketing strategist. Generate banker-grade personalization for a single product upsell.

RULES:
1. NEVER use em dashes (—). Use commas, periods, or short dashes (-).
2. NEVER include exact dollar amounts or transaction counts. Use "vaguely specific" behavioral phrasing.
3. NEVER mention competitors or risk/stress framing. Always frame as opportunity or fit.
4. Personas: 4–7 word archetype labels (no brand names).
5. Subject lines: ≤60 characters.
6. Body: 2–3 sentences, professional, warm but not saccharine.
7. CTA: 3–5 words, action verb first.
8. imageryBrief.mood must be one of: ${ALLOWED_MOODS.join(", ")}.
9. imageryBrief.query: 5–8 words, comma-separated stock-search phrase.
10. imageryBrief.keywords: 4–6 atomic tags.
11. imageryBrief.avoid: always include "identifiable faces" and "logos", plus persona-specific items as needed.
12. sharePct values across the 3 personas should sum to ~100.`,
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_personas",
              description: "Emit 3 microsegment personas with personalized copy and imagery briefs.",
              parameters: {
                type: "object",
                properties: {
                  personas: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        signalLabels: { type: "array", items: { type: "string" } },
                        sharePct: { type: "number" },
                        subject: { type: "string" },
                        body: { type: "string" },
                        cta: { type: "string" },
                        imageryBrief: {
                          type: "object",
                          properties: {
                            query: { type: "string" },
                            keywords: { type: "array", items: { type: "string" } },
                            mood: { type: "string", enum: ALLOWED_MOODS },
                            composition: { type: "string" },
                            avoid: { type: "array", items: { type: "string" } },
                          },
                          required: ["query", "keywords", "mood", "composition", "avoid"],
                          additionalProperties: false,
                        },
                      },
                      required: ["label", "signalLabels", "sharePct", "subject", "body", "cta", "imageryBrief"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["personas"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_personas" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429 || status === 402) {
        return new Response(JSON.stringify({ error: status === 429 ? "Rate limit exceeded" : "Payment required", status }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No structured output from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    // Normalize sharePct so the three personas sum to ~100
    const personas = parsed.personas ?? [];
    const total = personas.reduce((a: number, p: any) => a + (Number(p.sharePct) || 0), 0) || 1;
    for (const p of personas) {
      p.sharePct = Math.round(((Number(p.sharePct) || 0) / total) * 100);
    }

    return new Response(JSON.stringify({ personas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-campaign-segment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
