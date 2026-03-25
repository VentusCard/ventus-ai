

## Change Rewards Header to Location-Based Welcome

### Change — `src/components/demo/DemoRewardsView.tsx`

**Line 238**: Replace `"Your Rewards, {firstName}"` with `"Welcome to {city}, {firstName}"`.

The `city` variable is already passed into `RewardsPhoneMockup` and derived from `getCityFromZip(customer.zip)`.

Single line change:
```tsx
// Before
<p className="text-base font-bold text-slate-900">Your Rewards, {firstName}</p>

// After
<p className="text-base font-bold text-slate-900">Welcome to {city}, {firstName}</p>
```

