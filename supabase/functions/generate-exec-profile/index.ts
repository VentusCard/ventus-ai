import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { csv } = await req.json();
    if (!csv || typeof csv !== "string") {
      return new Response(JSON.stringify({ error: "csv field is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const lines = csv.trim().split("\n");
    const txCount = Math.max(0, lines.length - 1);

    // Build milestone keys: every 10 transactions
    const milestones: number[] = [];
    for (let m = 10; m <= txCount; m += 10) milestones.push(m);
    if (milestones.length === 0) milestones.push(txCount);

    const systemPrompt = `You are a banking transaction analysis engine. You analyze consumer transaction data and produce structured intelligence profiles.

Given a CSV of transactions, you must:
1. Classify every transaction row into a pillar (e.g. "Travel & Transport", "Food & Dining", "Wellness & Fitness", "Shopping", "Entertainment", "Home & Living", "Education & Family", "Healthcare", "Financial Planning", "Sports & Active", "Pets & Care", "Technology") and a short label (e.g. "Airlines", "Grocery", "Gym").
2. Generate 4-5 lifestyle pills (short labels like "Wellness Explorer", "Career Focused").
3. Write progressive persona descriptions at these transaction milestones: ${JSON.stringify(milestones)}. Each description should build on previous ones, starting vague and becoming more specific as more data accumulates.
4. Compose three intelligence cards:
   - Analytics: spending pattern summary with percentages and detected life events
   - Rewards: 4 hyper-personalized deal recommendations as pills
   - Relationship: life event detection and next-best-product recommendation

For txIndices, pick 4-5 representative transaction indices (0-based) that support each card's narrative.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this transaction CSV:\n\n${csv}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_exec_profile",
              description: "Return the structured executive profile analysis",
              parameters: {
                type: "object",
                properties: {
                  signalMap: {
                    type: "object",
                    description: "Map of transaction index (as string) to {pillar, label}",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        pillar: { type: "string" },
                        label: { type: "string" },
                      },
                      required: ["pillar", "label"],
                    },
                  },
                  pills: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-5 lifestyle labels",
                  },
                  descriptions: {
                    type: "object",
                    description: "Milestone-keyed persona descriptions. Keys are transaction counts as strings.",
                    additionalProperties: { type: "string" },
                  },
                  intelligence: {
                    type: "object",
                    properties: {
                      analytics: {
                        type: "object",
                        properties: {
                          accent: { type: "string", description: "Hex color, use #60a5fa" },
                          icon: { type: "string", description: "Single character icon, use ◆" },
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          content: { type: "string" },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["accent", "icon", "title", "subtitle", "content", "txIndices"],
                      },
                      rewards: {
                        type: "object",
                        properties: {
                          accent: { type: "string", description: "Hex color, use #34d399" },
                          icon: { type: "string", description: "Single character icon, use ★" },
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          pills: { type: "array", items: { type: "string" } },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["accent", "icon", "title", "subtitle", "pills", "txIndices"],
                      },
                      relationship: {
                        type: "object",
                        properties: {
                          accent: { type: "string", description: "Hex color, use #fbbf24" },
                          icon: { type: "string", description: "Single character icon, use ⚡" },
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          content: { type: "string" },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["accent", "icon", "title", "subtitle", "content", "txIndices"],
                      },
                    },
                    required: ["analytics", "rewards", "relationship"],
                  },
                },
                required: ["signalMap", "pills", "descriptions", "intelligence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_exec_profile" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-exec-profile error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
