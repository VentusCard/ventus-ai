# Add Features to Personalized Deals Key Features Card

## Goal
Add three new capability rows to the Key features card in the Personalized Deals (rewards) personalization tab.

## Change
1. In `src/components/tepilot/insights/personalization/SurfaceFeaturePanel.tsx`, append three items to `FEATURES.rewards.items`:
   - **Local Deals and Perks** — detail about geo-targeted merchant and place-based benefits.
   - **Multiple Deal Aggregators** — detail about combining owned, partner, and network offer sources.
   - **Surface Financial Products** — detail about weaving relevant banking products into the rewards experience.
2. Leave the existing four rewards rows unchanged.
3. The card already uses `flex-1` row distribution, so the seven rows will fill the card height evenly.
4. Do not change Product or Relationship feature lists.

## Verification
- Run TypeScript typecheck and production build.
- Use Playwright to view the Personalized Deals tab and confirm all seven feature rows render and fill the Key features card without overflow or excessive whitespace.
