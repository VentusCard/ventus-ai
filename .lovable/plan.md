
# Create Capability Detail Pages

## Overview

Create 4 new detail pages for each capability card on the `/technology` page. Each page will provide an expanded explanation with use cases, benefits, and visual elements. The Technology page cards will become clickable links.

## Routes & Files

| Capability | Route | File |
|------------|-------|------|
| Advanced Transaction Enrichment | `/enrichment` | `src/pages/Enrichment.tsx` |
| Intelligent Reward Personalization | `/smartrewards` | `src/pages/SmartRewards.tsx` |
| Holistic Customer Engagement | `/engagement` | `src/pages/Engagement.tsx` |
| Wealth Management CoPilot | `/wealth` | `src/pages/Wealth.tsx` |

## Page Structure (Each Detail Page)

Each page will follow existing design patterns and include:

1. **Hero Section** - Title, icon, and brief value proposition
2. **Overview Section** - Expanded description of the capability
3. **Key Features Section** - 3-4 feature cards with icons explaining specific functionality
4. **Use Cases Section** - Real-world scenarios where this capability applies
5. **Benefits Section** - Tangible outcomes for financial institutions
6. **CTA Section** - Link back to Technology overview and Schedule Demo button

## Files to Modify

1. **`src/App.tsx`** - Add 4 new routes
2. **`src/pages/Technology.tsx`** - Make cards clickable with links to detail pages

## Files to Create

1. `src/pages/Enrichment.tsx`
2. `src/pages/SmartRewards.tsx`
3. `src/pages/Engagement.tsx`
4. `src/pages/Wealth.tsx`

---

## Technical Details

### Route Configuration (App.tsx)

Add these routes alongside existing ones:
```text
/enrichment     -> Enrichment.tsx
/smartrewards   -> SmartRewards.tsx
/engagement     -> Engagement.tsx
/wealth         -> Wealth.tsx
```

### Technology.tsx Changes

- Wrap each capability card in a `<Link>` component
- Add arrow icon or "Learn More" indicator to show cards are clickable
- Maintain existing hover styling

### Page Content Outline

**1. Enrichment Page (`/enrichment`)**
- Semantic AI analysis beyond merchant name cleaning
- Location patterns, spending velocity, category detection
- Integration with existing banking systems
- Use cases: fraud detection, personalized insights, spending reports

**2. SmartRewards Page (`/smartrewards`)**
- AI-driven purchase persona creation
- Dynamic offer matching based on behavior
- Real-time reward recommendations
- Use cases: increased redemption rates, targeted promotions

**3. Engagement Page (`/engagement`)**
- Unified experience across rewards, perks, and content
- Seamless integration with banking platforms
- Personalized educational content
- Use cases: improved retention, cross-sell opportunities

**4. Wealth Page (`/wealth`)**
- Lifestyle event detection from transactions
- Proactive client engagement triggers
- Administrative task automation
- Use cases: client reviews, life milestone planning

### Styling Approach

- Reuse existing glassmorphism card styles (`border-white/20 bg-white/10 backdrop-blur-sm`)
- Consistent typography with foreground/foreground-muted colors
- Icon styling from existing pages (`bg-primary/10` containers)
- Responsive grid layouts matching About and FAQ pages
- Back navigation arrow to return to `/technology`
