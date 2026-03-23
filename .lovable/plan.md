

## Move Financial Journey to Relationship Section

**File: `src/components/tepilot/insights/AnalyticsContainer.tsx`** (lines 28–52)

Two changes to `NAV_GROUPS`:

1. **Remove** `{ value: "targeting", label: "Financial Journey", icon: Route }` from the "Analytics" group
2. **Rename** "Wealth Management" → "Relationship" and **add** the Financial Journey item into it, so it becomes:
   ```
   {
     label: "Relationship",
     items: [
       { value: "life-events", label: "Life Events Intelligence", icon: CalendarHeart },
       { value: "targeting", label: "Financial Journey", icon: Route },
     ],
   }
   ```

No other files need changes — the tab routing and content rendering already use the `value` key which stays the same.

