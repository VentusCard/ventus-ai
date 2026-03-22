import { EnrichedTransaction } from "@/types/transaction";

export interface LocationContext {
  homeZip: string | null;
  homeCity: string | null;
  travelDestinations: Array<{
    destination: string;
    startDate: string | null;
    endDate: string | null;
    transactionCount: number;
  }>;
}

export function extractLocationContext(transactions: EnrichedTransaction[]): LocationContext {
  // Extract home zipcode (most common non-travel zip)
  const homeZip = transactions.find(t => t.home_zip)?.home_zip || null;
  
  // Extract city from home zip
  const homeCity = deriveCityFromZip(homeZip);
  
  // Group travel transactions by destination
  const travelMap = new Map<string, {
    destination: string;
    startDate: string | null;
    endDate: string | null;
    transactionCount: number;
  }>();
  
  transactions.forEach(t => {
    if (t.trip_label && 
        t.travel_context?.travel_destination && 
        t.travel_context.travel_destination.toLowerCase() !== 'unknown') {
      const dest = t.travel_context.travel_destination;
      if (!travelMap.has(dest)) {
        travelMap.set(dest, {
          destination: dest,
          startDate: t.travel_context.travel_period_start,
          endDate: t.travel_context.travel_period_end,
          transactionCount: 0
        });
      }
      const entry = travelMap.get(dest)!;
      entry.transactionCount++;
    }
  });
  
  return {
    homeZip,
    homeCity,
    travelDestinations: Array.from(travelMap.values())
      .sort((a, b) => b.transactionCount - a.transactionCount)
  };
}

function deriveCityFromZip(zip: string | null): string | null {
  if (!zip) return null;
  
  // Use zipcode prefix (first 3 digits) for broader coverage
  const zipPrefix = zip.substring(0, 3);
  
  const zipPrefixToCityMap: Record<string, string> = {
    "606": "Chicago",
    "607": "Chicago",
    "608": "Chicago",
    "100": "New York",
    "101": "New York", 
    "102": "New York",
    "103": "New York",
    "104": "New York",
    "105": "New York",
    "900": "Los Angeles",
    "901": "Los Angeles",
    "902": "Los Angeles",
    "941": "San Francisco",
    "942": "San Francisco",
    "943": "San Francisco",
    "944": "San Francisco",
    "021": "Boston",
    "022": "Boston",
    "331": "Miami",
    "332": "Miami",
    "333": "Miami",
    "752": "Dallas",
    "753": "Dallas",
    "770": "Houston",
    "771": "Houston",
    "772": "Houston",
    "981": "Seattle",
    "982": "Seattle",
    "303": "Atlanta",
    "304": "Atlanta",
    "191": "Philadelphia",
    "192": "Philadelphia",
  };
  
  return zipPrefixToCityMap[zipPrefix] || null;
}
