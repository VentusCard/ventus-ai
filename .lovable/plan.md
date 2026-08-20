# Sharpen Ventus Core behavioral ticker examples

## Scope
Update only the `Behavioral` signal examples in the `/bankdemo` Systems tab Customer Intelligence Core ticker. Keep the existing animation, layout, click behavior, and other signal families untouched.

## Current state
The Behavioral row currently cycles through fairly broad pillar labels:
- "Travel & exploration, top pillar"
- "Pet care routine"
- "Sports & active living"
- "Trip reconstructed, 6 nights"

These read as categories, not as the specific behavioral fingerprints Ventus can infer.

## Proposed new Behavioral examples
Replace the four examples with a broader, more specific set that demonstrates granular behavioral detection. Each item keeps the existing `{ to: signal, ev: evidence, basis }` shape, with `to` as the specific label and `ev` as the supporting transaction pattern.

```text
Behavioral
├── Sports & Fitness
│   Bi-weekly weekend tennis                →  Court fees + tennis shop, every other Sat/Sun
│   Sunday morning yoga studio              →  CorePower/YogaWorks, 9-11am, 3x/month
│   Twice-weekly CrossFit box               →  Recurring box fee + supplement store
│   Monthly ski-pass + mountain lodging     →  Ikon/Epic pass, resort charges, winter cluster
│
├── Travel
│   Annual tropical vacation                →  Caribbean/Mexico hotel + airline, Jan/Feb
│   Quarterly business trip to Chicago      →  ORD flights + downtown hotels, Thu-Sun
│   Weekend beach getaways                  →  Coastal hotels + gas, Friday departures
│   International summer trip                 →  Foreign transactions + long-haul airline
│
├── Food & Dining
│   Daily 8am coffee ritual                 →  Starbucks/Coffee bean, weekday mornings
│   Friday date-night steakhouse            →  Ruth's Chris/Mastro's, Friday evenings
│   Weekly meal-kit subscriber              →  HelloFresh/Blue Apron, recurring charge
│   Lunch rotation Sweetgreen/Chipotle      →  Fast-casual salad/burrito, weekdays
│
├── Shopping & Style
│   Quarterly Nordstrom/Saks refresh        →  Department-store spikes every ~90 days
│   Monthly Sephora beauty run              →  Recurring beauty retailer, ~$150 cycle
│   REI outdoor-gear cycle                  →  REI + Patagonia, spring/fall peaks
│
├── Home & Living
│   Weekend Home Depot project cycle        →  Hardware + garden, Saturday mornings
│   Monthly Costco bulk run                 →  Costco warehouse, first weekend
│   Bi-weekly house-cleaning service        →  Recurring home-service payment
│
├── Pets
│   Monthly Chewy auto-ship               →  Recurring pet-food subscription
│   Quarterly vet wellness visits           →  Banfield/pet hospital, ~90 days
│
├── Entertainment & Culture
│   Friday movie-theater habit              →  AMC/Regal, Friday evening tickets
│   Season concert-ticket buyer             →  Ticketmaster, recurring show purchases
│   Monthly Broadway/show tickets           →  Theater district merchants
│
├── Technology & Digital
│   Annual device upgrade cycle             →  Apple Store + carrier financing spikes
│   Multi-streaming subscriber              →  Netflix/Spotify/HBO/Disney+, 8+ services
│
└── Family & Community
    Saturday kids-activity circuit          →  Sports leagues, activity centers, weekend
    Seasonal back-to-school shopping        →  Target/Old Navy/Kids' apparel, July/Aug
```

## Implementation
File: `src/components/tepilot/insights/CapabilitiesView.tsx`
- Replace the `examples` array inside the `Behavioral` `SignalDetail` object (lines ~111-116) with 8-10 of the specific examples above.
- Keep the `basis` values realistic: mostly "1P" for first-party transaction evidence, with occasional "Both" where external data improves precision.

## Verification
- Open `/bankdemo` → Systems tab and watch the Behavioral row cycle.
- Confirm each example reads as a specific behavioral fingerprint rather than a broad pillar.
- Confirm animation, click-to-select detail panel, and other signal rows remain unchanged.
