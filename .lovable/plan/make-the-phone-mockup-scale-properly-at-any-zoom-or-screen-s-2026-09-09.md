# Make the phone mockup scale properly at any zoom or screen size

## The problem

The phone mockup currently sizes itself off the browser window height, but everything inside it (photo heights, text sizes, card minimum heights) is hard-coded in fixed pixels, with an extra 1.1x magnification applied on top. That combination only looks right at one particular window size. At 100% zoom on a large screen the phone gets tall and wide while the contents stay small, leaving awkward gaps; at other sizes the same content overflows or crowds.

## The fix: one internal scale for the whole phone

Instead of fixed pixel sizes, the phone becomes self-measuring. Its contents scale off the phone's own width, so the layout looks identical whether the phone is small or large, at 90%, 100%, or 125% zoom.

1. The phone frame declares itself a sizing context and publishes its own width as an internal scale value.
2. Remove the 1.1x magnification hack — it fights the browser's own zoom and blurs edges.
3. Every text size, image height, icon size, padding, and card minimum height inside the three personalization surfaces is re-expressed relative to that scale, with sensible floors and ceilings so text never gets unreadably small on a narrow phone or comically large on a wide one.
4. Vertical proportions (hero photo vs. body vs. pill row in the curated collection card, the product offer card height) become percentages of available space rather than fixed pixel heights, so the phone content always fills its frame with no dead space and no clipping.
5. The phone's outer size gets a healthy aspect-ratio-driven box that respects both available height and available width, so it stays phone-shaped instead of stretching.

## Where the changes land

- `ExecDemoPhoneView.tsx` — frame becomes a container-query context with a `--pv` scale variable; drop `zoom: 1.1`; status bar and bottom tab bar switch to scaled sizes.
- `CustomerMockupPanel.tsx` — phone box sizing switches from the height-only formula to an aspect-ratio box bounded by both column width and available height.
- `src/styles/components.css` — a small set of phone-scale utility classes (text steps, spacing steps) defined once via `clamp()` on the container width, so all surfaces share one type ramp.
- `GeneratedOffersPhoneView.tsx`, `ProductCardsPhoneView.tsx`, `RelationshipPhoneView.tsx`, `ConsumerAIChatView.tsx` — fixed `text-[11px]`-style classes and pixel heights replaced with the shared scale classes and proportional heights.

## Verification

Screenshot all three personalization tabs with a customer selected at three window sizes (roughly 1280, 1440, and 1920 wide) and confirm the layouts are visually identical in proportion, with no clipping, no empty space at the bottom of the phone, and legible text in every case.

## Scope guardrails

Visual sizing only. No changes to deal/product/chat content, data, or behavior. The same phone component is also used on the exec demo page, so that page gets a matching pass to confirm nothing regresses there.
