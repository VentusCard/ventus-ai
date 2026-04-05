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

    const milestones: number[] = [];
    for (let m = 10; m <= txCount; m += 10) milestones.push(m);
    if (milestones.length === 0 && txCount > 0) milestones.push(txCount);

    const systemPrompt = `You are a banking transaction analysis engine. Analyze consumer transaction data and produce structured intelligence profiles.

Given a CSV of transactions (rows numbered 0 to ${txCount - 1}), you must:

1. **signalEntries**: For EVERY transaction row, classify it into a pillar and label. Return an array of objects with index, pillar, and label. Pillars include: "Travel & Transport", "Food & Dining", "Wellness & Fitness", "Shopping", "Entertainment", "Home & Living", "Education & Family", "Healthcare", "Financial Planning", "Sports & Active", "Pets & Care", "Technology". Labels are short (1-2 words) like "Airlines", "Grocery", "Gym", "Dining", "Hotels", etc.

2. **pills**: Generate exactly 4-5 lifestyle labels (e.g. "Wellness Explorer", "Career Focused", "Active Lifestyle").

3. **milestoneDescriptions**: Write progressive persona descriptions at these transaction count milestones: ${JSON.stringify(milestones)}. Return an array of {milestone, description}. Each description should BUILD on previous ones — start vague ("Active consumer with travel and dining signals") and become more specific and insightful as more data accumulates.

4. **intelligence**: Compose three intelligence cards:
   - analytics: spending pattern summary with percentages and detected life events
   - rewards: 4 hyper-personalized deal recommendations
   - relationship: life event detection and next-best-product recommendation
   For txIndices, pick 4-5 representative transaction row indices (0-based) that support each card.`;

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
          { role: "user", content: `Analyze this transaction CSV (${txCount} rows):\n\n${csv}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_exec_profile",
              description: "Return the structured executive profile analysis result",
              parameters: {
                type: "object",
                properties: {
                  signalEntries: {
                    type: "array",
                    description: "Classification for each transaction row",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number", description: "0-based transaction row index" },
                        pillar: { type: "string", description: "e.g. Travel & Transport" },
                        label: { type: "string", description: "e.g. Airlines, Grocery" },
                      },
                      required: ["index", "pillar", "label"],
                    },
                  },
                  pills: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-5 lifestyle labels like Wellness Explorer",
                  },
                  milestoneDescriptions: {
                    type: "array",
                    description: "Progressive persona descriptions at milestones",
                    items: {
                      type: "object",
                      properties: {
                        milestone: { type: "number", description: "Transaction count milestone" },
                        description: { type: "string", description: "Persona description at this milestone" },
                      },
                      required: ["milestone", "description"],
                    },
                  },
                  intelligence: {
                    type: "object",
                    properties: {
                      analytics: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          content: { type: "string", description: "Spending pattern summary with percentages" },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["title", "subtitle", "content", "txIndices"],
                      },
                      rewards: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          rewardPills: { type: "array", items: { type: "string" }, description: "4 deal recommendations like REI 10% Back" },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["title", "subtitle", "rewardPills", "txIndices"],
                      },
                      relationship: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          content: { type: "string", description: "Life event detection and next-best-product" },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["title", "subtitle", "content", "txIndices"],
                      },
                    },
                    required: ["analytics", "rewards", "relationship"],
                  },
                },
                required: ["signalEntries", "pills", "milestoneDescriptions", "intelligence"],
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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    // Transform arrays back to the map format the client expects
    const signalMap: Record<string, { pillar: string; label: string }> = {};
    for (const entry of (raw.signalEntries || [])) {
      signalMap[String(entry.index)] = { pillar: entry.pillar, label: entry.label };
    }

    const descriptions: Record<string, string> = {};
    for (const entry of (raw.milestoneDescriptions || [])) {
      descriptions[String(entry.milestone)] = entry.description;
    }

    const result = {
      signalMap,
      pills: raw.pills || [],
      descriptions,
      intelligence: {
        analytics: {
          accent: "#60a5fa",
          icon: "◆",
          title: raw.intelligence?.analytics?.title || "Analytics Intelligence",
          subtitle: raw.intelligence?.analytics?.subtitle || "",
          content: raw.intelligence?.analytics?.content || "",
          txIndices: raw.intelligence?.analytics?.txIndices || [],
        },
        rewards: {
          accent: "#34d399",
          icon: "★",
          title: raw.intelligence?.rewards?.title || "Smart Rewards",
          subtitle: raw.intelligence?.rewards?.subtitle || "",
          pills: raw.intelligence?.rewards?.rewardPills || [],
          txIndices: raw.intelligence?.rewards?.txIndices || [],
        },
        relationship: {
          accent: "#fbbf24",
          icon: "⚡",
          title: raw.intelligence?.relationship?.title || "Relationship Intelligence",
          subtitle: raw.intelligence?.relationship?.subtitle || "",
          content: raw.intelligence?.relationship?.content || "",
          txIndices: raw.intelligence?.relationship?.txIndices || [],
        },
      },
    };

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
