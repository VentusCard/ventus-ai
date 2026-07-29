const MERCHANT_NORMALIZATION_RULES = [
  [/^starbucks\b/i, 'Starbucks'],
  [/^chipotle\b/i, 'Chipotle'],
  [/sweetgreen/i, 'Sweetgreen'],
  [/^(wholefds|whole foods)\b/i, 'Whole Foods'],
  [/^target\b/i, 'Target'],
  [/^wal[-\s]?mart\b|^walmart\b/i, 'Walmart'],
  [/^comed\b/i, 'ComEd Electric'],
  [/^pg&e\b/i, 'PG&E'],
  [/\brent\b.*\b(apt|apartment|landlord)\b|\b(apt|apartment|landlord)\b.*\brent\b|^landlord$/i, 'Rent Payment'],
  [/^acme corp\b/i, 'Acme Corp Payroll'],
  [/^irs treas\b|^irs tax refund\b/i, 'IRS Tax Refund'],
  [/^zelle\b/i, 'Zelle Payment'],
  [/^venmo\b/i, 'Venmo Payment'],
  [/^cash app\b/i, 'Cash App'],
  [/^netflix\b/i, 'Netflix'],
  [/^spotify\b/i, 'Spotify'],
  [/^apple\.com\/bill\b/i, 'Apple'],
  [/^apple store\b/i, 'Apple Store'],
  [/^delta air lines\b/i, 'Delta Air Lines'],
  [/^marriott\b/i, 'Marriott'],
  [/^airbnb\b/i, 'Airbnb'],
  [/^shell oil\b|^shell$/i, 'Shell'],
  [/^lyft\b/i, 'Lyft'],
  [/^parking\b/i, 'Parking Meter'],
  [/^nordstrom\b/i, 'Nordstrom'],
  [/^saks fifth avenue\b/i, 'Saks Fifth Avenue'],
  [/^costco\b/i, 'Costco'],
  [/^amazon\b.*refund/i, 'Amazon Refund'],
  [/^amazon\.com\b/i, 'Amazon'],
  [/^google\b/i, 'Google'],
  [/^doordash\b/i, 'DoorDash'],
  [/^uber eats\b/i, 'Uber Eats'],
  [/^bright horizons\b/i, 'Bright Horizons'],
  [/^buybuy baby\b/i, 'Buybuy Baby'],
  [/^kaiser permanente\b/i, 'Kaiser Permanente'],
  [/^cvs pharmacy\b/i, 'CVS Pharmacy'],
  [/^quest diagnostics\b/i, 'Quest Diagnostics'],
  [/^u-?haul\b/i, 'U-Haul'],
  [/^usps change of address\b/i, 'USPS Change of Address'],
  [/^chewy\b/i, 'Chewy'],
  [/^petco\b/i, 'Petco'],
  [/^petsmart\b/i, 'PetSmart'],
  [/^banfield\b/i, 'Banfield Pet Hospital'],
];

export function normalizeCleanMerchantName({ predictedName, rawMerchantName }) {
  const candidates = [rawMerchantName, predictedName].filter((value) => typeof value === 'string');
  for (const candidate of candidates) {
    const normalized = normalizeMerchantCandidate(candidate);
    const match = MERCHANT_NORMALIZATION_RULES.find(([pattern]) => pattern.test(normalized));
    if (match) return match[1];
  }
  return fallbackCleanName(predictedName || rawMerchantName || '');
}

function normalizeMerchantCandidate(value) {
  return String(value)
    .replace(/\bREF\s+PBM_\d+\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fallbackCleanName(value) {
  return toTitleCase(
    normalizeMerchantCandidate(value)
      .replace(/[#*]/g, ' ')
      .replace(/\b\d{2,}\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function toTitleCase(value) {
  return value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
