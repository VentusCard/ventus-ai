

## Make All Bank Analytics Tabs Light-Themed

After auditing every tab in the analytics suite, I found two areas with dark theming:

### 1. DealActivationPreview.tsx — Dark Red Deal Detail Panel (lines 1012-1097)
The right-side deal detail panel uses `bg-gradient-to-br from-red-900 via-rose-900 to-red-950` with white text on dark background. This is the most prominent dark element.

**Fix**: Convert to a light theme with a soft rose/slate border card:
- Background: `bg-white border border-slate-200 rounded-xl` 
- Badge: `border-rose-200 bg-rose-50 text-rose-700`
- Deal title: `text-slate-900` instead of `text-white`
- Merchant name: `text-slate-500` instead of `text-rose-300/80`
- Section labels: `text-rose-600` instead of `text-rose-400`
- AI message / description: `text-slate-700` / `text-slate-500`
- Deal terms labels: `text-slate-500` instead of `text-rose-300`
- Deal terms values: `text-slate-900` instead of `text-rose-200`
- Borders: `border-slate-200` instead of `border-rose-800/50`
- Button: `bg-rose-600 hover:bg-rose-700 text-white` (invert from current)
- Activation count: `text-slate-400` instead of `text-rose-400`
- Empty state: `text-slate-400` instead of `text-rose-400/60`

### 2. Rewards Pipeline components — Remove `dark:` variant classes
Four files have unnecessary `dark:` Tailwind classes. Since the app is light-only, these are harmless but should be cleaned for consistency:
- `MerchantPipelineTable.tsx` — strip `dark:` variants from color functions and inline classes
- `DeadlineOverview.tsx` — strip `dark:` variants from urgency configs and list items
- `PipelineStatusBadge.tsx` — strip `dark:` variants from status configs
- `GapContextCard.tsx` — strip `dark:` variants from priority colors and state cards

### 3. Minor: Active pill buttons using `bg-slate-900 text-white`
- `CategoryExtensionOpportunities.tsx` line 78: Change `bg-slate-900` to `bg-blue-600` for active filter pills (consistent with blue theme)
- `AvailableDealsGrid.tsx` line 174: Change `bg-slate-900` to `bg-blue-600` and `hover:bg-slate-800` to `hover:bg-blue-700`

### Files to edit:
1. `src/components/tepilot/insights/DealActivationPreview.tsx` — convert deal detail panel to light theme
2. `src/components/tepilot/insights/CategoryExtensionOpportunities.tsx` — active pill color
3. `src/components/tepilot/rewards-pipeline/AvailableDealsGrid.tsx` — active pill color
4. `src/components/tepilot/rewards-pipeline/MerchantPipelineTable.tsx` — remove `dark:` classes
5. `src/components/tepilot/rewards-pipeline/DeadlineOverview.tsx` — remove `dark:` classes
6. `src/components/tepilot/rewards-pipeline/PipelineStatusBadge.tsx` — remove `dark:` classes
7. `src/components/tepilot/rewards-pipeline/GapContextCard.tsx` — remove `dark:` classes

