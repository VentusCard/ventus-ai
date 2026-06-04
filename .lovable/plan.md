# Plan: Make Settings sub-tab switching feel instant

## Root cause

In `src/components/tepilot/insights/SettingsContainer.tsx`, the three `TabsContent` panels (`SettingsView`, `BillingView`, `TeamView`) unmount and remount on every tab change — Radix Tabs' default behavior. Each panel re-mounts a sizable tree of shadcn primitives (Card, Switch, Select, Table, Dropdown, Progress) with no expensive logic but enough JSX that the mount cost is perceptible.

## Change

**`src/components/tepilot/insights/SettingsContainer.tsx`** — pass `forceMount` to each `TabsContent` so all three panels mount once and stay mounted; Radix toggles their `data-state` for visibility. Use Tailwind to hide inactive panels.

```tsx
<TabsContent value="general" forceMount className="mt-5 data-[state=inactive]:hidden">
  <SettingsView />
</TabsContent>
<TabsContent value="billing" forceMount className="mt-5 data-[state=inactive]:hidden">
  <BillingView />
</TabsContent>
<TabsContent value="team" forceMount className="mt-5 data-[state=inactive]:hidden">
  <TeamView />
</TabsContent>
```

Tradeoff: first open of the Settings page mounts all three panels up front (still fast since they're static JSX). Subsequent tab switches become a CSS visibility toggle — effectively instant.

No other files change.
