## Section 3 — featured-campaign toggle strip

Add a single-row "featured campaign" strip between the Section 3 header and the existing 5-card grid in `MessagePreviewsSection.tsx`. The strip lets you focus on one of the 5 exemplars at a time, with color-coded logic shown above the campaign and arrows to page between them.

### Layout

```text
┌─ Section 3 header: [3] Micro-Segment Personalized Campaign Output ─────────┐
│                                                                            │
│  ┌─ Toggle strip ───────────────────────────────────────────────────────┐  │
│  │ [◀]   ● Category stack          Campaign 2 of 5  ·  548 total  [▶]  │  │  ← one line, color-coded
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌─ Featured single campaign (full card, slightly larger) ─────────────┐  │
│  │ left-border colored to match logic family · subject · body · CTA    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ── 5-card grid (unchanged) ──────────────────────────────────────────────  │
│  [card 1] [card 2] [card 3] [card 4] [card 5]                              │
│                                                                            │
│  footer line (unchanged)                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

### Behavior

- Arrows cycle through the 5 currently-shown exemplars only (wrap-around).
- The strip's color-coded chip + featured card's left border reuse the existing `ANCHOR_VISUAL` palette (blue stack / amber life-event / emerald goal / slate usage) so the family identity carries from strip → featured card → grid card.
- Counter in the strip reads `Campaign N of 5 · 548 total` and remains the click target for the existing Variation Logic popover.
- The header's standalone counter Badge is removed (moved into the strip).
- Clicking a card in the 5-card grid below promotes it to the featured slot.
- Keyboard: `←` / `→` page the featured card when the strip has focus.

### Technical notes

- File: `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` only.
- Add `featuredIdx` state (default 0). Reset to 0 whenever `productName` changes (alongside the existing reveal effect).
- Clamp `featuredIdx` to revealed cards during the stagger so the featured slot never shows a blank.
- Featured card reuses the existing card markup (extracted into a small inline component or rendered inline with size tweaks: bigger subject, body, full `why` line). No changes to `buildMessageCards.ts` or `MessageCard` shape.
- Color-coded chip in the strip: small colored dot + family label pulled from `ANCHOR_VISUAL[card.anchorFamily].label` / `.iconColor`.
- Counter button keeps the existing `Popover` + `FormulaCell` payload; only its position moves.
- No new packages, no backend changes, no edits to the 5-card grid styling.

### Out of scope

- Paging the full 548-campaign bank (only the 5 exemplars toggle).
- Keyboard shortcuts outside the strip's focus.
- Changes to Steps 1 or 2, the edge function, or `buildMessageCards`.