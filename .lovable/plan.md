

## Ungate Rewards from Travel Detection

### Problem
The `rewards` consumer node depends on `["travel", "locational", "dealPersonalization"]`. This means the Rewards overlay stays locked until travel detection completes — even though the Rewards view already derives its city from `getCityFromZip(customer.zip)` (home city) and doesn't need travel data at all.

### What changes

**1. `src/hooks/useDemoEnrichment.ts` — Remove travel deps from rewards consumer**

Change line 133:
```ts
// Before
rewards: ["travel", "locational", "dealPersonalization"],
// After  
rewards: ["dealPersonalization"],
```

This lets Rewards become ready as soon as deal personalization completes (~4s), independent of travel detection.

**2. `src/components/demo/DemoRewardsView.tsx` — Add travel city update**

Currently the welcome header shows: `Welcome to {city}, {firstName}!` where `city = getCityFromZip(customer.zip)` (home city).

Add an optional `travelCity` prop. When travel detection later finds a destination, the parent passes it down and the header updates to show the travel city, with Local Perks updating to show travel-destination perks.

- Accept optional `travelCity?: string` prop
- Use `travelCity || homeCity` for the welcome message and perks lookup
- This means on initial load it shows home city; when travel detection finishes, it reactively updates to the detected travel destination

**3. `src/components/demo/DemoDetailOverlay.tsx` — Pass travel city to rewards**

Extract the first travel destination from `localExperiences` data and pass it as `travelCity` to `DemoRewardsView`. Since `localExperiences` state updates asynchronously when local-experiences API returns, the rewards view will reactively update.

### Result
- Rewards unlocks in ~4s (after deal personalization only)
- Initially shows home city perks
- When travel detection / local experiences finish, the city and perks update automatically
- No change to travel node gating — it still waits for both local-experiences and travel-detection independently

