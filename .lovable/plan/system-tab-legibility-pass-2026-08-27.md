# System tab legibility pass

The System tab (`/bankdemo` → System) relies heavily on light grey text at very small sizes. On a large screen / projector these rows nearly disappear. This pass raises contrast and bumps the smallest type, without changing layout, colors of the family accents, or any logic.

## What changes

**On white background**
- Section eyebrows ("Data sources", "Activation destinations") and the counter next to them: grey-400 → slate-600, size 10.5px → 11.5px.
- Source card sublabels (mono provider/feed strings) and the "Updated 12s ago" caption: slate-400 → slate-500.
- Destination row count chips and the "Every Customer, Every Colleague" caption: slate-500 → slate-600.
- Detail-panel sublabels under each item: slate-500 → slate-600.
- Minimum font size on white lifted from 9.5px to 11px.

**On the dark Intelligence Core panel (`#141432`)**
- "Signals · what we detect" eyebrow: slate-500 → slate-300, 9.5px → 11px (slate-500 on this navy is the worst offender on the page).
- Ticker rows: evidence text slate-300 → slate-200, arrow slate-400 → slate-300, "· 24h" meta slate-300 → slate-200.
- Inactive signal label/icon greys nudged one step lighter so non-active rows stay readable.

**Header**
- Title/subtitle already read well; leave as is.

## Technical notes

All edits are in `src/components/tepilot/insights/CapabilitiesView.tsx` — the class maps at the top (`TEAMS`, inactive signal styles, badge maps) plus the inline classNames in the pipeline board and detail panel. Target is roughly WCAG AA (4.5:1) for body text and AA-large for mono captions. No structural, sizing, or data changes; card heights stay the same since only text color and a ~1px type bump are involved.

## Verification

Screenshot the System tab at 1440px after the change and confirm every caption is readable, then check the build log is clean.
