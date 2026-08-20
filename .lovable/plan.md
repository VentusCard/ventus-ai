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
Replace the four examples with a broader, more specific set that demonstrates granular behavioral detection. Mix three label styles so the ticker does not feel repetitive:

1. **Identity / role labels** — what this customer is (e.g., "Luxury goods auctioneer").
2. **Frequency-led patterns** — how often a behavior repeats (e.g., "Bi-weekly weekend tennis").
3. **Situational clusters** — a specific context or occasion (e.g., "Summer outdoor-gear cycle").

Each item keeps the existing `{ to: signal, ev: evidence, basis }` shape, with `to` as the specific label and `ev` as the supporting transaction pattern.

```text
Behavioral
├── Identity / Role
│   Luxury goods auctioneer               →  Sotheby's/Christie's + high-value collectible purchases
│   Golf club member                        →  Country club dues + pro shop + course charges
│   Fine dining regular                     →  Michelin/steakhouse reservations, $400+ dinners
│   Concert season subscriber               →  Symphony/opera recurring tickets
│   Multi-streaming household               →  Netflix/Spotify/HBO/Disney+, 8+ services
│
├── Frequency-led patterns
│   Bi-weekly weekend tennis                →  Court fees + tennis shop, every other Sat/Sun
│   Sunday morning yoga regular             →  CorePower/YogaWorks, 9-11am, 3x/month
│   Annual tropical vacationer              →  Caribbean/Mexico hotel + airline, Jan/Feb
│   Quarterly business traveler to Chicago  →  ORD flights + downtown hotels, Thu-Sun
│   Daily 8am coffee ritual                 →  Starbucks, weekday mornings
│   Friday date-night steakhouse regular    →  Ruth's Chris/Mastro's, Friday evenings
│   Monthly Chewy auto-ship                 →  Recurring pet-food subscription
│   Quarterly vet wellness visits           →  Banfield/pet hospital, ~90 days
│
└── Situational / Occasion
    Summer outdoor-gear cycle               →  REI + Patagonia, spring/fall peaks
    Weekend beach getaways                  →  Coastal hotels + gas, Friday departures
    Saturday kids-activity parent           →  Sports leagues, activity centers, weekend
    Seasonal back-to-school shopper         →  Target/Old Navy/Kids' apparel, July/Aug
    International summer trip               →  Foreign transactions + long-haul airline
    Weekend Home Depot project cycle        →  Hardware + garden, Saturday mornings
```

## Implementation
File: `src/components/tepilot/insights/CapabilitiesView.tsx`
- Replace the `examples` array inside the `Behavioral` `SignalDetail` object (lines ~111-116) with 8-10 of the specific examples above.
- Keep the `basis` values realistic: mostly "1P" for first-party transaction evidence, with occasional "Both" where external data improves precision.

## Verification
- Open `/bankdemo` → Systems tab and watch the Behavioral row cycle.
- Confirm each example reads as a specific behavioral fingerprint rather than a broad pillar.
- Confirm animation, click-to-select detail panel, and other signal rows remain unchanged.
