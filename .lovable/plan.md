# Keep Financial card, but stop subtracting it from the addressable count

Financial signals should still display in the 5-card grid, but they must not reduce the addressable audience. Today, for products where `relevance.financial === "flag"`, the funnel removes those users and the card shows `−N excluded`.

## Changes

File: `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`

1. **Exclude financial from funnel subtraction.** When calling `buildAudienceFunnel`, merge `"financial"` into the `disabled` set passed in (without affecting the user-controlled `disabled` state). Existing logic in `buildAudienceFunnel` already treats disabled families as "don't subtract", so the final addressable count and footer stay correct.
   ```ts
   const funnelDisabled = new Set(disabled);
   funnelDisabled.add("financial");
   const funnel = buildAudienceFunnel(product.estimatedAudience, exclusions, relevance, funnelDisabled);
   ```
2. **Card label override.** In the `.map`, force the financial card off the "flag" branch so it reads `{eligible} users` instead of `−N excluded`:
   ```ts
   const isFlag = rel === "flag" && fam !== "financial";
   ```
3. **Disable toggle.** Financial cards stay non-toggleable (already the case — `canToggle` excludes `financial`).

## Out of scope
- Removing the financial card itself.
- Changing `buildAudienceFunnel` internals (we use the existing `disabled` mechanism).
- Other families' behavior.
