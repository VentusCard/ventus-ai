

## Plan: Simplify Collection Card — Remove Rollup Pill and Deal Terms

### Changes

**`src/components/exec-demo/GeneratedOffersPhoneView.tsx`** — Two tweaks:

1. **Remove the rollup pill badge** (lines 59-65) — the colored `✦ Frequent Traveler` chip. The collection message alone is enough context.

2. **Show only merchant names** in the deal pills — change `{deal.merchant} · {deal.rewardValue}` to just `{deal.merchant}`. Make pills slightly smaller (`text-[9px]`, `px-2 py-0.5`).

Result:
```text
┌──────────────────────────────┐
│ "Travel smarter with new     │
│  gear and perks"             │
│                              │
│ [Away] [Bose] [TSA] [Samsonite]│
│                              │
│         ● ○ ○                │
└──────────────────────────────┘
```

### No other files change

