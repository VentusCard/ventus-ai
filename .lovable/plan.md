

## Plan: Show TierProductSelector as collapsed preview, full detail on expand

Currently the `TierProductSelector` only appears inside the expanded detail section. The user wants it always visible as a compact summary when collapsed, expanding to the full selector + personalization preview when clicked.

### Change: `AutomatedFlowsSection.tsx`

**When collapsed** — show a compact inline preview of tier→product assignments below the header row (inside the card but before the expanded section). Display 3 small tier badges with their assigned product names, e.g.:

```
Mass Market: Cashback Plus, Travel Card  |  Affluent: Premium Rewards  |  HNW: Private Banking
```

This is a clickable area that expands the card (same as clicking the header).

**When expanded** — keep the current layout (trigger info, flow diagram, TierProductSelector, PersonalizationPreviewPanel).

### Implementation

1. Extract the tier product summary into a compact preview component rendered **outside** the `isExpanded` conditional, shown only when `!isExpanded`
2. The preview renders 3 inline tier labels with product chips, or "No products" if empty
3. Clicking it triggers expand (same `setExpandedFlowId` call)

### File Changed

| File | Change |
|------|--------|
| `AutomatedFlowsSection.tsx` | Add collapsed tier-product preview below header row when `!isExpanded` |

