

## Plan: Dynamic Stock Photos for Collection Cards

### Approach
Use **Unsplash** direct image URLs mapped dynamically to each collection's theme. We'll build a keyword extraction function that maps rollup names and pillar categories to relevant Unsplash search terms, then use Unsplash's free embed URL format (`https://images.unsplash.com/photo-{id}?w=400&h=200&fit=crop`).

### How it works
1. Curate ~20-25 high-quality Unsplash photo IDs covering common lifestyle categories (travel, food, fitness, tech, fashion, outdoor, wellness, etc.)
2. Build a `getCollectionImage(rollup, pillar)` function that fuzzy-matches the rollup/pillar name to the best photo
3. Display the image as a background or top banner inside each collection card

### Changes

**`src/components/exec-demo/GeneratedOffersPhoneView.tsx`**:
- Add a `getCollectionImage()` helper that maps rollup names (e.g., "Frequent Traveler", "Coffee & Dining", "Outdoor Enthusiast") to curated Unsplash photo URLs
- Add an `<img>` element at the top of each collection card with `object-cover` styling and a fixed height (~80px)
- Overlay the collection message on top of or below the image
- Keep merchant pills pinned to the bottom

Layout:
```text
┌──────────────────────────────┐
│ [  lifestyle stock photo   ] │
│ "Travel smarter with new     │
│  gear and perks"             │
│                              │
│ [Away] [Bose] [TSA]          │
│         ● ○ ○                │
└──────────────────────────────┘
```

### No API key needed
Unsplash allows hotlinking via their CDN for free. No edge function or API key required — just direct image URLs with size parameters.

### No other files change

