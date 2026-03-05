

## Plan: Remove "See It In Action" Section

Remove lines 108-121 from `src/pages/BankWideAnalytics.tsx` — the entire Section 3 block containing the `AnalyticsDemoPanel`. Also remove the `AnalyticsDemoPanel` import since it will no longer be used.

Update the "See It Work ↓" button's `onClick` to scroll to the next section (e.g., `"analytics-problem"` or the cross-sell section) instead of the removed `#analytics-demo`.

### Files
- `src/pages/BankWideAnalytics.tsx`: Remove Section 3 (lines 108-121), remove `AnalyticsDemoPanel` import, update scroll target on hero button.

