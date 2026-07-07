## Goal
Port the redesigned sticky header + pill navigation from `AdvisorNotificationsView.tsx` into `LeadershipNotificationsView.tsx` so both conversation threads share the same ultra-clear look.

## Changes — `src/components/tepilot/advisor-console/LeadershipNotificationsView.tsx`

1. **Sticky header block (lines ~387–437)** — replace the current compact nav row with the Advisor version:
   - Title row above the pills:
     - `h2`: "Example Conversation thread between Leadership and Ventus AI Coworker"
     - Right-aligned "Message X of Y" chip (white pill with slate-200 border)
   - Larger Prev / Next buttons with icon + label ("Prev", "Next") instead of icon-only
   - Bigger pills: `px-3.5 py-2 rounded-full text-sm`, colored variants:
     - Active + Ventus → `bg-sky-600 border-sky-600 text-white shadow-md`
     - Active + Leader → `bg-slate-700 border-slate-700 text-white shadow-md`
     - Inactive + Ventus → `bg-sky-50 border-sky-200 text-sky-700`
     - Inactive + Leader → `bg-white border-slate-200 text-slate-700`
   - Pill contents: bold index number, label ("Ventus" / "Leadership"), muted time — matching the Advisor pattern (drop the tiny colored dot).
   - Container padding matches Advisor: `pt-4 pb-3` with `mb-3` between title row and pills.

2. **Subject block (lines 469–476)** — remove the now-redundant `Message X of Y` line under the subject (the counter now lives in the header, same as Advisor view).

3. Outer wrapper spacing: bump `space-y-3` → `space-y-5` to match Advisor spacing.

No other logic, data, or components change. Nav item labels stay driven by `m.sender` (Ventus/Leadership).

## Summary
Leadership thread gets the same titled, high-contrast pill navigation as the Advisor thread, with the message counter moved into the header chip.