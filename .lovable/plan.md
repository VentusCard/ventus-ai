

## Fix: Rollup "0 txns" + Pillar-Colored Transaction Highlights

### Problem 1: Rollups Sometimes Show 0 Transactions

The `rollupStats` in `ExecDemoIntelPanel.tsx` (line 156-163) matches the AI-returned `pillar` name against chip pillar names using exact string match. If the AI returns even a slightly different pillar name (e.g., "Health & Wellness" vs "Wellness & Fitness"), the match fails and yields 0 txns / $0.

**Fix in `supabase/functions/synthesize-persona/index.ts`**: Add explicit instruction in the system prompt telling the AI to use the **exact** pillar name strings from the input data. Also pass the distinct pillar names as a strict enum in the tool schema so the model can only pick from the actual input values.

**Fix in `ExecDemoIntelPanel.tsx`** (defensive fallback): Add fuzzy matching — if exact match fails, try case-insensitive or substring matching against chip pillars.

### Problem 2: Filtered Transactions Use Wrong Color

When clicking a rollup pill, the left panel highlights filtered transactions with a hardcoded `#10b981` (emerald green) instead of the pillar's actual color from `PILLAR_COLORS`.

**Fix in `ExecDemoPage.tsx`**: Compute the active pillar color and pass it as a new prop (e.g., `activePillColor`) to `ExecDemoLeftPanel`.

**Fix in `ExecDemoLeftPanel.tsx`**: Accept `activePillColor` prop and use it instead of the hardcoded `#10b981` for filtered transaction highlights.

### Files
- `supabase/functions/synthesize-persona/index.ts` — strengthen prompt + pass pillar names as enum
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — add fuzzy pillar name matching for rollup stats
- `src/pages/ExecDemoPage.tsx` — compute and pass active pillar color
- `src/components/exec-demo/ExecDemoLeftPanel.tsx` — use pillar color for filtered highlights

