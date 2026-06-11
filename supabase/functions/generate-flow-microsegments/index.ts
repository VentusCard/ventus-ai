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
    const {
      productName,
      productCategory,
      productPositioning,
      signals = [],
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const signalLines = (signals as Array<{ label: string; evidence: string; type: string }>)
      .map((s, i) => `${i + 1}. [${s.type}] ${s.label} — ${s.evidence}`)
      .join("\n");

    const userPrompt = `Write the actual outbound campaign email that goes to customers in each microsegment of an always-on bank product flow.

Product: ${productName} (${productCategory})
Positioning: ${productPositioning ?? "n/a"}

Signals (one microsegment per signal, matched by exact signalLabel):
${signalLines}

For EACH signal write a real email a customer would receive:
- title: 4-7 word internal archetype name for the microsegment (e.g. "New-parent education planners").
- subject: <=60 char email subject line tuned to that signal's life stage / behavior.
- body: 3-5 sentence email body addressed to "Hi {{first_name}},". Open by acknowledging the life moment or behavior behind the signal in vaguely-specific phrasing (no exact amounts or counts). Then explain why ${productName} fits THIS person right now, with 1-2 concrete benefits relevant to that signal. Close with a soft handoff to the CTA. Warm, professional, banker tone. No em dashes.
- cta: 3-5 word button label, action verb first.

The bodies must feel meaningfully different across signals - a new-parent 529 email should read differently from a college-tour-age 529 email.`;

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
            content: `You are an expert bank marketing strategist generating banker-grade microsegment copy.

RULES:
1. NEVER use em dashes. Use commas, periods, or short dashes.
2. NEVER include exact dollar amounts or transaction counts. Use "vaguely specific" behavioral phrasing.
3. NEVER mention competitors or risk/stress framing. Always frame as opportunity or fit.
4. Title: 4-7 word archetype, no brand names.
5. Subject: <=60 characters.
6. Body: 2-3 sentences, professional and warm.
7. CTA: 3-5 words, action verb first.
8. signalLabel MUST match the provided signal label exactly.
9. Return exactly one microsegment per input signal, in the same order.`,
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_microsegments",
              description: "Emit one microsegment per input signal.",
              parameters: {
                type: "object",
                properties: {
                  microsegments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        signalLabel: { type: "string" },
                        title: { type: "string" },
                        subject: { type: "string" },
                        body: { type: "string" },
                        cta: { type: "string" },
                      },
                      required: ["signalLabel", "title", "subject", "body", "cta"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["microsegments"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_microsegments" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429 || status === 402) {
        return new Response(
          JSON.stringify({ error: status === 429 ? "Rate limit exceeded" : "Payment required", status }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
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

    return new Response(JSON.stringify({ microsegments: parsed.microsegments ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-flow-microsegments error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
