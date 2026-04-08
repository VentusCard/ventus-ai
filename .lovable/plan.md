

## Rewrite `synthesize-persona` Prompt to Think Like an Analyst

### Problem
The current prompt is a wall of negative rules ("NEVER do X", "do NOT do Y"). The LLM struggles with long prohibition lists and still produces incoherent rollups — e.g., grouping gym visits with hotel stays into "Strategic Domestic Travel" because they share a trip window.

### Approach
Replace the rule-heavy prompt with a shorter, principle-driven prompt that teaches the model **how to think** rather than what to avoid. The key insight: a good analyst asks "what does this person *do regularly*?" not "which rows can I combine?"

### Changes

**File: `supabase/functions/synthesize-persona/index.ts`** — Rewrite the system prompt (~lines 36-63)

New prompt philosophy:
- **Think in habits, not categories.** A rollup should describe a recurring behavior pattern you'd mention to a colleague: "this person is clearly a fitness nut" or "they eat out 3x a week at mid-range spots." If you wouldn't say it out loud about a real person, don't create the rollup.
- **Same-pillar rule stays** (it's structural, not a hack) but framed positively: "Rollups group categories within a single pillar that reflect the same lifestyle habit."
- **Behavioral coherence test:** Before creating a rollup, ask: "Would a friend describe this person this way?" A person who stays at a Hilton in Dallas and also goes to Orange Theory is a fitness enthusiast who traveled — not a "strategic domestic traveler."
- **Tier honesty framed as empathy:** "Describe their spending the way they'd describe it to a friend. Chipotle regulars call themselves foodies, not premium gastronomes."
- **Specificity from merchants:** "Use the merchant names to be specific. Netflix + Hulu + Spotify → 'Streaming Junkie', not 'Digital Subscriber'."
- **Rollups are optional:** "If categories don't share a clear habit, leave them ungrouped. Fewer rollups with real insight beats more rollups with filler."

Remove all the "NEVER", "CRITICAL", "BAD/GOOD example" lists. Replace with 2-3 natural principles and a single illustrative example.

### What stays the same
- The pillar enum constraint (structural correctness)
- The tool-calling schema and response format
- The `category_indices` requirement
- The 3-insight and headline structure

### Summary
- 1 file changed: `supabase/functions/synthesize-persona/index.ts`
- Prompt rewrite only — no client-side changes, no schema changes
- No hard-coded incompatible pairs

