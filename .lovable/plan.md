

## Fix: Keep Persona Rollups Behavioral, Drop Brand Names

### Problem
Line 70 explicitly tells the AI to "Be specific using merchant names" — e.g., "Netflix + Hulu + Spotify = Streaming Junkie". This causes brand-focused labels like "Nordstrom, Sephora & Warby Parker Loyalists" instead of behavioral ones like "Style-Conscious Shopper."

### Fix
**File: `supabase/functions/synthesize-persona/index.ts`** — update two prompt lines:

1. **Replace line 70** (merchant-name instruction) with:
   `"Never mention brand or merchant names in rollup labels. Labels should describe the behavior or lifestyle habit, not the stores. Nordstrom + Sephora + Warby Parker = 'Style-Conscious Shopper', not 'Nordstrom & Sephora Loyalist.'"`

2. **Update line 68** — remove the merchant examples from the tier instruction so it doesn't encourage brand references in labels either. Keep the tier-honesty principle but frame it behaviorally.

One file, two lines changed. Redeploy edge function.

