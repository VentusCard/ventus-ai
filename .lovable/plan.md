

## New Edge Function: `bankwide-chat` — Executive-Grade Banking Intelligence

### Why a new function
The existing `advisor-chat` is tailored for individual client wealth management (psychology profiles, RMDs, Monte Carlo results). The Ventus AI welcome tab serves **bank leadership** analyzing portfolio-wide trends. A dedicated function delivers a sharply different system prompt, tone, and context formatting without cluttering the advisor function.

### New file: `supabase/functions/bankwide-chat/index.ts`

**System prompt — ultra-professional executive tone:**
- Persona: "Ventus Intelligence Briefing" — a senior banking strategy analyst
- Audience: C-suite, SVPs, heads of consumer banking
- Tone: authoritative, data-driven, concise, no filler — McKinsey-grade
- Output style: executive briefing bullets, bold headline insights, quantified impact
- When discussing trends: always cite figures, growth rates, affected user counts
- When identifying risks: lead with severity, quantify exposure, recommend mitigation
- Structured sections: "Key Finding", "Supporting Data", "Recommended Action"

**Context formatting:**
- Accepts a `context` object with `bankwideMetrics`, `hotTrends`, `modules`, `cardProducts`
- Formats into a structured executive data brief with sections: Portfolio Overview, Spending Trends, Competitive Landscape, Life Event Signals, Product Distribution
- Richer than the current freeform pass-through — structured for leadership questions

**Technical details:**
- Same CORS pattern as `advisor-chat`
- Same Lovable AI gateway call (`google/gemini-2.5-flash`)
- Same error handling (429/402/500)
- Non-streaming (matches current `useAdvisorChat` pattern)
- `verify_jwt = false` in config.toml

### Update: `supabase/config.toml`
Add:
```toml
[functions.bankwide-chat]
verify_jwt = false
```

### Update: `src/hooks/useAdvisorChat.ts`
Add an optional `functionName` prop (default: `"advisor-chat"`) so the welcome view can call `"bankwide-chat"` instead, without duplicating hook logic.

### Update: `src/components/tepilot/insights/VentusAIWelcomeView.tsx`
- Pass `functionName: "bankwide-chat"` to `useAdvisorChat`
- No other changes needed — the context object is already being passed

### System prompt key behaviors
1. **Hot trends**: When asked about trends, structure response as a ranked briefing with magnitude, affected segments, and strategic implications
2. **Need-to-knows**: Proactively flag deposit flight risk, seasonal patterns, underperforming segments, and cross-sell gaps
3. **Navigation guidance**: When a question maps to a specific module, mention it by name and suggest the user explore it
4. **Competitor intelligence**: Frame outflow data as strategic risk with retention ROI estimates
5. **Executive summary style**: Every response opens with a bold one-line takeaway before supporting detail

