

## Replace Skiing Example with Expecting-a-Baby Life Event (Beat 4)

### Current mechanism (3 phases via `beat4Phase`)
- **Phase 0**: Show MCC badge + amount (merchant name hidden)
- **Phase 1**: Reveal merchant name
- **Phase 2**: Reveal behavioral insight label

This exact 3-phase click-through mechanism stays. Only the data and labels change.

### Changes to `src/components/demo/DemoPasswordGate.tsx`

**1. Replace transaction data array** (lines 397-400):
```
{ merchant: "CVS Pharmacy",               mcc: "5912", mccLabel: "Drug Stores & Pharmacies",      amount: "$48.70",  delay: "0.15s" }
{ merchant: "Motherhood Maternity",        mcc: "5621", mccLabel: "Women's Ready-to-Wear",         amount: "$127.00", delay: "0.3s" }
{ merchant: "Dr. Reyes OB/GYN Associates", mcc: "N/A",  mccLabel: "Check #1087",                   amount: "$350.00", delay: "0.45s" }
{ merchant: "Pottery Barn",                mcc: "5712", mccLabel: "Furniture & Home Furnishings",   amount: "$890.00", delay: "0.6s" }
{ merchant: "Babies R Us",                 mcc: "5999", mccLabel: "Miscellaneous Retail",           amount: "$156.75", delay: "0.75s" }
```

**2. Update heading** (line 391): "MCCs can't detect life events."

**3. Update subtitle** (lines 392-394): "Five transactions across five different MCC codes. To the bank, these are completely unrelated purchases."

**4. Update insight label** (line 449): Change "Behavioral Insight: Skiing" → "Life Event: Expecting a Baby"

**5. Update SVG icon** to a heart/baby-appropriate shape instead of the ski diamond.

**6. Update `beat4Phase` max** from `2` to `2` — stays the same (phase 0 = MCC+amount, phase 1 = merchant description, phase 2 = life event reveal).

