# Section 4 signal pop-up readability audit

## Confirmed findings
- Opened all 14 signal pop-ups in the live deck at 1903 × 1024: 11 contain supporting transactions and three contain outside evidence.
- The Rail column is only 64px wide, including cell padding. “Premium Card” and “Cashback Card” are clipped in multiple pop-ups.
- Original descriptions and several subcategory lists are also truncated. The table currently hides overflow and compresses its columns into the available width.

## Proposed changes
1. **Show full rail names.** Reserve enough width for every existing rail, remove rail truncation, and keep Rail as the first column.
2. **Make every existing table field readable.** Rebalance column widths for dates, original descriptions, amounts, merchants, categories, subcategories, and frequency. Permit up to two text lines per transaction; do not depend on hover to read the existing values.
3. **Fit the table without squeezing it.** Allow a wider pop-up on large desktops, retain safe screen-edge margins, and provide horizontal table scrolling on narrower desktops rather than cutting off or compressing columns. Keep the /demo-style grouped headers and raw/enriched divider.
4. **Audit the whole pop-up.** Check titles, summaries, key details, merchant labels, monthly payments, and outside evidence for wrapping and clipping. Keep all content reachable through vertical scrolling, with the close control accessible.

## Preserve
- Existing signal wording, transaction data, classifications, payment calculations, and frequency values; no enrichment-rule changes or extra columns in this task.
- Family colors, strict light theme, pill interactions, both reveal steps, and slide-navigation behavior.
- The Section 4 story layout outside the pop-ups.

## Technical details
- Scope presentation changes to `src/components/deckmo/RickySignalStory.tsx` and deck-specific rules in `src/styles/base.css` as needed; do not change the shared pop-up component.
- Start with approximately 120px for Rail and a roughly 1400px minimum table width; tune against actual content so all existing values fit within two lines.
- Use screen-constrained pop-up sizing and a dedicated horizontal table scroll area. Keep vertical scrolling for long detail lists.

## Verification
- Open every signal pop-up at 1903 × 1024, 1691 × 1011, 1376 × 842, and 1024 × 768.
- Inspect every supporting row, including the longest raw strings, hospital merchant name, subcategory combinations, and largest amount. Confirm full rail names and no hidden information.
- Verify table scrolling reaches both edges, detail scrolling reaches the final transaction, and all three external evidence panels remain complete.
- Check closing by X, Escape, and outside click; opening a pop-up must not advance the slide.
- Run existing deck regression tests and check the latest preview diagnostics. Confirm the live preview serves the changed layout before reporting completion.