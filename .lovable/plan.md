

## Separate product actions into two labeled rows

### What
Split the AI-generated action pills on each product card into two visually distinct rows:
1. **Standard Response** — operational actions (email campaign, schedule meeting, push notification, etc.) where `tone === "standard"`
2. **Concierge Touch** — relationship-building / wow-factor actions where `tone === "wow"`

Each row gets a tiny label prefix (e.g. `Standard Response ·` and `Concierge Touch ·`) in slate-400 text before the pills.

### Change

**File**: `src/components/exec-demo/NextProductRationale.tsx`, lines ~310-365

Replace the single `flex-wrap` div of action pills with two grouped rows:

```tsx
{(() => {
  const dynamicActions = productActions?.find(ca => ca.card_index === origIdx)?.actions;

  if (dynamicActions && dynamicActions.length > 0) {
    const standard = dynamicActions.filter(a => a.tone === "standard");
    const wow = dynamicActions.filter(a => a.tone === "wow");

    return (
      <div className="mt-2 space-y-1.5">
        {standard.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Standard Response</span>
            {standard.map((action, ai) => (
              /* existing pill rendering, no ring/sparkle */
            ))}
          </div>
        )}
        {wow.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Concierge Touch</span>
            {wow.map((action, ai) => (
              /* existing pill rendering with sparkle + ring */
            ))}
          </div>
        )}
      </div>
    );
  }

  // Loading and static fallbacks remain unchanged
})()}
```

Also update the static fallbacks to use the same two-row layout with labels.

Single file, ~30 lines changed.

