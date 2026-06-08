import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, productName, productCategory, productPositioning } = await req.json();

    if (!productId || !productName) {
      return new Response(JSON.stringify({ error: "productId and productName are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Generate 8–10 Lifestyle Asset Signals that a bank's data platform could detect to identify customers who would be a strong fit for the following product:

Product: ${productName}
Category: ${productCategory ?? "n/a"}
Positioning: ${productPositioning ?? "n/a"}

Each signal should describe an observable behavior in transaction data (spending pattern, account flow, recurring debit, deposit pattern, etc.) that correlates with strong fit for this product.`;

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
            content: `You are a bank marketing data strategist. Generate lifestyle/behavioral signals a bank can detect from transaction data.

RULES:
1. NEVER use em dashes (—). Use commas or short dashes (-).
2. NEVER include specific dollar amounts or exact transaction counts. Use "vaguely specific" behavioral phrasing (e.g., "Recurring private club dues", "Sustained idle checking balance", "Multi-carrier travel pattern"). Never "5+ transactions" or ">$25k".
3. NEVER mention competitor brand names (Plaid, MX, etc.) or risk/stress terminology. Frame everything as opportunity / fit.
4. Labels: 2–4 words, behavioral archetype tone.
5. Descriptions: ≤14 words, describe the evidence type without exact counts/dollars.
6. detectionRate: realistic estimate of share of US bank base, between 0.003 and 0.20.
7. id: short kebab-case, prefixed with the productId (e.g., "${productId}-private-banking").`,
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_signals",
              description: "Emit 8–10 lifestyle asset signals tuned to the given product.",
              parameters: {
                type: "object",
                properties: {
                  signals: {
                    type: "array",
                    minItems: 8,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        description: { type: "string" },
                        detectionRate: { type: "number" },
                      },
                      required: ["id", "label", "description", "detectionRate"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["signals"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_signals" } },
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

    // Light normalization to keep IDs unique and detectionRate in range
    const seen = new Set<string>();
    const signals = (parsed.signals ?? []).map((s: any, i: number) => {
      let id = String(s.id ?? `${productId}-sig-${i}`).toLowerCase().replace(/[^a-z0-9-]/g, "-");
      if (seen.has(id)) id = `${id}-${i}`;
      seen.add(id);
      const rate = Math.max(0.003, Math.min(0.20, Number(s.detectionRate) || 0.02));
      return { id, label: String(s.label ?? "Signal"), description: String(s.description ?? ""), detectionRate: rate };
    });

    return new Response(JSON.stringify({ signals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-lifestyle-signals error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
