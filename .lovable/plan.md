The back button on /bankdemo is rendered inside `AnalyticsContainer.tsx` conditionally when the `onBack` prop is provided. It is currently passed from `BankAnalyticsDashboard.tsx`.

Change: Remove the `onBack` prop from the `<AnalyticsContainer />` call in `src/pages/BankAnalyticsDashboard.tsx`. This will hide the back arrow button in the top-left of the header.