

## Refocus Risk Detection on Vice & Suspicious International Activity

### Problem
The edge function currently flags generic fraud (duplicate charges, geo anomalies) and habit shifts (spending spikes, tier changes) — producing noisy results like "Fraud medium" and "Habit Shift low" that aren't useful. The user wants this focused on genuinely concerning patterns: gambling, adult content, and suspicious international transactions.

### Changes — Single file: `supabase/functions/detect-risk-transactions/index.ts`

#### Rewrite the SYSTEM_PROMPT to focus on 3 narrower categories:

1. **VICE** — Gambling merchants/casinos/sports betting, adult content, payday/predatory loans, pawn shops, crypto mixing services
2. **SUSPICIOUS_INTERNATIONAL** — Transactions in high-risk jurisdictions (OFAC-listed countries), unusual currency conversion patterns, international wire transfers to unfamiliar destinations, transactions in countries inconsistent with customer profile
3. **AML** — Structuring below $10K thresholds, rapid round-number deposits/withdrawals, layering patterns

**Remove entirely:** FRAUD (generic duplicate charges, geo anomalies) and HABIT_SHIFT (spending spikes, tier changes) — these are noise, not risk.

#### Update the response schema:
- `category: "vice" | "suspicious_international" | "aml"`
- Keep severity, merchant, amount, date, reason fields
- Instruct the model: "Only flag transactions with clear evidence of vice activity, money laundering patterns, or suspicious international activity. Do NOT flag normal spending variations, travel, or routine purchases."
- Add instruction: "Be conservative — if unsure, do not flag. Return empty flags array if nothing concerning is found."

#### Update memory file
Update `mem://technical/edge-functions/risk-detection-logic` to reflect the narrowed scope.

### No UI changes needed — the pill rendering in `ExecDemoIntelPanel.tsx` already reads `flag.category` dynamically and title-cases it.

