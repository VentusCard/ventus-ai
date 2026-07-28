## Goal
Normalize typography inside the `/coworker` email reel so every message renders on one consistent type scale, instead of mixing `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`, `text-xs`, `text-sm` across the digest body, reply bodies, and eyebrow labels.

## Current problem
Reel body wrapper is `text-[13px]`, but shared render callbacks in `AdvisorConversationThread.tsx` (used by both the tablet view and the reel via `DigestBody` + `REPLY_MESSAGES`) hard-code sizes:
- Eyebrow labels: `text-[11px]` (some `text-[9px]`/`text-[10px]` in compact)
- Table headers: `text-[10px]`
- Table rows: `text-[12px]`
- DigestBody rows: `text-[9-12px]` in compact
Result: font size jumps message-to-message and line-to-line inside a single email.

## Type scale to apply (reel + compact tablet)
- Body prose: `text-[13px] leading-relaxed`
- Eyebrow / uppercase labels: `text-[11px] uppercase tracking-wide`
- Table cells: `text-[13px]` (headers stay eyebrow style)
- Sender chip name: `text-[13px]`, meta: `text-[11px]`
One family only — no additional arbitrary sizes.

## Changes
1. `src/components/coworker/CoworkerEmailReel.tsx`
   - Keep body wrapper at `text-[13px] leading-relaxed`, ensure quoted block and signature use `text-[11px]` (eyebrow scale) consistently.

2. `src/components/tepilot/advisor-console/AdvisorConversationThread.tsx` — shared `REPLY_MESSAGES` renderers + `DigestBody`:
   - Eyebrow paragraphs (`Transactions (last 90 days)`, `Household`, `Task 1/2 — …`): unify to `text-[11px] uppercase tracking-wide text-slate-500`.
   - Travel-card table: header `text-[11px] uppercase tracking-wide`, rows `text-[13px]` (was `text-[10px]` / `text-[12px]`).
   - `DigestBody` compact branch: retitle sizes to the same scale — section title `text-[13px]`, count pill `text-[11px]`, client name `text-[13px]`, event label eyebrow `text-[11px]`, description body `text-[13px]`, "Recommended offer:" eyebrow `text-[11px]`. Non-compact branch unchanged (already `text-sm`/`text-xs`).

3. Verify the `/bankdemo` compact tablet view still reads well (same normalized scale — slightly larger meta text than today, but consistent).

## Out of scope
- Full (non-compact) `AdvisorConversationThread` layout used elsewhere.
- Colors, spacing, borders, and copy stay untouched.
- No new fonts; existing `Manrope` UI font applies everywhere.
