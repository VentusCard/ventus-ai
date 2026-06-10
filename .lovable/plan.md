## Plan: Rename Capabilities Tab to System

### What to change
In the `/bankdemo` dashboard (`BankAnalyticsDashboard`), the **Capabilities** tab and its page header currently read "Capabilities" / "Platform Capabilities". Rename both to **"System"**.

### Files to edit
1. **`src/components/tepilot/insights/AnalyticsContainer.tsx`**
   - Line 49: change `label: "Capabilities"` → `label: "System"` in the `NAV_GROUPS` array.

2. **`src/components/tepilot/insights/CapabilitiesView.tsx`**
   - Line 61: change `title="Platform Capabilities"` → `title="System"` on the `<TabHeader>` component.

### Verification
- Open the `/bankdemo` preview.
- Confirm the sidebar nav item under "Home" reads **System**.
- Confirm the page header reads **System**.