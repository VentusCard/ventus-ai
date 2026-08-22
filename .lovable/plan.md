# Consistent page headers

Make every tab header in /bankdemo look the same: one single line with the tab name and its description, and no popover buttons. The System tab keeps its own custom header and is untouched.

## What changes

- Title and description sit on the same line: icon, bold tab name, a thin divider dot, then the description in muted small text (truncated if the window is narrow).
- Remove the "How It Works" and "Why It Matters" pill buttons and their popovers from all tabs.
- Keep the section dropdown (where a tab has sub-sections) on the right of the same row.
- Keep the same bottom border, spacing, and overall header height so no page shifts.

## Technical notes

- Single edit to `src/components/tepilot/insights/TabHeader.tsx`: replace the stacked title/subtitle block with an inline flex row, delete the two `Popover` blocks and the `Lightbulb`/`Zap` imports.
- `howItWorks` / `whyItMatters` props stay in the interface but become optional and unused, so the ~27 existing call sites that pass them keep compiling with no edits.
- `src/components/tepilot/insights/CapabilitiesView.tsx` (System tab) is not modified.
