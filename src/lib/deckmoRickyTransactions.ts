export const RICKY_SIGNAL_LABELS = {
  tennis: "Bi-weekly advanced tennis",
  hawaii: "Annual Hawaiian vacation",
  home: "Buying a house above $1.5M",
  brokerage: "Recurring transfer to brokerage",
  business: "Small business owner",
  betting: "Increasing sports betting",
} as const;

export type RickySignalLabel = typeof RICKY_SIGNAL_LABELS[keyof typeof RICKY_SIGNAL_LABELS];

export interface RickyTransaction {
  id: string;
  date: string;
  source: "Premium Card" | "Cashback Card" | "ACH" | "Checks" | "Wire" | "Zelle";
  merchant: string;
  description: string;
  amount: string;
  mcc?: string;
  mccLabel?: string;
  signals: RickySignalLabel[];
}

const signal = (label: RickySignalLabel): RickySignalLabel[] => [label];
const none: RickySignalLabel[] = [];

export const RICKY_TRANSACTIONS: RickyTransaction[] = [
  { id: "r001", date: "09/18/26", source: "Cashback Card", merchant: "WHOLE FOODS MARKET", description: "Weekly groceries", amount: "($184.62)", mcc: "5411", mccLabel: "Grocery Stores", signals: none },
  { id: "r002", date: "09/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r003", date: "09/14/26", source: "Premium Card", merchant: "CITY TENNIS CENTER", description: "Court reservation", amount: "($72.00)", mcc: "7997", mccLabel: "Membership Clubs", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r004", date: "09/12/26", source: "ACH", merchant: "MERCHANT SERVICES SETTLEMENT", description: "Card processor payout", amount: "$12,480.55", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r005", date: "09/11/26", source: "Premium Card", merchant: "ONLINE WAGERING", description: "Sportsbook transaction", amount: "($480.00)", mcc: "7995", mccLabel: "Betting", signals: signal(RICKY_SIGNAL_LABELS.betting) },
  { id: "r006", date: "09/10/26", source: "Cashback Card", merchant: "SHELL OIL", description: "Fuel purchase", amount: "($86.14)", mcc: "5541", mccLabel: "Service Stations", signals: none },
  { id: "r007", date: "09/08/26", source: "Wire", merchant: "PACIFIC TITLE & ESCROW", description: "Closing funds", amount: "($315,000.00)", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r008", date: "09/07/26", source: "Checks", merchant: "PREMIER HOME INSPECTION", description: "Property inspection", amount: "($1,275.00)", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r009", date: "09/05/26", source: "ACH", merchant: "GAMING WALLET", description: "Wallet funding", amount: "($350.00)", signals: signal(RICKY_SIGNAL_LABELS.betting) },
  { id: "r010", date: "09/03/26", source: "ACH", merchant: "QUARTERLY TAX PAYMENT", description: "Estimated business tax", amount: "($8,750.00)", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r011", date: "09/01/26", source: "Premium Card", merchant: "COURTSIDE PRO SHOP", description: "Tennis strings and grips", amount: "($94.75)", mcc: "5941", mccLabel: "Sporting Goods", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r012", date: "08/30/26", source: "ACH", merchant: "NORTHSTAR MOVING", description: "Moving services deposit", amount: "($3,850.00)", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r013", date: "08/29/26", source: "Wire", merchant: "COMMERCIAL SUPPLIER", description: "Inventory payment", amount: "($6,340.20)", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r014", date: "08/27/26", source: "Cashback Card", merchant: "CHEWY.COM", description: "Monthly pet supplies", amount: "($76.89)", mcc: "5995", mccLabel: "Pet Shops", signals: none },
  { id: "r015", date: "08/24/26", source: "Premium Card", merchant: "RACKET SPORTS CLUB", description: "Tennis equipment", amount: "($186.40)", mcc: "5941", mccLabel: "Sporting Goods", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r016", date: "08/22/26", source: "Cashback Card", merchant: "MAMA'S FISH HOUSE", description: "Dinner in Maui", amount: "($238.40)", mcc: "5812", mccLabel: "Eating Places", signals: signal(RICKY_SIGNAL_LABELS.hawaii) },
  { id: "r017", date: "08/21/26", source: "Cashback Card", merchant: "MOLOKINI SNORKEL TOUR", description: "Island excursion", amount: "($216.00)", mcc: "7999", mccLabel: "Recreation Services", signals: signal(RICKY_SIGNAL_LABELS.hawaii) },
  { id: "r018", date: "08/20/26", source: "Premium Card", merchant: "WAILEA BEACH RESORT", description: "Maui resort stay", amount: "($2,960.00)", mcc: "7011", mccLabel: "Lodging", signals: signal(RICKY_SIGNAL_LABELS.hawaii) },
  { id: "r019", date: "08/20/26", source: "Premium Card", merchant: "ISLAND CAR RENTAL", description: "Maui rental car", amount: "($614.28)", mcc: "7512", mccLabel: "Automobile Rental", signals: signal(RICKY_SIGNAL_LABELS.hawaii) },
  { id: "r020", date: "08/18/26", source: "Premium Card", merchant: "HAWAIIAN AIRLINES", description: "Round trip to Maui", amount: "($1,842.16)", mcc: "4511", mccLabel: "Air Carriers", signals: signal(RICKY_SIGNAL_LABELS.hawaii) },
  { id: "r021", date: "08/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r022", date: "08/14/26", source: "ACH", merchant: "MORTGAGE LENDER", description: "Application and appraisal", amount: "($1,150.00)", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r023", date: "08/11/26", source: "Premium Card", merchant: "CITY TENNIS CENTER", description: "Court reservation", amount: "($72.00)", mcc: "7997", mccLabel: "Membership Clubs", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r024", date: "08/09/26", source: "Cashback Card", merchant: "TARGET STORES", description: "Household supplies", amount: "($218.46)", mcc: "5411", mccLabel: "Grocery Stores", signals: none },
  { id: "r025", date: "08/06/26", source: "ACH", merchant: "BUSINESS INSURANCE CO", description: "Commercial policy premium", amount: "($1,420.00)", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r026", date: "08/03/26", source: "Cashback Card", merchant: "UBER TRIP", description: "Ride downtown", amount: "($31.72)", mcc: "4121", mccLabel: "Taxicabs and Rideshares", signals: none },
  { id: "r027", date: "07/30/26", source: "Checks", merchant: "ARCHITECTURAL REVIEW", description: "Property consultation", amount: "($2,400.00)", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r028", date: "07/28/26", source: "Premium Card", merchant: "ONLINE WAGERING", description: "Sportsbook transaction", amount: "($225.00)", mcc: "7995", mccLabel: "Betting", signals: signal(RICKY_SIGNAL_LABELS.betting) },
  { id: "r029", date: "07/25/26", source: "Premium Card", merchant: "RACKET SPORTS CLUB", description: "Tennis shoes", amount: "($164.00)", mcc: "5661", mccLabel: "Shoe Stores", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r030", date: "07/21/26", source: "Cashback Card", merchant: "SPOTIFY PREMIUM", description: "Music subscription", amount: "($10.99)", mcc: "4899", mccLabel: "Cable and Digital Media", signals: none },
  { id: "r031", date: "07/18/26", source: "ACH", merchant: "MERCHANT SERVICES SETTLEMENT", description: "Card processor payout", amount: "$11,905.20", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r032", date: "07/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r033", date: "07/12/26", source: "Cashback Card", merchant: "CVS PHARMACY", description: "Prescription refill", amount: "($42.18)", mcc: "5912", mccLabel: "Drug Stores", signals: none },
  { id: "r034", date: "07/09/26", source: "Zelle", merchant: "ALEX R.", description: "Dinner reimbursement", amount: "($84.00)", signals: none },
  { id: "r035", date: "07/05/26", source: "Premium Card", merchant: "CITY TENNIS CENTER", description: "Court reservation", amount: "($72.00)", mcc: "7997", mccLabel: "Membership Clubs", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r036", date: "06/30/26", source: "ACH", merchant: "COMMERCIAL PROPERTY RENT", description: "Business premises rent", amount: "($6,800.00)", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r037", date: "06/27/26", source: "Cashback Card", merchant: "COSTCO WHOLESALE", description: "Bulk household shopping", amount: "($286.14)", mcc: "5300", mccLabel: "Wholesale Clubs", signals: none },
  { id: "r038", date: "06/23/26", source: "Premium Card", merchant: "ONLINE WAGERING", description: "Sportsbook transaction", amount: "($190.00)", mcc: "7995", mccLabel: "Betting", signals: signal(RICKY_SIGNAL_LABELS.betting) },
  { id: "r039", date: "06/18/26", source: "ACH", merchant: "ELECTRIC UTILITY", description: "Monthly utility payment", amount: "($286.70)", signals: none },
  { id: "r040", date: "06/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r041", date: "06/11/26", source: "Premium Card", merchant: "RACKET SPORTS CLUB", description: "Tennis balls and grips", amount: "($78.60)", mcc: "5941", mccLabel: "Sporting Goods", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r042", date: "06/08/26", source: "Cashback Card", merchant: "LOCAL BOOKSELLERS", description: "Books and magazines", amount: "($64.85)", mcc: "5942", mccLabel: "Book Stores", signals: none },
  { id: "r043", date: "06/03/26", source: "ACH", merchant: "PAYROLL SERVICES", description: "Small business payroll", amount: "($9,840.00)", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r044", date: "05/29/26", source: "Cashback Card", merchant: "WHOLE FOODS MARKET", description: "Weekly groceries", amount: "($172.30)", mcc: "5411", mccLabel: "Grocery Stores", signals: none },
  { id: "r045", date: "05/25/26", source: "Premium Card", merchant: "CITY TENNIS CENTER", description: "Court reservation", amount: "($72.00)", mcc: "7997", mccLabel: "Membership Clubs", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r046", date: "05/21/26", source: "Premium Card", merchant: "NORDSTROM", description: "Seasonal clothing", amount: "($328.95)", mcc: "5651", mccLabel: "Family Clothing", signals: none },
  { id: "r047", date: "05/18/26", source: "ACH", merchant: "MERCHANT SERVICES SETTLEMENT", description: "Card processor payout", amount: "$13,206.18", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r048", date: "05/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r049", date: "05/10/26", source: "Cashback Card", merchant: "PETCO", description: "Dog grooming supplies", amount: "($48.50)", mcc: "5995", mccLabel: "Pet Shops", signals: none },
  { id: "r050", date: "05/06/26", source: "Premium Card", merchant: "ONLINE WAGERING", description: "Sportsbook transaction", amount: "($125.00)", mcc: "7995", mccLabel: "Betting", signals: signal(RICKY_SIGNAL_LABELS.betting) },
  { id: "r051", date: "05/02/26", source: "Cashback Card", merchant: "HOME DESIGN STUDIO", description: "Furniture consultation", amount: "($640.00)", mcc: "5712", mccLabel: "Furniture Stores", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r052", date: "04/27/26", source: "Premium Card", merchant: "RACKET SPORTS CLUB", description: "Racquet restringing", amount: "($68.00)", mcc: "5941", mccLabel: "Sporting Goods", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r053", date: "04/23/26", source: "Cashback Card", merchant: "STARBUCKS COFFEE", description: "Coffee purchase", amount: "($7.85)", mcc: "5814", mccLabel: "Fast Food Restaurants", signals: none },
  { id: "r054", date: "04/19/26", source: "Checks", merchant: "BAY AREA APPRAISAL", description: "Residential appraisal", amount: "($925.00)", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r055", date: "04/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r056", date: "04/12/26", source: "Cashback Card", merchant: "APPLE SERVICES", description: "Cloud storage subscription", amount: "($9.99)", mcc: "5734", mccLabel: "Computer Software", signals: none },
  { id: "r057", date: "04/08/26", source: "ACH", merchant: "ACCOUNTING SERVICES", description: "Business bookkeeping", amount: "($780.00)", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r058", date: "04/04/26", source: "Zelle", merchant: "MORGAN T.", description: "Shared tickets", amount: "($145.00)", signals: none },
  { id: "r059", date: "03/30/26", source: "Premium Card", merchant: "CITY TENNIS CENTER", description: "Court reservation", amount: "($72.00)", mcc: "7997", mccLabel: "Membership Clubs", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r060", date: "03/26/26", source: "Cashback Card", merchant: "TRADER JOES", description: "Weekly groceries", amount: "($126.42)", mcc: "5411", mccLabel: "Grocery Stores", signals: none },
  { id: "r061", date: "03/22/26", source: "Premium Card", merchant: "ONLINE WAGERING", description: "Sportsbook transaction", amount: "($90.00)", mcc: "7995", mccLabel: "Betting", signals: signal(RICKY_SIGNAL_LABELS.betting) },
  { id: "r062", date: "03/18/26", source: "ACH", merchant: "MERCHANT SERVICES SETTLEMENT", description: "Card processor payout", amount: "$10,988.34", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r063", date: "03/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r064", date: "03/11/26", source: "Cashback Card", merchant: "VETERINARY CLINIC", description: "Annual wellness exam", amount: "($195.00)", signals: none },
  { id: "r065", date: "03/07/26", source: "Premium Card", merchant: "FOUR SEASONS DINING", description: "Weekend dinner", amount: "($284.70)", mcc: "5812", mccLabel: "Eating Places", signals: none },
  { id: "r066", date: "03/03/26", source: "ACH", merchant: "INTERNET PROVIDER", description: "Monthly internet service", amount: "($94.00)", signals: none },
  { id: "r067", date: "02/26/26", source: "Premium Card", merchant: "RACKET SPORTS CLUB", description: "Tennis equipment", amount: "($146.25)", mcc: "5941", mccLabel: "Sporting Goods", signals: signal(RICKY_SIGNAL_LABELS.tennis) },
  { id: "r068", date: "02/21/26", source: "Cashback Card", merchant: "UBER TRIP", description: "Airport ride", amount: "($54.80)", mcc: "4121", mccLabel: "Taxicabs and Rideshares", signals: none },
  { id: "r069", date: "02/18/26", source: "ACH", merchant: "COMMERCIAL SUPPLIER", description: "Inventory restock", amount: "($4,920.65)", signals: signal(RICKY_SIGNAL_LABELS.business) },
  { id: "r070", date: "02/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
  { id: "r071", date: "02/10/26", source: "Cashback Card", merchant: "WHOLE FOODS MARKET", description: "Weekly groceries", amount: "($168.34)", mcc: "5411", mccLabel: "Grocery Stores", signals: none },
  { id: "r072", date: "02/05/26", source: "Checks", merchant: "PROPERTY ATTORNEY", description: "Purchase contract review", amount: "($2,200.00)", signals: signal(RICKY_SIGNAL_LABELS.home) },
  { id: "r073", date: "01/29/26", source: "Premium Card", merchant: "ONLINE WAGERING", description: "Sportsbook transaction", amount: "($65.00)", mcc: "7995", mccLabel: "Betting", signals: signal(RICKY_SIGNAL_LABELS.betting) },
  { id: "r074", date: "01/24/26", source: "Premium Card", merchant: "HAWAIIAN AIRLINES", description: "Annual trip advance booking", amount: "($1,780.42)", mcc: "4511", mccLabel: "Air Carriers", signals: signal(RICKY_SIGNAL_LABELS.hawaii) },
  { id: "r075", date: "01/19/26", source: "Cashback Card", merchant: "CHEWY.COM", description: "Monthly pet supplies", amount: "($72.18)", mcc: "5995", mccLabel: "Pet Shops", signals: none },
  { id: "r076", date: "01/15/26", source: "ACH", merchant: "EXTERNAL BROKERAGE", description: "Recurring investment transfer", amount: "($5,000.00)", signals: signal(RICKY_SIGNAL_LABELS.brokerage) },
];
