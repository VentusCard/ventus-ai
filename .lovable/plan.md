

## Improve Right Panel Space Usage, Font Sizes, and Colors

The right panel (60% of the 560x440px mockup) currently uses small font sizes (8-10px) and muted colors that don't fill the available space well. This plan increases sizes, improves color contrast, and adjusts spacing so the intelligence cards feel more substantial.

### Changes (1 file: `src/components/hero/EnrichmentMockup.tsx`)

**1. Section header — "Personalization Orchestration" (line 515-516)**
- Increase from `text-[10px]` to `text-[11px]`
- Change color from `text-emerald-400` to a brighter white-blue (`text-blue-300`) for better contrast against the dark background

**2. Persona card (Dynamic Persona) — lines 520-555**
- Increase title from `text-[9px]` to `text-[10px]`
- Increase pill text from `text-[8px]` to `text-[9px]`
- Increase padding from `px-2.5 py-2` to `px-3 py-2.5`
- Brighten pill text color from `#60a5fa` to `#93c5fd`

**3. Intelligence cards (Analytics, Rewards, Relationship) — lines 581-661**
- Increase card padding from `px-3 py-2.5` to `px-3.5 py-3`
- Increase card title icon from `fontSize: 12` to `fontSize: 14`
- Increase card title text from `text-[10px]` to `text-[11px]`
- Increase subtitle from `text-[8px] text-gray-500` to `text-[9px] text-gray-400` for better readability
- Increase pill text from `text-[9px]` to `text-[10px]`, padding from `px-2 py-0.5` to `px-2.5 py-1`
- Increase content text from `text-[10px] text-gray-400` to `text-[11px] text-gray-300`
- Reduce gap between cards from `gap-2` to `gap-1.5` to reclaim vertical space for larger content

**4. Color improvements throughout right panel**
- Card accent colors remain as-is (they're already distinct per card type)
- Pill backgrounds: increase opacity from `18` hex to `22` for better visibility
- Revealed card background: from `rgba(255,255,255,0.03)` to `rgba(255,255,255,0.05)` for more definition

These changes make the right panel content ~15-20% larger and more legible while staying within the existing 60% width column and 440px height constraint.

