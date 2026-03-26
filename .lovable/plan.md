

## Add CTAs to "How we can help" section

**File:** `src/components/demo/DemoWealthView.tsx`

**What changes:**

In the "How we can help" column of each life event card (lines 223-232), add two CTA buttons below the suggestions list:
- **"Open HY Savings"** — styled as a primary button (filled, using the event's color)
- **"Apply for 529"** — styled as a secondary/outline button

Also update the `EVENT_META` suggestions data to include CTA metadata per event type so different events can show relevant CTAs (e.g. Education Funding shows "Apply for 529" + "Open HY Savings", Retirement shows different CTAs). For simplicity, we'll add a `ctas` array to each event meta entry.

**Implementation detail:**

1. Add a `ctas` field to `EVENT_META` entries and `DEFAULT_META`:
   - Education Funding: `["Open HY Savings", "Apply for 529"]`
   - Retirement Planning: `["Open HY Savings", "Review IRA Options"]`
   - Others get sensible defaults like `["Open HY Savings", "Learn More"]`

2. After the suggestions `<div className="space-y-1.5">` block (line 231), insert a row of two small CTA buttons using `flex gap-2 mt-3`, styled consistently with the event color.

