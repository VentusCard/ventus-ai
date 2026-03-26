

## Merge "Your Relationship" and "Your Branch" into one card

**What changes:**

In `src/components/demo/DemoWealthView.tsx`:

1. **Replace the "Tenure Banner" card** (lines 137-144) with a combined card that includes both the tenure info and the branch info in a single card. Layout: tenure line on top, branch + local perk below, separated by a subtle divider or spacing. Keep the `Star` icon in the header, rename to "Your Relationship" or keep as-is.

2. **Delete the standalone "Local Branch Card"** (lines 258-266).

3. The **Tenure + Wellness Row** remains a 2-column grid — left card becomes the merged relationship+branch card, right card stays as Financial Wellness.

**Merged card content:**
- Header: Star icon + "Your Relationship"
- Line 1: `Valued member since {sinceYear}` / `{tenureYears} years with TCBY Bank`
- Small divider
- Line 2: MapPin icon + `TCBY Westfield — Open until 6:00 PM`
- Line 3: Local perk text

