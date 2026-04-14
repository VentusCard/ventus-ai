

## Enhance Rewards phone tab with semantic search, savings bar, hero spotlight, and expiring soon row

### Summary
Port four features from the `/deckmo` rewards view into the exec demo's phone mockup (`GeneratedOffersPhoneView.tsx`), layered above the existing collection carousel which remains unchanged.

### Layout (top to bottom)
```text
┌─────────────────────────┐
│ Welcome, {name}! $XXX   │  ← Savings Summary Bar
├─────────────────────────┤
│ 🔍 Search deals...      │  ← Semantic Search Input
│ [AI reasoning chip]     │
├─────────────────────────┤
│ ⭐ Top Pick For You     │  ← Hero Spotlight Card
│ {merchant} {rewardValue}│
├─────────────────────────┤
│ ⏰ Expiring Soon        │  ← 2-3 deals with countdown
├─────────────────────────┤
│ ✨ Curated for {name}   │  ← Existing carousel (unchanged)
│ [collection cards]      │
│ [dots + arrows]         │
└─────────────────────────┘
```

### Changes — single file: `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

1. **Savings Summary Bar** (top)
   - "Welcome, {firstName}!" with `TrendingUp` icon
   - Stable yearly savings seeded from `offerGroups.length` (~$380-580)
   - Blue-50 to indigo-50 gradient background

2. **Semantic Search Bar**
   - Import and use `useSemanticDealSearch` hook
   - Compact input (10px text) with `Search` icon left, `Loader2`/`X` right
   - AI reasoning chip below when results return (blue-50, 9px, `Sparkles` icon)
   - **Bridge logic**: edge function returns `deal-N` IDs → build a `Map<dealId, merchantName>` from the server catalog (inline ~200 entries) → convert matching IDs to merchant names → filter `offerGroups` to only show groups/deals with matching merchants
   - When search is active: pause auto-rotation, filter carousel groups, filter hero/expiring deals
   - When search is empty: show everything (current behavior)

3. **Hero "Top Pick" Card**
   - Takes the first deal from the first collection group
   - Star icon + "Top Pick For You" label
   - Merchant name, reward value badge, personalized message, "Activate" CTA
   - Colored border + subtle gradient matching pillar color

4. **Expiring Soon Row**
   - Takes 2-3 deals from the last collection, assigns fake countdown hours (4h, 12h, 23h)
   - Compact horizontal cards with urgency coloring (red for <6h, amber otherwise)
   - Shows merchant name + reward value + "Xh left"

5. **Existing carousel** — unchanged, just rendered below the new sections. Auto-rotation pauses when search is active (same as `expandedGroup`).

### Technical details
- New imports: `useSemanticDealSearch`, `Search`, `X`, `Loader2`, `TrendingUp`, `Clock`, `Star` from lucide-react
- The merchant lookup map (~200 entries, ~3KB) is defined as a module-level constant
- All new sections use same compact phone-mockup typography (8-13px)
- No other files change

