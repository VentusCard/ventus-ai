

## Reorder and Update Stats in "How It Works" Section

Update the three stats in `src/components/IntegrationSection.tsx` to use "3,000+ Dynamic Labels" as the first stat, then reorder the remaining two.

### Changes

**File: `src/components/IntegrationSection.tsx`**

Update the `stats` array (lines 9-13) from:

```
{ target: 20, suffix: "+", label: "Life events detected" },
{ target: 50, suffix: "+", label: "Lifestyle dimensions" },
{ target: null, text: "Real-time", label: "Processing" },
```

To:

```
{ target: 3000, suffix: "+", label: "Dynamic labels" },
{ target: 50, suffix: "+", label: "Lifestyle dimensions" },
{ target: 20, suffix: "+", label: "Life events detected" },
```

Also update the rendering section (around lines 87-99) to remove the special "Real-time" text handling since all three stats now use numeric count-up values. The third stat will use `count2` (a new counter for 20) instead of the hardcoded "Real-time" text.

Update the `useCountUp` hooks (around lines 52-53) to add a third counter and adjust the assignments to match the new stat order (3000, 50, 20).

The count-up animation duration remains 1500ms, so "3,000+" will animate up impressively when scrolled into view. Number formatting with commas will be added for the 3,000 value for readability.

