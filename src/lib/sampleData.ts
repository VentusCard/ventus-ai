import { ClientProfileData } from "@/types/clientProfile";

// Sample customer profiles for each dataset
export const SAMPLE_CUSTOMER_1: ClientProfileData = {
  name: "Sarah Mitchell",
  segment: "Preferred",
  aum: "$650K",
  tenure: "2.5 years",
  contact: {
    email: "sarah.mitchell@gmail.com",
    phone: "(415) 555-1234",
    address: "1250 Market St, San Francisco, CA 94102",
  },
  demographics: {
    age: "32",
    occupation: "Product Manager",
    familyStatus: "Single",
    incomeLevel: "$150K-$200K",
    industry: "Technology",
  },
  holdings: {
    deposit: "$85K",
    credit: "$15K",
    mortgage: "$0",
    investments: "$550K",
  },
  compliance: {
    kycStatus: "Current",
    lastReview: "Oct 2024",
    nextReview: "Apr 2025",
    riskProfile: "Moderate",
  },
  milestones: [
    { event: "Account Opening", date: "Jun 2022" },
    { event: "Added Investment Account", date: "Sep 2022" },
  ],
};

export const SAMPLE_CUSTOMER_2: ClientProfileData = {
  name: "James Rodriguez",
  segment: "Preferred",
  aum: "$420K",
  tenure: "1.8 years",
  contact: {
    email: "james.rodriguez@outlook.com",
    phone: "(512) 555-8876",
    address: "850 Congress Ave, Austin, TX 78701",
  },
  demographics: {
    age: "29",
    occupation: "Software Engineer",
    familyStatus: "Engaged",
    incomeLevel: "$175K-$225K",
    industry: "Technology",
  },
  holdings: {
    deposit: "$65K",
    credit: "$8K",
    mortgage: "$0",
    investments: "$347K",
  },
  compliance: {
    kycStatus: "Current",
    lastReview: "Nov 2024",
    nextReview: "May 2025",
    riskProfile: "Aggressive",
  },
  milestones: [
    { event: "Account Opening", date: "Mar 2023" },
    { event: "IRA Rollover Completed", date: "Aug 2023" },
  ],
};

export const SAMPLE_CUSTOMER_3: ClientProfileData = {
  name: "Emily Chen",
  segment: "Private",
  aum: "$1.2M",
  tenure: "4.5 years",
  contact: {
    email: "emily.chen@icloud.com",
    phone: "(312) 555-4420",
    address: "2340 N Lincoln Ave, Chicago, IL 60614",
  },
  demographics: {
    age: "38",
    occupation: "Director of Operations",
    familyStatus: "Married, 2 children",
    incomeLevel: "$250K-$350K",
    industry: "Healthcare",
  },
  holdings: {
    deposit: "$180K",
    credit: "$22K",
    mortgage: "$485K",
    investments: "$997K",
  },
  compliance: {
    kycStatus: "Current",
    lastReview: "Sep 2024",
    nextReview: "Mar 2025",
    riskProfile: "Balanced",
  },
  milestones: [
    { event: "Account Opening", date: "Jul 2020" },
    { event: "Mortgage Refinance", date: "Feb 2022" },
    { event: "College Savings Plan Setup", date: "May 2023" },
  ],
};

export const SAMPLE_CUSTOMER_4: ClientProfileData = {
  name: "Michael Thompson",
  segment: "Premium",
  aum: "$2.8M",
  tenure: "8.2 years",
  contact: {
    email: "michael.thompson@gmail.com",
    phone: "(415) 555-9921",
    address: "789 Pacific Heights Blvd, San Francisco, CA 94102",
  },
  demographics: {
    age: "48",
    occupation: "Managing Partner",
    familyStatus: "Married, 2 children",
    incomeLevel: "$500K-$750K",
    industry: "Legal",
  },
  holdings: {
    deposit: "$320K",
    credit: "$45K",
    mortgage: "$950K",
    investments: "$2.4M",
  },
  compliance: {
    kycStatus: "Current",
    lastReview: "Aug 2024",
    nextReview: "Feb 2025",
    riskProfile: "Balanced",
  },
  milestones: [
    { event: "Account Opening", date: "Nov 2016" },
    { event: "Trust Account Established", date: "Mar 2019" },
    { event: "Premium Status Achieved", date: "Jun 2020" },
    { event: "Estate Planning Review", date: "Sep 2024" },
  ],
};

export const SAMPLE_CUSTOMER_5: ClientProfileData = {
  name: "Amanda Williams",
  segment: "Private",
  aum: "$1.5M",
  tenure: "5.5 years",
  contact: {
    email: "amanda.williams@yahoo.com",
    phone: "(212) 555-3847",
    address: "45 E 10th St, New York, NY 10003",
  },
  demographics: {
    age: "42",
    occupation: "Investment Banker",
    familyStatus: "Married, 1 child",
    incomeLevel: "$400K-$600K",
    industry: "Finance",
  },
  holdings: {
    deposit: "$210K",
    credit: "$35K",
    mortgage: "$720K",
    investments: "$1.25M",
  },
  compliance: {
    kycStatus: "Current",
    lastReview: "Oct 2024",
    nextReview: "Apr 2025",
    riskProfile: "Moderate",
  },
  milestones: [
    { event: "Account Opening", date: "Jun 2019" },
    { event: "Added Joint Account", date: "Dec 2020" },
    { event: "Wealth Planning Session", date: "Mar 2024" },
  ],
};

export const SAMPLE_CUSTOMER_6: ClientProfileData = {
  name: "Robert Garcia",
  segment: "Premium",
  aum: "$3.2M",
  tenure: "10.3 years",
  contact: {
    email: "robert.garcia@outlook.com",
    phone: "(312) 555-7712",
    address: "1200 N State Pkwy, Chicago, IL 60610",
  },
  demographics: {
    age: "55",
    occupation: "Chief Technology Officer",
    familyStatus: "Married, adult children",
    incomeLevel: "$600K-$1M",
    industry: "Technology",
  },
  holdings: {
    deposit: "$450K",
    credit: "$28K",
    mortgage: "$380K",
    investments: "$2.75M",
  },
  compliance: {
    kycStatus: "Current",
    lastReview: "Jul 2024",
    nextReview: "Jan 2025",
    riskProfile: "Conservative",
  },
  milestones: [
    { event: "Account Opening", date: "Sep 2014" },
    { event: "Premium Status Achieved", date: "Mar 2017" },
    { event: "Trust Account Established", date: "Nov 2020" },
    { event: "Retirement Planning Session", date: "Jun 2024" },
  ],
};

export const SAMPLE_CSV = `transaction_id,merchant_name,description,mcc,amount,date,zip_code
txn_001,STARBUCKS COFFEE #1234,Coffee and pastry purchase,5814,12.45,2025-08-15,94102
txn_002,WHOLE FOODS MARKET,Weekly grocery shopping,5411,156.78,2025-08-16,94102
txn_003,EQUINOX FITNESS,Monthly gym membership fee,7997,200.00,2025-08-15,94102
txn_004,SHELL OIL 78945,Gasoline fill-up,5541,45.20,2025-08-17,94103
txn_005,PAYPAL*TICKETMASTR,Concert tickets - Sabrina Carpenter,7996,287.50,2025-08-17,
txn_006,AplPAY UBER EATS,Food delivery via Apple Pay,5814,45.30,2025-08-18,
txn_007,AMAZON.COM,Online shopping - books,5942,34.99,2025-08-18,
txn_008,PAYPAL*ETSY,Handmade home decor,5969,78.25,2025-08-19,
txn_009,DELTA AIR LINES,Flight to NYC JFK,4511,450.00,2025-08-12,94102
txn_010,MARRIOTT HOTELS,Hotel stay 3 nights,7011,600.00,2025-08-13,10036
txn_011,CVS PHARMACY,Prescription medication,5912,28.50,2025-08-19,94102
txn_012,LULULEMON,Athletic wear purchase,5651,89.00,2025-08-20,94102
txn_013,CHEWY.COM,Dog food and supplies,5995,67.89,2025-08-21,94102
txn_014,NETFLIX.COM,Monthly streaming subscription,4899,15.99,2025-08-15,
txn_015,UBER TRIP,Ride to downtown,4121,23.50,2025-08-22,94102
txn_016,CHIPOTLE MEXICAN GRILL,Lunch burrito bowl,5814,11.75,2025-08-22,94102
txn_017,TARGET STORES,Home goods and groceries,5411,127.34,2025-08-23,94103
txn_018,AplPAY APPLE.COM,App Store purchases via Apple Pay,5734,4.99,2025-08-15,
txn_019,LA FITNESS,Gym membership renewal,7997,29.99,2025-08-24,94102
txn_020,SEPHORA,Cosmetics and skincare,5977,156.50,2025-08-25,94102
txn_021,PETSMART,Pet supplies,5995,43.20,2025-08-26,94103
txn_022,SPOTIFY,Premium music subscription,4899,10.99,2025-08-15,
txn_023,PAYPAL*STUBHUB,Broadway show tickets,7922,195.00,2025-08-26,
txn_024,SOUTHWEST AIRLINES,Flight booking,4511,289.00,2025-08-27,
txn_025,WALGREENS,Pharmacy and sundries,5912,34.67,2025-08-28,94102
txn_026,PANERA BREAD,Lunch and coffee,5814,18.45,2025-08-29,94102
txn_027,HOME DEPOT,Home improvement supplies,5211,234.56,2025-08-30,94103
txn_028,TRADER JOES,Grocery shopping,5411,89.23,2025-08-31,94102
txn_029,NORDSTROM,Clothing purchase,5651,178.90,2025-09-01,94102
txn_030,PETCO,Dog treats and toys,5995,28.40,2025-09-02,94103
txn_031,AMC THEATRES,Movie tickets and snacks,7832,42.00,2025-09-03,94102
txn_032,DOORDASH,Food delivery,5814,35.60,2025-09-04,94102
txn_033,SHELL OIL,Gas station,5541,52.30,2025-09-05,94103
txn_034,COSTCO WHOLESALE,Bulk shopping,5411,198.76,2025-09-06,94102
txn_035,BLUE APRON,Meal kit delivery,5814,71.94,2025-08-08,
txn_036,EQUINOX SPA,Spa treatment,7298,150.00,2025-09-07,94102
txn_037,BARNES & NOBLE,Books purchase,5942,45.80,2025-09-08,94102
txn_038,VETERINARY CLINIC,Dog annual checkup,0742,185.00,2025-09-09,94103
txn_039,HULU,Streaming subscription,4899,14.99,2025-08-15,
txn_040,LYFT RIDE,Ride to airport,4121,35.80,2025-09-10,94102
txn_041,OLIVE GARDEN,Dinner for two,5812,67.50,2025-09-11,94103
txn_042,IKEA,Furniture purchase,5712,345.00,2025-09-12,94102
txn_043,ULTA BEAUTY,Beauty products,5977,92.30,2025-09-13,94102
txn_044,PETFOOD EXPRESS,Premium dog food,5995,54.99,2025-09-14,94103
txn_045,HBO MAX,Streaming subscription,4899,15.99,2025-08-15,
txn_046,STARBUCKS COFFEE,Morning coffee,5814,6.75,2025-09-15,94102
txn_047,RITE AID PHARMACY,Over-the-counter meds,5912,18.90,2025-09-16,94103
txn_048,NIKE STORE,Running shoes,5661,129.99,2025-09-17,94102
txn_049,HILTON HOTELS,Business travel accommodation,7011,425.00,2025-09-18,94102
txn_050,WHOLE FOODS,Organic groceries,5411,143.56,2025-09-19,94102
txn_051,PLANET FITNESS,Monthly membership,7997,22.99,2025-09-15,94102
txn_052,WARBY PARKER,Prescription glasses,5995,195.00,2025-09-20,94102
txn_053,GRUBHUB,Dinner delivery,5814,42.30,2025-09-21,
txn_054,LOWES,Garden supplies,5211,87.45,2025-09-22,94103
txn_055,SHELL OIL LOCAL,Gas station home,5541,48.20,2025-09-23,94102
txn_056,DELTA AIR LINES NYC,Flight to LaGuardia NYC,4511,520.00,2025-09-24,
txn_057,MARRIOTT TIMES SQUARE,Hotel check-in NYC 4 nights,7011,950.00,2025-09-24,10036
txn_058,SHELL OIL QUEENS NY,Gas rental car Queens,5541,58.30,2025-09-24,11101
txn_059,UBER NYC,Ride from airport to hotel,4121,45.80,2025-09-24,10036
txn_060,STARBUCKS MANHATTAN,Coffee in Times Square,5814,8.95,2025-09-25,10036
txn_061,JOES PIZZA NYC,Lunch Manhattan,5814,22.50,2025-09-25,10001
txn_062,BROADWAY THEATRE,Hamilton tickets,7922,350.00,2025-09-25,10036
txn_063,UBER NYC,Ride to Broadway,4121,18.40,2025-09-25,10036
txn_064,SHELL OIL BROOKLYN,Gas fill-up Brooklyn,5541,62.15,2025-09-26,11211
txn_065,WHOLE FOODS MANHATTAN,Groceries for hotel,5411,45.70,2025-09-26,10001
txn_066,MET MUSEUM NYC,Museum admission,8999,30.00,2025-09-26,10028
txn_067,LYFT NYC,Ride to museum,4121,22.30,2025-09-26,10028
txn_068,CENTRAL PARK CAFE,Lunch in park,5814,28.60,2025-09-27,10024
txn_069,UBER NYC,Ride to airport,4121,52.90,2025-09-28,11101
txn_070,DELTA AIR LINES,Return flight home,4511,480.00,2025-09-28,
txn_071,SHELL OIL LOCAL,Gas station home,5541,49.10,2025-09-29,94102
txn_072,STARBUCKS COFFEE,Morning coffee home,5814,6.75,2025-09-30,94102
txn_073,COLLEGEBOARD SAT,SAT registration fee,8299,68.00,2025-10-05,
txn_074,KAPLAN TEST PREP,SAT prep course,8299,1299.00,2025-10-08,94102
txn_075,STANFORD VISITOR PARKING,Campus tour parking,7523,25.00,2025-10-14,94305
`;

export const SAMPLE_CSV_SPORTS_WELLNESS = `transaction_id,merchant_name,description,mcc,amount,date,zip_code
txn_s001,LULULEMON ATHLETICA,Yoga pants and sports bra,5655,189.00,2025-08-15,
txn_s002,WHOLE FOODS MARKET,Organic groceries and supplements,5411,143.67,2025-08-15,78701
txn_s003,EQUINOX AUSTIN,Monthly gym membership premium,7997,250.00,2025-08-15,
txn_s004,JUICE LAND,Post-workout green juice,5814,12.50,2025-08-16,
txn_s005,GNC LIVE WELL,Protein powder and vitamins,5499,87.45,2025-08-16,
txn_s006,REI CO-OP,Hiking boots and trail gear,5941,234.99,2025-08-17,78701
txn_s007,NIKE STORE AUSTIN,Running shoes,5661,159.99,2025-08-17,
txn_s008,BARRYS BOOTCAMP,5-class package,7997,150.00,2025-08-18,
txn_s009,SNAP KITCHEN,Healthy meal prep 5 days,5814,89.50,2025-08-18,
txn_s010,VITAMIN SHOPPE,Pre-workout and BCAAs,5499,62.30,2025-08-19,
txn_s011,TRADER JOES,Healthy snacks and produce,5411,67.89,2025-08-19,78701
txn_s012,SOULCYCLE AUSTIN,Cycling class 3-pack,7997,85.00,2025-08-20,
txn_s013,ATHLETA,Workout leggings and tank tops,5655,156.50,2025-08-20,
txn_s014,PICNIK AUSTIN,Protein coffee and breakfast,5814,15.75,2025-08-21,
txn_s015,DICKS SPORTING GOODS,Dumbbells and resistance bands,5941,178.90,2025-08-21,78701
txn_s016,WHOLE FOODS MARKET,Organic meat and vegetables,5411,124.56,2025-08-22,78701
txn_s017,LIFETIME FITNESS,Personal training session,7997,95.00,2025-08-22,
txn_s018,SMOOTHIE KING,Post-workout protein smoothie,5814,9.95,2025-08-23,
txn_s019,UNDER ARMOUR,Athletic wear and socks,5655,98.40,2025-08-23,
txn_s020,SPROUTS FARMERS MARKET,Organic produce and supplements,5411,89.23,2025-08-24,
txn_s021,AUSTIN ROCK GYM,Day pass and gear rental,7997,45.00,2025-08-24,
txn_s022,ROGUE FITNESS AUSTIN,Kettlebells and yoga mat,5941,267.80,2025-08-25,78701
txn_s023,ELEMENTS MASSAGE,Deep tissue massage 90min,7298,145.00,2025-08-25,
txn_s024,WHOLE FOODS MARKET,Supplements and protein bars,5411,78.90,2025-08-26,78701
txn_s025,ORANGE THEORY FITNESS,Monthly membership,7997,189.00,2025-08-26,
txn_s026,PATAGONIA AUSTIN,Running jacket and shorts,5655,198.50,2025-08-27,
txn_s027,FACTOR MEALS,Meal delivery service,5814,119.94,2025-08-27,
txn_s028,SEPHORA,Sport sunscreen and skincare,5977,67.30,2025-08-28,
txn_s029,YOGA YOGA AUSTIN,10-class pass,7997,120.00,2025-08-28,
txn_s030,JUICE LAND,Acai bowl and smoothie,5814,16.50,2025-08-29,
txn_s031,REI CO-OP,Camping gear and backpack,5941,345.67,2025-08-29,
txn_s032,WHOLE FOODS MARKET,Weekly organic groceries,5411,156.78,2025-08-30,78701
txn_s033,LULULEMON ATHLETICA,Sports bras and headbands,5655,134.00,2025-08-30,
txn_s034,SHELL OIL,Gas fill-up,5541,52.30,2025-08-31,78701
txn_s035,AUSTIN CHIROPRACTIC,Adjustment and therapy,8049,95.00,2025-08-31,
txn_s036,SNAP KITCHEN,Lunch bowls 5-pack,5814,67.50,2025-09-01,
txn_s037,DICKS SPORTING GOODS,Foam roller and stretch bands,5941,89.99,2025-09-01,78701
txn_s038,RESTORE HYPER WELLNESS,Cryotherapy session,7298,65.00,2025-09-02,
txn_s039,TRADER JOES,Healthy snacks and produce,5411,73.45,2025-09-02,
txn_s040,NIKE STORE AUSTIN,Training shoes and apparel,5661,198.00,2025-09-03,
txn_s041,BARRYS BOOTCAMP,Single class drop-in,7997,34.00,2025-09-03,
txn_s042,PICNIK AUSTIN,Coffee and breakfast burrito,5814,14.30,2025-09-04,
txn_s043,GNC LIVE WELL,Multivitamins and fish oil,5499,54.20,2025-09-04,
txn_s044,WHOLE FOODS MARKET,Organic groceries and juice,5411,132.90,2025-09-05,78701
txn_s045,ATHLETA,Running shorts and top,5655,112.50,2025-09-05,
txn_s046,SOULCYCLE AUSTIN,Single ride,7997,32.00,2025-09-06,
txn_s047,SMOOTHIE KING,Green smoothie,5814,10.50,2025-09-06,
txn_s048,VITAMIN SHOPPE,Protein bars and collagen,5499,48.90,2025-09-07,
txn_s049,SPROUTS FARMERS MARKET,Organic produce and nuts,5411,95.67,2025-09-07,
txn_s050,REI CO-OP,Hydration pack and water bottle,5941,87.50,2025-09-08,
txn_s051,ELEMENTS MASSAGE,Sports massage 60min,7298,95.00,2025-09-08,
txn_s052,LULULEMON ATHLETICA,Yoga mat and blocks,5655,78.00,2025-09-09,
txn_s053,FACTOR MEALS,Weekly meal delivery,5814,119.94,2025-09-09,
txn_s054,WHOLE FOODS MARKET,Supplements and vitamins,5411,89.45,2025-09-10,78701
txn_s055,ORANGE THEORY FITNESS,Extra class fee,7997,18.00,2025-09-10,
txn_s056,UNDER ARMOUR,Compression wear,5655,87.30,2025-09-11,
txn_s057,JUICE LAND,Protein smoothie bowl,5814,13.75,2025-09-11,
txn_s058,DICKS SPORTING GOODS,Resistance bands set,5941,45.99,2025-09-12,78701
txn_s059,SHELL OIL,Gas station,5541,48.70,2025-09-12,78701
txn_s060,HILTON DALLAS,Weekend trip hotel 2 nights,7011,320.00,2025-09-13,75201
txn_s061,SHELL OIL DALLAS,Gas fill-up Dallas,5541,55.40,2025-09-13,75201
txn_s062,WHOLE FOODS DALLAS,Groceries while traveling,5411,45.60,2025-09-14,75201
txn_s063,YOGA STUDIO DALLAS,Drop-in class,7997,25.00,2025-09-14,
txn_s064,SHELL OIL,Gas return home,5541,51.20,2025-09-15,78701
txn_s065,TRADER JOES,Weekly groceries,5411,82.35,2025-09-16,78701
txn_s066,BARRYS BOOTCAMP,Class package renewal,7997,150.00,2025-09-16,
txn_s067,NIKE STORE AUSTIN,Athletic socks and headband,5661,45.50,2025-09-17,
txn_s068,SNAP KITCHEN,Healthy dinner meals,5814,78.00,2025-09-17,
txn_s069,GNC LIVE WELL,Post-workout recovery drink,5499,36.80,2025-09-18,
txn_s070,WHOLE FOODS MARKET,Organic groceries weekly,5411,167.89,2025-09-19,78701
txn_s071,RESTORE HYPER WELLNESS,IV therapy session,7298,175.00,2025-09-20,
txn_s072,LULULEMON ATHLETICA,Workout jacket,5655,148.00,2025-09-21,
txn_s073,PICNIK AUSTIN,Breakfast and coffee,5814,16.90,2025-09-22,
txn_s074,ATHLETA,Yoga pants and bra,5655,134.50,2025-09-23,
txn_s075,WHOLE FOODS MARKET,Final weekly groceries,5411,145.23,2025-09-24,78701
txn_s076,BUY BUY BABY,Nursery furniture and crib,5641,1250.00,2025-10-02,78701
txn_s077,AUSTIN OB GYN ASSOCIATES,Prenatal checkup,8011,350.00,2025-10-05,78701
txn_s078,POTTERY BARN KIDS,Nursery decor and bedding,5712,485.00,2025-10-08,78701
`;

export const SAMPLE_CSV_FOOD_HOME = `transaction_id,merchant_name,description,mcc,amount,date,zip_code
txn_h001,GIBSONS BAR & STEAKHOUSE,Anniversary dinner,5812,287.50,2025-08-15,60614
txn_h002,WHOLE FOODS MARKET,Weekly grocery shopping,5411,167.89,2025-08-15,60614
txn_h003,HOME DEPOT,Kitchen cabinet hardware,5211,156.78,2025-08-16,60614
txn_h004,MARIANO'S,Large grocery haul,5411,234.56,2025-08-16,60614
txn_h005,STARBUCKS COFFEE,Morning coffee routine,5814,6.75,2025-08-17,60614
txn_h006,UBER EATS,Dinner delivery,5814,45.30,2025-08-17,60614
txn_h007,MENARDS,Home improvement supplies,5211,198.90,2025-08-18,60614
txn_h008,PORTILLOS HOT DOGS,Chicago classic lunch,5814,18.45,2025-08-18,60614
txn_h009,TRADER JOES,Specialty groceries,5411,89.23,2025-08-19,60614
txn_h010,NETFLIX,Monthly subscription,4899,15.99,2025-08-15,
txn_h011,TARGET,Home décor and essentials,5411,145.67,2025-08-19,60614
txn_h012,LOU MALNATIS PIZZERIA,Deep dish pizza dinner,5812,67.50,2025-08-20,60614
txn_h013,LOWE'S,Garden tools and plants,5211,124.30,2025-08-20,60657
txn_h014,PANERA BREAD,Lunch and coffee,5814,16.90,2025-08-21,60614
txn_h015,COSTCO WHOLESALE,Bulk grocery shopping,5411,298.76,2025-08-21,60614
txn_h016,SHELL,Gas fill-up,5541,52.30,2025-08-22,60614
txn_h017,CRATE AND BARREL,Living room pillows,5712,156.50,2025-08-22,60614
txn_h018,WHOLE FOODS MARKET,Organic produce,5411,124.56,2025-08-23,60614
txn_h019,DOORDASH,Late night food delivery,5814,38.60,2025-08-23,60614
txn_h020,ACE HARDWARE,Plumbing supplies,5251,67.80,2025-08-24,60614
txn_h021,CHIPOTLE MEXICAN GRILL,Quick lunch,5814,12.75,2025-08-24,60614
txn_h022,WEST ELM,Bedroom furniture,5712,567.90,2025-08-25,60610
txn_h023,MARIANO'S,Weekly groceries,5411,178.45,2025-08-25,60614
txn_h024,RPM ITALIAN,Date night dinner,5812,198.75,2025-08-26,60610
txn_h025,HOME DEPOT,Power tools,5211,234.99,2025-08-26,60614
txn_h026,HULU,Monthly subscription,4899,14.99,2025-08-15,
txn_h027,STARBUCKS COFFEE,Coffee run,5814,7.25,2025-08-27,60614
txn_h028,TRADER JOES,Grocery shopping,5411,95.67,2025-08-27,60614
txn_h029,GRUBHUB,Lunch delivery,5814,28.40,2025-08-28,60614
txn_h030,COMED,Electric utility bill,4900,145.67,2025-08-28,60614
txn_h031,IKEA,Dining room furniture,5712,445.00,2025-08-29,60126
txn_h032,WHOLE FOODS MARKET,Specialty items,5411,134.90,2025-08-29,60614
txn_h033,PEQUODS PIZZA,Weekend dinner,5812,54.30,2025-08-30,60614
txn_h034,BP,Gas station,5541,48.70,2025-08-30,60614
txn_h035,HOMEGOODS,Bathroom accessories,5714,89.50,2025-08-31,60614
txn_h036,MARIANO'S,Weekly grocery run,5411,187.34,2025-08-31,60614
txn_h037,PEOPLES GAS,Gas utility bill,4900,89.45,2025-09-01,60614
txn_h038,PANERA BREAD,Breakfast and coffee,5814,13.60,2025-09-01,60614
txn_h039,BEST BUY,Kitchen appliances,5722,567.89,2025-09-02,60614
txn_h040,UBER EATS,Dinner delivery,5814,42.30,2025-09-02,60614
txn_h041,GIRL AND THE GOAT,Celebration dinner,5812,234.50,2025-09-03,60607
txn_h042,TARGET,Household supplies,5411,98.45,2025-09-03,60614
txn_h043,HELLOFRESH,Weekly meal kit delivery,5814,89.94,2025-09-04,
txn_h044,STARBUCKS COFFEE,Morning coffee,5814,6.95,2025-09-04,60614
txn_h045,HOME DEPOT,Bathroom renovation supplies,5211,456.78,2025-09-05,60614
txn_h046,WHOLE FOODS MARKET,Organic groceries,5411,156.78,2025-09-05,60614
txn_h047,COSTCO WHOLESALE,Monthly bulk shopping,5411,312.45,2025-09-06,60614
txn_h048,ROTO-ROOTER,Plumbing service call,1711,285.00,2025-09-06,60614
txn_h049,CHIPOTLE MEXICAN GRILL,Lunch,5814,14.25,2025-09-07,60614
txn_h050,CB2,Modern furniture pieces,5712,389.00,2025-09-07,60614
txn_h051,MARIANO'S,Weekly groceries,5411,167.89,2025-09-08,60614
txn_h052,DOORDASH,Lunch delivery,5814,32.75,2025-09-08,60614
txn_h053,SPOTIFY,Premium subscription,4899,10.99,2025-09-08,
txn_h054,LOWE'S,Outdoor patio furniture,5211,678.90,2025-09-09,60657
txn_h055,PORTILLOS,Quick dinner,5814,24.50,2025-09-09,60614
txn_h056,TRADER JOES,Specialty groceries,5411,102.34,2025-09-10,60614
txn_h057,MARATHON,Gas fill-up,5541,51.20,2025-09-10,60614
txn_h058,STANLEY STEEMER,Carpet cleaning service,7217,195.00,2025-09-11,60614
txn_h059,WHOLE FOODS MARKET,Weekly shopping,5411,178.90,2025-09-11,60614
txn_h060,AMAZON PRIME,Annual membership renewal,5999,139.00,2025-09-11,
txn_h061,HOME DEPOT,Washer and dryer,5722,1289.00,2025-09-12,60614
txn_h062,LOU MALNATIS PIZZERIA,Family dinner,5812,89.40,2025-09-12,60614
txn_h063,CVS PHARMACY,Household items,5912,34.67,2025-09-13,60614
txn_h064,PANERA BREAD,Lunch meeting,5814,22.80,2025-09-13,60614
txn_h065,WAYFAIR,Online furniture purchase,5712,445.67,2025-09-14,
txn_h066,COSTCO WHOLESALE,Bulk food items,5411,245.78,2025-09-14,60614
txn_h067,ULTA BEAUTY,Personal care items,5977,87.50,2025-09-15,60614
txn_h068,STARBUCKS COFFEE,Coffee and pastry,5814,9.45,2025-09-15,60614
txn_h069,MARIANO'S,Weekly grocery shopping,5411,189.56,2025-09-16,60614
txn_h070,GRUBHUB,Dinner delivery,5814,51.30,2025-09-16,60614
txn_h071,WALGREENS,Pharmacy and sundries,5912,28.90,2025-09-17,60614
txn_h072,AMC THEATRES,Movie night,7832,42.00,2025-09-17,60610
txn_h073,MUSIC BOX THEATRE,Indie film tickets,7832,28.00,2025-09-18,60614
txn_h074,WHOLE FOODS MARKET,Final weekly groceries,5411,167.34,2025-09-19,60614
txn_h075,ETSY,Handmade home décor,5969,78.25,2025-09-19,
txn_h076,GUARANTEED RATE MORTGAGE,Pre-approval application fee,6163,500.00,2025-10-03,60601
txn_h077,CHICAGO HOME INSPECTIONS,Home inspection service,7389,450.00,2025-10-08,60614
txn_h078,CHICAGO TITLE COMPANY,Title search and escrow,6411,1200.00,2025-10-12,60601
`;

export const PILLAR_COLORS: Record<string, string> = {
  "Sports & Active Living": "#3b82f6",
  "Health & Wellness": "#10b981",
  "Food & Dining": "#f59e0b",
  "Travel & Exploration": "#8b5cf6",
  "Home & Living": "#ec4899",
  "Style & Beauty": "#f43f5e",
  "Pets": "#06b6d4",
  "Entertainment & Culture": "#6366f1",
  "Technology & Digital Life": "#ef4444",
  "Family & Community": "#14b8a6",
  "Financial & Aspirational": "#a855f7",
  "Miscellaneous & Unclassified": "#64748b"
};

export const LIFESTYLE_PILLARS = [
  "Sports & Active Living",
  "Health & Wellness",
  "Food & Dining",
  "Travel & Exploration",
  "Home & Living",
  "Style & Beauty",
  "Pets",
  "Entertainment & Culture",
  "Technology & Digital Life",
  "Family & Community",
  "Financial & Aspirational",
  "Miscellaneous & Unclassified"
];

export const SAMPLE_CSV_TRAVEL_FAMILY_12 = `transaction_id,merchant_name,description,mcc,amount,date,zip_code
txn_sf001,AFTER SCHOOL CARE,November payment,8299,450.00,2024-11-01,94102
txn_sf002,SF PARKING GARAGE,Monthly parking,7523,225.00,2024-11-01,94102
txn_sf003,KIDS SOCCER LEAGUE,Fall season,7941,295.00,2024-11-05,94102
txn_sf004,SAFEWAY,Weekly shopping,5411,178.90,2024-11-11,94102
txn_sf005,CHEVRON,Gas fill-up,5541,69.40,2024-11-13,94102
txn_sf006,WHOLE FOODS MARKET,Weekly groceries,5411,223.45,2024-11-18,94102
txn_sf007,UNITED AIRLINES,Flight to Bozeman family,4511,1345.00,2024-11-25,94102
txn_sf008,BUDGET BOZEMAN,SUV rental 5 days,7512,467.00,2024-11-25,59715
txn_sf009,YELLOWSTONE LODGE,Hotel 4 nights,7011,1234.00,2024-11-25,82190
txn_sf010,SHELL MONTANA,Gas fill-up,5541,64.80,2024-11-25,59715
txn_sf011,ALBERTSONS BOZEMAN,Groceries for lodge,5411,98.60,2024-11-25,59715
txn_sf012,YELLOWSTONE TOURS,Guided wildlife tour,7999,289.00,2024-11-26,82190
txn_sf013,SHELL YELLOWSTONE,Gas in park,5541,72.30,2024-11-26,82190
txn_sf014,OLD FAITHFUL INN,Dinner with view,5812,145.70,2024-11-26,82190
txn_sf015,YELLOWSTONE GIFT SHOP,Souvenirs,5999,67.80,2024-11-27,82190
txn_sf016,SHELL MONTANA,Gas station,5541,68.90,2024-11-28,59715
txn_sf017,MONTANA CAFE,Thanksgiving dinner,5812,189.00,2024-11-28,59715
txn_sf018,SHELL BOZEMAN,Final gas,5541,66.40,2024-11-29,59715
txn_sf019,BUDGET,Return car,7512,0.00,2024-11-29,59715
txn_sf020,UNITED AIRLINES,Return flight home,4511,1345.00,2024-11-29,
txn_sf021,CHEVRON,Gas at home,5541,70.20,2024-11-30,94102
txn_sf022,AFTER SCHOOL CARE,December payment,8299,450.00,2024-12-01,94102
txn_sf023,SF PARKING GARAGE,Monthly parking,7523,225.00,2024-12-01,94102
txn_sf024,COSTCO WHOLESALE,Post-trip shopping,5300,287.90,2024-12-02,94102
txn_sf025,SAFEWAY,Weekly groceries,5411,189.45,2024-12-09,94102
txn_sf026,CHEVRON,Gas fill-up,5541,69.70,2024-12-11,94102
txn_sf027,TARGET,Holiday shopping,5411,456.78,2024-12-15,94102
txn_sf028,TOYS R US,Kids gifts,5945,334.90,2024-12-18,94102
txn_sf029,WHOLE FOODS MARKET,Holiday groceries,5411,312.56,2024-12-20,94102
txn_sf030,CHEVRON,Gas station,5541,71.30,2024-12-22,94102
txn_sf031,AMAZON.COM,Holiday gifts,5999,789.00,2024-12-19,
txn_sf032,COSTCO WHOLESALE,Holiday party,5300,234.67,2024-12-23,94102
txn_sf033,SAFEWAY,Christmas dinner,5411,289.90,2024-12-24,94102
txn_sf034,AMC THEATRES,Family movie,7832,62.00,2024-12-26,94102
txn_sf035,CHEVRON,End of year gas,5541,70.50,2024-12-30,94102
txn_sf036,SAFEWAY,New Years groceries,5411,178.45,2025-01-02,94102
txn_sf037,AFTER SCHOOL CARE,January payment,8299,450.00,2025-01-02,94102
txn_sf038,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-01-01,94102
txn_sf039,COSTCO WHOLESALE,Monthly shopping,5300,298.67,2025-01-06,94102
txn_sf040,CHEVRON,Gas fill-up,5541,72.10,2025-01-08,94102
txn_sf041,TRADER JOES,Weekly groceries,5411,156.78,2025-01-13,94102
txn_sf042,WHOLE FOODS MARKET,Organic groceries,5411,234.56,2025-01-20,94102
txn_sf043,CHEVRON,Gas station,5541,70.30,2025-01-23,94102
txn_sf044,SAFEWAY,Weekly shopping,5411,189.34,2025-01-27,94102
txn_sf045,KIDS SWIM LESSONS,Winter session,7941,185.00,2025-01-29,94102
txn_sf046,AFTER SCHOOL CARE,February payment,8299,450.00,2025-02-01,94102
txn_sf047,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-02-01,94102
txn_sf048,CHEVRON,Gas fill-up,5541,69.80,2025-02-03,94102
txn_sf049,ANA ALL NIPPON,Flight to Tokyo family,4511,3456.00,2025-02-10,94102
txn_sf050,TIMES CAR RENTAL,Compact car 10 days,7512,678.00,2025-02-10,100
txn_sf051,KEIO PLAZA TOKYO,Hotel 9 nights,7011,3890.00,2025-02-10,160
txn_sf052,ENEOS GAS TOKYO,Gas fill-up,5541,45.60,2025-02-11,100
txn_sf053,FAMILY MART,Convenience store,5411,34.50,2025-02-11,100
txn_sf054,TOKYO DISNEYLAND,Park tickets family,7996,456.00,2025-02-12,279
txn_sf055,DISNEY RESTAURANT TOKYO,Lunch in park,5812,98.70,2025-02-12,279
txn_sf056,ENEOS GAS,Gas station,5541,48.30,2025-02-13,100
txn_sf057,TEAMLAB BORDERLESS,Museum tickets,7998,134.00,2025-02-13,135
txn_sf058,LAWSON STORE,Groceries,5411,56.80,2025-02-14,160
txn_sf059,TOKYO DISNEYSEA,Park admission,7996,456.00,2025-02-14,279
txn_sf060,SUSHI RESTAURANT TOKYO,Dinner,5812,178.90,2025-02-15,100
txn_sf061,ENEOS GAS,Gas fill-up,5541,47.20,2025-02-16,100
txn_sf062,UENO ZOO,Zoo admission,7998,23.40,2025-02-16,110
txn_sf063,AKIHABARA SHOPS,Shopping district,5999,234.60,2025-02-17,101
txn_sf064,RAMEN ICHIRAN,Lunch,5814,45.80,2025-02-17,150
txn_sf065,ENEOS GAS,Gas station,5541,46.90,2025-02-18,100
txn_sf066,TOKYO TOWER,Tower admission,7996,67.80,2025-02-18,105
txn_sf067,FAMILY MART,Snacks and drinks,5411,28.90,2025-02-19,100
txn_sf068,ENEOS GAS,Final gas,5541,44.70,2025-02-19,100
txn_sf069,TIMES CAR,Return car,7512,0.00,2025-02-19,100
txn_sf070,NARITA EXPRESS,Train to airport,4111,89.00,2025-02-20,282
txn_sf071,ANA ALL NIPPON,Return flight home,4511,3456.00,2025-02-20,
txn_sf072,CHEVRON,Gas at home,5541,71.50,2025-02-21,94102
txn_sf073,COSTCO WHOLESALE,Post-trip shopping,5300,298.90,2025-02-24,94102
txn_sf074,SAFEWAY,Weekly groceries,5411,189.45,2025-03-03,94102
txn_sf075,AFTER SCHOOL CARE,March payment,8299,450.00,2025-03-01,94102
txn_sf076,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-03-01,94102
txn_sf077,CHEVRON,Gas fill-up,5541,70.30,2025-03-05,94102
txn_sf078,TRADER JOES,Weekly shopping,5411,167.89,2025-03-10,94102
txn_sf079,WHOLE FOODS MARKET,Organic groceries,5411,234.56,2025-03-17,94102
txn_sf080,CHEVRON,Gas station,5541,69.80,2025-03-20,94102
txn_sf081,KIDS SOCCER LEAGUE,Spring season,7941,295.00,2025-03-18,94102
txn_sf082,SAFEWAY,Weekly groceries,5411,198.34,2025-03-24,94102
txn_sf083,COSTCO WHOLESALE,Bulk shopping,5300,289.67,2025-03-31,94102
txn_sf084,AFTER SCHOOL CARE,April payment,8299,450.00,2025-04-01,94102
txn_sf085,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-04-01,94102
txn_sf086,CHEVRON,Gas fill-up,5541,72.10,2025-04-03,94102
txn_sf087,UNITED AIRLINES,Flight to Costa Rica family,4511,1678.00,2025-04-08,94102
txn_sf088,ECONOMY RENT-A-CAR,SUV rental 7 days,7512,567.00,2025-04-08,20101
txn_sf089,FOUR SEASONS PAPAGAYO,Resort 6 nights,7011,3890.00,2025-04-08,50503
txn_sf090,PURA VIDA GAS,Gas fill-up,5541,42.60,2025-04-09,20101
txn_sf091,AUTOMERCADO,Groceries for resort,5411,67.80,2025-04-09,20101
txn_sf092,ZIP LINE TOUR COSTA RICA,Canopy tour,7999,234.00,2025-04-10,50503
txn_sf093,LOCAL RESTAURANT CR,Dinner,5812,98.50,2025-04-10,20101
txn_sf094,PURA VIDA GAS,Gas station,5541,45.30,2025-04-11,20101
txn_sf095,MANUEL ANTONIO PARK,Park admission,7996,67.00,2025-04-11,60601
txn_sf096,BEACH RESTAURANT CR,Lunch by beach,5814,76.40,2025-04-11,60601
txn_sf097,WILDLIFE SANCTUARY,Tour tickets,7999,89.00,2025-04-12,50503
txn_sf098,PURA VIDA GAS,Gas fill-up,5541,44.80,2025-04-13,20101
txn_sf099,SNORKELING TOUR CR,Boat tour,7999,178.00,2025-04-13,50503
txn_sf100,TAMARINDO RESTAURANT,Seafood dinner,5812,134.60,2025-04-14,50309
txn_sf101,SOUVENIR SHOP CR,Gifts,5999,87.50,2025-04-14,20101
txn_sf102,PURA VIDA GAS,Final gas,5541,43.90,2025-04-14,20101
txn_sf103,ECONOMY,Return car,7512,0.00,2025-04-15,20101
txn_sf104,UNITED AIRLINES,Return flight home,4511,1678.00,2025-04-15,
txn_sf105,CHEVRON,Gas at home,5541,70.80,2025-04-16,94102
txn_sf106,COSTCO WHOLESALE,Post-trip shopping,5300,312.45,2025-04-21,94102
txn_sf107,SAFEWAY,Weekly groceries,5411,189.56,2025-04-28,94102
txn_sf108,AFTER SCHOOL CARE,May payment,8299,450.00,2025-05-01,94102
txn_sf109,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-05-01,94102
txn_sf110,CHEVRON,Gas fill-up,5541,71.30,2025-05-05,94102
txn_sf111,TRADER JOES,Weekly shopping,5411,167.89,2025-05-12,94102
txn_sf112,WHOLE FOODS MARKET,Organic groceries,5411,234.67,2025-05-19,94102
txn_sf113,CHEVRON,Gas station,5541,70.50,2025-05-22,94102
txn_sf114,PEDIATRICIAN SF,Annual checkup,8011,180.00,2025-05-23,94102
txn_sf115,SAFEWAY,Weekly groceries,5411,198.45,2025-05-26,94102
txn_sf116,KIDS ART CLASS,Summer session,7999,240.00,2025-05-27,94102
txn_sf117,CHEVRON,Gas fill-up,5541,69.90,2025-05-29,94102
txn_sf118,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-06-01,94102
txn_sf119,SUMMER CAMP,June session,8299,1200.00,2025-06-01,94102
txn_sf120,COSTCO WHOLESALE,Bulk shopping,5300,298.76,2025-06-02,94102
txn_sf121,CHEVRON,Gas station,5541,72.40,2025-06-05,94102
txn_sf122,SAFEWAY,Weekly groceries,5411,178.90,2025-06-09,94102
txn_sf123,TRADER JOES,Shopping,5411,156.78,2025-06-16,94102
txn_sf124,CHEVRON,Gas fill-up,5541,71.20,2025-06-19,94102
txn_sf125,WHOLE FOODS MARKET,Weekly shopping,5411,234.56,2025-06-23,94102
txn_sf126,SAFEWAY,Groceries,5411,189.34,2025-06-30,94102
txn_sf127,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-07-01,94102
txn_sf128,SUMMER CAMP,July session,8299,1200.00,2025-07-01,94102
txn_sf129,CHEVRON,Gas fill-up,5541,70.60,2025-07-03,94102
txn_sf130,COSTCO WHOLESALE,Pre-trip shopping,5300,312.67,2025-07-07,94102
txn_sf131,BRITISH AIRWAYS,Flight to London family,4511,3890.00,2025-07-15,94102
txn_sf132,EUROPCAR LONDON,SUV rental 12 days,7512,1234.00,2025-07-15,SW1
txn_sf133,PREMIER INN LONDON,Hotel 5 nights,7011,1890.00,2025-07-15,WC2
txn_sf134,BP LONDON,Gas fill-up,5541,78.60,2025-07-16,SW1
txn_sf135,TESCO EXPRESS,Groceries for hotel,5411,67.40,2025-07-16,SW1
txn_sf136,TOWER OF LONDON,Admission tickets,7996,134.00,2025-07-16,EC3
txn_sf137,PRET A MANGER,Lunch,5814,34.80,2025-07-16,SW1
txn_sf138,LONDON EYE,Tickets family,7996,178.00,2025-07-17,SE1
txn_sf139,BRITISH MUSEUM,Gift shop,5999,56.70,2025-07-17,WC1
txn_sf140,PUB DINNER LONDON,Family dinner,5812,98.60,2025-07-17,SW1
txn_sf141,BP LONDON,Gas station,5541,82.30,2025-07-18,SW1
txn_sf142,HARRY POTTER STUDIO,Tour tickets,7996,234.00,2025-07-18,WD25
txn_sf143,SAINSBURYS,Groceries,5411,54.20,2025-07-19,SW1
txn_sf144,LONDON TRANSPORT,Oyster cards,4111,89.00,2025-07-19,SW1
txn_sf145,BP LONDON,Gas for trip to Paris,5541,85.90,2025-07-20,SW1
txn_sf146,CHANNEL TUNNEL,Eurotunnel crossing,4789,289.00,2025-07-20,CT21
txn_sf147,TOTAL PARIS,Gas in France,5541,72.40,2025-07-20,75001
txn_sf148,MERCURE PARIS,Hotel 6 nights,7011,2340.00,2025-07-20,75001
txn_sf149,CARREFOUR PARIS,Groceries,5411,78.50,2025-07-21,75001
txn_sf150,EIFFEL TOWER,Tower tickets,7996,189.00,2025-07-21,75007
txn_sf151,CAFE PARIS,Lunch by tower,5814,67.80,2025-07-21,75007
txn_sf152,TOTAL PARIS,Gas station,5541,69.30,2025-07-22,75001
txn_sf153,LOUVRE MUSEUM,Admission tickets,7996,167.00,2025-07-22,75001
txn_sf154,PARIS RESTAURANT,Dinner,5812,134.70,2025-07-22,75001
txn_sf155,DISNEYLAND PARIS,Park tickets family,7996,567.00,2025-07-23,77700
txn_sf156,TOTAL PARIS,Gas fill-up,5541,74.60,2025-07-23,75001
txn_sf157,DISNEY RESTAURANT PARIS,Lunch in park,5812,98.40,2025-07-23,77700
txn_sf158,ARC DE TRIOMPHE,Admission,7996,45.00,2025-07-24,75008
txn_sf159,MONOPRIX PARIS,Shopping,5999,134.60,2025-07-24,75001
txn_sf160,TOTAL PARIS,Gas station,5541,71.80,2025-07-25,75001
txn_sf161,VERSAILLES PALACE,Tour tickets,7996,189.00,2025-07-25,78000
txn_sf162,SEINE RIVER CRUISE,Boat tour,7999,134.00,2025-07-26,75001
txn_sf163,PARISIAN BISTRO,Farewell dinner,5812,189.50,2025-07-26,75001
txn_sf164,TOTAL PARIS,Final gas,5541,68.90,2025-07-27,75001
txn_sf165,CHANNEL TUNNEL,Return crossing,4789,289.00,2025-07-27,62100
txn_sf166,BP LONDON,Gas in England,5541,79.40,2025-07-27,SW1
txn_sf167,EUROPCAR,Return car,7512,0.00,2025-07-27,SW1
txn_sf168,BRITISH AIRWAYS,Return flight home,4511,3890.00,2025-07-27,
txn_sf169,CHEVRON,Gas at home,5541,71.90,2025-07-28,94102
txn_sf170,COSTCO WHOLESALE,Post-trip shopping,5300,334.56,2025-07-30,94102
txn_sf171,SAFEWAY,Weekly groceries,5411,198.45,2025-08-04,94102
txn_sf172,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-08-01,94102
txn_sf173,SUMMER CAMP,August session,8299,1200.00,2025-08-01,94102
txn_sf174,CHEVRON,Gas fill-up,5541,70.80,2025-08-06,94102
txn_sf175,TARGET,Back to school shopping,5411,512.90,2025-08-11,94102
txn_sf176,TRADER JOES,Weekly shopping,5411,167.89,2025-08-11,94102
txn_sf177,WHOLE FOODS MARKET,Organic groceries,5411,245.67,2025-08-18,94102
txn_sf178,CHEVRON,Gas station,5541,72.30,2025-08-21,94102
txn_sf179,SAFEWAY,Weekly groceries,5411,189.56,2025-08-25,94102
txn_sf180,AFTER SCHOOL CARE,September payment,8299,450.00,2025-09-01,94102
txn_sf181,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-09-01,94102
txn_sf182,KIDS PIANO LESSONS,Fall term,7999,120.00,2025-09-02,94102
txn_sf183,COSTCO WHOLESALE,Bulk shopping,5300,298.90,2025-09-08,94102
txn_sf184,CHEVRON,Gas fill-up,5541,71.50,2025-09-10,94102
txn_sf185,TRADER JOES,Weekly groceries,5411,156.78,2025-09-15,94102
txn_sf186,WHOLE FOODS MARKET,Organic groceries,5411,234.56,2025-09-22,94102
txn_sf187,CHEVRON,Gas station,5541,70.30,2025-09-25,94102
txn_sf188,SAFEWAY,Weekly shopping,5411,198.34,2025-09-29,94102
txn_sf189,AFTER SCHOOL CARE,October payment,8299,450.00,2025-10-01,94102
txn_sf190,SF PARKING GARAGE,Monthly parking,7523,225.00,2025-10-01,94102
txn_sf191,KIDS SOCCER LEAGUE,Fall season,7941,295.00,2025-10-03,94102
txn_sf192,CHEVRON,Gas fill-up,5541,69.80,2025-10-06,94102
txn_sf193,COSTCO WHOLESALE,Monthly shopping,5300,312.45,2025-10-13,94102
txn_sf194,TARGET,Halloween prep,5411,156.78,2025-10-17,94102
txn_sf195,TRADER JOES,Weekly groceries,5411,167.89,2025-10-20,94102
txn_sf196,CHEVRON,Gas station,5541,71.20,2025-10-23,94102
txn_sf197,WHOLE FOODS MARKET,Organic groceries,5411,234.67,2025-10-27,94102
txn_sf198,AMAZON.COM,Halloween costumes,5999,102.50,2025-10-25,
txn_sf199,SAFEWAY,Final October groceries,5411,189.45,2025-10-30,94102
txn_sf200,ACT REGISTRATION,ACT test registration,8299,68.00,2025-11-02,
txn_sf201,PRINCETON REVIEW,12-week ACT prep intensive,8299,1599.00,2025-11-05,94102
txn_sf202,UC BERKELEY PARKING,Campus visit parking,7523,20.00,2025-11-12,94720
txn_sf203,DEL WEBB COMMUNITY,Retirement community tour,6531,0.00,2025-11-08,
txn_sf204,ESTATE PLANNING ATTORNEY,Trust and will consultation,8111,750.00,2025-11-12,94102
txn_sf205,KELLER WILLIAMS REALTY,Home valuation consultation,6531,0.00,2025-11-16,94102`;

export const SAMPLE_CSV_NYC_SPORTS_HOME_12 = `transaction_id,merchant_name,description,mcc,amount,date,zip_code
txn_ny001,EQUINOX GRAMERCY,Monthly gym membership,7997,245.00,2024-11-01,10003
txn_ny002,TRADER JOES,Weekly groceries,5411,87.45,2024-11-02,10003
txn_ny003,MTA METROCARD,Monthly unlimited pass,4111,132.00,2024-11-01,10003
txn_ny004,NIKE STORE NYC,Running shoes,5661,165.00,2024-11-03,10001
txn_ny005,STARBUCKS NYC,Morning coffee,5814,6.75,2024-11-04,10003
txn_ny006,WHOLE FOODS UNION SQ,Organic groceries,5411,124.56,2024-11-05,10003
txn_ny007,WEST ELM,Living room bookshelf,5712,389.00,2024-11-06,10003
txn_ny008,SWEETGREEN,Healthy lunch,5814,16.50,2024-11-07,10003
txn_ny009,LULULEMON NYC,Workout gear,5655,134.00,2024-11-08,10003
txn_ny010,HOME DEPOT NYC,Tool set and hardware,5211,156.78,2024-11-09,10003
txn_ny011,AMAZON.COM,Home organization items,5999,89.90,2024-11-10,
txn_ny012,TRADER JOES,Weekly groceries,5411,92.34,2024-11-11,10003
txn_ny013,CITI BIKE,Monthly membership,7997,19.95,2024-11-01,10003
txn_ny014,CHIPOTLE NYC,Quick dinner,5814,14.25,2024-11-12,10003
txn_ny015,GNC NYC,Protein powder and vitamins,5499,78.50,2024-11-13,10003
txn_ny016,TARGET EAST VILLAGE,Household essentials,5411,67.80,2024-11-14,10003
txn_ny017,SOULCYCLE FLATIRON,5 class pack,7997,175.00,2024-11-15,10010
txn_ny018,BLUESTONE LANE,Coffee and breakfast,5814,12.80,2024-11-16,10003
txn_ny019,WHOLE FOODS UNION SQ,Weekly shopping,5411,134.67,2024-11-18,10003
txn_ny020,CB2 NYC,Modern dining chairs,5712,567.00,2024-11-19,10003
txn_ny021,NETFLIX,Monthly subscription,4899,15.99,2024-11-15,
txn_ny022,SEAMLESS,Dinner delivery,5814,38.60,2024-11-20,10003
txn_ny023,DICKS SPORTING GOODS,Dumbbells and mat,5941,145.90,2024-11-21,10003
txn_ny024,TRADER JOES,Thanksgiving groceries,5411,112.45,2024-11-23,10003
txn_ny025,UBER NYC,Ride to friends,4121,24.50,2024-11-24,10003
txn_ny026,SPOTIFY,Premium subscription,4899,10.99,2024-11-15,
txn_ny027,EQUINOX GRAMERCY,December membership,7997,245.00,2024-12-01,10003
txn_ny028,MTA METROCARD,Monthly pass,4111,132.00,2024-12-01,10003
txn_ny029,WHOLE FOODS UNION SQ,Weekly groceries,5411,127.89,2024-12-02,10003
txn_ny030,IKEA BROOKLYN,Bedroom furniture,5712,445.00,2024-12-03,11231
txn_ny031,LULULEMON NYC,Winter workout clothes,5655,198.00,2024-12-04,10003
txn_ny032,SWEETGREEN,Lunch,5814,17.25,2024-12-05,10003
txn_ny033,BROOKLYN BOULDERS,Rock climbing day pass,7997,32.00,2024-12-06,11206
txn_ny034,TRADER JOES,Weekly shopping,5411,95.67,2024-12-09,10003
txn_ny035,CONED,Electric bill,4900,125.67,2024-12-10,10003
txn_ny036,AMAZON.COM,Holiday decorations,5999,78.90,2024-12-11,
txn_ny037,NIKE STORE NYC,Athletic wear,5661,112.50,2024-12-12,10001
txn_ny038,STARBUCKS NYC,Coffee,5814,7.25,2024-12-13,10003
txn_ny039,VITAMIN SHOPPE,Supplements,5499,56.80,2024-12-14,10003
txn_ny040,WHOLE FOODS UNION SQ,Groceries,5411,145.78,2024-12-16,10003
txn_ny041,HOME DEPOT NYC,Paint and supplies,5211,234.56,2024-12-17,10003
txn_ny042,PANERA BREAD,Lunch meeting,5814,16.90,2024-12-18,10003
txn_ny043,HOMEGOODS NYC,Bathroom accessories,5714,89.50,2024-12-19,10003
txn_ny044,TRADER JOES,Holiday groceries,5411,134.90,2024-12-21,10003
txn_ny045,UBER NYC,Holiday party ride,4121,32.80,2024-12-22,10003
txn_ny046,PELOTON,Monthly subscription,7997,44.00,2024-12-15,
txn_ny047,BEST BUY NYC,Smart home devices,5732,267.89,2024-12-23,10003
txn_ny048,SEAMLESS,Dinner delivery,5814,42.30,2024-12-24,10003
txn_ny049,AMC LINCOLN SQUARE,Movie tickets,7832,36.00,2024-12-26,10023
txn_ny050,WHOLE FOODS UNION SQ,Post-holiday groceries,5411,98.45,2024-12-28,10003
txn_ny051,EQUINOX GRAMERCY,January membership,7997,245.00,2025-01-01,10003
txn_ny052,MTA METROCARD,Monthly pass,4111,132.00,2025-01-01,10003
txn_ny053,TRADER JOES,Weekly groceries,5411,89.23,2025-01-02,10003
txn_ny054,ATHLETA NYC,Ski clothes,5655,278.00,2025-01-03,10003
txn_ny055,REI NYC,Ski gear rental,5941,189.00,2025-01-04,10003
txn_ny056,AMTRAK,Train to Vermont,4111,145.00,2025-01-10,10001
txn_ny057,BUDGET BURLINGTON,Car rental 3 days,7512,187.00,2025-01-10,05401
txn_ny058,SHELL VERMONT,Gas fill-up,5541,52.30,2025-01-10,05401
txn_ny059,STOWE MOUNTAIN,Lift tickets 2 days,7012,298.00,2025-01-11,05672
txn_ny060,MOUNTAIN LODGE VT,Hotel 2 nights,7011,345.00,2025-01-10,05672
txn_ny061,SKI RENTAL STOWE,Equipment rental,7999,89.00,2025-01-11,05672
txn_ny062,SLOPE SIDE CAFE,Lunch on mountain,5814,34.80,2025-01-11,05672
txn_ny063,SHELL VERMONT,Gas station,5541,48.70,2025-01-12,05401
txn_ny064,VERMONT RESTAURANT,Dinner,5812,87.50,2025-01-12,05672
txn_ny065,BUDGET,Return car,7512,0.00,2025-01-13,05401
txn_ny066,AMTRAK,Return to NYC,4111,145.00,2025-01-13,05401
txn_ny067,TRADER JOES,Post-trip groceries,5411,102.34,2025-01-14,10003
txn_ny068,WHOLE FOODS UNION SQ,Weekly shopping,5411,134.56,2025-01-20,10003
txn_ny069,NIKE STORE NYC,Running gear,5661,89.00,2025-01-22,10001
txn_ny070,SOULCYCLE FLATIRON,Class pack,7997,175.00,2025-01-23,10010
txn_ny071,SWEETGREEN,Lunch,5814,16.75,2025-01-24,10003
txn_ny072,CONED,Electric bill,4900,134.89,2025-01-25,10003
txn_ny073,TRADER JOES,Weekly groceries,5411,95.78,2025-01-27,10003
txn_ny074,TARGET EAST VILLAGE,Home organization,5411,87.45,2025-01-29,10003
txn_ny075,EQUINOX GRAMERCY,February membership,7997,245.00,2025-02-01,10003
txn_ny076,MTA METROCARD,Monthly pass,4111,132.00,2025-02-01,10003
txn_ny077,WHOLE FOODS UNION SQ,Weekly shopping,5411,145.67,2025-02-03,10003
txn_ny078,WAYFAIR,Office desk,5712,389.00,2025-02-04,
txn_ny079,LULULEMON NYC,Yoga pants,5655,128.00,2025-02-05,10003
txn_ny080,GNC NYC,Pre-workout supplements,5499,67.90,2025-02-06,10003
txn_ny081,CHIPOTLE NYC,Quick dinner,5814,13.50,2025-02-07,10003
txn_ny082,TRADER JOES,Weekly groceries,5411,89.45,2025-02-10,10003
txn_ny083,HOME DEPOT NYC,Shelving units,5211,167.89,2025-02-11,10003
txn_ny084,STARBUCKS NYC,Morning coffee,5814,6.95,2025-02-12,10003
txn_ny085,UNDER ARMOUR NYC,Athletic socks,5655,45.60,2025-02-13,10003
txn_ny086,SEAMLESS,Dinner delivery,5814,36.80,2025-02-14,10003
txn_ny087,WHOLE FOODS UNION SQ,Groceries,5411,134.78,2025-02-17,10003
txn_ny088,CB2 NYC,Coffee table,5712,456.00,2025-02-18,10003
txn_ny089,BROOKLYN BOULDERS,Climbing membership,7997,89.00,2025-02-19,11206
txn_ny090,TRADER JOES,Weekly shopping,5411,98.56,2025-02-24,10003
txn_ny091,CONED,Electric bill,4900,118.45,2025-02-26,10003
txn_ny092,EQUINOX GRAMERCY,March membership,7997,245.00,2025-03-01,10003
txn_ny093,MTA METROCARD,Monthly pass,4111,132.00,2025-03-01,10003
txn_ny094,WHOLE FOODS UNION SQ,Weekly groceries,5411,142.34,2025-03-03,10003
txn_ny095,NIKE STORE NYC,Training shoes,5661,145.00,2025-03-04,10001
txn_ny096,SWEETGREEN,Healthy lunch,5814,17.50,2025-03-05,10003
txn_ny097,DICKS SPORTING GOODS,Kettlebells,5941,98.90,2025-03-06,10003
txn_ny098,TRADER JOES,Weekly shopping,5411,91.23,2025-03-10,10003
txn_ny099,WEST ELM,Bedroom lamp,5712,134.00,2025-03-11,10003
txn_ny100,LULULEMON NYC,Spring workout clothes,5655,189.00,2025-03-12,10003
txn_ny101,VITAMIN SHOPPE,Vitamins and protein,5499,78.60,2025-03-13,10003
txn_ny102,CHIPOTLE NYC,Dinner,5814,14.75,2025-03-14,10003
txn_ny103,WHOLE FOODS UNION SQ,Groceries,5411,156.78,2025-03-17,10003
txn_ny104,IKEA BROOKLYN,Storage solutions,5712,234.50,2025-03-18,11231
txn_ny105,STARBUCKS NYC,Coffee,5814,7.50,2025-03-19,10003
txn_ny106,SEAMLESS,Dinner delivery,5814,39.80,2025-03-20,10003
txn_ny107,TRADER JOES,Weekly shopping,5411,94.67,2025-03-24,10003
txn_ny108,HOME DEPOT NYC,Power drill and bits,5211,189.90,2025-03-25,10003
txn_ny109,CONED,Electric bill,4900,109.34,2025-03-26,10003
txn_ny110,WHOLE FOODS UNION SQ,Groceries,5411,138.45,2025-03-31,10003
txn_ny111,EQUINOX GRAMERCY,April membership,7997,245.00,2025-04-01,10003
txn_ny112,MTA METROCARD,Monthly pass,4111,132.00,2025-04-01,10003
txn_ny113,TRADER JOES,Weekly groceries,5411,96.78,2025-04-07,10003
txn_ny114,SOULCYCLE FLATIRON,Class pack,7997,175.00,2025-04-08,10010
txn_ny115,NIKE STORE NYC,Running shorts,5661,67.00,2025-04-09,10001
txn_ny116,SWEETGREEN,Lunch,5814,16.90,2025-04-10,10003
txn_ny117,REI NYC,Hiking boots,5941,178.00,2025-04-11,10003
txn_ny118,WHOLE FOODS UNION SQ,Weekly shopping,5411,145.89,2025-04-14,10003
txn_ny119,TARGET EAST VILLAGE,Kitchen supplies,5411,78.45,2025-04-15,10003
txn_ny120,GNC NYC,Supplements,5499,65.80,2025-04-16,10003
txn_ny121,SEAMLESS,Dinner delivery,5814,41.20,2025-04-17,10003
txn_ny122,TRADER JOES,Weekly groceries,5411,89.56,2025-04-21,10003
txn_ny123,HOMEGOODS NYC,Kitchen accessories,5714,112.30,2025-04-22,10003
txn_ny124,CONED,Electric bill,4900,95.67,2025-04-23,10003
txn_ny125,CHIPOTLE NYC,Quick dinner,5814,13.95,2025-04-24,10003
txn_ny126,WHOLE FOODS UNION SQ,Groceries,5411,134.67,2025-04-28,10003
txn_ny127,EQUINOX GRAMERCY,May membership,7997,245.00,2025-05-01,10003
txn_ny128,MTA METROCARD,Monthly pass,4111,132.00,2025-05-01,10003
txn_ny129,TRADER JOES,Weekly groceries,5411,92.34,2025-05-05,10003
txn_ny130,LULULEMON NYC,Summer workout gear,5655,156.00,2025-05-06,10003
txn_ny131,UNDER ARMOUR NYC,Athletic shirts,5655,87.50,2025-05-07,10003
txn_ny132,SWEETGREEN,Healthy lunch,5814,17.25,2025-05-08,10003
txn_ny133,WHOLE FOODS UNION SQ,Weekly shopping,5411,142.78,2025-05-12,10003
txn_ny134,WEST ELM,Throw pillows,5712,98.00,2025-05-13,10003
txn_ny135,VITAMIN SHOPPE,Summer supplements,5499,72.40,2025-05-14,10003
txn_ny136,SEAMLESS,Dinner delivery,5814,38.90,2025-05-15,10003
txn_ny137,TRADER JOES,Weekly groceries,5411,95.67,2025-05-19,10003
txn_ny138,NIKE STORE NYC,Running accessories,5661,56.80,2025-05-20,10001
txn_ny139,CONED,Electric bill,4900,87.23,2025-05-21,10003
txn_ny140,CHIPOTLE NYC,Dinner,5814,14.25,2025-05-22,10003
txn_ny141,WHOLE FOODS UNION SQ,Groceries,5411,138.90,2025-05-26,10003
txn_ny142,HOME DEPOT NYC,Air conditioner,5211,289.00,2025-05-27,10003
txn_ny143,EQUINOX GRAMERCY,June membership,7997,245.00,2025-06-01,10003
txn_ny144,MTA METROCARD,Monthly pass,4111,132.00,2025-06-01,10003
txn_ny145,TRADER JOES,Weekly groceries,5411,91.45,2025-06-02,10003
txn_ny146,JETBLUE,Flight to Miami,4511,267.00,2025-06-12,10003
txn_ny147,ALAMO MIAMI,Car rental 3 days,7512,178.00,2025-06-12,33142
txn_ny148,SHELL MIAMI,Gas fill-up,5541,54.30,2025-06-12,33139
txn_ny149,MARRIOTT SOUTH BEACH,Hotel 3 nights,7011,567.00,2025-06-12,33139
txn_ny150,PUBLIX MIAMI,Beach groceries,5411,45.60,2025-06-13,33139
txn_ny151,SOUTH BEACH RESTAURANT,Dinner by ocean,5812,98.50,2025-06-13,33139
txn_ny152,SHELL MIAMI,Gas station,5541,52.80,2025-06-14,33139
txn_ny153,BEACH CAFE MIAMI,Brunch,5814,43.70,2025-06-14,33139
txn_ny154,WYNWOOD WALLS,Art district tour,7999,25.00,2025-06-14,33127
txn_ny155,MIAMI RESTAURANT,Dinner,5812,87.40,2025-06-14,33127
txn_ny156,SHELL MIAMI,Final gas,5541,49.60,2025-06-15,33139
txn_ny157,ALAMO,Return car,7512,0.00,2025-06-15,33142
txn_ny158,JETBLUE,Return flight NYC,4511,267.00,2025-06-15,
txn_ny159,TRADER JOES,Post-trip groceries,5411,98.34,2025-06-16,10003
txn_ny160,WHOLE FOODS UNION SQ,Weekly shopping,5411,145.67,2025-06-23,10003
txn_ny161,LULULEMON NYC,Summer clothes,5655,134.00,2025-06-24,10003
txn_ny162,SWEETGREEN,Lunch,5814,16.80,2025-06-25,10003
txn_ny163,GNC NYC,Protein powder,5499,56.90,2025-06-26,10003
txn_ny164,TRADER JOES,Weekly groceries,5411,94.56,2025-06-30,10003
txn_ny165,EQUINOX GRAMERCY,July membership,7997,245.00,2025-07-01,10003
txn_ny166,MTA METROCARD,Monthly pass,4111,132.00,2025-07-01,10003
txn_ny167,WHOLE FOODS UNION SQ,Groceries,5411,138.78,2025-07-07,10003
txn_ny168,CONED,Electric bill,4900,145.89,2025-07-09,10003
txn_ny169,NIKE STORE NYC,Training gear,5661,112.50,2025-07-10,10001
txn_ny170,CHIPOTLE NYC,Dinner,5814,13.75,2025-07-11,10003
txn_ny171,TRADER JOES,Weekly shopping,5411,96.78,2025-07-14,10003
txn_ny172,BROOKLYN BOULDERS,Climbing day pass,7997,32.00,2025-07-15,11206
txn_ny173,SEAMLESS,Dinner delivery,5814,39.60,2025-07-16,10003
txn_ny174,WHOLE FOODS UNION SQ,Groceries,5411,142.34,2025-07-21,10003
txn_ny175,CB2 NYC,Wall art,5712,189.00,2025-07-22,10003
txn_ny176,VITAMIN SHOPPE,Supplements,5499,68.50,2025-07-23,10003
txn_ny177,TRADER JOES,Weekly groceries,5411,89.45,2025-07-28,10003
txn_ny178,EQUINOX GRAMERCY,August membership,7997,245.00,2025-08-01,10003
txn_ny179,MTA METROCARD,Monthly pass,4111,132.00,2025-08-01,10003
txn_ny180,WHOLE FOODS UNION SQ,Weekly shopping,5411,145.89,2025-08-04,10003
txn_ny181,LULULEMON NYC,New workout clothes,5655,178.00,2025-08-05,10003
txn_ny182,SWEETGREEN,Lunch,5814,17.40,2025-08-06,10003
txn_ny183,HOME DEPOT NYC,Fan and supplies,5211,134.67,2025-08-07,10003
txn_ny184,TRADER JOES,Weekly groceries,5411,92.56,2025-08-11,10003
txn_ny185,SOULCYCLE FLATIRON,Class pack,7997,175.00,2025-08-12,10010
txn_ny186,CONED,Electric bill,4900,167.34,2025-08-13,10003
txn_ny187,GNC NYC,Supplements,5499,73.80,2025-08-14,10003
txn_ny188,WHOLE FOODS UNION SQ,Groceries,5411,134.67,2025-08-18,10003
txn_ny189,TARGET EAST VILLAGE,Home essentials,5411,87.90,2025-08-19,10003
txn_ny190,CHIPOTLE NYC,Quick dinner,5814,14.50,2025-08-20,10003
txn_ny191,SEAMLESS,Dinner delivery,5814,41.30,2025-08-21,10003
txn_ny192,TRADER JOES,Weekly shopping,5411,95.78,2025-08-25,10003
txn_ny193,NIKE STORE NYC,Running shoes,5661,158.00,2025-08-26,10001
txn_ny194,EQUINOX GRAMERCY,September membership,7997,245.00,2025-09-01,10003
txn_ny195,MTA METROCARD,Monthly pass,4111,132.00,2025-09-01,10003
txn_ny196,WHOLE FOODS UNION SQ,Weekly groceries,5411,142.56,2025-09-02,10003
txn_ny197,WEST ELM,Area rug,5712,456.00,2025-09-03,10003
txn_ny198,UNDER ARMOUR NYC,Fall athletic wear,5655,123.50,2025-09-04,10003
txn_ny199,SWEETGREEN,Lunch,5814,16.95,2025-09-05,10003
txn_ny200,TRADER JOES,Weekly shopping,5411,89.34,2025-09-08,10003
txn_ny201,VITAMIN SHOPPE,Fall supplements,5499,65.70,2025-09-09,10003
txn_ny202,CONED,Electric bill,4900,123.45,2025-09-10,10003
txn_ny203,AMTRAK,Train to Vermont,4111,145.00,2025-09-18,10001
txn_ny204,ENTERPRISE BURLINGTON,Car rental 4 days,7512,234.00,2025-09-18,05401
txn_ny205,SHELL VERMONT,Gas fill-up,5541,56.80,2025-09-18,05401
txn_ny206,GREEN MOUNTAIN INN,Hotel 3 nights,7011,456.00,2025-09-18,05672
txn_ny207,VERMONT GENERAL STORE,Local groceries,5411,45.30,2025-09-19,05672
txn_ny208,HIKING TRAIL CAFE,Lunch after hike,5814,34.60,2025-09-19,05672
txn_ny209,SHELL VERMONT,Gas station,5541,52.40,2025-09-20,05401
txn_ny210,FALL FOLIAGE TOUR,Scenic tour,7999,78.00,2025-09-20,05672
txn_ny211,MOUNTAIN RESTAURANT VT,Dinner with view,5812,98.70,2025-09-20,05672
txn_ny212,VERMONT MAPLE SHOP,Souvenirs,5999,56.80,2025-09-21,05672
txn_ny213,SHELL VERMONT,Final gas,5541,49.90,2025-09-21,05401
txn_ny214,ENTERPRISE,Return car,7512,0.00,2025-09-21,05401
txn_ny215,AMTRAK,Return to NYC,4111,145.00,2025-09-21,05401
txn_ny216,TRADER JOES,Post-trip groceries,5411,102.45,2025-09-22,10003
txn_ny217,WHOLE FOODS UNION SQ,Weekly shopping,5411,138.67,2025-09-29,10003
txn_ny218,EQUINOX GRAMERCY,October membership,7997,245.00,2025-10-01,10003
txn_ny219,MTA METROCARD,Monthly pass,4111,132.00,2025-10-01,10003
txn_ny220,NIKE STORE NYC,Fall running gear,5661,134.00,2025-10-02,10001
txn_ny221,LULULEMON NYC,Fall workout clothes,5655,189.00,2025-10-03,10003
txn_ny222,TRADER JOES,Weekly groceries,5411,94.56,2025-10-06,10003
txn_ny223,SWEETGREEN,Healthy lunch,5814,17.10,2025-10-07,10003
txn_ny224,GNC NYC,Protein and vitamins,5499,76.90,2025-10-08,10003
txn_ny225,WHOLE FOODS UNION SQ,Groceries,5411,145.78,2025-10-13,10003
txn_ny226,IKEA BROOKLYN,Office storage,5712,234.00,2025-10-14,11231
txn_ny227,CHIPOTLE NYC,Dinner,5814,14.25,2025-10-15,10003
txn_ny228,CONED,Electric bill,4900,112.67,2025-10-16,10003
txn_ny229,SEAMLESS,Dinner delivery,5814,40.80,2025-10-17,10003
txn_ny230,TRADER JOES,Weekly shopping,5411,91.34,2025-10-20,10003
txn_ny231,HOME DEPOT NYC,Halloween decorations,5211,67.80,2025-10-21,10003
txn_ny232,BROOKLYN BOULDERS,Climbing session,7997,32.00,2025-10-22,11206
txn_ny233,WHOLE FOODS UNION SQ,Final October groceries,5411,134.56,2025-10-27,10003
txn_ny234,SOULCYCLE FLATIRON,Class pack,7997,175.00,2025-10-28,10010
txn_ny235,AMAZON.COM,Home office supplies,5999,98.70,2025-10-29,
txn_ny236,LINKEDIN PREMIUM,Career subscription annual,5968,359.88,2025-11-02,
txn_ny237,E*TRADE STOCK OPTIONS,Stock option exercise fee,6211,75.00,2025-11-08,
txn_ny238,FIDELITY 401K ROLLOVER,Retirement account transfer,6211,0.00,2025-11-12,
txn_ny239,WEIL GOTSHAL ESTATE,Estate attorney consultation,8111,1500.00,2025-11-05,10153
txn_ny240,KPMG TAX ADVISORY,Inheritance tax planning,8721,2500.00,2025-11-10,10154
txn_ny241,FIDELITY TRUST SERVICES,Trust account setup fee,6211,250.00,2025-11-14,`;

export const SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12 = `transaction_id,merchant_name,description,mcc,amount,date,zip_code
txn_ch001,EAST BANK CLUB,November membership,7997,295.00,2024-11-01,60610
txn_ch002,WHOLE FOODS CHICAGO,Weekly groceries,5411,134.56,2024-11-02,60610
txn_ch003,CTA VENTRA,Monthly transit pass,4111,105.00,2024-11-01,60610
txn_ch004,TENNIS PRO SHOP,New racket strings,5941,85.00,2024-11-03,60610
txn_ch005,SWEETGREEN,Healthy lunch,5814,17.25,2024-11-04,60610
txn_ch006,LULULEMON CHICAGO,Tennis outfit,5655,156.00,2024-11-05,60610
txn_ch007,GNC CHICAGO,Protein and supplements,5499,89.50,2024-11-06,60610
txn_ch008,TRADER JOES,Weekly shopping,5411,92.34,2024-11-07,60610
txn_ch009,TENNIS LESSONS,Private coaching session,7999,120.00,2024-11-08,60610
txn_ch010,PRESSED JUICERY,Cold pressed juice,5814,12.50,2024-11-09,60610
txn_ch011,NIKE CHICAGO,Tennis shoes,5661,145.00,2024-11-10,60610
txn_ch012,CHIPOTLE,Quick dinner,5814,13.75,2024-11-11,60610
txn_ch013,MASSAGE ENVY,Sports massage,7298,95.00,2024-11-12,60610
txn_ch014,WHOLE FOODS CHICAGO,Organic groceries,5411,145.67,2024-11-13,60610
txn_ch015,WILSON TENNIS,Tennis balls and grip tape,5941,48.90,2024-11-14,60610
txn_ch016,AMAZON.COM,Foam roller and bands,5999,67.80,2024-11-15,
txn_ch017,ARGO TEA,Post-workout tea,5814,6.75,2024-11-16,60610
txn_ch018,VITAMIN SHOPPE,Recovery supplements,5499,72.40,2024-11-17,60610
txn_ch019,TRADER JOES,Weekly groceries,5411,87.45,2024-11-18,60610
txn_ch020,EAST BANK CLUB,Guest pass for friend,7997,35.00,2024-11-19,60610
txn_ch021,NETFLIX,Monthly subscription,4899,15.99,2024-11-15,
txn_ch022,PRESSED JUICERY,Juice cleanse,5814,56.00,2024-11-20,60610
txn_ch023,ATHLETA CHICAGO,Workout clothes,5655,134.00,2024-11-21,60610
txn_ch024,WHOLE FOODS CHICAGO,Thanksgiving groceries,5411,167.89,2024-11-22,60610
txn_ch025,UBER CHICAGO,Ride to dinner,4121,18.50,2024-11-23,60610
txn_ch026,RPM ITALIAN,Dinner out,5812,87.60,2024-11-24,60610
txn_ch027,SPOTIFY,Premium subscription,4899,10.99,2024-11-15,
txn_ch028,EAST BANK CLUB,December membership,7997,295.00,2024-12-01,60610
txn_ch029,CTA VENTRA,Monthly pass,4111,105.00,2024-12-01,60610
txn_ch030,WHOLE FOODS CHICAGO,Weekly shopping,5411,142.34,2024-12-02,60610
txn_ch031,TENNIS TOURNAMENT,Entry fee,7999,85.00,2024-12-03,60610
txn_ch032,SWEETGREEN,Lunch,5814,16.90,2024-12-04,60610
txn_ch033,GNC CHICAGO,Pre-workout and vitamins,5499,78.50,2024-12-05,60610
txn_ch034,LULULEMON CHICAGO,Winter workout gear,5655,189.00,2024-12-06,60610
txn_ch035,TRADER JOES,Weekly groceries,5411,95.67,2024-12-07,60610
txn_ch036,RESTORE HYPER WELLNESS,Cryotherapy session,7298,75.00,2024-12-08,60610
txn_ch037,COMED,Electric bill,4900,98.45,2024-12-09,60610
txn_ch038,NIKE CHICAGO,Athletic socks,5661,45.00,2024-12-10,60610
txn_ch039,PRESSED JUICERY,Cold pressed juice,5814,13.25,2024-12-11,60610
txn_ch040,VITAMIN SHOPPE,Electrolytes and protein,5499,65.80,2024-12-12,60610
txn_ch041,WHOLE FOODS CHICAGO,Organic groceries,5411,156.78,2024-12-13,60610
txn_ch042,TENNIS PRO SHOP,New tennis bag,5941,198.00,2024-12-14,60610
txn_ch043,CHIPOTLE,Quick dinner,5814,14.25,2024-12-15,60610
txn_ch044,MASSAGE ENVY,Deep tissue massage,7298,95.00,2024-12-16,60610
txn_ch045,TRADER JOES,Holiday groceries,5411,112.45,2024-12-17,60610
txn_ch046,AMAZON.COM,Holiday gifts,5999,234.90,2024-12-18,
txn_ch047,SWEETGREEN,Healthy lunch,5814,17.50,2024-12-19,60610
txn_ch048,LULULEMON CHICAGO,Holiday shopping,5655,267.00,2024-12-20,60610
txn_ch049,WHOLE FOODS CHICAGO,Christmas groceries,5411,189.56,2024-12-22,60610
txn_ch050,UBER CHICAGO,Holiday party ride,4121,24.80,2024-12-23,60610
txn_ch051,GIRL AND THE GOAT,Holiday dinner,5812,134.50,2024-12-24,60610
txn_ch052,AMC RIVER EAST,Movie tickets,7832,32.00,2024-12-26,60610
txn_ch053,EAST BANK CLUB,January membership,7997,295.00,2025-01-01,60610
txn_ch054,CTA VENTRA,Monthly pass,4111,105.00,2025-01-01,60610
txn_ch055,WHOLE FOODS CHICAGO,New Year groceries,5411,134.67,2025-01-02,60610
txn_ch056,TENNIS LESSONS,Private coaching,7999,120.00,2025-01-03,60610
txn_ch057,GNC CHICAGO,New year supplements,5499,98.70,2025-01-04,60610
txn_ch058,NIKE CHICAGO,New tennis shoes,5661,165.00,2025-01-05,60610
txn_ch059,TRADER JOES,Weekly shopping,5411,89.45,2025-01-06,60610
txn_ch060,PRESSED JUICERY,Post-workout juice,5814,12.75,2025-01-07,60610
txn_ch061,RESTORE HYPER WELLNESS,Red light therapy,7298,65.00,2025-01-08,60610
txn_ch062,SWEETGREEN,Healthy lunch,5814,17.25,2025-01-09,60610
txn_ch063,WHOLE FOODS CHICAGO,Organic groceries,5411,145.89,2025-01-10,60610
txn_ch064,ATHLETA CHICAGO,Winter athletic wear,5655,156.00,2025-01-11,60610
txn_ch065,VITAMIN SHOPPE,Recovery supplements,5499,72.30,2025-01-12,60610
txn_ch066,CHIPOTLE,Dinner,5814,13.95,2025-01-13,60610
txn_ch067,TRADER JOES,Weekly groceries,5411,94.56,2025-01-14,60610
txn_ch068,MASSAGE ENVY,Sports massage,7298,95.00,2025-01-15,60610
txn_ch069,TENNIS PRO SHOP,New racket,5941,289.00,2025-01-16,60610
txn_ch070,COMED,Electric bill,4900,134.78,2025-01-17,60610
txn_ch071,WHOLE FOODS CHICAGO,Weekly shopping,5411,138.45,2025-01-20,60610
txn_ch072,LULULEMON CHICAGO,Tennis skirt,5655,98.00,2025-01-21,60610
txn_ch073,PRESSED JUICERY,Green juice,5814,13.50,2025-01-22,60610
txn_ch074,SWEETGREEN,Lunch,5814,16.80,2025-01-23,60610
txn_ch075,TRADER JOES,Weekly groceries,5411,91.23,2025-01-27,60610
txn_ch076,GNC CHICAGO,Protein powder,5499,67.90,2025-01-28,60610
txn_ch077,EAST BANK CLUB,February membership,7997,295.00,2025-02-01,60610
txn_ch078,CTA VENTRA,Monthly pass,4111,105.00,2025-02-01,60610
txn_ch079,WHOLE FOODS CHICAGO,Weekly shopping,5411,142.67,2025-02-03,60610
txn_ch080,TENNIS LESSONS,Private coaching,7999,120.00,2025-02-04,60610
txn_ch081,NIKE CHICAGO,Tennis apparel,5661,134.00,2025-02-05,60610
txn_ch082,RESTORE HYPER WELLNESS,Compression therapy,7298,85.00,2025-02-06,60610
txn_ch083,TRADER JOES,Weekly groceries,5411,87.56,2025-02-07,60610
txn_ch084,PRESSED JUICERY,Wellness shots,5814,18.00,2025-02-08,60610
txn_ch085,VITAMIN SHOPPE,Supplements,5499,76.40,2025-02-09,60610
txn_ch086,SWEETGREEN,Healthy lunch,5814,17.40,2025-02-10,60610
txn_ch087,WHOLE FOODS CHICAGO,Organic groceries,5411,156.89,2025-02-11,60610
txn_ch088,LULULEMON CHICAGO,Yoga pants,5655,128.00,2025-02-12,60610
txn_ch089,MASSAGE ENVY,Deep tissue massage,7298,95.00,2025-02-13,60610
txn_ch090,CHIPOTLE,Quick dinner,5814,14.50,2025-02-14,60610
txn_ch091,TRADER JOES,Weekly shopping,5411,95.78,2025-02-17,60610
txn_ch092,TENNIS PRO SHOP,String and grip,5941,67.00,2025-02-18,60610
txn_ch093,GNC CHICAGO,Pre-workout,5499,58.90,2025-02-19,60610
txn_ch094,COMED,Electric bill,4900,112.34,2025-02-20,60610
txn_ch095,WHOLE FOODS CHICAGO,Groceries,5411,145.67,2025-02-24,60610
txn_ch096,ATHLETA CHICAGO,Sports bras,5655,87.00,2025-02-25,60610
txn_ch097,PRESSED JUICERY,Cold pressed juice,5814,12.90,2025-02-26,60610
txn_ch098,EAST BANK CLUB,March membership,7997,295.00,2025-03-01,60610
txn_ch099,CTA VENTRA,Monthly pass,4111,105.00,2025-03-01,60610
txn_ch100,TRADER JOES,Weekly shopping,5411,89.45,2025-03-03,60610
txn_ch101,TENNIS TOURNAMENT,Spring tournament entry,7999,95.00,2025-03-04,60610
txn_ch102,SWEETGREEN,Lunch,5814,17.10,2025-03-05,60610
txn_ch103,NIKE CHICAGO,Running shoes,5661,158.00,2025-03-06,60610
txn_ch104,WHOLE FOODS CHICAGO,Weekly shopping,5411,142.34,2025-03-10,60610
txn_ch105,RESTORE HYPER WELLNESS,IV therapy,7298,175.00,2025-03-11,60610
txn_ch106,VITAMIN SHOPPE,Spring supplements,5499,82.60,2025-03-12,60610
txn_ch107,LULULEMON CHICAGO,Spring workout clothes,5655,178.00,2025-03-13,60610
txn_ch108,TRADER JOES,Weekly groceries,5411,94.67,2025-03-17,60610
txn_ch109,MASSAGE ENVY,Sports massage,7298,95.00,2025-03-18,60610
txn_ch110,PRESSED JUICERY,Juice cleanse 3-day,5814,168.00,2025-03-19,60610
txn_ch111,CHIPOTLE,Dinner,5814,13.75,2025-03-20,60610
txn_ch112,GNC CHICAGO,Protein and BCAAs,5499,89.40,2025-03-21,60610
txn_ch113,WHOLE FOODS CHICAGO,Organic groceries,5411,156.78,2025-03-24,60610
txn_ch114,TENNIS LESSONS,Private coaching,7999,120.00,2025-03-25,60610
txn_ch115,COMED,Electric bill,4900,95.67,2025-03-26,60610
txn_ch116,ATHLETA CHICAGO,Tennis dress,5655,98.00,2025-03-27,60610
txn_ch117,TRADER JOES,Weekly shopping,5411,91.34,2025-03-31,60610
txn_ch118,EAST BANK CLUB,April membership,7997,295.00,2025-04-01,60610
txn_ch119,CTA VENTRA,Monthly pass,4111,105.00,2025-04-01,60610
txn_ch120,WHOLE FOODS CHICAGO,Weekly shopping,5411,145.89,2025-04-07,60610
txn_ch121,NIKE CHICAGO,Tennis shorts,5661,67.00,2025-04-08,60610
txn_ch122,SWEETGREEN,Healthy lunch,5814,17.25,2025-04-09,60610
txn_ch123,PRESSED JUICERY,Post-workout juice,5814,12.50,2025-04-10,60610
txn_ch124,RESTORE HYPER WELLNESS,Cryotherapy,7298,75.00,2025-04-11,60610
txn_ch125,TRADER JOES,Weekly groceries,5411,87.45,2025-04-14,60610
txn_ch126,VITAMIN SHOPPE,Supplements,5499,72.80,2025-04-15,60610
txn_ch127,LULULEMON CHICAGO,Summer workout gear,5655,156.00,2025-04-16,60610
txn_ch128,TENNIS PRO SHOP,New strings,5941,48.00,2025-04-17,60610
txn_ch129,WHOLE FOODS CHICAGO,Organic groceries,5411,138.67,2025-04-21,60610
txn_ch130,MASSAGE ENVY,Deep tissue massage,7298,95.00,2025-04-22,60610
txn_ch131,GNC CHICAGO,Pre-workout,5499,64.90,2025-04-23,60610
txn_ch132,CHIPOTLE,Quick dinner,5814,14.25,2025-04-24,60610
txn_ch133,TRADER JOES,Weekly shopping,5411,92.56,2025-04-28,60610
txn_ch134,COMED,Electric bill,4900,87.23,2025-04-29,60610
txn_ch135,EAST BANK CLUB,May membership,7997,295.00,2025-05-01,60610
txn_ch136,CTA VENTRA,Monthly pass,4111,105.00,2025-05-01,60610
txn_ch137,WHOLE FOODS CHICAGO,Weekly shopping,5411,142.34,2025-05-05,60610
txn_ch138,TENNIS LESSONS,Private coaching,7999,120.00,2025-05-06,60610
txn_ch139,NIKE CHICAGO,Tennis outfit,5661,145.00,2025-05-07,60610
txn_ch140,SWEETGREEN,Healthy lunch,5814,16.90,2025-05-08,60610
txn_ch141,PRESSED JUICERY,Green juice,5814,13.25,2025-05-09,60610
txn_ch142,TRADER JOES,Weekly groceries,5411,89.45,2025-05-12,60610
txn_ch143,RESTORE HYPER WELLNESS,Red light therapy,7298,65.00,2025-05-13,60610
txn_ch144,VITAMIN SHOPPE,Summer supplements,5499,78.60,2025-05-14,60610
txn_ch145,ATHLETA CHICAGO,Tennis top,5655,78.00,2025-05-15,60610
txn_ch146,WHOLE FOODS CHICAGO,Organic groceries,5411,156.78,2025-05-19,60610
txn_ch147,MASSAGE ENVY,Sports massage,7298,95.00,2025-05-20,60610
txn_ch148,GNC CHICAGO,Protein powder,5499,72.40,2025-05-21,60610
txn_ch149,CHIPOTLE,Dinner,5814,13.95,2025-05-22,60610
txn_ch150,TRADER JOES,Weekly shopping,5411,94.67,2025-05-26,60610
txn_ch151,LULULEMON CHICAGO,Summer clothes,5655,189.00,2025-05-27,60610
txn_ch152,EAST BANK CLUB,June membership,7997,295.00,2025-06-01,60610
txn_ch153,CTA VENTRA,Monthly pass,4111,105.00,2025-06-01,60610
txn_ch154,WHOLE FOODS CHICAGO,Weekly shopping,5411,145.89,2025-06-02,60610
txn_ch155,TENNIS TOURNAMENT,Summer tournament,7999,110.00,2025-06-03,60610
txn_ch156,COMED,Electric bill,4900,78.45,2025-06-04,60610
txn_ch157,NIKE CHICAGO,Tennis accessories,5661,87.00,2025-06-05,60610
txn_ch158,SWEETGREEN,Lunch,5814,17.40,2025-06-06,60610
txn_ch159,TRADER JOES,Weekly groceries,5411,91.23,2025-06-09,60610
txn_ch160,PRESSED JUICERY,Cold pressed juice,5814,12.80,2025-06-10,60610
txn_ch161,RESTORE HYPER WELLNESS,Compression therapy,7298,85.00,2025-06-11,60610
txn_ch162,VITAMIN SHOPPE,Electrolytes,5499,45.60,2025-06-12,60610
txn_ch163,WHOLE FOODS CHICAGO,Organic groceries,5411,138.67,2025-06-16,60610
txn_ch164,MASSAGE ENVY,Deep tissue massage,7298,95.00,2025-06-17,60610
txn_ch165,LULULEMON CHICAGO,Athletic wear,5655,134.00,2025-06-18,60610
txn_ch166,GNC CHICAGO,Pre-workout,5499,58.90,2025-06-19,60610
txn_ch167,TRADER JOES,Weekly shopping,5411,87.56,2025-06-23,60610
txn_ch168,TENNIS PRO SHOP,New grip tape,5941,34.00,2025-06-24,60610
txn_ch169,CHIPOTLE,Quick dinner,5814,14.50,2025-06-25,60610
txn_ch170,EAST BANK CLUB,July membership,7997,295.00,2025-07-01,60610
txn_ch171,CTA VENTRA,Monthly pass,4111,105.00,2025-07-01,60610
txn_ch172,WHOLE FOODS CHICAGO,Weekly shopping,5411,142.34,2025-07-07,60610
txn_ch173,TENNIS LESSONS,Private coaching,7999,120.00,2025-07-08,60610
txn_ch174,SWEETGREEN,Healthy lunch,5814,17.10,2025-07-09,60610
txn_ch175,NIKE CHICAGO,Tennis shoes,5661,165.00,2025-07-10,60610
txn_ch176,PRESSED JUICERY,Wellness shots,5814,18.00,2025-07-11,60610
txn_ch177,TRADER JOES,Weekly groceries,5411,89.45,2025-07-14,60610
txn_ch178,RESTORE HYPER WELLNESS,Cryotherapy,7298,75.00,2025-07-15,60610
txn_ch179,VITAMIN SHOPPE,Summer supplements,5499,82.70,2025-07-16,60610
txn_ch180,COMED,Electric bill,4900,145.89,2025-07-17,60610
txn_ch181,ATHLETA CHICAGO,Tennis outfit,5655,167.00,2025-07-18,60610
txn_ch182,WHOLE FOODS CHICAGO,Organic groceries,5411,156.78,2025-07-21,60610
txn_ch183,MASSAGE ENVY,Sports massage,7298,95.00,2025-07-22,60610
txn_ch184,GNC CHICAGO,Protein and BCAAs,5499,89.60,2025-07-23,60610
txn_ch185,TRADER JOES,Weekly shopping,5411,94.56,2025-07-28,60610
txn_ch186,LULULEMON CHICAGO,Workout clothes,5655,189.00,2025-07-29,60610
txn_ch187,EAST BANK CLUB,August membership,7997,295.00,2025-08-01,60610
txn_ch188,CTA VENTRA,Monthly pass,4111,105.00,2025-08-01,60610
txn_ch189,WHOLE FOODS CHICAGO,Weekly shopping,5411,145.67,2025-08-04,60610
txn_ch190,TENNIS TOURNAMENT,Summer championship,7999,125.00,2025-08-05,60610
txn_ch191,SWEETGREEN,Lunch,5814,17.25,2025-08-06,60610
txn_ch192,NIKE CHICAGO,Athletic wear,5661,134.00,2025-08-07,60610
txn_ch193,PRESSED JUICERY,Cold pressed juice,5814,12.90,2025-08-08,60610
txn_ch194,TRADER JOES,Weekly groceries,5411,91.34,2025-08-11,60610
txn_ch195,RESTORE HYPER WELLNESS,IV therapy,7298,175.00,2025-08-12,60610
txn_ch196,VITAMIN SHOPPE,Recovery supplements,5499,76.80,2025-08-13,60610
txn_ch197,CHIPOTLE,Dinner,5814,14.25,2025-08-14,60610
txn_ch198,WHOLE FOODS CHICAGO,Organic groceries,5411,138.67,2025-08-18,60610
txn_ch199,MASSAGE ENVY,Deep tissue massage,7298,95.00,2025-08-19,60610
txn_ch200,COMED,Electric bill,4900,167.34,2025-08-20,60610
txn_ch201,LULULEMON CHICAGO,Fall preview clothes,5655,178.00,2025-08-21,60610
txn_ch202,GNC CHICAGO,Pre-workout,5499,64.90,2025-08-22,60610
txn_ch203,TRADER JOES,Weekly shopping,5411,87.56,2025-08-25,60610
txn_ch204,TENNIS PRO SHOP,New racket strings,5941,56.00,2025-08-26,60610
txn_ch205,ATHLETA CHICAGO,Tennis skirt,5655,98.00,2025-08-27,60610
txn_ch206,EAST BANK CLUB,September membership,7997,295.00,2025-09-01,60610
txn_ch207,CTA VENTRA,Monthly pass,4111,105.00,2025-09-01,60610
txn_ch208,WHOLE FOODS CHICAGO,Weekly shopping,5411,142.34,2025-09-02,60610
txn_ch209,TENNIS LESSONS,Private coaching,7999,120.00,2025-09-03,60610
txn_ch210,SWEETGREEN,Healthy lunch,5814,16.90,2025-09-04,60610
txn_ch211,NIKE CHICAGO,Fall tennis gear,5661,156.00,2025-09-05,60610
txn_ch212,PRESSED JUICERY,Green juice,5814,13.25,2025-09-06,60610
txn_ch213,TRADER JOES,Weekly groceries,5411,89.45,2025-09-08,60610
txn_ch214,RESTORE HYPER WELLNESS,Red light therapy,7298,65.00,2025-09-09,60610
txn_ch215,VITAMIN SHOPPE,Fall supplements,5499,78.90,2025-09-10,60610
txn_ch216,COMED,Electric bill,4900,123.45,2025-09-11,60610
txn_ch217,WHOLE FOODS CHICAGO,Organic groceries,5411,156.78,2025-09-15,60610
txn_ch218,MASSAGE ENVY,Sports massage,7298,95.00,2025-09-16,60610
txn_ch219,LULULEMON CHICAGO,Fall workout clothes,5655,189.00,2025-09-17,60610
txn_ch220,GNC CHICAGO,Protein powder,5499,72.40,2025-09-18,60610
txn_ch221,TRADER JOES,Weekly shopping,5411,94.67,2025-09-22,60610
txn_ch222,CHIPOTLE,Quick dinner,5814,13.95,2025-09-23,60610
txn_ch223,TENNIS PRO SHOP,Tennis bag,5941,134.00,2025-09-24,60610
txn_ch224,EAST BANK CLUB,October membership,7997,295.00,2025-10-01,60610
txn_ch225,CTA VENTRA,Monthly pass,4111,105.00,2025-10-01,60610
txn_ch226,WHOLE FOODS CHICAGO,Weekly shopping,5411,145.89,2025-10-06,60610
txn_ch227,TENNIS TOURNAMENT,Fall championship,7999,115.00,2025-10-07,60610
txn_ch228,SWEETGREEN,Lunch,5814,17.40,2025-10-08,60610
txn_ch229,NIKE CHICAGO,Tennis shoes,5661,165.00,2025-10-09,60610
txn_ch230,PRESSED JUICERY,Cold pressed juice,5814,12.75,2025-10-10,60610
txn_ch231,TRADER JOES,Weekly groceries,5411,91.23,2025-10-13,60610
txn_ch232,RESTORE HYPER WELLNESS,Compression therapy,7298,85.00,2025-10-14,60610
txn_ch233,VITAMIN SHOPPE,Supplements,5499,76.80,2025-10-15,60610
txn_ch234,COMED,Electric bill,4900,112.67,2025-10-16,60610
txn_ch235,ATHLETA CHICAGO,Fall athletic wear,5655,156.00,2025-10-17,60610
txn_ch236,WHOLE FOODS CHICAGO,Organic groceries,5411,138.67,2025-10-20,60610
txn_ch237,MASSAGE ENVY,Deep tissue massage,7298,95.00,2025-10-21,60610
txn_ch238,GNC CHICAGO,Pre-workout and BCAAs,5499,89.50,2025-10-22,60610
txn_ch239,CHIPOTLE,Dinner,5814,14.50,2025-10-23,60610
txn_ch240,TRADER JOES,Final October shopping,5411,87.45,2025-10-27,60610
txn_ch241,LULULEMON CHICAGO,Winter workout preview,5655,178.00,2025-10-28,60610
txn_ch242,TENNIS LESSONS,Private coaching,7999,120.00,2025-10-29,60610
txn_ch243,JAMES ALLEN DIAMONDS,Engagement ring purchase,5944,8500.00,2025-11-03,
txn_ch244,FOUR SEASONS CHICAGO,Wedding venue deposit,7011,10000.00,2025-11-08,60611
txn_ch245,SHANNON GAIL WEDDINGS,Wedding planner retainer,7399,3500.00,2025-11-12,60614
txn_ch246,NORTHWESTERN OB GYN,First prenatal visit,8011,400.00,2025-11-15,60611
txn_ch247,NORTHWESTERN MUTUAL,Life insurance application,6311,150.00,2025-11-18,
txn_ch248,SIDLEY AUSTIN LLP,Estate planning will update,8111,1200.00,2025-11-22,60603`;
