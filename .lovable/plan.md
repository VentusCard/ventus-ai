
## Change
In `src/pages/ExecDemoPage.tsx` (lines ~950-957), change the phone mockup column's visibility condition from `activeTab` (any tab) to `activeTab === "relationship"` only.

```tsx
// Replace activeTab checks with this for the col 3 wrapper:
width: activeTab === "relationship" ? 360 : 0,
minWidth: activeTab === "relationship" ? 360 : 0,
opacity: activeTab === "relationship" ? 1 : 0,
```

And update `showContent` accordingly:
```tsx
showContent={activeTab === "relationship" && phase !== "idle"}
```

## Result
The phone mockup stays fully hidden (collapsed width 0) on the Next-Offer and Next-Product tabs, and only slides in when the user clicks the **Next Conversation** tab.

## Out of scope
- No changes to the phone view internals, intel panel, or tab logic.
- Other panels/columns unchanged.
