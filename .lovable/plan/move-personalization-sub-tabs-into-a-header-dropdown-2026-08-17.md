# Move personalization sub-tabs into a header dropdown

On all three personalization pages (Personalized Deals, Personalized Product, Personalized Relationship), remove the sub-tab bar strip under the page header and replace it with a compact dropdown placed to the left of the "How It Works" pill in the page header row.

## Behavior

- The sub-tab bar card/strip is gone; the workspace starts directly under the header, reclaiming vertical space for the device mockup.
- The header row gains a select control (left of "How It Works" / "Why It Matters") listing the same sections:
  - Deals: Customer View, Next-Deal Intelligence
  - Product: Customer View, Segment Targeting
  - Relationship: Customer View, Customer Insights, Relationship Intelligence, AI Banking Assistant
- "Customer View" stays the default selection on every page; picking another entry swaps the content below, exactly as the tabs did.
- The dropdown matches the existing pill styling (small, rounded, slate border, strict light theme) and shows the section icon plus label.

```text
[icon] Personalized Deals                    [ Customer View v ] [How It Works] [Why It Matters]
       subtitle line
-----------------------------------------------------------------------------------------------
| Customer Selection      |  Personalized Rewards (mockup)                                     |
```

## Technical notes

- `TabHeader.tsx`: add optional props `sections?: SubTabItem[]`, `value?`, `onChange?`; when provided, render a shadcn `DropdownMenu` (light theme) before the two popover pills.
- `PersonalizedDealsView.tsx`, `PersonalizedProductView.tsx`, `PersonalizedRelationshipView.tsx`: drop the `SubTabBar` render and pass their existing `TABS`, `active`, `setActive` to `TabHeader`. Content conditionals stay unchanged.
- `SubTabBar.tsx` stays in place — it is still used by the Intelligence Database view.
- Header keeps `mb-4`; no other spacing changes.
