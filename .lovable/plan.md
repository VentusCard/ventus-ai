# Personalization tabs: 1/3 signal column + live AI generation

Two changes to the Customer View shared by **Personalized Deals**, **Personalized Product**, and **Personalized Relationship** on /bankdemo.

## 1. Layout

- Signals take the left **third** of the panel; the phone mockup plus the "What the customer sees" copy fill the right two-thirds.
- Grid becomes a 3-column split on large screens (`lg:grid-cols-3`): signal panel = 1 column, right side = 2 columns, with the phone and the explanatory copy side by side inside it.
- Signal pills wrap comfortably in the narrower column; confidence badges stay on the pill, evidence still expands inline on click.

## 2. Wire the AI so the experience is generated, not mocked

Today the five example customers are hardcoded signal lists and the phone renders static demo content. Selecting a customer will instead run the same intelligence pipeline the /demo flow uses, against that customer's transaction set.

Per selected customer, in order:

1. **Enrich** — classify the customer's transactions (`classify-transactions`).
2. **Signals** — life events (`analyze-lifestyle-signals`), persona + financial/demographic/spending signals (`synthesize-persona`), risk (`detect-risk-transactions`).
3. **Experience** — deals (`generate-next-offers`) and product cards (`generate-product-cards`), fed by the signals from step 2.

Behavior:
- Generation starts when a customer is first selected, with each stage revealing its signal row as it lands (life events → financial → spending → demographic → risk), then the phone content fills in.
- Results are cached per customer for the session, so switching between the three tabs or back to a previous customer is instant and fires nothing again.
- Each stage shows a compact loading state and, on failure, falls back to the existing static signals/content for that customer so the demo never breaks.
- The "Relationship" surface keeps its existing interactive chat, now grounded in the freshly generated signals.

## Technical notes

- New `src/lib/personalizationPipeline.ts` — extracts the staged edge-function sequence currently inlined in `ExecDemoPage.tsx` (`classify` → `analyze-lifestyle-signals` → `synthesize-persona` → `detect-risk-transactions` → `generate-next-offers` / `generate-product-cards`), parameterized by customer CSV + demographics. No edge-function or prompt changes.
- New `src/lib/personalizationResultStore.ts` — per-customer result cache + status (`idle | running | ready | failed`) exposed through `useSyncExternalStore`, same pattern as `execDemoSessionStore.ts`.
- `CustomerSignalPanel.tsx` — reads generated signals when ready, falls back to the static ones in `personalizationExamples.ts`; per-family skeleton rows while running.
- `CustomerMockupPanel.tsx` — new 3-column grid, passes generated offers / product cards / life events / risk flags into `ExecDemoPhoneView` exactly as the session path already does.
- `ExecDemoPage.tsx` refactored to call the shared pipeline so /demo and the personalization tabs stay in sync (no behavior change to /demo).
- This intentionally reintroduces AI calls on /bankdemo, scoped to the three personalization tabs and only on explicit customer selection.
