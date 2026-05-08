import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { product_cards, persona_rollups, life_events, demographics, pillars, risk_flags, bankContext } = await req.json();
    const bankName = bankContext && typeof bankContext.bankName === "string" ? bankContext.bankName.trim().slice(0, 80) : "";
    const bankShort = bankContext && typeof bankContext.bankShortName === "string" ? bankContext.bankShortName.trim().slice(0, 40) : "";

    if (!product_cards || !Array.isArray(product_cards) || product_cards.length === 0) {
      return new Response(JSON.stringify({ error: "product_cards required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const bankPrefix = bankName
      ? `BANK IDENTITY: You represent ${bankName}${bankShort ? ` ("${bankShort}")` : ""}. Where action labels reference the bank, use "${bankShort || bankName}" instead of "Our Bank" or "the bank".\n\n`
      : "";

    const systemPrompt = bankPrefix + `You are a world-class private banking concierge strategist. Given a customer's product recommendation cards, their behavioral persona, detected life events, demographics, and spending patterns, you generate 2-5 engagement actions per product card.

RULES:
- Each card gets 2-5 actions
- 1-2 actions must be STANDARD banking engagement (e.g. "Signal Sent to Mobile App", "Triggered Email Campaign", "Notify Wealth Advisor", "Schedule Review Meeting", "Flag for Quarterly Review", "Push Notification Sent")
- 1-3 actions must be WOW-FACTOR actions that make the customer feel their bank deeply understands and cares about their life. These are hyper-personalized concierge-level gestures that ONLY make sense given the customer's specific context.
- WOW examples: "Send Congratulatory Flowers for Anniversary", "Curated College Visit Itinerary", "Handwritten Milestone Card from Branch Manager", "Personalized Travel Insurance Bundle", "Birthday Savings Challenge for Child", "Proactive Estate Planning Check-in", "Custom Retirement Countdown Dashboard", "Local Restaurant Reservation via Concierge"
- WOW actions should feel like "my bank genuinely cares about my well-being" NOT "my bank is surveilling me"
- Actions must be contextually justified by the provided data — don't invent context that isn't there
- Keep labels concise (3-8 words)
- Icon must be one of: smartphone, mail, user-check, calendar, heart, gift, shield, lightbulb, star, compass, flower, pen-line, cake, plane, home, briefcase, bell
- Color must be one of: blue, amber, violet, teal, emerald, rose, sky, orange, indigo, pink, slate
- Standard actions use: blue, amber, teal, violet
- Wow actions use warmer/richer colors: rose, emerald, orange, pink, indigo

RISK CARDS (cards where type === "risk" or signal_label matches a risk category like "Gambling", "High-Risk / Offshore Gambling", "Sports Betting", "Casino & Table Games", "Horse Racing & Pari-mutuel", "Casual / Social Gaming", "Lottery & Raffles", "Adult Entertainment", "Suspicious International", "AML", "Pawn Shops & Short-Term Credit", "Debt Collection & Debt Relief", "Check Cashing & Money Services", "Subprime Credit & Buy-Here-Pay-Here", "Overdraft & NSF Activity", "Crypto Mixing & High-Risk Crypto", "Financial Distress", "Payday Loan", "Crypto Mixing", "Structuring", "Layering"):
- Generate ONLY risk-appropriate, wellness/safety/compliance actions. NEVER marketing, upsell, or celebratory actions.
- Use cooler/calmer colors ONLY: standard → slate, sky, indigo; wow → rose, indigo. Never pink, orange, emerald, amber celebratory tones.
- Prefer icons: shield, bell, user-check, lightbulb.
- Tone: caring, discreet, professional. NEVER alarming or judgmental.
- Examples by category:
  - VICE (gambling/adult/sports betting):
     standard → "Push: Set Merchant Block", "Suppress Category Marketing", "Notify Customer Care Team"
     wow → "Discreet Wellness Check-in Call", "Personalized Spending Limit Setup", "Confidential Support Outreach"
  - FINANCIAL DISTRESS (pawn/payday/early-wage-access/debt-collection/check-cashing/overdraft/subprime/crypto-mixing):
     standard → "Suppress Credit-Card Marketing", "Notify Customer Care Team", "Flag for Wellness Review", "Waive Next Overdraft Fee"
     wow → "Hardship Program Outreach", "Confidential Financial Coaching", "Free Overdraft-Protection Setup", "Discreet Financial Counselor Referral", "Pre-Approved Hardship Line Offer"
     Tone is especially gentle here — NEVER imply judgment. Frame everything as "we're here to help" support, not surveillance.
  - SUSPICIOUS INTERNATIONAL (cross-border wires, OFAC, currency anomalies):
     standard → "SMS Verification Sent", "Card-Freeze Quick Action", "Travel Notice Reminder"
     wow → "Concierge Fraud-Team Callback", "Travel Notice Pre-Set", "Personal Liaison Assigned"
  - AML (structuring, layering):
     standard → "Flag for Compliance Review", "KYC Refresh Sent", "Internal Case Notation"
     wow → "Private Compliance Liaison Outreach", "Discreet Relationship Manager Notice"
- Forbidden labels for risk cards: anything mentioning "rewards", "bonus", "miles", "points", "earn", "apply", "upgrade", "flowers", "gift", "celebration".`;

    const userPrompt = `PRODUCT CARDS:
${JSON.stringify(product_cards, null, 2)}

PERSONA ROLLUPS:
${JSON.stringify(persona_rollups?.slice(0, 6) || [], null, 2)}

LIFE EVENTS:
${JSON.stringify(life_events?.slice(0, 3) || [], null, 2)}

DEMOGRAPHICS:
${JSON.stringify(demographics || {}, null, 2)}

TOP SPENDING PILLARS:
${JSON.stringify(pillars?.slice(0, 6)?.map((p: any) => ({ pillar: p.pillar, label: p.label, count: p.count, totalSpend: p.totalSpend })) || [], null, 2)}

RISK FLAGS (if any card has type === "risk", use these to drive risk-appropriate actions):
${JSON.stringify((risk_flags || []).slice(0, 8).map((f: any) => ({ category_group: f.category_group, category_label: f.category_label, merchant: f.merchant_name })), null, 2)}

Generate 2-5 engagement actions for each product card.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_card_actions",
              description: "Return engagement actions for each product card",
              parameters: {
                type: "object",
                properties: {
                  card_actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        card_index: { type: "number", description: "Index of the product card (0-based)" },
                        actions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              label: { type: "string", description: "Action label, 3-8 words" },
                              icon: { type: "string", enum: ["smartphone", "mail", "user-check", "calendar", "heart", "gift", "shield", "lightbulb", "star", "compass", "flower", "pen-line", "cake", "plane", "home", "briefcase", "bell"] },
                              color: { type: "string", enum: ["blue", "amber", "violet", "teal", "emerald", "rose", "sky", "orange", "indigo", "pink", "slate"] },
                              tone: { type: "string", enum: ["standard", "wow"] },
                            },
                            required: ["label", "icon", "color", "tone"],
                            additionalProperties: false,
                          },
                          minItems: 2,
                          maxItems: 5,
                        },
                      },
                      required: ["card_index", "actions"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["card_actions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_card_actions" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response");
      return new Response(JSON.stringify({ card_actions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    console.log("Generated actions:", JSON.stringify(parsed.card_actions?.length), "cards");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-product-actions error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
