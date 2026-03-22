

## Expand & Restructure Category Extensions: 5+ Per Pillar, Merchant-Category Focus

### Key Changes

**Restructure naming convention**: Extension products should be merchant *categories* (e.g., "Action Cameras"), not specific products (e.g., "GoPro HERO13 Black"). Specific brands go in `extensionMerchant` field and are shown in the expanded card detail.

**Example**: 
- `extensionProduct`: "Action Cameras" (category-level)
- `extensionMerchant`: "GoPro / Insta360 / DJI" (brands listed within)

### Current Count by Pillar (need 5 each)

| Pillar | Current | Need |
|--------|---------|------|
| Sports & Active Living | 4 | +1 |
| Family & Community | 2 | +3 |
| Home & Living | 2 | +3 |
| Travel & Exploration | 1 | +4 |
| Food & Dining | 2 | +3 |
| Health & Wellness | 3 | +2 |
| Entertainment & Culture | 1 | +4 |
| Technology & Digital Life | 1 | +4 |
| Pets | 1 | +4 |

### New Opportunities to Add (~28)

**Sports & Active Living** (+1):
- Cycling enthusiasts → Sports Nutrition Bars (Clif / RXBAR / GoMacro)

**Family & Community** (+3):
- Parents with school-age kids → Educational Subscription Boxes (KiwiCo / Little Passports / MEL Science)
- Family meal planners → Meal Kit Subscriptions (HelloFresh / Blue Apron / Home Chef)
- Youth sports parents → Team Photo & Video Services (Hudl / GameChanger / Shutterfly)

**Home & Living** (+3):
- Furniture shoppers → Candles & Home Fragrance (Yankee Candle / Diptyque / Bath & Body Works)
- Home cooks with kitchen upgrades → Specialty Cookware (Le Creuset / All-Clad / Staub)
- Lawn care spenders → Outdoor Furniture (Wayfair / Pottery Barn / Article)

**Travel & Exploration** (+4):
- Hotel loyalty spenders → Luggage & Travel Gear (Away / Samsonite / Tumi)
- International travelers → Language Learning Apps (Babbel / Rosetta Stone / Duolingo Plus)
- Road trip families → Roadside Assistance & Car Accessories (AAA / WeatherTech / Thule)
- Beach/resort travelers → Swimwear & Sun Protection (Maui Jim / Vuori / Supergoop)

**Food & Dining** (+3):
- Wine bar/restaurant wine spenders → Wine Club Subscriptions (Winc / Naked Wines / Wine.com)
- Frequent takeout orderers → Kitchen Gadgets (Ninja / Instant Pot / Our Place)
- Organic grocery shoppers → Farm Box Delivery (Misfits Market / Imperfect Foods / Thrive Market)

**Health & Wellness** (+2):
- Spa & self-care spenders → Skincare Subscriptions (Dermstore / Sephora / The Ordinary)
- Sleep tracker/supplement buyers → Premium Bedding (Casper / Brooklinen / Parachute)

**Entertainment & Culture** (+4):
- Concert/live music spenders → Vinyl & Audio Equipment (Sonos / Audio-Technica / Crosley)
- Museum/gallery visitors → Art Print Subscriptions (Society6 / Minted / Saatchi Art)
- Book store frequenters → E-Reader & Audiobook Subscriptions (Kindle / Audible / Libro.fm)
- Movie theater regulars → Streaming Bundle Upgrades (AMC A-List / Criterion Channel / MUBI)

**Technology & Digital Life** (+4):
- Smart home buyers → Home Networking Equipment (eero / Google Nest WiFi / Ubiquiti)
- Photography hobbyists → Photo Printing Services (Shutterfly / Artifact Uprising / Mixbook)
- Podcast/audio spenders → Microphone & Audio Gear (Blue Yeti / Shure / Rode)
- Productivity app subscribers → Ergonomic Desk Accessories (Autonomous / Uplift / Fully)

**Pets** (+4):
- High-spend pet owners → Pet Grooming Services (PetSmart Grooming / Wag / Rover)
- Pet treat/toy buyers → Custom Pet Portraits (Crown & Paw / West & Willow / PetPortraits)
- Multi-pet households → Automatic Pet Feeders (PetSafe / SureFeed / Petlibro)
- Frequent dog park/daycare users → Dog Walking Apps (Rover / Wag / Care.com)

### Also Update Existing Entries
Rename all `extensionProduct` values from specific products to merchant categories:
- "GoPro HERO13 Black" → "Action Cameras"
- "The North Face ThermoBall Jacket" → "Premium Outerwear"
- "Sony WH-1000XM5 / Bose QuietComfort Ultra" → "Noise-Canceling Headphones"
- "Secretlab / Herman Miller Gaming Chair" → "Ergonomic Gaming Chairs"
- etc.

### Files Changed
1. **`src/lib/categoryExtensionData.ts`** — Restructure existing 16 entries (product→category naming), add ~28 new entries with full data structure

