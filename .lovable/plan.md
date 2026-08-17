# Expand Banking Product Catalog in Automated Flows

## Goal
Add a curated set of new banking products to the `/bankdemo` Automated Flows catalog (`src/lib/productAutomatedFlows.ts`) so the page covers more retail, affluent, small-business, and protection use cases while keeping the existing 5-category structure and light-theme UI intact.

## Proposed Additions

### Existing category fills
1. **Lending**
   - RV / Boat Loan
   - Motorcycle Loan
   - Construction Loan
   - Lease Buyout Loan

2. **Deposits**
   - Money Market Account
   - Teen / Youth Savings
   - Holiday Club Savings

3. **Cards**
   - Secured Credit Card
   - Student Credit Card
   - Business Credit Card

4. **Insurance**
   - Pet Insurance
   - Identity Theft Protection
   - Disability Insurance
   - Auto Insurance

5. **Wealth**
   - 401(k) Rollover Service
   - ABLE / Special Needs Savings
   - Financial Planning Subscription

## Implementation
1. Update `FlowCategory` union in `src/lib/productAutomatedFlows.ts` to include `Business Banking` and `Protections & Services`.
2. Add new `ProductFlow` entries with semantic life-event and behavioral signals, estimated audience, penetration, and Lucide icons.
3. Import any additional Lucide icons needed.
4. Verify `ProductAutomatedFlowsView.tsx` correctly groups and counts the new categories without hardcoded totals.
5. Run TypeScript check and capture a preview screenshot of the Automated Flows tab.

## Out of scope
- No backend or edge-function changes.
- No changes to the autonomous activity feed, campaign builder, or navigation structure.
- No dark-mode or visual style changes beyond what the existing components already provide.
