

## Add slim Location Experience card to Rewards phone mockup

### What
Add a compact "Welcome to New York" location perks card between the Expiring Soon row and the Collection Carousel. It shows a city welcome header and two nested perk mini-cards (one Art, one Sports) from the hardcoded `INITIAL_PERKS` data.

### Change: `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

**Add a new section between the Expiring Soon block (~line 354) and the Collection Carousel header (~line 356):**

1. **City welcome header**: `MapPin` icon + "Welcome to New York" in 11px bold + "Explore perks for TCBY Members" in 9px slate-500
2. **Two nested perk cards** (hardcoded from `locationPerksData`):
   - **Art**: MoMA Private Viewing — indigo left accent bar, "Art" badge, partner name, value pill
   - **Sports**: Mets Home Game Access — green left accent bar, "Sports" badge, partner name, value pill
3. Each card: `rounded-lg`, left-colored border (4px), compact layout (9-10px text), non-interactive

**New import**: `MapPin` from lucide-react (add to existing import line)

No other files change. The perks are hardcoded inline — no need to import from `locationPerksData`.

### Visual
```text
┌─────────────────────────┐
│ 📍 Welcome to New York  │
│ Explore perks for TCBY  │
│ ┌──┬──────────────────┐ │
│ │▎ │ 🎨 Art            │ │
│ │▎ │ MoMA Private View │ │
│ │▎ │ Free entry        │ │
│ └──┴──────────────────┘ │
│ ┌──┬──────────────────┐ │
│ │▎ │ ⚾ Sports          │ │
│ │▎ │ Mets Home Game    │ │
│ │▎ │ $250/game         │ │
│ └──┴──────────────────┘ │
└─────────────────────────┘
```

