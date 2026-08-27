# Audit & redesign Data sources cards for readability

## Audit findings (current state)

In `/bankdemo` → System tab, the **Data sources** column (left of the pipeline):

| Element | Current | Issue |
| --- | --- | --- |
| Source name ("Banking Core") | 13px medium | Small; hierarchy too flat vs sublabel |
| Sublabel ("accounts · transactions · ledger · 12 sources") | 11px mono, slate-500, truncated | Mono + low contrast + truncation = illegible on a projector; the "N sources" count is buried in the same string |
| Icon tile | 30×30, 16px icon | Reads as decoration, not a status anchor |
| Status | bare 8px green dot, no label | Meaning unclear at a glance |
| Internal vs External | only implied by sky/amber icon tint | No explicit badge; user must infer |
| Section eyebrow ("Internal signals · 2") | 11.5px mono uppercase slate-600 | OK, keep |

## Redesign

Single file: `src/components/tepilot/insights/CapabilitiesView.tsx` (`SourceGroupCard` + the sourceSections header row).

**Card layout (per source):**

```text
┌──────────────────────────────────────────────┐
│ [34px icon]  Banking Core          ● Live    │
│              accounts · transactions · ledger│
│              [12 source feeds]  [Internal]   │
└──────────────────────────────────────────────┘
```

1. **Source name** → `text-[15px] font-semibold text-slate-900` (clear hierarchy).
2. **Sublabel** → `text-[12.5px] font-normal text-slate-600`, drop mono, keep truncate.
3. **Count** becomes its own chip: `[12 source feeds]` — `text-[11px] font-medium`, tinted pill matching internal (sky) / external (amber), so the number is scannable instead of buried in the sublabel string.
4. **Origin badge** → explicit pill: `Internal` (sky-100/sky-700) or `External · Modeled` (amber-100/amber-700). Color alone no longer carries meaning.
5. **Status** → labeled `● Live` text-11px emerald-600 with the existing pulsing halo dot, instead of a bare dot.
6. **Icon tile** → 34×34 with 18px icon, keeps sky/amber tint.
7. **Card padding** → `px-3.5 py-3`, min-height ~72px; active state keeps the sky ring. The 4 cards + 2 section eyebrows still fit the ~10%-taller pipeline board; reduce inter-card gap from 12px to 10px if needed to avoid overflow.
8. Click behavior and the detail panel below are unchanged.

## Style rules

- Strict light theme, no `dark:` utilities.
- Target AA contrast (≥4.5:1) for all text: nothing below slate-600 on white except the count pills (700-level text on 100-level tint).

## Verification

Screenshot the System tab at 1440px; confirm all four cards read clearly (name / feeds count / origin / live status at a glance) and the board height still matches the destinations column. Check build log clean.
