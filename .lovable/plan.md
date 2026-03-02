

## Color-Code Transaction Sources in the Feed

Currently, the account badges (e.g. `••4821`, `••9053`) in the transaction feed are all rendered in the same gray. This change assigns a distinct color to each unique account number per persona, making it visually clear that enrichment signals are drawn from multiple funding sources.

### Changes (1 file: `src/components/hero/EnrichmentMockup.tsx`)

**1. Add a source color palette constant (~line 7)**

A small array of 5 distinct colors (slate blue, emerald, amber, purple, rose) to cycle through for each unique account within a persona.

```ts
const SOURCE_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];
```

**2. Add a helper to map account to color**

A simple function that extracts unique accounts from a persona's transactions and assigns colors by index:

```ts
const getSourceColor = (transactions: Transaction[], account: string): string => {
  const uniqueAccounts = [...new Set(transactions.map(t => t.account))];
  const idx = uniqueAccounts.indexOf(account);
  return SOURCE_COLORS[idx % SOURCE_COLORS.length];
};
```

**3. Pass source color to TxRow (~line 708)**

Update the `TxRow` component to accept a `sourceColor` prop, and use it for the account badge background and text color instead of the current gray defaults.

**4. Update account badge styling in TxRow**

Change the account badge to always use its source color (with transparency for background), regardless of highlight state:

```tsx
<span style={{
  background: `${sourceColor}20`,
  color: sourceColor,
}}>
  {tx.account}
</span>
```

**5. Pass `sourceColor` from the caller**

Where `TxRow` is rendered in the transaction feed loop, compute the source color from the current persona's transactions and pass it down.

This creates a clear visual pattern: same-colored account badges group together, showing that e.g. the renovation signal comes from 2 different cards while the travel signal comes from a 3rd.

