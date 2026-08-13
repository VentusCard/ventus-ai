# Clarify source/destination counts in Systems tab

## Problem
In `/bankdemo` → **System** tab, the **Data sources** cards show a bare number after each source name (e.g., "Core banking · 5"). It is not obvious that the number refers to how many source inputs are in that group. The same issue appears in the section headers for both Data sources and Activation destinations.

## Proposed change
Update `src/components/tepilot/insights/CapabilitiesView.tsx` to add explicit count labels wherever a bare number is shown:

1. **Source group cards** — change the sublabel from `{sublabel} · {inputs.length}` to `{sublabel} · {inputs.length} sources`.
2. **Data sources section header** — change `{groups.length} groups · {totalSourceInputs}` to `{groups.length} groups · {totalSourceInputs} sources`.
3. **Activation destinations section header** — change `3 teams · {visibleDestinations.length}` to `3 teams · {visibleDestinations.length} destinations` for consistency.

No functional or data changes; only copy/labeling improvements.

## Files changed
- `src/components/tepilot/insights/CapabilitiesView.tsx`
