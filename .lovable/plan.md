Change the Income pill in `ExecDemoSelectionDialog.tsx` from emerald (`bg-emerald-50 text-emerald-700`) to a distinct color so it stands apart from existing source pills (Cashback Card already uses emerald).

Proposed: **teal** — `bg-teal-100 text-teal-800` (unused by any source in `SOURCE_COLORS`, still reads as "money in", clearly different from Cashback Card's lighter emerald).

Also tint the per-row amount text in the expanded Income table from `text-emerald-700` → `text-teal-800` to match.

No other changes.