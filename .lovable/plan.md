# Fix phone mockups at full width

## Goal
Keep the three personalization phone mockups elegant and proportionally consistent at full browser width, 100% zoom, and 90% zoom without changing their content or behavior.

## Confirmed issue
The current outer phone width is calculated from panel height (`60cqh`), while the inner interface scales from width alone. At wider viewports this makes the phone and its contents grow too aggressively; the Deals collection image becomes oversized and the visual balance differs across screen sizes.

## Changes
1. Replace the height-only outer sizing with a bounded phone aspect ratio that respects both the available panel width and height.
2. Update the shared phone scaler to fit its fixed design canvas against both measured width and measured height, preventing enlargement or clipping at full width.
3. Remove the scale limits and flexible deal-card behavior that fight the shared proportional layout; keep each surface’s intended visual hierarchy within the common canvas.
4. Preserve the current customer selection, tabs, deal carousel, product cards, chat behavior, and all displayed content.

## Verification
- Check Personalized Deals, Personalized Product, and Personalized Relationship with a selected customer.
- Compare 100% and 90% browser zoom at standard and full-width desktop sizes.
- Confirm the complete frame, bottom navigation, and primary content remain visible and balanced with no dead space, clipping, overlap, or console errors.
- Recheck the shared phone on the executive demo so the correction does not regress that view.

## Technical details
Use one stable design width and phone aspect ratio, with a `ResizeObserver`-driven `min(widthScale, heightScale)` calculation. The outer wrapper will use container-relative width/height bounds rather than a single `cqh` width formula.
