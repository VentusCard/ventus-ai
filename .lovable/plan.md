

## Expand First Two Pillars by Default & Enlarge Phone Mockup

### Changes — `src/components/demo/DemoEngagementView.tsx`

#### 1. Default-expand first two pillars
Change `expandedPillar` from a single string to a `Set<string>` initialized with the first two pillar names. Update toggle logic accordingly.

```tsx
// Before
const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

// After
const [expandedPillars, setExpandedPillars] = useState<Set<string>>(() => {
  const names = spending.slice(0, 2).map(s => s.name);
  return new Set(names);
});
```

Toggle logic: flip membership in the set instead of setting a single value.

#### 2. Make phone mockup bigger
- Remove `max-w-[380px]` constraint (or increase to `max-w-[480px]`)
- This lets the mockup fill more of its grid column

### Files Modified
- `src/components/demo/DemoEngagementView.tsx`

