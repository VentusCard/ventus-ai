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
      pillars, lifeEvents, products, regions, metros, areaType,
      demographics, crossSellStrategies, upsellStrategies, campaignGoal, estimatedAudience
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context prompt
    const contextParts: string[] = [];
    if (pillars?.length) contextParts.push(`Lifestyle pillars: ${pillars.join(', ')}`);
    if (lifeEvents?.length) contextParts.push(`Life events: ${lifeEvents.join(', ')}`);
    if (products && Object.keys(products).length) {
      const has = Object.entries(products).filter(([,v]) => v === 'has').map(([k]) => k);
      const lacks = Object.entries(products).filter(([,v]) => v === 'lacks').map(([k]) => k);
      if (has.length) contextParts.push(`Customer has: ${has.join(', ')}`);
      if (lacks.length) contextParts.push(`Customer lacks: ${lacks.join(', ')}`);
    }
    if (regions?.length) contextParts.push(`Regions: ${regions.join(', ')}`);
    if (metros?.length) contextParts.push(`Metro areas: ${metros.join(', ')}`);
    if (areaType && areaType !== 'All') contextParts.push(`Area type: ${areaType}`);
    if (demographics?.ageRanges?.length) contextParts.push(`Age ranges: ${demographics.ageRanges.join(', ')}`);
    if (demographics?.incomeBands?.length) contextParts.push(`Income bands: ${demographics.incomeBands.join(', ')}`);
    if (crossSellStrategies?.length) contextParts.push(`Cross-sell strategies: ${crossSellStrategies.join(', ')}`);
    if (upsellStrategies?.length) contextParts.push(`Upsell strategies: ${upsellStrategies.join(', ')}`);
    if (campaignGoal) contextParts.push(`Campaign goal: ${campaignGoal}`);
    if (estimatedAudience) contextParts.push(`Estimated audience: ${(estimatedAudience / 1_000_000).toFixed(1)}M`);

    const userPrompt = `Generate a marketing campaign brief for a bank targeting the following audience:\n\n${contextParts.join('\n')}\n\nProvide creative, compelling marketing copy that would resonate with this segment.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert bank marketing strategist. Generate compelling, compliant financial marketing content. Keep copy professional but engaging. Follow banking regulations - no misleading claims. Always include relevant disclaimers context in imagery direction.\n\nIMPORTANT RULES:\n1. NEVER use em dashes (—). Use commas, periods, or short dashes (-) instead.\n2. Include personalization merge tags where appropriate: {{first_name}}, {{last_name}}, {{product_name}}, {{offer_value}}, {{expiry_date}}, {{city}}. For example, start emails with 'Hi {{first_name}},' or reference '{{city}}' for geo-targeted campaigns. Use these naturally - not every field needs every tag."
          },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_brief",
              description: "Generate a structured campaign brief with all required marketing fields",
              parameters: {
                type: "object",
                properties: {
                  campaign_name: { type: "string", description: "Creative campaign name" },
                  subject_line: { type: "string", description: "Email subject line, under 60 chars" },
                  email_body: { type: "string", description: "2-3 sentence email marketing copy" },
                  push_copy: { type: "string", description: "Short push notification with emoji" },
                  sms_copy: { type: "string", description: "SMS copy under 160 characters" },
                  in_app_copy: { type: "string", description: "In-app banner copy, 1-2 sentences" },
                  cta_text: { type: "string", description: "Call-to-action button text" },
                  cta_link: { type: "string", description: "Suggested CTA link path" },
                  imagery_direction: { type: "string", description: "Description for creative team on imagery style and content" },
                  offer_type: { type: "string", description: "Type of offer (discount, bonus, waiver, etc.)" },
                  offer_value: { type: "string", description: "Specific offer value" },
                  offer_validity_days: { type: "number", description: "How many days the offer is valid" },
                },
                required: [
                  "campaign_name", "subject_line", "email_body", "push_copy",
                  "sms_copy", "in_app_copy", "cta_text", "cta_link",
                  "imagery_direction", "offer_type", "offer_value", "offer_validity_days"
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_brief" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded", status: 429 }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required", status: 402 }), {
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

    let brief;
    try {
      brief = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(brief), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-campaign-brief error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
