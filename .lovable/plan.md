

## Issue Analysis

The user reports two problems:
1. The edge function returns placeholder text: `"Personalized High-Yield Savings message..."`
2. The personalization preview regenerates when changing audience filters, when it shouldn't

### Root Cause

Looking at `PersonalizationPreviewPanel.tsx`:

**Line 56-63**: The useEffect regenerates personas and clears messages whenever `selectedPillars` or `selectedLifeEvents` change. However, these values are static for each template (derived from `getPillarsForTemplate()` and `getLifeEventsForTemplate()`) so this isn't the issue.

**Line 288**: The placeholder appears when `message?.msg` is falsy:
```tsx
"{message?.msg || `Personalized ${personaProduct?.name || 'offer'} message...`}"
```

**Network logs show**: The edge function IS returning real messages successfully. The issue is that:
1. Either messages aren't persisting in state after generation
2. OR the component is re-rendering and losing the generated messages

**Line 151-156**: Auto-generation triggers when `selectedProduct`, `personas`, `hasGenerated`, or `isGenerating` change. The dependency array includes `generatePersonalizedMessages` which has `tierProductOverrides` as a dependency (line 148).

### The Problem

When audience filters change in `AutomatedFlowsSection`, React re-renders the entire expanded flow section. While `tierProductOverrides` doesn't change, the component may be losing state or the `generatePersonalizedMessages` callback is being recreated, triggering unnecessary regeneration.

## Solution

**1. Stabilize the PersonalizationPreviewPanel to prevent unnecessary regeneration:**
   - Add memoization to prevent re-renders when irrelevant props change
   - Ensure messages persist across renders
   - Only regenerate when products actually change, not on every render

**2. Make dependencies more explicit:**
   - Remove `generatePersonalizedMessages` from useEffect dependencies
   - Use a stable ref or better dependency tracking

**3. Add loading state protection:**
   - Ensure existing messages aren't cleared while new ones are generating
   - Show the loading state overlay instead of placeholder text

### Changes Needed

**`src/components/tepilot/campaigns/PersonalizationPreviewPanel.tsx`**:
- Wrap component in `React.memo` to prevent re-renders when audience filters change
- Fix the auto-generation useEffect to have stable dependencies
- Change line 288 to show loading state instead of placeholder when generating
- Add a ref to track the last product state to prevent unnecessary regeneration

**`src/components/tepilot/campaigns/AutomatedFlowsSection.tsx`**:
- Ensure props passed to PersonalizationPreviewPanel are stable (they already are)
- Consider adding a key to PersonalizationPreviewPanel based on template.id to maintain separate state per flow

### Expected Outcome

After these changes:
1. Clicking "Audience Matched" and changing filters will NOT regenerate the personalization preview
2. The placeholder text will only show before the first generation, not during regeneration
3. Messages will persist properly across renders
4. Only changing tier products will trigger regeneration (as intended)

