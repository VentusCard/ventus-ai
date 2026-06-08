## Goal
Let the edge function decide — per product — both the lifestyle signals AND whether any life events are worth surfacing. No hardcoded product → life-event map in the frontend.

## Edge function: `supabase/functions/generate-lifestyle-signals/index.ts`

Extend the tool schema so a single call returns:
- `signals: LifestyleAssetSignal[]` (unchanged behavior)
- `applicableLifeEvents: string[]` — subset of canonical ids `['retirement','education','family','home','elder_care','business','wealth_transfer']`. **MUST be `[]` when no life event is a meaningful targeting lever for this specific product.**

Prompt additions:
- Pass the canonical life-event vocabulary (id + human name) into the user prompt.
- System rule: "Only include a life event if it is a clear, meaningful targeting lever for THIS product. Return an empty array otherwise. Examples: travel rewards card → []; cashback card → []; personal loan → []; 529 → ['family','education']; HELOC/mortgage → ['home','family']; wealth management → ['retirement','business','wealth_transfer']; life insurance → ['family','retirement','wealth_transfer','elder_care']."
- Keep all existing consumer-perspective + baseline-coverage rules for signals.

Response body: `{ signals, applicableLifeEvents }`. Default `applicableLifeEvents` to `[]` if the model omits it.

## Frontend: `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`

- New state `applicableLifeEvents: string[]`, populated from the edge-function response. Reset to `[]` on product change.
- **Remove the Lifestyle Pillars chip cloud + its summary-footer row entirely** (keep `pillars` state at `[]` so payload shapes stay unchanged).
- **Life Events chip cloud renders only when `applicableLifeEvents.length > 0`**, filtered to that subset. Hide the corresponding summary-footer row when empty.
- On product change and on each new generation, drop any `lifeEvents` selections no longer in the applicable set.

## Out of scope
Other campaign builder sections, other edge functions, audience estimate math.

## Validation
- Travel Rewards Card → Generate → response has `applicableLifeEvents: []` → Section 2 shows only Demographics.
- 529 College Savings Plan → Generate → `applicableLifeEvents` includes `family`, `education` → Life Events chip cloud appears with just those two.
- Wealth Management → Generate → includes `retirement`, `business`, `wealth_transfer`.
- In every case, `signals` are also returned and shown as before.