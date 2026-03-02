

## Taller Card, Slower Pace, Third Customer

### 1. Increase card height
- Change the body grid height from `380px` to `440px` (line 336)
- This gives more room for transaction rows and card content

### 2. Slow down timings
- `profile`: 1000 -> 1400
- `scroll`: 3000 -> 4000
- `cardScan`: 800 -> 1100
- `collectInterval`: 250 -> 350
- `collectBuffer`: 500 -> 700
- `cardReveal`: 800 -> 1000
- `hold`: 2500 -> 3200

### 3. Add a third customer profile
A new customer with a distinct persona, e.g.:

**Emily & James W.** -- Age 58, Empty Nesters, Scottsdale AZ, High Income

Transactions (19 entries across 4 accounts):
- Retirement/financial cluster (Fidelity, Schwab, Edward Jones, Vanguard, Northwestern Mutual, TIAA) -- for Analytics
- Travel/luxury cluster (Four Seasons, Napa Valley Wine Train, Viking Cruises, American Express Travel) -- for Rewards  
- Health/lifestyle/philanthropy cluster (Mayo Clinic, Equinox, United Way, Habitat for Humanity, Williams Sonoma, Sur La Table, MasterClass, Audible, National Geographic) -- for Relationship Intelligence

Cards:
- **Dynamic Persona**: pills: "Pre-Retiree", "Luxury Traveler", "Philanthropist", "Wellness Focused", "Lifelong Learner"
- **Analytics Intelligence**: "Recommend Wealth Management Upgrade -- retirement consolidation pattern detected across 6 accounts. Personalized advisor introduction queued." (txIndices 0-5)
- **Smart Rewards**: pills: "Four Seasons 5x Points", "Viking Cruises $500 Credit", "Napa Wine Club", "Amex Centurion Invite" (txIndices 6-9)
- **Relationship Intelligence**: "Life Event: Retirement Transition detected from financial consolidation and lifestyle shifts. Estate planning package sent to advisor." (txIndices 10-18)

### Files changed
Only `src/components/hero/EnrichmentMockup.tsx`:
- Update `TIMINGS` values
- Update grid height
- Add third customer object to the `customers` array

