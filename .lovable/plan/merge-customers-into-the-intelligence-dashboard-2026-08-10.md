# Merge Customers into the Intelligence Dashboard

Same pattern already used for Reports, Query, and Risk: the Customers directory becomes a sub-tab inside the Intelligence Dashboard instead of its own sidebar item.

## What changes

- Sidebar "Customer Intelligence" group loses the standalone "Customers" entry.
- Intelligence Dashboard sub-tabs become: **Overview · Customers · Reports · Query · Risk**.
- Customers sits right after Overview so bankers land on the directory quickly.
- The full Customers experience (portfolio stats, search bar, results table, side detail panel) is unchanged — only where it lives changes.
- Existing links to the Customers tab keep working; they open the dashboard with the Customers sub-tab preselected.

## Technical notes

- `VentusAIDashboardView.tsx`: add `customers` to `DASHBOARD_SECTIONS` (Users icon) and to the `initialSection` union; render `CustomersDirectoryView` for that section.
- `AnalyticsContainer.tsx`: remove `{ value: "customers", ... }` from the nav group, keep `'customers'` in `TabValue`, add it to the set that highlights the dashboard nav item, and route `case 'customers'` to `VentusAIDashboardView` with `initialSection="customers"`.
- Strict light theme, no other behavior changes.
