

## Remove Headline from Persona Synthesis — Keep Only Pillar Rollups

### Problem
The `synthesize-persona` edge function currently returns a `headline` (e.g., "Weekend Golfer & Foodie") and `insights` array alongside `pillar_rollups`. The headline is unnecessary — only the pillar rollups matter.

### Changes

**File: `supabase/functions/synthesize-persona/index.ts`**
- Remove `headline` and `insights` from the system prompt instructions (items 1 and 2)
- Simplify prompt to focus solely on generating pillar rollups
- Remove `headline` and `insights` from the tool schema `parameters.properties` and `required` array
- Remove `headline` and `insights` from the response mapping (return only `pillar_rollups`)

**File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`** (or wherever headline/insights are rendered)
- Remove any UI rendering of `persona.headline` and `persona.insights`
- Keep only the rollup pill display

Two files changed, net reduction in code.

