import { EnrichedTransaction } from '@/types/transaction';
import { extractLocationContext } from './geoLocationUtils';

export interface TravelCandidate {
  transaction: EnrichedTransaction;
  reason: 'away_zip' | 'travel_anchor' | 'temporal_cluster';
  anchor_type?: 'flight' | 'hotel' | 'car_rental' | 'transport' | null;
}

export interface PreFilterStats {
  total: number;
  home: number;
  candidates: number;
  reduction: number;
}

/**
 * Pre-filter transactions to identify travel candidates before sending to AI.
 * This dramatically reduces AI processing time by only analyzing likely travel transactions.
 */
export function preFilterTravelCandidates(
  transactions: EnrichedTransaction[],
  homeZip: string
): {
  homeZone: EnrichedTransaction[];
  travelCandidates: TravelCandidate[];
  stats: PreFilterStats;
} {
  // Derive home city using existing utility
  const locationContext = extractLocationContext(transactions);
  const homeCity = locationContext.homeCity;
  
  // US Hotels
  const hotelAnchors = [
    'hotel', 'marriott', 'hilton', 'hyatt', 'holiday inn', 'airbnb', 'vrbo',
    'premier inn', 'travelodge', 'ibis', 'mercure', 'novotel', 'accor', 'radisson',
  ];
  
  // Airlines
  const airlineAnchors = [
    'airline', 'airways', 'delta', 'united', 'southwest', 'american airlines', 'jetblue',
    'british airways', 'air france', 'lufthansa', 'easyjet', 'ryanair',
    'emirates', 'qatar airways', 'singapore airlines', 'cathay', 'klm', 'virgin atlantic',
    'spirit', 'frontier', 'alaska air', 'hawaiian air', 'sun country',
  ];
  
  // Car rentals
  const carRentalAnchors = [
    'hertz', 'enterprise', 'avis', 'budget', 'car rental', 'alamo',
    'europcar', 'sixt',
  ];
  
  // Transport
  const transportAnchors = [
    'airport', 'parking', 'eurotunnel', 'eurostar', 'channel tunnel',
  ];
  
  const travelAnchors = [...hotelAnchors, ...airlineAnchors, ...carRentalAnchors, ...transportAnchors];
  
  // International city/location keywords to detect in merchant names
  const locationKeywords = [
    'london', 'paris', 'rome', 'berlin', 'tokyo', 'sydney', 'dubai', 'amsterdam',
    'barcelona', 'munich', 'vienna', 'prague', 'lisbon', 'madrid', 'milan', 'dublin',
    'brussels', 'zurich', 'geneva', 'singapore', 'hong kong', 'bangkok', 'toronto',
    'vancouver', 'montreal', 'mexico city', 'cancun', 'heathrow', 'gatwick', 'stansted'
  ];
  
  // Detect international ZIP formats (non-US)
  const isInternationalZip = (txZip: string, homeZip: string): boolean => {
    if (!txZip || !homeZip) return false;
    
    // US zips are 5 digits (or 5+4)
    const usZipPattern = /^\d{5}(-\d{4})?$/;
    const homeIsUS = usZipPattern.test(homeZip);
    const txIsUS = usZipPattern.test(txZip);
    
    // If home is US but transaction isn't, likely international
    if (homeIsUS && !txIsUS) return true;
    
    // UK postcodes: alphanumeric like SW1, WC2, EC3, N1, etc.
    const ukPattern = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d?[A-Z]{0,2}$/i;
    if (homeIsUS && ukPattern.test(txZip)) return true;
    
    return false;
  };
  
  const homeZone: EnrichedTransaction[] = [];
  const candidateMap = new Map<string, TravelCandidate>();
  
  // Helper to derive city from zip (using same logic as geoLocationUtils)
  const deriveCityFromZip = (zip: string | null): string | null => {
    if (!zip) return null;
    const zipPrefix = zip.substring(0, 3);
    const zipPrefixToCityMap: Record<string, string> = {
      "606": "Chicago", "607": "Chicago", "608": "Chicago",
      "100": "New York", "101": "New York", "102": "New York", "103": "New York", "104": "New York", "105": "New York",
      "900": "Los Angeles", "901": "Los Angeles", "902": "Los Angeles",
      "941": "San Francisco", "942": "San Francisco", "943": "San Francisco", "944": "San Francisco",
      "021": "Boston", "022": "Boston",
      "331": "Miami", "332": "Miami", "333": "Miami",
      "752": "Dallas", "753": "Dallas",
      "770": "Houston", "771": "Houston", "772": "Houston",
      "981": "Seattle", "982": "Seattle",
      "303": "Atlanta", "304": "Atlanta",
      "191": "Philadelphia", "192": "Philadelphia",
    };
    return zipPrefixToCityMap[zipPrefix] || null;
  };
  
  // First pass: identify away-from-home (city-based), travel anchor, and international transactions
  transactions.forEach(tx => {
    const txZip = tx.zip_code || '';
    const merchant = tx.normalized_merchant.toLowerCase();
    
    // City-based ZIP matching: compare derived cities, not ZIP prefixes
    const txCity = deriveCityFromZip(txZip);
    const isAwayZip = txZip && txCity && homeCity && txCity !== homeCity;
    
    // Check if international ZIP format (e.g., UK postcodes like SW1, WC2)
    const isInternational = isInternationalZip(txZip, homeZip);
    
    // Check if travel anchor merchant
    const isTravelAnchor = travelAnchors.some(anchor => 
      merchant.includes(anchor)
    );
    
    // Check if merchant name contains international location keywords
    const hasLocationInMerchant = locationKeywords.some(city => 
      merchant.includes(city)
    );
    
    if (isAwayZip || isTravelAnchor || isInternational || hasLocationInMerchant) {
      let reason: 'away_zip' | 'travel_anchor' | 'temporal_cluster' = 'away_zip';
      let anchor_type: TravelCandidate['anchor_type'] = null;
      
      if (isTravelAnchor) {
        reason = 'travel_anchor';
        // Determine specific anchor type
        if (airlineAnchors.some(a => merchant.includes(a))) {
          anchor_type = 'flight';
        } else if (hotelAnchors.some(a => merchant.includes(a))) {
          anchor_type = 'hotel';
        } else if (carRentalAnchors.some(a => merchant.includes(a))) {
          anchor_type = 'car_rental';
        } else {
          anchor_type = 'transport';
        }
      } else if (isInternational || hasLocationInMerchant) {
        reason = 'away_zip';
      }
      
      candidateMap.set(tx.transaction_id, {
        transaction: tx,
        reason,
        anchor_type
      });
    } else {
      homeZone.push(tx);
    }
  });
  
  // Second pass: add transactions within ±2 days of any travel anchor
  // BUT only if they have a non-home zip code (to verify they're at the destination)
  const anchorDates = Array.from(candidateMap.values())
    .filter(c => c.reason === 'travel_anchor')
    .map(c => new Date(c.transaction.date));
  
  homeZone.forEach(tx => {
    const txDate = new Date(tx.date);
    const txZip = tx.zip_code || '';
    const txCity = deriveCityFromZip(txZip);
    
    // Skip transactions without zip codes - we can't verify location
    if (!txZip) return;
    
    // Skip if transaction is clearly at home
    if (txCity && homeCity && txCity === homeCity) return;
    
    const nearAnchor = anchorDates.some(anchorDate => {
      const daysDiff = Math.abs(
        (txDate.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 2;
    });
    
    if (nearAnchor && !candidateMap.has(tx.transaction_id)) {
      candidateMap.set(tx.transaction_id, {
        transaction: tx,
        reason: 'temporal_cluster'
      });
    }
  });
  
  const travelCandidates = Array.from(candidateMap.values());
  const filteredHome = homeZone.filter(tx => !candidateMap.has(tx.transaction_id));
  const reduction = ((filteredHome.length / transactions.length) * 100);
  
  return {
    homeZone: filteredHome,
    travelCandidates,
    stats: {
      total: transactions.length,
      home: filteredHome.length,
      candidates: travelCandidates.length,
      reduction: Math.round(reduction)
    }
  };
}
