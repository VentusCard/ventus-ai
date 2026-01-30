
# New Hero Design: Abstract Gradient with Animated AI Graphics

## Overview
Replace the current credit card video hero with a clean, modern design featuring bold typography as the focal point, complemented by subtle animated AI/data visualization graphics. The design will feel sophisticated, tech-forward, and aligned with the "transaction intelligence" positioning.

---

## Design Concept

**Visual Style:**
- Dark gradient background with subtle color shifts (blues, purples, indigos)
- Animated floating data nodes/particles in the background
- Glowing connection lines between nodes representing data flow
- Clean typography with the brushstroke animation retained for "consumer intelligence"

**Layout:**
- Centered text hierarchy (headline, subheading, CTA)
- Animated SVG graphics positioned around the text
- Subtle gradient orbs/blobs that gently animate

---

## Technical Implementation

### 1. Remove Video, Add Animated Background (`src/components/Hero.tsx`)

**What's changing:**
- Remove the video element and its intersection observer logic
- Add animated SVG elements representing data nodes and connections
- Add floating gradient orbs that slowly animate
- Add animated particles/dots moving across the background

**New visual elements:**
```text
+--------------------------------------------------+
|                                                  |
|     ○───○        (floating data nodes)           |
|       ╲                                          |
|    ○───○──○                                      |
|                                                  |
|     Turn transaction data into                   |
|     ~~~consumer intelligence~~~                  |
|                                                  |
|     Beyond basic enrichment...                   |
|                                                  |
|         [ Schedule Demo ]                        |
|                                                  |
|          ○──○                                    |
|            ╲───○     (more floating nodes)       |
+--------------------------------------------------+
```

### 2. Animated Data Network SVG Component

Create floating animated nodes with:
- **Nodes**: Small glowing circles that fade in/out
- **Lines**: Connecting paths that draw themselves
- **Movement**: Gentle floating animation on the network
- **Glow effects**: Subtle pulse on nodes

### 3. Gradient Orb Animations

Add soft gradient blobs that:
- Float slowly in the background
- Use CSS blur for a soft glow effect
- Colors: Primary blues, soft purples, subtle teals

### 4. New Animation Keyframes (`tailwind.config.ts`)

Add new keyframes:
- `float-slow`: Gentle vertical floating (slower than current)
- `pulse-glow`: Subtle glow pulsing for nodes
- `draw-line`: SVG line drawing animation
- `fade-float`: Combined fade + float for staggered entrance

---

## File Changes

### `src/components/Hero.tsx` - Complete Redesign

**Remove:**
- Video element and videoRef
- Intersection observer useEffect
- Video-related gradient overlays

**Add:**
- Animated SVG network visualization component
- Floating gradient orb elements
- Enhanced background gradients
- Staggered entrance animations for text elements

**Keep:**
- Main headline structure with brushstroke animation
- "Schedule Demo" CTA button
- Dark theme color scheme

### `tailwind.config.ts` - New Animations

Add keyframes:
```text
float-slow: Gentle Y movement over 8-10s
pulse-glow: Opacity + scale pulse for glowing nodes
draw-line: Stroke-dashoffset animation for line drawing
particle-drift: Subtle horizontal + vertical drift
```

---

## Visual Elements Detail

### Data Network SVG
- 8-12 nodes positioned strategically around the hero
- Connecting lines that animate on page load
- Nodes have subtle glow/pulse effect
- Entire network floats gently

### Gradient Orbs
- 2-3 large blurred gradient circles
- Positioned behind text for depth
- Colors: `#3b82f6` (blue), `#8b5cf6` (violet), `#06b6d4` (cyan)
- Very slow floating animation (10-15s cycle)

### Text Animations
- Headline fades up with stagger
- Subheading fades in slightly delayed
- Button fades in last
- Brushstroke animation on "consumer intelligence" retained

---

## Summary

| Element | Change |
|---------|--------|
| Video | Removed entirely |
| Background | Dark gradient + animated orbs |
| Visual focal point | Animated data network SVG |
| Typography | Kept with enhanced entrance animations |
| CTA Button | Kept with fade-in animation |
| Mobile responsive | Simplified animations on mobile |

This creates a modern, sophisticated hero that emphasizes Ventus AI's data intelligence focus while maintaining excellent performance (no video loading) and a cleaner aesthetic.
