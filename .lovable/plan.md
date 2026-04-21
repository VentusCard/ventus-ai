

## Roll up risk pills into 3 group-level pills

Right now Sarah's intel panel renders **one pill per flagged transaction** — so 3 gambling + 3 financial vulnerability + 1 adult = **7 pills**. You want **3 roll-up pills** (one per high-level group):

- ⚠ **Gambling** — `3 txns · high` (max severity across the 3 subcats)
- ⚠ **Financial Vulnerability** — `3 txns · high`
- ⚠ **Adult Entertainment** — `1 txn · medium`

Underlying per-transaction flag data stays intact, so clicking a pill still highlights all matched txns and the existing AI / drilldown flows work — only the rendering is rolled up.

## Where the change lives

Single render block: `src/components/exec-demo/ExecDemoIntelPanel.tsx` lines 477–574 (the `riskPills` const inside the `Risk Factors` section).

No edge-function changes — `detect-risk-transactions` continues to emit specific `category_label` per transaction (Sports Betting, Casino & Table Games, High-Risk / Offshore Gambling, etc.). The roll-up happens client-side at render time so the underlying granularity is preserved for downstream flows (deal cards, AI chat, drill-downs).

## Roll-up logic

```text
For each riskFlags.flags entry:
  group_key =
    "adult"                    if category_group=="vice" AND label contains "adult"
    "gambling"                 if category_group=="vice"   (all gambling subcats land here)
    "financial_vulnerability"  if category_group=="financial_distress"
    "suspicious_international" if category_group=="suspicious_international"
    "aml"                      if category_group=="aml"
    else: raw category_label

Per group accumulate:
  - txIds (Set of transaction_ids — dedupe across duplicate flags)
  - merchants (Set, for click → tx-list highlight)
  - severity = max(severity)  using rank low<medium<high

Render order (fixed): gambling → financial_vulnerability → adult → suspicious_international → aml → others.
```

Pill format: `⚠ Gambling   3 txns · high` (count + severity in the small subscript span that today shows only severity).

## Click behavior preserved

When a roll-up pill is clicked, all matched transaction indices across the group are passed to `onTriggerPillClick` — the full set of underlying txns highlights in the transaction list, and the relationship-tab AI prompt fires with `rollup.sampleMerchant` (first merchant in the group) for context.

## What does NOT change

- Edge function output (`detect-risk-transactions`) — still emits specific subcategory labels per transaction; LLM prompt + deterministic detectors stay as-is.
- Other groups (AML, Suspicious International) — also collapse to one pill per group, but those are rare and usually only 1 txn anyway.
- `availableSignals` (relationship-tab signal selector) — stays per-flag; that selector benefits from subcategory specificity. Can roll it up too if you want — leaving as-is for now.
- Sarah's CSV — already has 3 gambling + 3 distress + 1 adult interleaved.

## Verification

- `/demo` → Sarah Mitchell → run enrichment → Risk Factors row shows exactly **3 pills**: Gambling (3 txns · high), Financial Vulnerability (3 txns · high), Adult Entertainment (1 txn · medium).
- Click "Gambling" pill → DraftKings, Bellagio, and STAKE.COM*PROC LV rows all highlight in the txn list.
- Click "Financial Vulnerability" pill → EarnIn, WESTERN UNION*MTO 8821, and Portfolio Recovery rows all highlight.
- Click "Adult Entertainment" pill → PRIVATE MEDIA GRP LLC row highlights.
- Customers with zero risk flags still show the "No Risk Factors Detected" green pill.

