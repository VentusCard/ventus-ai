

## Replace "Description" Column with Official MCC Descriptions

### What Changes
In `ExecDemoSelectionDialog.tsx`, rename the "Description" column to **"MCC Description"** and populate it using a lookup map built from the official Visa/MasterCard MCC reference document (the PDF you uploaded), instead of the CSV's `description` field.

### MCC Description Map (from official PDF)
A `const MCC_DESCRIPTIONS: Record<string, string>` containing all MCCs used in sample data, with exact wording from the document:

| MCC | Official Description |
|-----|---------------------|
| 0742 | Veterinary Services |
| 1711 | Air Conditioning, Heating and Plumbing Contractors |
| 3058 | Air Carriers, Airlines (mapped to 4511 range) |
| 4111 | Transportation–Suburban and Local Commuter Passenger, including Ferries |
| 4121 | Taxicabs and Limousines |
| 4511 | Air Carriers, Airlines–not elsewhere classified |
| 4789 | Transportation Services Not Elsewhere Classified |
| 4899 | Cable, Satellite, and Other Pay Television and Radio Services |
| 4900 | Utilities–Electric, Gas, Heating Oil, Sanitary, Water |
| 5211 | Building Materials, Lumber Stores |
| 5251 | Hardware Stores |
| 5300 | Wholesale Clubs |
| 5411 | Grocery Stores, Supermarkets |
| 5499 | Miscellaneous Food Stores–Convenience Stores, Markets, Specialty Stores |
| 5541 | Service Stations (With or Without Ancillary Services) |
| 5641 | Children's and Infants' Wear Stores |
| 5651 | Family Clothing Stores |
| 5655 | Sports Apparel, and Riding Apparel Stores |
| 5661 | Shoe Stores |
| 5712 | Equipment, Furniture and Home Furnishings Stores |
| 5714 | Drapery, Upholstery and Window Coverings Stores |
| 5722 | Household Appliance Stores |
| 5732 | Electronics Sales |
| 5734 | Computer Software Stores |
| 5812 | Eating Places and Restaurants |
| 5814 | Fast Food Restaurants |
| 5912 | Drug Stores and Pharmacies |
| 5941 | Sporting Goods Stores |
| 5942 | Book Stores |
| 5944 | Clock, Jewelry, Watch and Silverware Stores |
| 5945 | Game, Toy and Hobby Shops |
| 5968 | Direct Marketing–Continuity/Subscription Merchants |
| 5969 | Direct Marketing–Other Direct Marketers–Not Elsewhere Classified |
| 5977 | Cosmetic Stores |
| 5995 | Pet Shops, Pet Food and Supplies |
| 5999 | Miscellaneous and Specialty Retail Stores |
| 6163 | (not in PDF — use "Mortgage Brokers") |
| 6211 | Securities–Brokers and Dealers |
| 6311 | Insurance Sales, Underwriting and Premiums |
| 6411 | (not in PDF — use "Title Abstract and Escrow") |
| 6531 | Real Estate Agents and Managers–Rentals |
| 7011 | Lodging–Hotels, Motels, Resorts–not elsewhere classified |
| 7012 | Timeshares |
| 7217 | Carpet and Upholstery Cleaning |
| 7298 | Health and Beauty Spas |
| 7389 | Business Services Not Elsewhere Classified |
| 7399 | Business Services Not Elsewhere Classified |
| 7512 | Automobile Rental Agency–Not Elsewhere Classified |
| 7523 | Automobile Parking Lots and Garages |
| 7832 | Motion Picture Theaters |
| 7922 | Theatrical Producers, Ticket Agencies |
| 7941 | Athletic Fields, Commercial Sports, Professional Sports Clubs |
| 7996 | Amusement Parks, Carnivals, Circuses |
| 7997 | Clubs–Country Clubs, Membership (Athletic, Recreation, Sports) |
| 7998 | Aquariums, Dolphinariums, Zoos and Seaquariums |
| 7999 | Recreation Services–Not Elsewhere Classified |
| 8011 | Doctors–not elsewhere classified |
| 8049 | Chiropodists, Podiatrists |
| 8111 | Attorneys, Legal Services |
| 8299 | Schools And Educational Services–Not Elsewhere Classified |
| 8721 | Accounting, Auditing and Bookkeeping Services |
| 8999 | Professional Services–Not Elsewhere Classified |

### Code Changes in `ExecDemoSelectionDialog.tsx`

1. Add the `MCC_DESCRIPTIONS` constant at the top of the file.

2. In `RawRow` interface: rename `description` → `mcc_description`.

3. In `parseCsvRows`: compute `mcc_description` as `MCC_DESCRIPTIONS[mcc] || csvDescription || "—"` (falls back to CSV description if MCC not in map).

4. Table header: rename "Description" → "MCC Description".

5. Table cell: render `row.mcc_description` instead of `row.description`.

### Files
- `src/components/exec-demo/ExecDemoSelectionDialog.tsx` — only file changed.

