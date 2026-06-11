In `src/components/tepilot/insights/AnalyticsContainer.tsx`, make two changes to the left navigation panel:

1. **Size bump** (one step larger/darker):
   - Group headers: `text-[12px] text-slate-500` → `text-[13px] text-slate-600` (and hover to `text-slate-800`)
   - Nav item labels: `text-[14px] text-slate-700` → `text-[15px] text-slate-800` (hover to `text-slate-900`)
   - Icons: `w-[18px] h-[18px] text-slate-500` → `w-5 h-5 text-slate-600`
   - ChevronDown: `w-3 h-3` → `w-3.5 h-3.5`

2. **Home section expanded by default**: change the Home `Collapsible` from `defaultOpen={false}` to `defaultOpen={true}`. All other groups remain collapsed by default.
