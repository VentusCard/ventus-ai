## Rename `/bank-analytics` → `/bankdemo`

Update the route path everywhere it's referenced. No component logic, file names, or behavior change.

### Changes

1. **`src/App.tsx`**
   - Change `Route path="/bank-analytics"` → `/bankdemo`
   - Update chrome check `isBankAnalytics = location.pathname === "/bankdemo"`
   - (Optional) keep a legacy redirect `Route path="/bank-analytics"` → `<Navigate to="/bankdemo" replace />` so old links still work.

2. **`src/components/ContactFormDialog.tsx`** — `href="/bank-analytics?from=demo"` → `/bankdemo?from=demo`

3. **`src/pages/RewardsPipelinePage.tsx`** — `<Link to="/bank-analytics">` → `/bankdemo`

4. **`public/llms.txt`** — no current entry for this route; leave untouched.

The page component file `BankAnalyticsDashboard.tsx` stays as-is (internal name only).

### Question
Should I keep `/bank-analytics` as a legacy redirect to `/bankdemo`, or remove it entirely? Defaulting to **keep as redirect** unless you say otherwise.
