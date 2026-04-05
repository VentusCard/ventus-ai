

## AI-Powered Pillar Rollup Pills

### What We're Building
Extend the `synthesize-persona` edge function to also return **per-pillar rollup labels** (e.g., "Premium Wellness Enthusiast" for Health & Wellness pillar containing Gym + Spa + Supplements). The UI will show individual pills first, then animate them collapsing into rollup pills as the AI response arrives.

### How It Works

**1. Edge Function (`supabase/functions/synthesize-persona/index.ts`)**
- Update the tool-calling schema to also return a `pillar_rollups` array alongside `headline` and `insights`
- Each rollup: `{ pillar: string, label: string, categories: string[] }` — e.g., `{ pillar: "Health & Wellness", label: "Premium Wellness Enthusiast", categories: ["Gym", "Spa", "Supplements"] }`
- Prompt rules: rollups must only combine categories within the SAME pillar, never cross-pillar. Only generate rollups for pillars with 2+ categories. Label should be vivid and spend-tier-aware.

**2. Frontend Types (`ExecDemoIntelPanel.tsx`)**
- Extend `PersonaSynthesis` interface to include `pillarRollups?: { pillar: string; label: string; categories: string[] }[]`

**3. Animation Flow (`ExecDemoIntelPanel.tsx`)**
- Before AI response: individual pills display as they do now
- When `personaSynthesis.pillarRollups` arrives: for each rolled-up pillar, its child pills animate out (scale down + fade) and the rollup pill animates in (scale up + glow)
- New `PillarRollupChip` component: larger, gradient bg using pillar color, sparkle icon, shows `✦ Label · N txns · $Xk`
- Rollup pills render in a row above the remaining un-rolled individual pills
- Non-rolled pillars (only 1 category) keep their individual pills as-is

**4. Page Integration (`ExecDemoPage.tsx`)**
- Pass `pillarRollups` through `personaSynthesis` prop — no additional state needed since it's part of the same AI response

### Files Changed
1. `supabase/functions/synthesize-persona/index.ts` — add `pillar_rollups` to prompt, schema, and response
2. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — extend `PersonaSynthesis` type, add `PillarRollupChip` component, animate transition from individual pills to rollups

