

## Remove fallback to old DemoRewardsView

### Problem
When the Rewards tab loads, if `generatedOffers` hasn't arrived yet, the code falls back to the old `DemoRewardsView` component. This causes a flash of the old UI before the new `GeneratedOffersPhoneView` replaces it.

### Fix: `src/components/exec-demo/ExecDemoPhoneView.tsx`

Replace the `DemoRewardsView` fallback (line 59) with a simple loading placeholder — the same pattern used for the "product" tab:

```typescript
case "rewards":
  if (generatedOffers && generatedOffers.length > 0) {
    return <GeneratedOffersPhoneView offerGroups={generatedOffers} customerName={customer.profile.name} />;
  }
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-[11px] text-slate-300">Personalizing rewards...</span>
    </div>
  );
```

Also remove the now-unused `DemoRewardsView` import (line 8).

One-line change + one import removal.

