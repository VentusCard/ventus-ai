

## Add Professional Bank Dashboard Header to Analytics Page

### What
Replace the simple "Bank-wide Analytics" title (line 1162-1168) and the AnalyticsContainer's plain layout with a professional bank dashboard header — the kind you'd see in enterprise fintech tools — branded with "Powered by Ventus AI".

### Design
A top header bar above the sidebar + content area with:
- **Left**: Bank logo placeholder (building icon) + "First National Bank" (or generic bank name) + "Intelligence Platform"
- **Right**: "Powered by Ventus AI" branding with sparkle icon, plus a subtle timestamp ("Last updated: Mar 25, 2026")
- Clean white background, bottom border, compact height (~56px)
- Professional enterprise aesthetic matching the light-theme policy

### Implementation

**File: `src/components/tepilot/insights/AnalyticsContainer.tsx`**
- Add a header bar at the top of the container (above the sidebar + content flex layout)
- Header contains:
  - Left side: `Building2` icon + "First National Bank" (bold) + "Intelligence Platform" (muted)
  - Right side: `Sparkles` icon + "Powered by Ventus AI" badge + current date display
- Styled with `bg-white border-b border-slate-200 px-4 py-3`

**File: `src/pages/TePilot.tsx`** (lines 1161-1168)
- Remove the existing "Bank-wide Analytics" h2 heading since it will be redundant with the new header
- Keep the back button but move it into the header or remove it since the sidebar provides navigation

### Files Modified
- `src/components/tepilot/insights/AnalyticsContainer.tsx`
- `src/pages/TePilot.tsx`

