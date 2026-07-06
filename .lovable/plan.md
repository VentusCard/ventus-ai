## Change input source indicator from dot to numbered circle badge

### What
Replace the small green pulse-dot in the top-right corner of each SourceGroupCard with a green circular badge showing the number of inputs that source provides.

### Where
`src/components/tepilot/insights/CapabilitiesView.tsx`

### How
1. Locate the `SourceGroupCard` component (line ~542).
2. Replace the `absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse` span with a styled badge:
   - `absolute top-2 right-2`
   - Circular shape with a border and emerald green styling
   - Display `group.inputs.length` as centered text
   - Keep sizing proportional to the card (e.g. `w-5 h-5` with `text-[10px]` font)
   - Remove the `animate-pulse`
3. Ensure the badge remains readable against both the default white card background and the active/emerald-tinted state.

### Verification
- Visual check: each source card on the left shows a green circle with its input count.
- No clipping or overlap with card content.
