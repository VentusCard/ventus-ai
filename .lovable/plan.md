

## Plan: Toggle TierProductSelector via "Tier-Matched Product" badge click

### Change: `AutomatedFlowsSection.tsx`

**Current behavior**: The `TierProductSelector` is always visible when a flow is expanded.

**New behavior**: The `TierProductSelector` is hidden by default. Clicking the "Tier-Matched Product" badge in the flow diagram toggles it open/closed.

### Implementation

1. Add state: `const [tierSelectorOpenId, setTierSelectorOpenId] = useState<string | null>(null)`
2. Make the "Tier-Matched Product" `Badge` (line 315-318) clickable with a distinct hover style. On click, toggle `tierSelectorOpenId` for that flow.
3. Wrap the `TierProductSelector` (line 326-329) in a conditional: only render when `tierSelectorOpenId === template.id`.
4. Add visual indicator on the badge when selector is open (e.g. highlighted border/background).

### File Changed

| File | Change |
|------|--------|
| `AutomatedFlowsSection.tsx` | Add toggle state, make "Tier-Matched Product" badge clickable, conditionally show `TierProductSelector` |

