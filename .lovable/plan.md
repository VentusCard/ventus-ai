
# Add Second Button to Analytics & Targeting Card

## Overview

Add a secondary button to the Analytics & Targeting PersonaCard that navigates directly to the Segment Targeting view, similar to how the Wealth Management card has two buttons for different views.

## Current State

- Analytics & Targeting card has one button: "View Bank-wide Dashboard"
- Clicking it sets `insightType` to 'bankwide' and renders `AnalyticsContainer`
- AnalyticsContainer has internal tabs: "Analytics Dashboard" and "Segment Targeting"
- Users must click a second tab after entering the view to access Segment Targeting

## Proposed Solution

### Button Configuration

| Button | Position | Action |
|--------|----------|--------|
| View Analytics Dashboard | Top (secondary) | Opens AnalyticsContainer with "dashboard" tab active |
| Open Segment Builder | Bottom (primary) | Opens AnalyticsContainer with "targeting" tab active |

### Changes Required

**1. Update AnalyticsContainer to accept an initial tab prop:**
```typescript
interface AnalyticsContainerProps {
  defaultTab?: 'dashboard' | 'targeting';
}

export function AnalyticsContainer({ defaultTab = 'dashboard' }: AnalyticsContainerProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      ...
    </Tabs>
  );
}
```

**2. Add state to TePilot to track which analytics tab to show:**
```typescript
const [analyticsDefaultTab, setAnalyticsDefaultTab] = useState<'dashboard' | 'targeting'>('dashboard');
```

**3. Update the Analytics & Targeting PersonaCard with two buttons:**
```typescript
<PersonaCard
  icon={Building2}
  title="Analytics & Targeting"
  valueProposition="Make data-driven decisions across your entire portfolio"
  description="..."
  keyFeatures={[...]}
  secondaryButtonText="View Analytics Dashboard"
  secondaryButtonVariant="outline"
  onSecondaryClick={() => {
    setAnalyticsDefaultTab('dashboard');
    setInsightType('bankwide');
  }}
  buttonText="Open Segment Builder"
  buttonVariant="ai"
  onClick={() => {
    setAnalyticsDefaultTab('targeting');
    setInsightType('bankwide');
  }}
/>
```

**4. Pass the default tab to AnalyticsContainer:**
```typescript
{insightType === 'bankwide' && (
  <div className="space-y-6">
    ...
    <AnalyticsContainer defaultTab={analyticsDefaultTab} />
  </div>
)}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/tepilot/insights/AnalyticsContainer.tsx` | Add `defaultTab` prop to control initial tab |
| `src/pages/TePilot.tsx` | Add `analyticsDefaultTab` state, add secondary button props to Analytics card, pass prop to AnalyticsContainer |

## UI Preview

```text
┌────────────────────────────────────────────┐
│ 🏢 Analytics & Targeting                   │
│                                            │
│ Make data-driven decisions across...       │
│                                            │
│ ✓ Portfolio-wide behavioral analysis...    │
│ ✓ 12-Pillar interactive spending...        │
│ ✓ Card product performance matrix...       │
│ ...                                        │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │      View Analytics Dashboard      →   │ │  ← Secondary (outline style with primary bg)
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │        Open Segment Builder        →   │ │  ← Primary (ai variant)
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Benefits

- Users can go directly to either Analytics Dashboard or Segment Targeting
- Matches the two-button pattern used by the Wealth Management card
- No extra clicks required to reach the Segment Builder
- Both views remain accessible via tabs once inside the AnalyticsContainer
