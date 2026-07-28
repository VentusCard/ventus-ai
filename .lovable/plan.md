## Problem
Two issues in the `/coworker` email reel:
1. **Wasted horizontal space.** The reel container is `max-w-6xl` and the body inside it is further clamped to `max-w-3xl mx-auto`, so message content sits in a narrow column with large empty margins on wide viewports.
2. **Type still reads inconsistently.** Sizes are unified at 11/13px, but the compact `DigestBody` uses bold 13px for section titles + client names right next to regular 13px body prose, which visually reads as "bigger." The stacked bold labels + short lines make the layout feel cramped and uneven.

## Changes

### 1. Widen the reel (`src/pages/CoworkerPage.tsx` + `CoworkerEmailReel.tsx`)
- Bump the section wrapper on `CoworkerPage.tsx` from `max-w-6xl` to `max-w-7xl`.
- In `CoworkerEmailReel.tsx`:
  - Remove the inner `max-w-3xl mx-auto` on the body wrapper so content spans the full reel width with only side padding (`px-8`).
  - Increase reel height from `620px` to `680px` so the wider content has vertical room.
  - Bump body padding to `px-8 py-6` for breathing room at the new width.

### 2. Tighten typography hierarchy in compact `DigestBody` (`AdvisorConversationThread.tsx`)
Currently every heading, client name, and body line is 13px, only differentiated by weight — that reads as noisy.
- Section title (e.g. "Priority signals"): keep `text-[13px] font-semibold`.
- Client name: drop from `font-semibold` to `font-medium` so it doesn't compete with the section title.
- Event label eyebrow + timing pill: unchanged (11px).
- Body description + recommended offer line: unchanged (13px).
- Count pill: keep 11px but align vertically with title baseline.

### 3. Reply body layout (`REPLY_MESSAGES` renderers)
At the new wider width, the transaction bullet lists and travel-card table look sparse.
- Where replies render a client block + bullets + "Household" line, wrap them in a 2-column `md:grid-cols-2 gap-x-8` grid so two client blocks sit side-by-side instead of stacking in a narrow column.
- Travel-card table already spans full width — leave as-is, it will simply be wider.

## Out of scope
- Colors, borders, animation timing.
- The full (non-compact) `/bankdemo` layout.
- Copy changes.

## Technical notes
- No new components. Edits confined to `CoworkerPage.tsx`, `CoworkerEmailReel.tsx`, and the compact branch of `AdvisorConversationThread.tsx`.
- Verify with a viewport check at 1280px and 1523px (current preview width).
