## Fix deliverables section alignment in `CoworkerInboxView.tsx`

### Problem
In the "Ventus AI Coworker Capabilities" panel's deliverables sub-section:
1. The text is not vertically aligned with the role pills (Advisor / Leadership).
2. The two rows of text do not start at the same horizontal position because the pills are different widths.

### Changes
1. Give both pills a fixed `w-[84px]` (or similar) and `text-center` so they are the same width, and add `flex items-center` to vertically center them.
2. Remove `mt-0.5` from the pills and use `items-center` on the flex rows so the pill and text share a common baseline.
3. Ensure the `gap-2` remains consistent so the text block starts flush on both rows.

### Files
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` (lines 86-95)