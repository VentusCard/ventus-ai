

## Plan: Compact Collection Cards for Phone Screen

### Problem
The current deal tiles are too detailed (icon, product, reward badge, boost indicator, CTA button) taking up too much vertical space in the phone mockup. Need to slim down to just merchant name labels.

### Changes

**`src/components/exec-demo/GeneratedOffersPhoneView.tsx`** — Simplify deal tiles:

- Replace the tall deal cards with a **wrapped row of small merchant-name pills** inside the collection card
- Each pill is just: merchant name + reward value (e.g., "Bose · $40 off")
- Use `flex flex-wrap gap-1.5` instead of horizontal scroll — fits naturally in the phone width
- Remove the Gift icon, product subtitle, boost indicator, and CTA button from each tile
- Keep the collection card structure: rollup pill badge → collection message → merchant pills
- Keep the auto-rotation, dots, and arrows unchanged
- Reduce overall padding slightly for a tighter phone fit

Layout per collection card:
```text
┌──────────────────────────────┐
│ ✦ Frequent Traveler          │
│ "Travel smarter with new     │
│  gear and perks"             │
│                              │
│ [Away · 15%] [Bose · $40]   │
│ [TSA · Free] [Samsonite·10%]│
│                              │
│         ● ○ ○                │
└──────────────────────────────┘
```

### No other files change

