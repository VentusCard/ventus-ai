# 529 flow — fix the last three signals

## What the 529 flow shows today

Expanding the 529 College Savings Plan flow lists eight signals in this order:

```text
1. Life event   New baby in the household
2. Life event   Has a child heading to college
3. Behavioral   Paying for education outside tuition
4. Behavioral   Education money going to an outside provider
5. Financial    Paying tuition
6. Financial    Money left over each month
7. Demographic  Has school-age children
8. Demographic  Two earners in the household
```

Items 6 and 8 are generic filler pulled in by a fallback rule that fires whenever a product ends up with too few Financial/Demographic signals — they say nothing about education savings. Item 5 ("Paying tuition") also repeats what items 2 and 3 already establish, so the tail of the list reads as padding rather than evidence.

## What will change

Replace the tail with education-specific evidence, keeping five families represented:

- **Financial — "529 funded at another provider"**: recurring transfers to a state plan administrator or an outside brokerage's education account. This is the highest-intent, most winnable signal for the product and belongs first in the family.
- **Financial — "Setting money aside for a child"**: gift deposits around birthdays and holidays plus steady transfers into a savings bucket that never gets spent down — savings capacity aimed at a child, without a plan attached.
- **Demographic — "Has school-age children"**: kept as-is; it is genuinely on-point for 529.
- **Demographic — "Household saving beyond day-to-day needs"**: replaces "Two earners in the household" with a contribution-capacity read (income comfortably exceeds recurring commitments, with a persistent savings balance).

Remove from this flow:
- "Money left over each month" (generic surplus filler)
- "Two earners in the household" (generic filler)
- "Paying tuition" as a standalone Financial row, since items 2 and 3 already carry it

Result: 529 shows seven signals — 2 life event, 2 behavioral, 2 financial, 1 demographic — every one tied to education.

Risk filters for 529 are unchanged.

## Technical notes

- `src/lib/flowSignalFamilies.ts`
  - Add two education seeds to the `FINANCIAL` library (`outsideEducationPlan`, `childSavingsBuildup`) and one to `DEMOGRAPHIC` (`savingCapacityHousehold`), each with a weight consistent with neighbouring seeds.
  - In the education branch of the seed-selection function, attach the new Financial seeds at relevance 3 and skip `FINANCIAL.tuitionOutflow` for `flow.id === "529-plan"`.
  - Exclude `529-plan` from the generic `FINANCIAL.surplus`-style fallback and from the `DEMOGRAPHIC.dualIncome` fallback (the same guard pattern already used for `heloc`).
- No component changes: audience allocation, filter cascade, and the family grouping UI all read from the expanded list, so counts still sum exactly.

## Verification

- Typecheck and build.
- Run a small script that prints the expanded 529 signal list and asserts: no generic filler labels remain, allocated signal audiences still sum to the flow audience, and triggered − removed = qualified.
- Open `/bankdemo` → Automated Flows → 529 and confirm the expanded list reads as intended.
