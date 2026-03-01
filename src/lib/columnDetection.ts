/**
 * Smart column detection with fuzzy matching and confidence scoring
 */

interface ColumnMatch {
  standardField: string;
  detectedColumn: string;
  confidence: number;
}

// Keywords for each standard field (ordered by priority)
const FIELD_KEYWORDS: Record<string, string[]> = {
  merchant_name: [
    "merchant", "merchantname", "name", "store", "vendor", "business",
    "merchantdescription", "shop", "retailer", "company"
  ],
  description: [
    "description", "desc", "memo", "note", "details", 
    "transactiondescription", "transactiondetails", "narrative"
  ],
  amount: [
    "amount", "total", "value", "price", "cost", "sum",
    "transactionamount", "payment", "charge", "debit", "credit",
    "amountusd", "amount(usd)", "usd"
  ],
  date: [
    "date", "transactiondate", "posteddate", "purchasedate",
    "datetime", "timestamp", "postdate", "time"
  ],
  mcc: [
    "mcc", "merchantcategorycode", "categorycode", 
    "category", "merchantcategory", "type", "cat"
  ],
  transaction_id: [
    "transactionid", "id", "txnid", "transaction", 
    "reference", "ref", "referencenumber", "identifier"
  ],
  zip_code: [
    "zipcode", "zip", "postalcode", "postal", "zipcode", "zip_code"
  ],
  source: [
    "source", "account", "card", "cardtype", "accounttype", 
    "fundingsource", "paymentmethod"
  ]
};

/**
 * Calculate similarity between two strings (0-1 score)
 * Uses Levenshtein-like approach with case-insensitive matching
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[_\s-]/g, "");
  const s2 = str2.toLowerCase().replace(/[_\s-]/g, "");
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) {
    const longer = Math.max(s1.length, s2.length);
    const shorter = Math.min(s1.length, s2.length);
    return 0.8 * (shorter / longer);
  }
  
  // Partial word match
  const words1 = str1.toLowerCase().split(/[_\s-]/);
  const words2 = str2.toLowerCase().split(/[_\s-]/);
  
  const matchingWords = words1.filter(w1 => 
    words2.some(w2 => w1 === w2 || w1.includes(w2) || w2.includes(w1))
  );
  
  if (matchingWords.length > 0) {
    return 0.6 * (matchingWords.length / Math.max(words1.length, words2.length));
  }
  
  return 0;
}

/**
 * Detect and map columns automatically with confidence scores
 */
export function detectColumns(headers: string[]): {
  mapping: Record<string, string | null>;
  confidence: Record<string, number>;
  unmapped: string[];
} {
  const mapping: Record<string, string | null> = {
    merchant_name: null,
    description: null,
    amount: null,
    date: null,
    mcc: null,
    transaction_id: null,
    zip_code: null,
    source: null
  };
  
  const confidence: Record<string, number> = {};
  const usedColumns = new Set<string>();
  
  // Find best match for each standard field
  Object.entries(FIELD_KEYWORDS).forEach(([standardField, keywords]) => {
    let bestMatch: ColumnMatch | null = null;
    
    headers.forEach((header) => {
      if (usedColumns.has(header)) return;
      
      // Calculate max similarity across all keywords
      const maxSimilarity = Math.max(
        ...keywords.map(keyword => calculateSimilarity(header, keyword))
      );
      
      if (maxSimilarity > 0.3 && (!bestMatch || maxSimilarity > bestMatch.confidence)) {
        bestMatch = {
          standardField,
          detectedColumn: header,
          confidence: maxSimilarity
        };
      }
    });
    
    if (bestMatch && bestMatch.confidence >= 0.3) {
      mapping[standardField] = bestMatch.detectedColumn;
      confidence[standardField] = bestMatch.confidence;
      usedColumns.add(bestMatch.detectedColumn);
    }
  });
  
  const unmapped = headers.filter(h => !usedColumns.has(h));
  
  return { mapping, confidence, unmapped };
}

/**
 * Check if automatic mapping is good enough to proceed without user confirmation
 */
export function shouldShowMapper(
  mapping: Record<string, string | null>,
  confidence: Record<string, number>
): boolean {
  const requiredFields = ["merchant_name", "date", "amount"];
  
  // Missing required fields
  const missingRequired = requiredFields.some(field => !mapping[field]);
  if (missingRequired) return true;
  
  // Low confidence on any required field
  const lowConfidence = requiredFields.some(
    field => mapping[field] && confidence[field] < 0.7
  );
  if (lowConfidence) return true;
  
  return false;
}

/**
 * Apply user-confirmed mapping to raw data
 */
export function applyColumnMapping(
  rows: any[],
  mapping: Record<string, string>
): any[] {
  return rows.map(row => {
    const mapped: any = {};
    
    Object.entries(mapping).forEach(([standardField, columnName]) => {
      mapped[standardField] = row[columnName];
    });
    
    return mapped;
  });
}
