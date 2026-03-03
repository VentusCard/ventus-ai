

# Enhance HeroRewardsCard with TePilot-Level Details

## Goal
Upgrade the hero animation on the Consumer Rewards page from a simple tags + match bars card into a richer preview that showcases **personalized messaging** and **cross-category recommendations** -- the two capabilities we just added to the product description.

## What Changes

### Enhanced Data Model
Replace the flat `offers` array with richer deal objects inspired by VentusSmartRewards:

```text
Current:  { name: "REI 10% Back", match: 96 }

Enhanced: {
  brand: "GoPro",
  offer: "15% off HERO12",
  match: 94,
  pillar: "Snow Sports",        // lifestyle pillar (not the MCC)
  mcc: "Electronics",           // actual merchant category
  evidence: "$1,129 at Epic Pass",  // transaction that triggered match
  personalized: "Capture family ski moments..."  // AI-generated message snippet
}
```

### New Animation Phases (still loops every 6s)

| Phase | Timing | What Appears |
|-------|--------|--------------|
| 0 | 0ms | Customer profile + lifestyle tags fade in |
| 1 | 600ms | First deal slides in with cross-category badge (e.g., "Snow Sports -> Electronics") |
| 2 | 1200ms | Personalized message typewriter-animates below the deal |
| 3 | 2000ms | Second and third deals cascade in |
| 4 | 3500ms | Hold, then fade out and reset |

### Visual Additions per Deal Row
- **Cross-category indicator**: Small pill showing `Snow Sports -> Electronics` to visually communicate cross-MCC matching
- **Personalized message**: 1-line italic snippet below the deal name (truncated, typewriter effect)
- **Transaction evidence**: Tiny "Detected: $1,129 at Epic Pass" line in gray, showing what triggered the match

### Sample Data (3 deals, cycling through one persona)
1. **GoPro** — 15% off HERO12 — cross-category: Snow Sports to Electronics — "Capture family ski moments with waterproof action cam" — evidence: "$1,129 at Epic Pass"
2. **Smith Goggles** — 25% off 4D MAG — same-category: Snow Sports — "Quick-swap lenses for all-condition visibility" — evidence: "$312 at Loon Mountain"
3. **Ikon Pass** — suppressed (dimmed) — "Competing product: already purchased Epic Pass" — shows intelligence, not just matching

### File
`src/components/hero/HeroRewardsCard.tsx` — rewrite the data arrays and add 1-2 new animation phases. Component stays self-contained, no new files needed.

### What This Achieves
- The hero card now **demonstrates** the two key claims in the product description: personalized messaging and cross-category recommendations
- The GoPro-for-skier example (different MCCs, same lifestyle) is front-and-center
- The suppressed deal shows intelligence depth without cluttering the card
- Still compact and loops cleanly on a 6s cycle

