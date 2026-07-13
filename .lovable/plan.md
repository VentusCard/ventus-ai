# Make the Ventus AI panel context-aware on every tab

## Problem

The "Ventus AI" badge in the header opens `VentusAIChatPanel`, which sends `bankwide-chat` an `activeTab` label plus a static bank-wide `PLATFORM_CONTEXT`. Two gaps:

1. **Missing tabs.** `TAB_LABELS` and `TAB_QUICK_ACTIONS` only cover ~14 tabs. The sidebar has ~25 (Home: System / Bank Context / Demo; Analytics: Ventus AI Dashboard / Query / Reports; Product & Growth: Automated Flows / Campaign Builder / Next Product; plus deep-linked `report-*` pages, `settings`, `feedback`). On those tabs the panel shows the raw tab key (e.g. "targeting-automated-flows") and offers no quick actions.
2. **No per-tab payload.** The context sent to the edge function is identical everywhere. The model has no idea what data is on screen (which report, which cohort, which campaign, which product catalog entry, etc.), and `bankwide-chat`'s `formatContextForPrompt` doesn't even render `currentModule`.

## Fix

### 1. Cover every tab in `VentusAIChatPanel.tsx`
- Add `TAB_LABELS` + `TAB_QUICK_ACTIONS` entries for: `capabilities`, `products`, `exec-demo`, `ventus-ai-dashboard`, `query`, `reports`, `targeting-automated-flows`, `targeting-campaign-builder`, all `report-*` deep-linked pages, `settings`, `feedback`.
- Quick actions written for what that tab actually shows (e.g. Campaign Builder → "Draft a HELOC micro-segment", Reports → "Summarize the priority opportunity briefing", Query → "Write SQL for top-10 outflow merchants").

### 2. Per-tab context payload
- Add `TAB_CONTEXT: Record<TabValue, { summary: string; keyData?: string[]; suggestedNav?: string[] }>` in a new `src/lib/ventusAiTabContext.ts` so the mapping is shared and easy to extend.
- `VentusAIChatPanel` merges `TAB_CONTEXT[activeTab]` into the context object it already sends as `currentModule` + `currentModuleContext`.
- For the priority-opportunity report page, also pass the selected `opportunityId` (available on `AnalyticsContainer`) so the AI can speak to the exact briefing on screen. Requires threading `contextExtras` from `AnalyticsContainer` → `VentusAIChatPanel` (new optional prop).

### 3. Render the new context in the edge function
- Update `supabase/functions/bankwide-chat/index.ts` `BankwideContext` type and `formatContextForPrompt` to render:
  - `CURRENT VIEW: <label>` + `WHAT THE USER IS LOOKING AT: <summary>`
  - `ON-SCREEN DATA:` bullet list from `keyData`
  - `RELATED MODULES:` from `suggestedNav`
- Keep existing bank-wide brief intact so answers stay institutional.

### 4. Verify
- Playwright: visit `/bankdemo`, unlock with password, click Ventus AI badge on 5 representative tabs (Campaign Builder, Reports, Query, WM Coworker, Financial Vulnerability). Confirm friendly label, tab-specific quick actions, and that a sample question ("what am I looking at?") produces a response referencing the current view. Screenshot each.

## Out of scope

- No visual redesign of the panel itself.
- No changes to `bankwide-chat` model, temperature, or system prompt tone.
- No new tabs; only wiring context for tabs that already exist.
