

## Fix: Unique emojis for subcategory pills

### Problem
`getSubcategoryIcon` in `src/lib/categoryIcons.ts` only maps sports-related subcategories. Transaction-derived subcategories like "Coffee & Cafes", "Fast Casual", "Delivery", "Casual Dining", etc. all fall back to the default "🏆" — so every pill shows the same emoji.

### Change

**File: `src/lib/categoryIcons.ts`** — Expand `getSubcategoryIcon` with mappings for all common transaction subcategories:

- Coffee & Cafes → ☕
- Fast Casual → 🌯
- Delivery → 🚗
- Casual Dining → 🍽️
- Fast Food → 🍔
- Sports Bar → 🍺
- Fine Dining → 🥂
- Grocery / Groceries → 🛒
- Gas / Fuel → ⛽
- Streaming → 📺
- Shopping → 🛍️
- Electronics → 📱
- Travel → ✈️
- Hotels / Lodging → 🏨
- Rideshare → 🚕
- Gym / Fitness → 💪
- Pharmacy → 💊
- Pet → 🐾
- Entertainment → 🎭
- Music → 🎵
- Books → 📚
- Home Improvement → 🏠
- Utilities → 💡
- Insurance → 🛡️
- Subscriptions → 📦
- Beauty / Salon → 💇
- Clothing / Apparel → 👕
- (keep existing sports mappings)

This ensures each subcategory pill gets a distinct, recognizable emoji instead of the same fallback.

