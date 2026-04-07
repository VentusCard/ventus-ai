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

    // Simplified prompt: NO signal classification (done locally via MCC map)
    const systemPrompt = `You are a banking transaction analysis engine. Analyze consumer transaction data and produce lifestyle intelligence.

Given a CSV of transactions (${txCount} rows, 0-indexed), produce:

1. **pills**: 4-5 lifestyle labels (e.g. "Wellness Explorer", "Career Focused", "Active Lifestyle").

2. **milestoneDescriptions**: Progressive persona descriptions at milestones: ${JSON.stringify(milestones)}. Each should BUILD on previous — start vague and become more specific.

3. **intelligence**: Three cards:
   - analytics: spending pattern summary with percentages and life events
   - rewards: 4 hyper-personalized deal recommendations  
   - relationship: life event detection and next-best-product
   For txIndices, pick 4-5 representative row indices (0-based, max ${txCount - 1}).`;

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
          { role: "user", content: `Analyze:\n\n${csv}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_exec_profile",
              description: "Return the lifestyle intelligence profile",
              parameters: {
                type: "object",
                properties: {
                  pills: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-5 lifestyle labels",
                  },
                  milestoneDescriptions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        milestone: { type: "number" },
                        description: { type: "string" },
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
                          content: { type: "string" },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["title", "subtitle", "content", "txIndices"],
                      },
                      rewards: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          rewardPills: { type: "array", items: { type: "string" } },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["title", "subtitle", "rewardPills", "txIndices"],
                      },
                      relationship: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          subtitle: { type: "string" },
                          content: { type: "string" },
                          txIndices: { type: "array", items: { type: "number" } },
                        },
                        required: ["title", "subtitle", "content", "txIndices"],
                      },
                    },
                    required: ["analytics", "rewards", "relationship"],
                  },
                },
                required: ["pills", "milestoneDescriptions", "intelligence"],
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
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
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
      console.error("No tool call:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    const descriptions: Record<string, string> = {};
    for (const entry of (raw.milestoneDescriptions || [])) {
      descriptions[String(entry.milestone)] = entry.description;
    }

    const result = {
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
