

## Fix Merchant Name vs Description Across All Sample CSVs

### Problem
Transaction data has specific details in the `description` field when they should be in `merchant_name`. Real bank statements encode identifying info (artist names, destinations, store details) in the merchant string. The description should be a generic purchase type.

### Principle
- **merchant_name**: What appears on the statement — includes processor prefix + specific identifiers (e.g., `PAYPAL*TICKETMASTR Sabrina Carpenter`, `DELTA AIR LINES 0184 LGA`)
- **description**: Generic category label (e.g., `Concert tickets from Ticketmaster.com`, `Flight booking`)

### Scope — All 4 sample CSVs in `src/lib/sampleData.ts`

**SAMPLE_CSV (Sarah Mitchell, lines 220–296)**
Key fixes:
- `PAYPAL*TICKETMASTR,Concert tickets - Sabrina Carpenter` → `PAYPAL*TICKETMASTR Sabrina Carpenter,Concert tickets via Ticketmaster`
- `AplPAY UBER EATS,Food delivery via Apple Pay` → `AplPAY UBER EATS,Food delivery order`
- `AMAZON.COM,Online shopping - books` → `AMAZON.COM AMZN Books,Online purchase`
- `PAYPAL*ETSY,Handmade home decor` → `PAYPAL*ETSY HomeVibes Shop,Home decor purchase`
- `DELTA AIR LINES,Flight to NYC JFK` → `DELTA AIR LINES 0062 JFK,Flight booking`
- `MARRIOTT HOTELS,Hotel stay 3 nights` → `MARRIOTT HOTELS NYC MIDTOWN,Hotel accommodation`
- `PAYPAL*STUBHUB,Broadway show tickets` → `PAYPAL*STUBHUB Hamilton NYC,Event tickets via StubHub`
- `SOUTHWEST AIRLINES,Flight booking` → `SOUTHWEST AIRLINES WN3847,Flight booking`
- `DELTA AIR LINES NYC,Flight to LaGuardia NYC` → `DELTA AIR LINES 0184 LGA,Flight booking`
- `MARRIOTT TIMES SQUARE,Hotel check-in NYC 4 nights` → `MARRIOTT TIMES SQ NYC,Hotel accommodation`
- `BROADWAY THEATRE,Hamilton tickets` → `BROADWAY THEATRE Hamilton,Show admission`
- `MET MUSEUM NYC,Museum admission` → `MET MUSEUM NYC,Museum admission` (already fine)
- `AplPAY APPLE.COM,App Store purchases via Apple Pay` → `AplPAY APPLE.COM/BILL,App Store purchase`
- Various descriptions with "- [specific item]" pattern: move specifics into merchant name

**SAMPLE_CSV_SPORTS_WELLNESS (James Rodriguez, lines 298–377)**
Key fixes:
- `AUSTIN OB GYN ASSOCIATES,Prenatal checkup` → fine (merchant IS the info)
- `BUY BUY BABY,Nursery furniture and crib` → `BUY BUY BABY #0847,Nursery purchase`
- `POTTERY BARN KIDS,Nursery decor and bedding` → `POTTERY BARN KIDS #214,Home decor purchase`
- Most are already good — merchant names like `EQUINOX AUSTIN`, `REI CO-OP` carry the info. Descriptions like "Monthly gym membership premium" are appropriately generic.

**SAMPLE_CSV_FOOD_HOME (Robert Garcia, lines 379–458)**
Key fixes:
- `GUARANTEED RATE MORTGAGE,Pre-approval application fee` → `GUARANTEED RATE MORTGAGE,Mortgage application fee`
- `CHICAGO HOME INSPECTIONS,Home inspection service` → fine
- `CHICAGO TITLE COMPANY,Title search and escrow` → fine
- Most descriptions here are reasonably generic already.

**SAMPLE_CSV_TRAVEL_FAMILY_12 (Emily Chen, lines 501–707)**
Key fixes:
- `UNITED AIRLINES,Flight to Bozeman family` → `UNITED AIRLINES UA2847 BOZ,Flight booking`
- `YELLOWSTONE LODGE,Hotel 4 nights` → `YELLOWSTONE LODGE,Hotel accommodation`
- `ANA ALL NIPPON,Flight to Tokyo family` → `ANA ALL NIPPON NH007 NRT,Flight booking`
- `KEIO PLAZA TOKYO,Hotel 9 nights` → `KEIO PLAZA TOKYO,Hotel accommodation`
- `BRITISH AIRWAYS,Flight to London family` → `BRITISH AIRWAYS BA287 LHR,Flight booking`
- `PREMIER INN LONDON,Hotel 5 nights` → `PREMIER INN LONDON WC2,Hotel accommodation`
- `MERCURE PARIS,Hotel 6 nights` → `MERCURE PARIS CHAMPS,Hotel accommodation`
- All "Return flight home" → "Return flight"
- Trip descriptions with "family" qualifier: move to merchant or drop (the enrichment engine should detect this)

**SAMPLE_CSV_NYC_SPORTS_HOME_12 (Marcus Thompson, lines 709–end)**
- `JETBLUE,Flight to Miami` → `JETBLUE B6 1247 MIA,Flight booking`
- `MARRIOTT SOUTH BEACH,Hotel 3 nights` → `MARRIOTT SOUTH BEACH,Hotel accommodation`
- `JAMES ALLEN DIAMONDS,Engagement ring purchase` → `JAMES ALLEN DIAMONDS,Jewelry purchase`
- `FOUR SEASONS CHICAGO,Wedding venue deposit` → `FOUR SEASONS CHICAGO,Event venue deposit`
- `SHANNON GAIL WEDDINGS,Wedding planner retainer` → `SHANNON GAIL WEDDINGS,Event planning retainer`
- `NORTHWESTERN OB GYN,First prenatal visit` → `NORTHWESTERN OB GYN,Medical appointment`

**SAMPLE_CSV_CHICAGO_SPORTS_WELLNESS (Olivia Parker, lines ~940–1202)**
- `JAMES ALLEN DIAMONDS,Engagement ring purchase` → `JAMES ALLEN DIAMONDS,Jewelry purchase`
- `FOUR SEASONS CHICAGO,Wedding venue deposit` → `FOUR SEASONS CHICAGO,Event venue deposit`
- `SHANNON GAIL WEDDINGS,Wedding planner retainer` → `SHANNON GAIL WEDDINGS,Event planning retainer`
- `NORTHWESTERN OB GYN,First prenatal visit` → `NORTHWESTERN OB GYN,Medical appointment`
- `NORTHWESTERN MUTUAL,Life insurance application` → fine
- `SIDLEY AUSTIN LLP,Estate planning will update` → `SIDLEY AUSTIN LLP,Legal services`

### File
- `src/lib/sampleData.ts` — single file, all CSVs

### Approach
Systematically go through each CSV block, applying the principle: if a description contains specific identifying details (names, destinations, item types), move those into the merchant name and make the description generic.

