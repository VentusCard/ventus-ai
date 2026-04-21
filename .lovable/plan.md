

## Fix Financial Vulnerability pill → AI chat: pass a random merchant from the rollup

**The bug:** Clicking the rolled-up "⚠ Financial Vulnerability · 3 txns · high" pill always sends the AI a prompt about *EARNIN ACTIVEHOURS* — the first merchant in the rollup (`rollup.sampleMerchant`). The AI then can't ground its answer ("I don't have records of a transaction at EARNIN…") and the demo looks broken.

**Your fix:** Instead of always picking the first merchant, pick a **random** merchant from the rollup each time the pill is clicked. This mimics a real bank-customer experience where the AI is asked about *one* of the flagged transactions in the cluster — and a fresh re-click surfaces a different one, making the demo feel alive.

### Change

**File:** `src/components/exec-demo/ExecDemoIntelPanel.tsx` (~line 567, the rollup pill `onClick`)

Today:
```ts
onClick={() => isClickable && handleRiskForRel(flagLabel, matchedIndices, dotColor, rollup.sampleMerchant)}
```

Replace with:
```ts
onClick={() => {
  if (!isClickable) return;
  const all = Array.from(rollup.merchants as Set<string>);
  const picked = all.length > 0
    ? all[Math.floor(Math.random() * all.length)]
    : rollup.sampleMerchant;
  handleRiskForRel(flagLabel, matchedIndices, dotColor, picked);
}}
```

`handleRiskForRel` (line 413) and the prompt template stay exactly as they are — the existing prompt *"What is this transaction at {merchant}? What is it typically associated with statistically?"* is fine, it just needs a fresh merchant each click.

### Resulting flow

- Click ⚠ **Financial Vulnerability** → AI gets asked about EarnIn, OR Western Union, OR Portfolio Recovery (random each click).
- Click ⚠ **Gambling** → AI gets asked about DraftKings, OR Bellagio, OR STAKE.COM (random each click).
- Click ⚠ **Adult Entertainment** (only 1 merchant) → still asks about that single merchant.
- Re-clicking the same pill rotates to a different merchant, giving the demo a "live customer" feel.

### Files touched

- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — single onClick handler change on the risk rollup pill.

No edge function, schema, or prompt changes.

