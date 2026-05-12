import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { customerName, personaTitle, personaSummary, lifeEvents } = await req.json() as {
      customerName?: string;
      personaTitle?: string;
      personaSummary?: string;
      lifeEvents?: string[];
    };

    const events = Array.isArray(lifeEvents) ? lifeEvents.filter(Boolean) : [];
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are a senior wealth advisor preparing outreach for a high-value client.
Return ONLY valid JSON of shape: {"pointers": ["...", "...", "..."]}.
Each pointer is a short, advisor-facing talking point (max 18 words) that the relationship manager can use when reaching out.
Tone rules:
- Vaguely specific behavioral framing — never quote exact dollar amounts or transaction counts.
- Frame everything as opportunity / optimization / partnership. Never use stress, risk, or vulnerability language.
- Tailor each pointer to the persona AND the detected life event(s) — show you understand BOTH.
- Make the pointers feel personal, not generic financial-advice tropes.`;

    const user = `Client: ${customerName || "the client"}
Persona: ${personaTitle || "Affluent client"}${personaSummary ? `\nPersona detail: ${personaSummary}` : ""}
Detected life event(s): ${events.length ? events.join(" + ") : "general planning"}

Return 3 outreach pointers tailored to this exact combination.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      return new Response(JSON.stringify({ error: "ai_gateway_error", status: aiResp.status, detail: txt }), {
        status: aiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "{}";
    let pointers: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.pointers)) {
        pointers = parsed.pointers.filter((s: unknown) => typeof s === "string" && s.trim().length > 0).slice(0, 3);
      }
    } catch {
      // leave pointers empty
    }

    return new Response(JSON.stringify({ pointers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
