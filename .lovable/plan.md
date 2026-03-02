

## Tighten Spacing Within Intelligence Cards

Reduce internal padding and margins within the right-panel intelligence cards to prevent overflow and make better use of vertical space.

### Changes (1 file: `src/components/hero/EnrichmentMockup.tsx`)

**Card container (line 588)**
- Reduce padding from `px-3.5 py-3` to `px-3 py-2`

**Title row (line 604)**
- Reduce bottom margin from `mb-1` to `mb-0.5`

**Subtitle (line 614)**
- Reduce bottom margin from `mb-1` to `mb-0.5`

**Pills (line 619)**
- Reduce gap from `gap-1.5` to `gap-1`
- Reduce pill padding from `px-2.5 py-1` to `px-2 py-0.5`

**Content text (line 634)**
- Change leading from `leading-relaxed` to `leading-snug`

These changes reclaim roughly 15-20px of vertical space across the three cards, which should resolve the clipping issue for Michael R.'s Relationship Intelligence card at the current 450px height.

