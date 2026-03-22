

## Rename "Segment Targeting" → "Financial Journey" + Add Product Catalog Overview

### What changes

**1. `src/components/tepilot/insights/AnalyticsContainer.tsx`**
- Rename tab label from "Segment Targeting" to "Financial Journey"
- Change icon from `Target` to `Route`

**2. `src/lib/financialJourneyData.ts`** (NEW)
- Define a comprehensive consumer banking product catalog organized by category, expanding the existing 44 products with any missing ones (e.g., annuities, HSA, safe deposit, wire/ACH services, foreign exchange, private banking, trust & estate services)
- Each product includes: `name`, `category`, `penetrationRate`, `customerCount` (mock), `revenuePerCustomer`, and `nextProductOpportunities` (array of related upsell/cross-sell product names)
- Categories expanded to cover the full bank: Credit Cards, Deposit Accounts, Loans & Lending, Investment Products, Insurance, Digital Services, Wealth Management, Estate & Trust Services
- Summary stats: total products, total customers mapped, avg products per customer

**3. `src/components/tepilot/campaigns/FinancialJourneyHeader.tsx`** (NEW)
- A compact header section rendered above the existing Automated Flows / Campaigns switcher
- Shows a grid of all product categories as cards, each listing product count, total customers, and top opportunity
- Summary metrics row: Total Products, Avg Products/Customer, Top Cross-Sell Opportunity, Revenue Pipeline
- Clicking a category card scrolls/highlights relevant products — purely visual context, no navigation away from automation tools

**4. `src/components/tepilot/campaigns/SegmentTargetingView.tsx`** (UPDATE)
- Import and render `FinancialJourneyHeader` above `CampaignStudio`

### What stays the same
- `CampaignStudio.tsx` — completely untouched (Automated Flows + Campaigns mode switcher, all dimension selectors, AI brief generation)
- `AutomatedFlowsSection.tsx` — untouched
- All campaign components — untouched
- `/demo` page — untouched

