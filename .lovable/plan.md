# Plan: Products tab (Home › Products)

Add a new top-level **Products** tab to the Home group in the `/bankdemo` sidebar, positioned directly below **System** and above **Demo**. It serves as a static, visual catalog of every product Bank of America offers — to act as the future single source of truth for downstream views. Display-only for now (no wiring into Next-Product, Campaign Studio, etc.).

## What gets built

### 1. New catalog data file
`src/lib/bankProductCatalog.ts`

A typed, comprehensive itemization of BofA's public product lineup, grouped into 8 categories. Each entry: `{ id, name, tagline, highlight?, badge? }`.

Categories and items (~75 products):

- **Credit Cards** (12): Customized Cash Rewards, Unlimited Cash Rewards, Travel Rewards, Premium Rewards, Premium Rewards Elite, BankAmericard, BankAmericard Secured, Susan G. Komen Cash Rewards, Alaska Airlines Visa, Alaska Airlines Business, Air France KLM World Elite, Free Spirit Travel More World Elite.
- **Debit & Checking** (6): Advantage SafeBalance Banking, Advantage Plus Banking, Advantage Relationship Banking, Preferred Rewards member tiers (Gold/Platinum/Platinum Honors/Diamond), SafeBalance for students, Custom Debit Card.
- **Savings & CDs** (5): Advantage Savings, Featured CD, Fixed-Term CD, Flexible CD, Minor Savings (custodial).
- **Home Loans** (8): Fixed-rate Mortgage, Adjustable-Rate Mortgage, FHA Loan, VA Loan, Affordable Loan Solution, Jumbo Mortgage, HELOC, Mortgage Refinance.
- **Auto & Personal Lending** (5): New Auto Loan, Used Auto Loan, Auto Refinance, Lease Buyout, Vehicle Equity Loan.
- **Investing — Merrill** (10): Self-Directed Investing, Guided Investing, Guided Investing with Advisor, Merrill Lynch Wealth Management, Traditional IRA, Roth IRA, Rollover IRA, SEP IRA, 529 Plan, Custodial UGMA/UTMA.
- **Wealth & Private Bank** (6): Bank of America Private Bank, Trust Services, Estate Planning, Philanthropic Solutions, Specialty Asset Management, Family Office Services.
- **Small Business & Insurance** (8): Business Advantage Checking, Business Advantage Savings, Business Credit Cards (Customized Cash / Unlimited Cash / Travel Rewards / Platinum Plus / Unlimited Cash Secured), Business Line of Credit, SBA Loans, Practice Solutions, Equipment Financing, Merchant Services.
- **Protection & Services** (6): Balance Assist short-term loan, Overdraft Protection, Identity Protection, Mobile & Online Banking, Zelle, Erica AI Assistant.

Exports: `BANK_PRODUCT_CATEGORIES` (ordered array with `{ id, label, icon, accent, products[] }`) and the underlying `BankProduct` type so future consumers can import.

### 2. New view component
`src/components/tepilot/insights/ProductsCatalogView.tsx`

- Uses the standard `TabHeader` (title "Product Catalog", subtitle naming Bank of America as the reference institution, plus how-it-works / why-it-matters copy framing this as the single source of truth feeding downstream personalization).
- Top summary strip: 4 small stat tiles — total products, total categories, "single source of truth" label, and a static "Reference: Bank of America" pill.
- Renders each category as a section: category header (icon + label + product count), then a responsive grid of compact product cards (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`). Cards follow the existing light-theme convention: `bg-white border border-slate-200 rounded-lg p-4`, icon chip in the category accent color, product name in semibold slate-900, tagline in slate-500.
- Strict light theme, Manrope font (inherits), no dark-mode utilities, no Ventus signature badges.

### 3. Wire into AnalyticsContainer
`src/components/tepilot/insights/AnalyticsContainer.tsx`

- Add `'products'` to the `TabValue` union.
- Add `{ value: "products", label: "Products", icon: Package }` to the Home group, inserted between System and Demo.
- Add `case 'products': return <ProductsCatalogView />;` in `renderContent`.
- Import the new view and reuse the already-imported `Package` icon.

## Out of scope (explicit)

- No changes to Next-Product, Campaign Studio, Automated Flows, or any downstream consumer — they continue to read their existing data sources. Wiring them to this catalog will be a separate pass when the user requests it.
- No edge function, no DB table, no migration — pure static TypeScript data.
- No new routes; lives entirely inside `/bankdemo`.
