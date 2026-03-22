

## Use Static Location Experiences from /tepilot in Demo Rewards

### Goal
Replace the AI-generated local experiences in the rewards phone mockups with the static `INITIAL_PERKS` data from `LocationExperienceManager.tsx`. Show art, entertainment, perks, etc. with proper category variety and tier badges — different per customer based on their home city.

### Changes

#### 1. Extract `INITIAL_PERKS` to a shared data file
- Create `src/lib/locationPerksData.ts` — move the `INITIAL_PERKS` array, `LocationPerk` type, `PerkCategory` type, and `CATEGORY_CONFIG` from `LocationExperienceManager.tsx` into this shared file
- Update `LocationExperienceManager.tsx` to import from the shared file

#### 2. Rewrite Local Experiences section in `DemoRewardsView.tsx`
- Import the static perks data
- Map customer zip → city (94102→SF, 78701→Austin, 60614→Chicago, 10003→NYC)
- Filter perks by the customer's city
- Show category tabs (Art, Entertainment, Sports, Dining, etc.) within the phone mockup
- Each perk card shows: category icon + title + partner + value badge + tier badge (color-coded: Premium/Private/Preferred/All Members)
- Remove dependency on `localExperiences` prop and `useCityDeals` hook for this section

#### 3. Perk card design (compact, phone-scale)
- Category icon (from `CATEGORY_CONFIG`) + perk title in bold
- Partner name in muted text
- Value badge (e.g., "$250/game", "Free entry", "30% off") — styled with the customer accent color
- Tier badge (e.g., "Premium", "Private") — using existing `TIER_COLORS`
- Tagline as italic subtitle

### Result
Two customers in different cities see completely different location perks — one sees NYC Broadway/Mets/Le Bernardin, the other sees Austin ACL/Chicago Art Institute etc., showcasing the variety of art, entertainment, dining, sports, and culture perks.

### Files Modified
- `src/lib/locationPerksData.ts` — new shared data file
- `src/components/tepilot/insights/LocationExperienceManager.tsx` — import from shared file
- `src/components/demo/DemoRewardsView.tsx` — use static perks instead of AI-generated local experiences

