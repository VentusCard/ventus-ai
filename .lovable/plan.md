Make the three delivery-channel option buttons look more obviously clickable.

Current issue: inactive buttons are transparent ghost-style with no border, so they read as plain text rather than buttons.

Changes:
1. Give every option a consistent button shell — subtle border (`border border-slate-200`), soft background (`bg-white`), and a hover lift (`hover:shadow-sm`).
2. Keep the active state visually stronger: retain the accent-colored ring + soft shadow, and add a slightly tinted background (`bg-{accent}/5`).
3. Ensure the icon container and label colors still distinguish active vs. inactive, but every cell now looks like a tappable card/button regardless of state.
4. No prop or state changes. Purely Tailwind + inline-style adjustments in `ProductDeliveryChannelCard.tsx`.

Technical details
- File: `src/components/exec-demo/ProductDeliveryChannelCard.tsx`
- Replace ghost inactive styling with bordered card styling.
- Keep existing layout, grid, and active-state accent logic intact.