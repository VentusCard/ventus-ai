# Personalization tabs: 1/3 signal column + live AI generation

Two changes to the Customer View shared by **Personalized Deals**, **Personalized Product**, and **Personalized Relationship** on /bankdemo.

## 1. Layout

- Signals take the left **third** of the panel; the phone mockup plus the "What the customer sees" copy fill the right two-thirds.
- Grid becomes a 3-column split on large screens (`lg:grid-cols-3`): signal panel = 1 column, right side = 2 columns, with the phone and the explanatory copy side by side inside it.
- Signal pills wrap comfortably in the narrower column; confidence badges stay on the pill, evidence still expands inline on click.

## 2. Wire the AI so the experience is generated from the signals

No enrichment, no classification, no transaction processing. The five example customers' signal sets stay as they are — they are the input. Selecting a customer sends those signals straight to the generation functions.

On selection:

- **Deals** — signals → `generate-next-offers` → personalized offers in the phone.
- **Product** — signals → `generate-product-cards` → recommended product cards in the phone.
- **Relationship** — signals → `consumer-chat`, prompted to answer as a mock-up demo assistant: short, illustrative in-app answers grounded in that customer's signals, with a couple of suggested starter questions.

Behavior:
- Both generation calls fire together when a customer is first selected; the phone shows a compact loading state until they land.
- Results are cached per customer for the session, so switching between the three tabs or back to a previous customer is instant and fires nothing again.
- On failure, the surface falls back to the existing static content for that customer so the demo never breaks.
- The signal panel stays as-is (static signals, staggered reveal) — it is the source, not an output.

## Technical notes

- New `src/lib/personalizationGeneration.ts` — maps an `ExampleCustomer`'s five signal families into the request shapes `generate-next-offers` and `generate-product-cards` already accept (`lifeEvents`, `financial_signals`, `persona.pillarRollups` / `persona_rollups`, `demographics`, `risk_flags`), derived from the signal labels/evidence rather than transactions. No edge-function or prompt changes for these two.
- New `src/lib/personalizationResultStore.ts` — per-customer result cache + status (`idle | running | ready | failed`) exposed through `useSyncExternalStore`, same pattern as `execDemoSessionStore.ts`.
- `CustomerMockupPanel.tsx` — new 3-column grid (signals 1/3, phone + copy 2/3); passes generated offers / product cards into `ExecDemoPhoneView` the same way the session path does.
- Consumer chat: pass the selected customer's signals as context and add a mock-up instruction to the request so replies read as short demo answers. `/demo` and `ExecDemoPage.tsx` are untouched.
- This intentionally reintroduces AI calls on /bankdemo, scoped to the three personalization tabs and only on explicit customer selection.

