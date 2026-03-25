

## Plan: Restyle MCC Badge as a Ledger Row

**File: `src/components/demo/DemoPasswordGate.tsx` (lines 332-337)**

Replace the dashed-border pill with a minimal bank ledger row showing transaction ID, date, MCC code, and amount:

```tsx
<div className="flex flex-col items-center gap-2">
  <div className="w-full max-w-md bg-white rounded-lg border px-4 py-3 font-mono text-xs flex items-center gap-6" style={{ borderColor: "#E2E8F0" }}>
    <span style={{ color: "#94A3B8" }}>TXN-48291</span>
    <span style={{ color: "#94A3B8" }}>08/14/2025</span>
    <span className="font-semibold" style={{ color: "#0F172A" }}>MCC 7922</span>
    <span className="ml-auto font-semibold" style={{ color: "#0F172A" }}>−$185.00</span>
  </div>
  <span className="text-sm" style={{ color: "#94A3B8" }}>This is all the bank sees</span>
</div>
```

Four columns in a monospace ledger style: transaction ID, date, MCC code, amount. No merchant name or description — reinforcing the "blind" message.

