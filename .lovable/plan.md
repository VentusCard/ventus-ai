

## Add Semantic Search Bar to Consumer Rewards Tab

### What
Add a compact search bar below the "Welcome to {city}, {firstName}!" line that searches both the deal library AND local perks using the existing `semantic-deal-search` edge function. When active, it filters both the deal cards and the local perks section to show only matches.

### Changes

**File 1: `src/components/demo/DemoRewardsView.tsx`**

1. Import `useSemanticDealSearch` hook, `Search`, `Loader2`, `X`, and `Sparkles` icons
2. In `RewardsPhoneMockup`, wire up the hook
3. Add a compact search input below the welcome line (line 228–229):
   ```tsx
   <div className="relative">
     <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
     <input
       placeholder="Search deals & local perks..."
       value={searchQuery}
       onChange={e => handleSearchChange(e.target.value)}
       className="w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50 ..."
     />
     {/* Loader / clear button on right */}
   </div>
   ```
4. If semantic results are active, show a small reasoning badge (like the AvailableDealsGrid does)
5. Filter `deals` array: when `matchingDealIds` is active, only show deals whose `id` is in the set
6. Filter `perks` array: do a simple client-side text match of `searchQuery` against perk `title`, `partner`, `category`, and `value` fields (the edge function only knows deals, not perks — so perks get local text filtering while deals get AI semantic filtering)

**No edge function changes needed** — the existing `semantic-deal-search` function already handles the deal catalog. Perks are filtered client-side since they're local data.

### Behavior
- Typing triggers debounced AI search for deals + instant text filter for perks
- Results filter both sections simultaneously
- Clear button resets everything
- Small "AI reasoning" chip shown when semantic results are active
- Compact styling to fit the consumer mobile mockup aesthetic

### Files changed
1. `src/components/demo/DemoRewardsView.tsx` — add search bar, filtering logic

