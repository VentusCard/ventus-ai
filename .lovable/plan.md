
# Make All Accordion Section Icons Blue and Consistent

## Overview
Update all icons in the Client Snapshot Panel accordion sections to use consistent `text-blue-600` color styling.

## Current State
| Section | Icon | Current Color |
|---------|------|---------------|
| Transaction Overview | TrendingUp | `text-primary` |
| Detected Life Events | Sparkles | `text-primary` |
| Holdings Overview | Landmark | `text-blue-600` (already correct) |
| Top Spending Categories | Activity | No color class |
| Compliance & Risk | AlertCircle | No color class |
| Relationship Milestones | TrendingUp | No color class |

## Changes Required

### File: `src/components/tepilot/advisor-console/ClientSnapshotPanel.tsx`

1. **Line 181** - Transaction Overview icon
   - Change: `<TrendingUp className="w-4 h-4 text-primary" />`
   - To: `<TrendingUp className="w-4 h-4 text-blue-600" />`

2. **Line 211** - Detected Life Events icon
   - Change: `<Sparkles className={\`w-4 h-4 text-primary ${isLoadingInsights ? 'animate-pulse' : ''}\`} />`
   - To: `<Sparkles className={\`w-4 h-4 text-blue-600 ${isLoadingInsights ? 'animate-pulse' : ''}\`} />`

3. **Line 288** - Holdings Overview icon
   - Already using `text-blue-600` - no change needed

4. **Line 390** - Top Spending Categories icon
   - Change: `<Activity className="w-4 h-4" />`
   - To: `<Activity className="w-4 h-4 text-blue-600" />`

5. **Line 428** - Compliance & Risk icon
   - Change: `<AlertCircle className="w-4 h-4" />`
   - To: `<AlertCircle className="w-4 h-4 text-blue-600" />`

6. **Line 458** - Relationship Milestones icon
   - Change: `<TrendingUp className="w-4 h-4" />`
   - To: `<TrendingUp className="w-4 h-4 text-blue-600" />`

## Result
All six accordion section icons will display with consistent `text-blue-600` styling, creating a unified visual appearance in the left panel.
