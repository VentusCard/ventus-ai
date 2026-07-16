## LLMs currently in the /bankdemo flow

Traced from `ExecDemoPage` → edge functions:

| Step | Function | Current model |
|---|---|---|
| Classify transactions | `classify-transactions` | `gemini-2.5-flash` (fallback `gpt-5-mini`) |
| Travel detection | `travel-detection` | `gemini-2.5-flash` (fallback `gpt-5-mini`) |
| Pillar analysis | `analyze-pillar-transactions` | `gemini-2.5-flash` |
| Risk detection | `detect-risk-transactions` | `gemini-3-flash-preview` |
| Persona synthesis (Behavioral Intelligence) | `synthesize-persona` | `gemini-3-flash-preview` |
| Product cards | `generate-product-cards` | `gemini-2.5-flash` |
| Next-offer generation | `generate-next-offers` | `gemini-2.5-flash` |
| Semantic deal search | `semantic-deal-search` | `gemini-2.5-flash-lite` |
| Consumer chat (phone mockup) | `consumer-chat` | `gemini-3-flash-preview` |

## Proposed upgrades

Split by workload — bulk/row-level jobs stay on a fast/cheap model, reasoning-heavy synthesis jumps to a Pro tier.

**Heavy reasoning → `google/gemini-3.1-pro-preview`** (current-gen Pro, better structured reasoning)
- `synthesize-persona` — this is the one driving the 5 intelligence rows and the taxonomy issues we've been fixing. Biggest quality lift here.
- `generate-product-cards` — needs to reason across signals + product catalog to produce concrete rate/savings copy.
- `detect-risk-transactions` — pattern reasoning across many txns.

**Balanced → `google/gemini-3.5-flash`** (current-gen Flash, replaces 2.5-flash and the 3-flash-preview)
- `classify-transactions`, `travel-detection`, `analyze-pillar-transactions`, `generate-next-offers`, `generate-campaign-offers`, `deal-personalization`, `generate-lifestyle-signals`, `generate-campaign-brief`, `generate-analytics-query`, `advisor-chat`, `bankwide-chat`, `consumer-chat`, `parse-campaign-intent`, `generate-outreach-pointers`, `generate-product-actions`, `assess-creditworthiness`, `local-experiences`, `summarize-query-result`, `parse-bank-statement-pdf`, `generate-financial-tip`, `analyze-lifestyle-signals`, `generate-campaign-segment`.

**High-volume/cheap → `google/gemini-3.1-flash-lite`** (current-gen Lite)
- `semantic-deal-search` (short classification-style call).

Fallbacks (`gpt-5-mini` in classify/travel/creditworthiness) → keep, still a valid cross-provider fallback.

## Scope

Two options — please pick:
1. **/bankdemo path only** — update the 9 functions in the first table above.
2. **Whole project** — update all 22 functions to the tiers above (recommended for consistency; small blast radius since it's just model-id string changes).

No prompt/schema changes; Gemini 3.x accepts the same OpenAI-compatible request bodies we send today. I'll smoke-test one bankdemo run after the swap.