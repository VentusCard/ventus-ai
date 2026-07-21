## Problem

`generate-product-cards` currently produces 2 cards for the default customer. The slot rules say slots 1 & 2 = life events and slot 3 = financial_signal OR behavioral, so a customer with 1 life event + 1 financial signal + rollups ends up with only 2 cards, and even in the 2-life-event case we never show a behavioral card alongside a financial one.

## Fix

Lock the three slots to **one card per family**, in this fixed order:

- **Slot 1 — Life Event** (from `life_events[0]`)
- **Slot 2 — Behavioral** (from `persona_rollups[0]`)
- **Slot 3 — Financial Signal** (from `financial_signals[0]`)

If a family has no candidate, that slot falls back to the next-best available candidate from any other family, in this order: extra life event → extra financial signal → extra behavioral rollup. This keeps the total at 3 whenever inputs allow.

### 1. `supabase/functions/generate-product-cards/index.ts`

- Rewrite the "CARD ORDER (STRICT)" block:
  ```
  Emit exactly 3 cards, one per family, in this order:
    Slot 1 — life_event   (life_events[0])
    Slot 2 — behavioral   (persona_rollups[0])
    Slot 3 — financial_signal (financial_signals[0])

  Fallback ladder if a family is empty:
    - life_events[1] → financial_signals[1] → persona_rollups[1]
  Never emit two cards of the same type unless fallbacks force it, and never
  emit a risk/gambling/vice card under any circumstance.
  ```
- Update the tool `description` accordingly and add a hard rule: "Emit exactly min(3, total_available_candidates). Do NOT under-emit."
- Keep all forbidden-copy rules (Account Controls, gambling, etc.) intact.
- Update the FINANCIAL SIGNAL card guidance to note it's now slot 3 by default (was "third-slot conditional").

### 2. `src/components/exec-demo/NextProductRationale.tsx`

- Confirm behavioral + financial_signal both render (they already do). No visual change — just verify color themes read correctly for the new mixed slot order.

### 3. `src/pages/ExecDemoPage.tsx`

- Add one diagnostic log after cards return:
  ```
  console.log("[PRELOAD] Product cards ready:", cards.length,
    "types:", cards.map(c => c.type));
  ```
  so we can immediately see if the LLM ever drops a slot.

## Out of scope

- No changes to `synthesize-persona`, pill logic, Next-Offer, or Next-Conversation flows.
- No frontend rendering redesign — existing renderer already supports all three card types.

## Technical notes

- Deploy `generate-product-cards`, reload `/bankdemo` → Demo tab, and expect the console to log `types: ["life_event","behavioral","financial_signal"]` for the default customer (VW auto-loan + college prep + travel/dining rollups).
