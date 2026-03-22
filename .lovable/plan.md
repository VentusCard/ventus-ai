

## Make Pillar Question Text Full-Width and Larger

The three question subtitles (e.g., "Who are they, where do they spend & move money?") are currently small (9-11px) and left-aligned with an icon. They should span the full width of the row and be more prominent.

### Changes — `DemoNetworkDiagram.tsx`

**Line 308-311** — Update the question row styling:
- Increase font size: `text-[9px]` → `text-[12px]`, `text-[11px]` → `text-[14px]` (centered)
- Remove the small icon prefix (or keep it but enlarge it)
- Let the text span the full width with slightly more padding
- Use `font-semibold` instead of `font-medium` for better stage readability

### File Modified
- `src/components/demo/DemoNetworkDiagram.tsx` — enlarge pillar question text

