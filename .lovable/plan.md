## Plan: Make Cashback Card Unmistakable in Product Picker

### Problem
The product picker contains two cashback-related cards: "Cashback" (the 3/2/1 category-bearing card with 548 campaigns) and "Custom Cashback" (68 campaigns). Users cannot immediately tell which is the main category card, so the primary one gets missed.

### Change
In the product picker, rename the label for the primary catalog entry from **"Cashback"** to **"Cashback (3/2/1)"** (or equivalent parenthetical) so it is visually distinct from "Custom Cashback".

### Scope
- One label change in the campaign-studio product list / catalog mapping.
- No functional or data changes; purely presentational.

### Acceptance
- Typing "cashback" in the picker still returns both rows.
- The primary card is clearly identifiable as the category-bearing 3/2/1 product.