

## Formatting & Spacing Issues Found

Based on the screenshot and code review:

### Issues to fix in `src/components/demo/DemoWealthView.tsx`

1. **Life event falls back to generic content** — The AI returns event names like "College Preparation for Dependent" which don't match any `EVENT_META` key (only "Education Funding" exists). Fix: add fuzzy matching so event names containing keywords like "college", "education", "retirement", "home", "baby", etc. map to the correct meta entry.

2. **Extra blank lines (292-293)** — Two empty lines between the life events block and the fallback block. Minor but inconsistent with the rest of the file which uses single blank lines.

3. **Double blank line after Quick Actions (217-218)** — Two blank lines before the life events section; should be one for consistency.

### Changes

**File:** `src/components/demo/DemoWealthView.tsx`

- Add a helper function that matches event names to `EVENT_META` by keyword lookup instead of exact string match:
  - "college", "education", "529", "tuition" → Education Funding
  - "retire" → Retirement Planning
  - "home", "house", "mortgage" → Home Purchase
  - "baby", "expecting", "family formation" → Family Formation
  - "elder", "care" → Elder Care
  - "wealth transfer", "estate", "legacy" → Wealth Transfer
  - "business", "liquidity" → Business Liquidity
- Use this helper in the event render loop instead of direct `EVENT_META[event.event_name]`
- Remove extra blank lines at lines 217-218 and 292-293

