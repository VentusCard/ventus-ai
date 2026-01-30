
# Sophisticated Animated Gradient Background

## Overview
Transform the hero background into a premium, animated gradient mesh effect inspired by modern design trends (Apple, Stripe, Linear). The new background will feature flowing color waves, aurora-like effects, and sophisticated color transitions that create an immersive, high-end feel.

---

## Design Concept

**Visual Elements:**
- **Animated Gradient Mesh**: Multiple overlapping gradients that smoothly blend and shift colors
- **Aurora Borealis Effect**: Flowing light ribbons that animate across the screen
- **Gradient Wave Animation**: Gentle wave-like motion in the color fields
- **Spotlight Effects**: Subtle moving light sources that create depth
- **Glass Morphism Layer**: Frosted overlay that adds sophistication

**Color Palette:**
- Deep indigo/navy base: `hsl(220, 50%, 8%)`
- Electric blue accents: `#3b82f6`
- Violet highlights: `#8b5cf6`
- Cyan touches: `#06b6d4`
- Subtle pink/magenta: `#ec4899`

---

## Technical Implementation

### 1. New AnimatedGradientBackground Component

Create a new component that replaces/enhances `GradientOrbs.tsx` with:

**Layer 1 - Base Gradient Mesh:**
- Full-screen animated conic gradients
- Multiple overlapping gradients with different rotation speeds
- Smooth hue rotation animation

**Layer 2 - Aurora Ribbons:**
- SVG-based flowing curves with gradient fills
- Animated along paths with varying speeds
- Blur and glow effects for soft light appearance

**Layer 3 - Moving Spotlight:**
- Large radial gradients that slowly traverse the screen
- Creates dynamic lighting effect
- Responds to mouse position (existing parallax)

**Layer 4 - Glass Overlay:**
- Subtle frosted glass effect
- Adds depth and sophistication
- Helps text readability

### 2. New CSS Animations (`tailwind.config.ts`)

```text
New keyframes:
- gradient-rotate: 360deg rotation for conic gradients (20s cycle)
- gradient-shift: Background position animation (15s cycle)
- aurora-flow: Path animation for aurora ribbons (12s cycle)
- hue-rotate: Subtle hue shift animation (30s cycle)
- spotlight-drift: Large circular motion (25s cycle)
- wave-motion: Sine-wave-like vertical movement
```

### 3. Gradient Mesh Implementation

Using CSS `conic-gradient` and `radial-gradient` with animation:

```text
Layer structure:
+--------------------------------------------------+
|  [Animated Conic Gradient - slow rotation]       |
|    +--------------------------------------------+|
|    | [Radial Gradient Spots - floating]        ||
|    |   +----------------------------------------+|
|    |   | [Aurora SVG Ribbons - flowing]        ||
|    |   |   +------------------------------------+|
|    |   |   | [Spotlight - mouse responsive]    ||
|    |   |   |   +--------------------------------+|
|    |   |   |   | [Glass/Noise Overlay]         ||
+--------------------------------------------------+
```

---

## File Changes

### `src/components/hero/GradientOrbs.tsx` - Complete Redesign

Transform into `AnimatedGradientBackground` with:

**New elements:**
1. **Conic gradient base** - Rotating color wheel effect
2. **Multiple radial gradient layers** - Different blend modes
3. **Aurora SVG component** - Inline flowing light ribbons
4. **Animated mesh blobs** - Morphing gradient shapes
5. **Spotlight overlay** - Large moving light source
6. **Enhanced noise texture** - More visible grain for depth

**Animation approach:**
- Use CSS custom properties for animation values
- Leverage `mix-blend-mode` for color interactions
- Apply `backdrop-filter: blur()` for glass effects
- Use SVG `animate` elements for aurora flow

### `tailwind.config.ts` - New Animation Keyframes

Add sophisticated animation keyframes:

| Keyframe | Duration | Effect |
|----------|----------|--------|
| `gradient-rotate` | 20s | Full 360deg rotation |
| `gradient-shift` | 15s | Background position shift |
| `aurora-wave` | 8s | Vertical wave motion |
| `hue-dance` | 30s | Subtle hue rotation |
| `spotlight-wander` | 25s | Circular spotlight drift |
| `mesh-breathe` | 10s | Scale + opacity pulse |

---

## Visual Effect Details

### Animated Conic Gradient
```text
Background layers:
1. conic-gradient(from var(--angle), colors...) - rotates via CSS animation
2. radial-gradient(ellipse at 20% 30%, blue transparent)
3. radial-gradient(ellipse at 80% 70%, purple transparent)
4. Blend mode: screen/overlay for rich color mixing
```

### Aurora Ribbons
- 2-3 flowing SVG paths positioned across the screen
- Animated `d` attribute or `stroke-dashoffset` for flow effect
- Gradient stroke with glow filter
- Very subtle opacity (0.1-0.2) for ethereal look

### Spotlight Effect
- Large (800px+) radial gradient
- Animates in circular or figure-8 pattern
- Responds to mouse via existing parallax
- Creates dynamic "breathing" light effect

---

## Performance Considerations

- Use `will-change: transform` on animated elements
- Limit blur radius to prevent GPU strain
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Consider `prefers-reduced-motion` media query for accessibility

---

## Summary

| Current | New |
|---------|-----|
| Static gradient orbs | Animated gradient mesh |
| Simple float animations | Rotating/flowing animations |
| Basic radial gradients | Conic + radial + linear gradients |
| Single noise texture | Multi-layer glass effect |
| Floating orbs | Aurora ribbons + spotlights |

This creates a premium, Apple/Stripe-inspired animated background that feels sophisticated and modern while maintaining excellent performance.
