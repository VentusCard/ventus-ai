Rewrite the digest (message #1) so it reads as a self-contained email from a co-worker — keep the "Act now / Opportunities / At risk" section structure, drop the Open/Prepare buttons, and lean into **supporting numbers** and **clear timing** per row.

## File
`src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` — digest body only (the `activeMsg.kind === "digest"` branch). Nav, ribbon, subject, sender block, replies, and section headers stay.

## Remove
- **Open** and **Prepare** buttons on every signal row.
- The `+ N more in this category` truncation footer (an email wouldn't hide items behind a link — render up to 6 per section, plainly, or all if ≤6).
- Unused imports afterwards (likely `Sparkles`, `Button`).

## Keep
- Section blocks with colored left border, dot, title pill, and per-section count pill — "Act now / Opportunities / At risk" reads well and the user likes it.
- Small circular avatar with client initials.
- Opening paragraph, but reworded to set up the numbered read below.

## New row format
Each row becomes a compact paragraph-style block (no buttons, no card). Two lines:

- **Line 1 (header):** `{initials avatar}  {Client name}  ·  {EVENT LABEL small-caps muted}  ·  {timing chip}`
  - Timing chip: small rounded badge in the section's accent color, e.g. `bg-amber-50 text-amber-800 border border-amber-200`, with a **clear timing phrase** derived from `event.estimatedTiming` (kept verbatim if concrete like "within 30 days"; otherwise mapped: `imminent` → "this week", `near-term` → "next 2–3 weeks", `medium-term` → "this quarter"). Show the chip in-line, right of the label.
- **Line 2 (context):** one sentence built from `event.keyEvidence[0] || event.eventName`, followed by 1–2 **supporting numbers** rendered as bold inline stats. Pull what's already on the event object where possible; otherwise derive deterministically from the event so the same row always shows the same numbers:
  - `signalCount` — number of underlying signals: `event.keyEvidence.length` (fallback 3).
  - `windowDays` — behavioral lookback: derived from `event.urgencyScore` (`urgency 5 → 14 days`, `4 → 30`, `3 → 60`, `2 → 90`).
  - `confidencePct` — `Math.round((event.confidence ?? 0.7) * 100)` if the field exists, else derive from `urgencyScore * 18 + 10`.

  Sentence template: `{keyEvidence[0]}. {N} signals over the past {D} days · {C}% confidence.` — numbers bolded in `text-slate-900`.

Row container: `flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-b-0`. No hover state, no cursor pointer.

## Opening paragraph (reworded)
```
Morning — {totalSignals} new signals across {clientsWithSignals} clients. Grouped by how time-sensitive they are so you can plan the day. Every row has the underlying signal count, the window it covers, and my confidence — reply if you want me to go deeper on any of them.
```

## Closing paragraph (new, before signature)
```
Nothing here needs an immediate call except the Act Now list. Reply on any name and I'll pull household context, prior conversations, or draft prep notes.
```

## Copy guardrails
- Supporting numbers are **structural** (signal counts, lookback windows, confidence %), not customer spend or transaction totals — respects the "no exact spend/transaction counts" memory while giving the advisor real numbers.
- Timing chips must be concrete and unambiguous ("this week", "next 2–3 weeks", "this quarter", or the raw `estimatedTiming` if already specific). Section color reinforces urgency.
- No CTAs, no buttons.

## Props / API
`onOpenClient` and `onPrepareWithVentus` become unused. Rename them to `_onOpenClient`, `_onPrepareWithVentus` in the destructure so linting stays clean; keep the exported `AdvisorNotificationsViewProps` interface unchanged so `BankwideWMCopilotView` continues to pass them.

## Cleanup
Remove `Sparkles` and `Button` imports if unused after the row rewrite.

No other files change.