# Make Ventus AI actually answer about the current tab

## Problem

Even with the new per-tab context, the co-pilot ignored it. On Bank Context asking "what products are here" produced a generic platform brief listing the 10 Ventus modules — not the bank's product catalog on screen.

Two root causes:

1. **Context payload is too shallow.** For content-heavy tabs (Bank Context, Reports Library, Deals & Perks, Next Product, Life Events) we only send a one-line `summary` + a couple of `keyData` bullets. The model has no way to list the actual products/reports/deals on screen, so it falls back to the module list from `PLATFORM_CONTEXT`.
2. **System prompt over-weights the bank-wide briefing.** `SYSTEM_PROMPT` in `bankwide-chat` opens with "Ventus Intelligence Briefing… $385B portfolio" and never tells the model that a `CURRENT VIEW` block, when present, is the primary source. So it structures every answer as a portfolio briefing.

## Fix

### 1. Enrich per-tab payloads with real on-screen data
Extend `src/lib/ventusAiTabContext.ts` so the highest-signal tabs carry a concrete list of what the user sees:

- **products (Bank Context):** import `BANK_PRODUCT_CATEGORIES` and pass `onScreenItems`: for each category, `{ category, products: [{ name, tagline, pricing }] }`. This is the file the user was on when the bug happened — it's the top priority.
- **reports:** import the reports registry (templates + interactive reports) and pass titles + one-line descriptions.
- **deal-management / location-experience:** pull deal + perk names from the same source `DealsAndPerksView` renders.
- **targeting (Next Product) / targeting-campaign-builder / targeting-automated-flows:** pass segment names + product catalog category names so recommendations stay grounded.
- **life-events / wm-copilot / customer-insights / fvi-dashboard:** pass the event/cohort labels the view renders.

Keep `onScreenItems` typed and optional so the shell tabs (Settings, Feedback, Fraud/AML placeholder) stay lightweight.

Add a hard cap (~40 items or ~2KB serialized) per tab so we don't blow the token budget on tabs like reports; slice with a "… N more" marker if exceeded.

### 2. Send `onScreenItems` through to the edge function
- `VentusAIChatPanel` already forwards `currentModuleContext`; extend it to include `onScreenItems` when present.
- `bankwide-chat`'s `BankwideContext` type + `formatContextForPrompt` render a new `ON-SCREEN ITEMS:` block, formatted as compact bullets so the model can quote/list them directly.

### 3. Rewrite the system prompt so the current view wins
Update `SYSTEM_PROMPT` in `supabase/functions/bankwide-chat/index.ts`:

- Add a top-priority rule: **when a `CURRENT VIEW` block is present, answer about that view first**. Only fall back to the portfolio brief when the question is clearly about the whole book or the view has no relevant data.
- For questions like "what's here / what am I looking at / list the X on this page," answer directly from `ON-SCREEN ITEMS` and skip the four-part "Key Finding / Supporting Data / Strategic Implication / Recommended Action" scaffold.
- Keep the executive-brief structure only for portfolio-level or strategy questions.

### 4. Verify against the reported failure
- `curl` the deployed `bankwide-chat` function with a Bank Context payload and message "what products are here". Confirm the reply lists actual products (Customized Cash Rewards, Unlimited Cash Rewards, etc.), not the 10 Ventus modules.
- Repeat with two more tabs (Reports Library — "what reports do I have?"; Deals & Perks — "what deals are live?").
- Also run a portfolio-level question ("summarize the book") from Bank Context to confirm the executive-brief structure still fires when appropriate.

## Out of scope

- No visual changes to the chat panel.
- No model, temperature, or token-limit changes.
- No new tabs — only enriching context for tabs that already exist.
