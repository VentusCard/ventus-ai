# 8.4: Rework the showcase header copy (human-centric)

## Goal

The 8.4 (Retention showcase) headline should carry the message: **with Ventus, every transaction and payment is understood — and that opens countless ways to help the customer in the future.** Tone: warm, human, customer-first — no bank jargon.

Per the user's decisions: rewrite only the header (eyebrow + title + subtitle). The seven phone conversations, phone labels, the value block ("4.5%+ In-app engagement and NPS score"), and the 8.3 pre-showcase header stay exactly as they are.

## Current copy (8.4 showcase header only)

- Eyebrow: "ONE ASSISTANT · COMPLETE CONTEXT"
- Title: "More useful in every financial moment"
- Subtitle: "Ventus gives the banking assistant the context to move from answering questions to anticipating what Ricky needs next."

## New copy (human-centric)

- Eyebrow: `EVERY TRANSACTION UNDERSTOOD`
- Title: `Every payment understood. Countless ways to help.`
- Subtitle: `When Ventus understands every transaction and payment, your assistant can show up for the customer in countless ways — today and for years to come.`

## Changes

- `src/lib/deckmoScript.ts` — update the three strings in `DECKMO.retention.showcase` (`eyebrow`, `title`, `subtitle`).
- No component changes: `RetentionShowcase` in `src/components/deckmo/DeckmoBankdemoScenes.tsx` already renders these fields; layout and sizing stay as they are.

## Verification

- Build clean.
- Playwright pass at 1540×855 and 1920×1080: navigate to 8.4, confirm the new header text renders fully with no clipping or awkward wrapping, the carousel still rolls, and the phone conversations are untouched.
