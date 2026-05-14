When the dialog navigates to `/tepilot?view=bankwide`, the page sets `insightType='bankwide'` but `activeTab` still restores the last-used tab (or defaults to `upload`). The bankwide dashboard only renders inside the `insights` tab, so the user lands on the upload screen.

## Change

- File: `src/pages/TePilot.tsx` (activeTab initializer, lines 67–78)
- At the top of the initializer, check `searchParams.get('view') === 'bankwide'` and return `"insights"` immediately — taking priority over `navState.activeTab` and the sessionStorage value.

No other changes.