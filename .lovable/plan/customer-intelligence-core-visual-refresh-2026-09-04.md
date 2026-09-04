# Customer Intelligence Core visual refresh

## Goal
Update the Systems tab's "Customer Intelligence Core" panel so it feels lighter and the five signal-family cards read as full-color, matching the family cards in the Intelligence Database tab.

## Current state
- The core panel sits on a dark navy background (`bg-[#141432]`) inside `src/components/tepilot/insights/CapabilitiesView.tsx`.
- Each signal card uses a dark translucent family tint (`bg-{color}-600/30`) with white text.
- The Intelligence Database tab (right side of `/bankdemo`) already renders the five families as light, full-color cards using `SIGNAL_FAMILY_META` tokens (`bg-{color}-100/80`, `border-{color}-500`, etc.).

## Changes
1. **Lighter gradient background for the core panel**
   - Replace the dark navy container with a light blue gradient background (e.g., `bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50`).
   - Keep the rounded-xl container and padding.
   - Update header text and meta line to dark slate for legibility.

2. **Full-color signal cards**
   - Map each of the five `SIGNALS` entries to the matching `SIGNAL_FAMILY_META` token set.
   - Apply the family's `tint`, `cardBorder`, `cardBorderHover`, `cardRing`, and `chip` classes to each card.
   - Switch card text from white-on-dark to the family's dark text color (e.g., `text-blue-900` for Behavioral).
   - Keep the left accent bar, icon chip, pulse dot, 24h count, and rolling ticker.
   - Preserve active and hover states using the meta tokens.

3. **Preserve behavior**
   - Clicking a card still selects the family and reveals the shared detail panel below.
   - The walkthrough gray-out logic remains unchanged.
   - Rolling ticker animation and `PulseDot` halo continue to work.

## Verification
- Type-check and build the project.
- Open `/bankdemo` → Systems tab → step through the workflow walkthrough to confirm the core panel renders with the lighter gradient and full-color cards.
- Confirm text contrast and active/hover states are readable.
