# 8.4: Add placeholder assistant reply to AI-initiated conversations

## Goal
The three AI-initiated 8.4 conversations currently end on the customer's reply (e.g. "Show me what changed."). Add a third bubble — a short placeholder assistant response — so each AI-initiated conversation ends with the assistant delivering something.

## Changes

### `src/lib/deckmoScript.ts` — `retention.showcase.phones`
- Add an optional `reply` string to the three AI-initiated phones, written in the assistant's voice, starting from the requested style:
  - **Credit score update** (after "Show me what changed."): "Sure! Here is what I found: your score rose 18 points, driven mainly by lower card utilization and consistent on-time payments."
  - **Payment support** (after "Help me prevent that next month."): "Yes, here's the plan: I'll set a reminder three days before your next bill and flag the late fee for a courtesy review."
  - **Cash-flow support** (after "Yes, show me the options."): "Yes, here are the options: shift the smallest bill a few days later, or split it across two pay periods — either keeps your cushion intact."
- Keep final wording subject to the established "vaguely specific," human-centric tone (no stress language).

### `src/components/deckmo/DeckmoBankdemoScenes.tsx` — `ShowcasePhone`
- When `phone.initiator === "ai"`, append `{ role: "assistant", content: phone.reply }` to `initialMessages` so the third bubble renders like any assistant message (same bubbles, avatars, styling).
- Customer-initiated phones are unchanged (already end on an assistant answer).

## Kept unchanged
- Seven-phone carousel, labels, spacing, animation, per-phone chat persistence keys, Hawaii conversation, live typed-message behavior, arrow-only navigation, reduced-motion fallback.

## Validation
- Playwright at 1540×855: scroll the carousel, confirm each of the three AI-initiated phones shows assistant → customer → assistant (three bubbles), with no clipping or overflow inside the phone.
- Confirm customer-initiated phones still show two bubbles and everything else in 8.4 is unchanged.
- Confirm clean build in `/tmp/observability/build-errors.log`.
