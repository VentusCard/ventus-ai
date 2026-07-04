# Products tab — pricing & terms per product

Add realistic pricing/terms metadata to every product in the bank product catalog and surface it on each product card in the Products tab (`ProductsCatalogView`).

## 1. Extend `src/lib/bankProductCatalog.ts`

Add two optional fields to `BankProduct`:

```ts
export interface BankProduct {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  pricing?: string; // headline price/rate (e.g. "$0 annual fee", "6.49% APR", "0.04% APY")
  terms?: string;   // key terms line (e.g. "Variable APR 19.24%–29.24%", "15/20/30-yr fixed", "$100 min opening deposit")
}
```

Populate `pricing` and `terms` for every product across all 9 categories using publicly-referenced Bank of America values where available, and clearly-representative figures otherwise. Coverage by category:

- **Credit Cards** — annual fee + purchase APR range (e.g. Customized Cash: `$0 annual fee` / `Variable APR 19.24%–29.24%`; Premium Rewards Elite: `$550 annual fee` / `$300 airline incidental + $150 lifestyle credits`).
- **Debit & Checking** — monthly fee + waiver conditions (e.g. Advantage Plus: `$12/mo` / `Waived with $250 direct deposit or $1,500 min balance`).
- **Savings & CDs** — APY + minimum (e.g. Advantage Savings: `0.04% APY standard` / `Up to 0.04–0.04% with Preferred Rewards; $100 min`; Featured CD: `Promotional APY, 7–13 mo terms` / `$1,000 minimum`).
- **Home Loans** — sample rate + term/structure (e.g. 30-yr Fixed: `~6.75% APR (sample)` / `15/20/30-yr; 3% min down with PMI`; HELOC: `Variable, Prime + margin` / `10-yr draw / 20-yr repay`).
- **Auto & Personal Lending** — APR range + max term (e.g. New Auto: `From 6.29% APR` / `12–75 mo, up to $100k`).
- **Investing — Merrill** — commission/advisory fee + minimum (e.g. Self-Directed: `$0 online equity & ETF trades` / `No minimum`; Guided Investing: `0.45% annual advisory fee` / `$1,000 minimum`; ML Wealth Management: `Advisor-negotiated fee` / `Typically $250k+ minimum`).
- **Wealth & Private Bank** — fee structure + eligibility (e.g. Private Bank: `Custom advisory fee schedule` / `Typically $3M+ investable assets`).
- **Small Business & Insurance** — monthly fee/rate + limits (e.g. Business Fundamentals Checking: `$16/mo` / `Waived with $5k avg balance or $250 card spend`; SBA 7(a): `Prime + 2.75%–4.75%` / `Up to $5M, 10–25 yr terms`).
- **Protection & Services** — fee + limit (e.g. Balance Assist: `$5 flat fee` / `$100–$500, repay in 3 monthly installments`; Overdraft Protection: `$0 transfer fee` / `Linked deposit or credit account`; Zelle/Erica/Digital: `Free` / `Included with eligible accounts`).

All values will be labeled as reference/sample pricing (see UI note below) so nothing reads as a live rate quote.

## 2. Update `src/components/tepilot/insights/ProductsCatalogView.tsx`

Extend each product card to render pricing and terms beneath the tagline:

```text
┌─────────────────────────────────────────────┐
│ Product Name                        [badge] │
│ Tagline text…                               │
│ ─────────────────────────────────────────── │
│ 💲 Pricing  $0 annual fee                    │
│ 📄 Terms    Variable APR 19.24%–29.24%       │
└─────────────────────────────────────────────┘
```

Details:
- Add a thin `border-t border-slate-100` divider under the tagline, then a 2-row key/value grid.
- Use `DollarSign` icon for pricing row, `FileText` icon for terms row (both `w-3.5 h-3.5 text-slate-400`).
- Labels in `text-[10px] uppercase tracking-wider text-slate-400 font-medium`; values in `text-[12px] text-slate-700`.
- If a product has no `pricing`/`terms` (shouldn't happen after step 1), gracefully omit that row.
- Add a small footnote under the category subtitle area (top of view): `Pricing shown is reference/sample. Not a live rate quote.` — `text-[11px] text-slate-400`.
- Keep strict light theme (white cards, slate-200 borders, no `dark:` utilities). No other layout changes.

## 3. Out of scope

- No changes to Automated Flows, Campaign Builder, Pricing page, or any other tab.
- No changes to `BANK_PRODUCT_TOTAL` logic or category structure.
- No backend/edge function changes.

## Technical notes

- Files touched: `src/lib/bankProductCatalog.ts`, `src/components/tepilot/insights/ProductsCatalogView.tsx`.
- Type change on `BankProduct` is additive (optional fields) so no other consumer of the catalog breaks.
- After edit, run `tsgo` to confirm typecheck.
