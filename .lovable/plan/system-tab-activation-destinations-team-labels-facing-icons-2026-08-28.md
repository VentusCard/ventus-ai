# System Tab — Activation Destinations: Team Labels → Facing Icons

## Problem
In `/bankdemo` → System tab → "Activation destinations" column, each destination currently shows a colored team pill (Bank Leadership, Product & Growth, Rewards & Deals). The user finds this color scheme confusing because it overlaps with the 5 signal-family palette.

## Goal
Replace the colored team labels with simple **bank-facing** vs **consumer-facing** icons, reducing visual noise and clarifying whether each destination is used internally by the bank or surfaced to the customer.

## Changes

1. **Data model** (`CapabilitiesView.tsx` ~lines 78–84, 303–319)
   - Add a `facing: "bank" | "consumer"` field to the `Destination` type.
   - Tag each destination in `DESTINATIONS` accordingly:
     - **Bank-facing**: Intelligence Database, Ventus AI Coworker, Personalized Relationship, Automations Campaign, Custom Product Builder.
     - **Consumer-facing**: Personalized Product Offer, Personalized Reward Program, Local Merchant Deals, Loyalty & Retention.
   - Remove or deprecate the `TEAMS` color map for this column.

2. **Iconography**
   - Use a building/landmark icon (e.g., `Landmark` from lucide-react) for bank-facing destinations.
   - Use a user/phone icon (e.g., `Smartphone` or `Users`) for consumer-facing destinations.
   - Render the icon in a small, neutral tinted circle or square at the left of each row.

3. **Row redesign** (~lines 1140–1157)
   - Remove the colored left accent bar (`team.color`).
   - Remove the colored team-label pill.
   - Place the facing icon in a subtle slate/blue tinted badge on the left.
   - Keep the destination name as the primary text.
   - Optionally keep the channel name in a faint trailing pill or remove it (the user only mentioned replacing team labels).

4. **Visual consistency**
   - Keep the strict light theme (no dark surfaces).
   - Use only one or two neutral tints for icons so the palette no longer conflicts with signal-family colors.
   - Maintain row height and spacing established in the previous legibility pass.

## Out of scope
- No changes to the Data sources or Customer Intelligence Core columns.
- No changes to walkthrough flow logic.
- No dark-mode utilities.

## Acceptance criteria
- Activation destination rows no longer show colored team pills.
- Each row shows a clear bank-facing or consumer-facing icon.
- The color scheme no longer clashes with the 5 signal-family palette.
- Build passes and `/bankdemo` System tab preview reflects the change.
