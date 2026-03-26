

## Ventus AI Welcome Tab — with Hot Trends & Spending Intelligence

### Overview
Create a "Ventus AI" welcome tab as the first tab in bank analytics. It features a dark gradient hero, an AI chatbot pre-loaded with platform-wide context including **hot spending trends and need-to-know insights**, and navigation cards to all other tabs.

### New File: `src/components/tepilot/insights/VentusAIWelcomeView.tsx`

**Layout (top to bottom):**
1. **Gradient hero header** — dark `slate-900 → blue-900` with Sparkles icon, "Ventus AI" title, subtitle "Your Intelligent Banking Co-Pilot"
2. **Hot Trends & Need-to-Know strip** — a horizontal row of 4-5 compact insight cards auto-generated from `mockBankwideData` showing:
   - Top trending spending pillar (e.g. "Travel & Exploration ↑ 12% MoM")
   - Highest outflow category
   - Emerging life event signal (e.g. "Home Purchase signals up 8%")
   - Seasonal alert (e.g. "Holiday spending wave starting")
   - Portfolio-wide metric (e.g. "$385B annual spend across 75M users")
   These are static/computed from existing mock data, styled as small gradient-bordered cards on the dark background.
3. **Chat window** — white card with:
   - Messages rendered with `ReactMarkdown`
   - Uses `useAdvisorChat` hook with a rich `advisorContext` object describing all 10 platform modules + bankwide metrics + hot trends so the AI can answer any question
   - 4 suggested starter prompts as clickable chips: "What are the hot spending trends?", "Key risks I should know about", "Which segments need attention?", "Summarize platform capabilities"
   - Input bar at bottom
4. **Quick Navigation grid** — 2-row, 5-column grid of compact cards, one per tab (all 10 tabs), each with icon + label + one-line description. Clicking calls `onNavigate(tabValue)`.

**Chat context will include:**
- Bankwide metrics (total accounts, users, annual spend)
- Top pillar spending distribution from `CARD_PRODUCTS`
- Hot trends: computed MoM changes, seasonal patterns
- Platform module descriptions (what each tab does)
- This ensures the chatbot can discuss trends, spending patterns, and direct users to relevant tabs

### Update: `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Add `'ventus-ai'` to `TabValue` union
- Insert new "Home" nav group at top of `NAV_GROUPS` with single item `{ value: "ventus-ai", label: "Ventus AI", icon: Sparkles }`
- Change default tab from `'dashboard'` to `'ventus-ai'`
- Add `renderContent()` case: `case 'ventus-ai': return <VentusAIWelcomeView onNavigate={setActiveTab} />`

### Technical Details
- Reuses existing `useAdvisorChat` hook → calls `advisor-chat` edge function (no new backend needed)
- Hot trends are computed client-side from `mockBankwideData.ts` constants
- Navigation cards reuse the same icon imports from `AnalyticsContainer`
- The gradient hero uses `bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900`
- Trend cards use `TrendingUp`/`TrendingDown` icons with green/red accents

