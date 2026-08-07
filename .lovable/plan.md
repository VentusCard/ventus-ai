# Trim generic Demographic signals in /bankdemo System tab

## Goal
Make the **Demographic** expanded card in `/bankdemo` → **System** tab more insightful by removing generic KYC-style attributes and keeping behaviorally/financially inferred life-stage and household signals.

## Changes

1. **Edit `src/components/tepilot/insights/CapabilitiesView.tsx`**
   - In the `Demographic` signal block (currently lines 162–180), remove these four generic items:
     - `Age range`
     - `Income band`
     - `Region`
     - `Account tenure`
   - Keep all remaining items, including life-stage and financially-relevant signals:
     - `Likely homeowner`
     - `Parent of young children`
     - `Parent of school-age`
     - `Dual-income household`
     - `Pre-retiree / empty nester`
     - `Self-employed / 1099 household`
     - `Small business owner`
     - `Multi-property household`
     - `Rental income earner`
     - `Household with dependents in college`
     - `High-net-worth indicator`
     - `Recently relocated household`
     - `Beneficiary reasoning`
   - Optionally tighten the block description from "Household and life-stage attributes inferred from spend patterns, going beyond KYC fields" to something like "Behaviorally inferred household and life-stage attributes with direct product and timing implications."

## Out of scope
- No changes to other signal families (Spending Habits, Life Events, Financial, Risk).
- No backend or logic changes; this is a static copy edit in the System tab data.

## Verification
- Run the TypeScript check to confirm no syntax errors from the edit.
- Optionally open `/bankdemo` → **System** tab → **Demographic** card and confirm the removed items no longer appear and the remaining list renders correctly.
