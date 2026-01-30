
# Darken Hero Gradient Animation

## Overview
Reduce the brightness and intensity of the animated gradient orbs/mesh in the hero background while preserving the color palette and animation style. The network overlay (lines, nodes, pulses) will remain unchanged.

## Current State
The `GradientOrbs` component contains several animated layers that are currently too bright:
- Layer 1 & 1b: Rotating conic gradients at 30% and 25% opacity
- Layer 2: Three floating radial gradient spots at 40%, 35%, and 30% opacity with saturated blues, violets, and cyans
- Layer 3: Two soft gradient clouds at 20% and 15% opacity
- Layer 5: Hue-shifting overlay at 8% opacity
- Layer 8: Vignette at 40% opacity

## Changes

### 1. Reduce Rotating Conic Gradient Opacity
**File:** `src/components/hero/GradientOrbs.tsx`

- Layer 1 (primary rotating gradient): `opacity-30` to `opacity-15`
- Layer 1b (secondary rotating gradient): `opacity-25` to `opacity-12`

### 2. Dim Floating Radial Gradient Spots
**File:** `src/components/hero/GradientOrbs.tsx`

Reduce the three floating spots to roughly half their current opacity:
- Blue spot (top-left): `opacity-40` to `opacity-20`
- Violet spot (bottom-right): `opacity-35` to `opacity-18`
- Cyan spot (right-center): `opacity-30` to `opacity-15`

### 3. Reduce Soft Gradient Clouds
**File:** `src/components/hero/GradientOrbs.tsx`

- Top cloud: `opacity-20` to `opacity-10`
- Bottom cloud: `opacity-15` to `opacity-08`

### 4. Reduce Hue-Shifting Overlay
**File:** `src/components/hero/GradientOrbs.tsx`

- Hue-dance overlay: `opacity-[0.08]` to `opacity-[0.04]`

### 5. Strengthen Vignette (Anchor Edges Darker)
**File:** `src/components/hero/GradientOrbs.tsx`

- Increase vignette opacity from `0.4` to `0.6` so the edges of the hero are darker, making the center gradient feel less expansive

---

## Technical Summary

| Layer | Current Opacity | New Opacity |
|-------|----------------|-------------|
| Conic gradient (Layer 1) | 30% | 15% |
| Conic gradient reverse (Layer 1b) | 25% | 12% |
| Blue radial spot | 40% | 20% |
| Violet radial spot | 35% | 18% |
| Cyan radial spot | 30% | 15% |
| Top gradient cloud | 20% | 10% |
| Bottom gradient cloud | 15% | 8% |
| Hue-dance overlay | 8% | 4% |
| Vignette | 40% | 60% |

## Files Modified
- `src/components/hero/GradientOrbs.tsx`

## Visual Result
The animated gradient mesh will retain its color palette and motion but appear significantly darker and more subdued, allowing the hero content (headline, subheading, button) to stand out while blending seamlessly into the dark page below.
