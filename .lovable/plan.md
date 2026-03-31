

## Plan: Restructure Platform Module Pills

### What changes

**`src/types/demo.ts`**
- Add `"AI & UX"` to `ModuleKey` union and `ALL_MODULES` array
- Update `MODULE_ROW_MAP`: change `profiling: "Analytics"` → `profiling: "AI & UX"`
- Add `MODULE_NAV_GROUP_MAP` entry for `"AI & UX"` (empty array — it controls the diagram row, not analytics nav groups)

**`src/components/demo/DemoCustomerPanel.tsx`**
- Restructure pills into **two rows**:
  - **Row 1**: `All` + `Analytics` — both styled with solid blue background (`bg-blue-600 text-white`). Analytics stays always-on (locked).
  - **Row 2**: `AI & UX` (blue, toggleable) + `Rewards` (green) + `Relationship` (pink)

**`src/pages/DemoPage.tsx`**
- Update default `enabledModules` initial set to include `"AI & UX"`

### Behavior
- "Analytics" = always on, controls only the Analytics nav group tabs in bank-wide analytics
- "AI & UX" = toggleable, controls the "Experience" (profiling) row in the network diagram
- "All" toggles all modules on/off (as before, but now includes AI & UX)

