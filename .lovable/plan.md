## Goal

Make the Campaign Builder's targeting step (Step 2) explicitly consume all 5 signal families defined in the System tab's Behavioral Intelligence Core, so the builder visibly maps to the platform narrative.

## The 5 signal families (from `CapabilitiesView.tsx`)

1. Life Event Signals — amber
2. Behavioral Signals — blue
3. Financial Signals — emerald
4. Demographic Signals — violet
5. Risk Signals — rose

## Current state

Step 2 in `ProductCampaignBuilderView.tsx` only surfaces 3 of the 5:
- Lifestyle Asset Signals (a Behavioral subset) ✓
- Life Events ✓
- Demographics ✓
- Missing: dedicated **Financial Signals** and **Risk Signals** layers; Behavioral is only represented via Lifestyle Asset Signals.

## Changes

### 1. Restructure Step 2 as a 5-family panel

Group the existing controls under labeled, color-coded sections that mirror the System tab (same icon + tint tokens):

- **Life Event Signals** — existing Life Events chip cloud (amber accent)
- **Behavioral Signals** — existing Lifestyle Asset Signals generator (blue accent)
- **Financial Signals** — NEW chip cloud (emerald accent): income band, deposit balance tier, investable assets tier, payroll deposit, recent large inflow, credit utilization
- **Demographic Signals** — existing `DemographicFiltersPanel` (violet accent)
- **Risk Signals** — NEW chip cloud (rose accent): low overdraft risk, no fraud flags, stable tenure, healthy DTI — used as inclusion/exclusion filters

Each family gets a left-border accent + tiny family icon header so the visual matches the System tab.

### 2. Add the two missing data layers

- New file `src/lib/campaignSignalFamilies.ts` exporting static chip lists for **Financial Signals** and **Risk Signals** (id, label, description). No edge function calls — same pattern as life events.
- Add state in `ProductCampaignBuilderView`: `financialSignals: string[]`, `riskSignals: string[]`. Reset alongside other selections on product change.
- Include both arrays in `hasSelections` and pass them to:
  - `estimateAssetSignalAudience` call (extend the helper to accept and lightly reduce audience per selected financial/risk signal — simple multiplicative factors so the audience bar visibly responds).
  - The `generate-campaign-segment` invoke body so personas reflect them.

### 3. Edge function payload

Extend `supabase/functions/generate-campaign-segment/index.ts` to read `financialSignals` and `riskSignals` from the request body and append them to the persona-generation prompt as additional context. No schema/tool changes needed.

### 4. Step 2 header

Update the Step 2 title to "Layer the 5 Ventus signal families" and add a one-line subtitle "Same intelligence core powering the System tab." to make the mapping explicit.

## Out of scope

- No changes to the System tab itself.
- No changes to Automated Flows or the legacy Next-Best Product Engine.
- No DB/RLS changes.

## Files touched

- `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx` (restructure Step 2, new state, wire new signals)
- `src/lib/campaignSignalFamilies.ts` (new)
- `src/lib/lifestyleAssetSignals.ts` (extend `estimateAssetSignalAudience` to accept financial/risk signal counts)
- `supabase/functions/generate-campaign-segment/index.ts` (accept + use new fields in prompt)
