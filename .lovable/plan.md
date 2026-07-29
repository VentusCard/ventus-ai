Update `src/components/solutions/CampaignStudioPreview.tsx` so each of the 6 segment email drafts includes a clearly styled `$xx.xx` placeholder representing the per-household personalized annual benefit calculation.

## Changes

1. **Draft body copy** — In each of the 6 segment entries (Dining-led, Grocery-led, Commuter, New Parents, Just Moved, Empty-nest), insert a sentence like:
   > "Based on your last 90 days of spend, we estimate **$xx.xx** back per year on this card."
   The `$xx.xx` is rendered as a visibly-templated token (monospace chip, dashed border) to signal it's a per-recipient merge field, not a static number.

2. **Value Math chip row** — Replace the current hardcoded "~$237/yr" style chip with a two-part chip:
   - Left: signal-based math (e.g., "3% Dining + 2% Grocery")
   - Right: `$xx.xx / yr` placeholder chip in the same templated style

3. **Legend note** — Add a small caption under the drafts: *"`$xx.xx` = personalized per-household calculation from the last 90 days of transactions"* so viewers understand it's a merge token.

4. No changes to segment list, population bars, rotation logic, product header, or branding.

## Technical notes

- Introduce a tiny `<MergeToken>` inline span component (dashed border, monospace, subtle amber tint) reused across body copy and the value-math chip so the placeholder reads consistently.
- Keep strict light theme — no `dark:` utilities, no hardcoded colors outside existing tokens.
