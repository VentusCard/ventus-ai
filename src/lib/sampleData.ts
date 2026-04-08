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
    age: "45",
    occupation: "Product Director",
    familyStatus: "Married, 1 dependent",
    incomeLevel: "$200K-$250K",
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
    familyStatus: "Married, 2 dependents",
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
    familyStatus: "Married, 2 dependents",
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
    familyStatus: "Married, 1 dependent",
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
    familyStatus: "Married, adult dependents",
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

export const SAMPLE_CSV = `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source
txn_001,STARBUCKS COFFEE #1234,Fast Food Restaurants,5814,12.45,2024-11-01,94102,Cashback Card
txn_002,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,156.78,2024-11-06,94102,Cashback Card
txn_003,EQUINOX FITNESS,Membership Clubs, Recreation,7997,200.00,2024-11-12,94102,Premium Card
txn_004,SHELL OIL 78945,Service Stations, Gas,5541,45.20,2024-11-17,94103,Cashback Card
txn_005,PAYPAL*TICKETMASTR Sabrina Carpenter,Amusement Parks, Carnivals, Fairs,7996,287.50,2024-11-23,,Cashback Card
txn_006,AplPAY UBER EATS,Fast Food Restaurants,5814,45.30,2024-12-06,,Cashback Card
txn_007,AMAZON.COM AMZN Books,Book Stores,5942,34.99,2024-12-12,,Cashback Card
txn_008,PAYPAL*ETSY HomeVibes Shop,Direct Marketing, Other,5969,78.25,2024-12-17,,Cashback Card
txn_009,DELTA AIR LINES 0062 JFK,Airlines, Air Carriers,4511,450.00,2024-12-23,94102,Travel Card
txn_010,MARRIOTT HOTELS NYC MIDTOWN,Hotels, Motels, Resorts,7011,600.00,2024-12-28,10036,Travel Card
txn_011,CVS PHARMACY,Drug Stores, Pharmacies,5912,28.50,2025-01-08,94102,HSA
txn_012,LULULEMON,Family Clothing Stores,5651,89.00,2025-01-15,94102,Premium Card
txn_013,CHEWY.COM,Pet Shops, Pet Food and Supplies,5995,67.89,2025-01-22,94102,Cashback Card
txn_014,NETFLIX.COM,Cable, Satellite, Streaming Services,4899,15.99,2025-01-28,,Cashback Card
txn_015,UBER TRIP,Taxicabs and Rideshares,4121,23.50,2025-02-07,94102,Travel Card
txn_016,CHIPOTLE MEXICAN GRILL,Fast Food Restaurants,5814,11.75,2025-02-12,94102,Cashback Card
txn_017,TARGET STORES,Grocery Stores, Supermarkets,5411,127.34,2025-02-17,94103,Cashback Card
txn_018,AplPAY APPLE.COM/BILL,Computer Software Stores,5734,4.99,2025-02-22,,Cashback Card
txn_019,LA FITNESS,Membership Clubs, Recreation,7997,29.99,2025-02-26,94102,Cashback Card
txn_020,SEPHORA,Cosmetic Stores,5977,156.50,2025-03-08,94102,Premium Card
txn_021,PETSMART,Pet Shops, Pet Food and Supplies,5995,43.20,2025-03-15,94103,Cashback Card
txn_073,COLLEGEBOARD SAT,Schools, Educational Services,8299,68.00,2025-03-15,,Cashback Card
txn_022,SPOTIFY,Cable, Satellite, Streaming Services,4899,10.99,2025-03-22,,Cashback Card
txn_023,PAYPAL*STUBHUB Hamilton NYC,Theatrical Producers, Ticket Agencies,7922,195.00,2025-03-28,,Cashback Card
txn_024,SOUTHWEST AIRLINES WN3847,Airlines, Air Carriers,4511,289.00,2025-04-07,,Travel Card
txn_025,WALGREENS,Drug Stores, Pharmacies,5912,34.67,2025-04-12,94102,HSA
txn_026,PANERA BREAD,Fast Food Restaurants,5814,18.45,2025-04-17,94102,Cashback Card
txn_027,HOME DEPOT,Lumber and Building Materials Stores,5211,234.56,2025-04-22,94103,Checking
txn_028,TRADER JOES,Grocery Stores, Supermarkets,5411,89.23,2025-04-27,94102,Cashback Card
txn_029,NORDSTROM,Family Clothing Stores,5651,178.90,2025-05-07,94102,Premium Card
txn_074,KAPLAN TEST PREP,Schools, Educational Services,8299,1299.00,2025-05-10,94102,Checking
txn_030,PETCO,Pet Shops, Pet Food and Supplies,5995,28.40,2025-05-12,94103,Cashback Card
txn_031,AMC THEATRES,Motion Picture Theaters,7832,42.00,2025-05-18,94102,Cashback Card
txn_032,DOORDASH,Fast Food Restaurants,5814,35.60,2025-05-23,94102,Cashback Card
txn_033,SHELL OIL,Service Stations, Gas,5541,52.30,2025-05-28,94103,Cashback Card
txn_034,COSTCO WHOLESALE,Grocery Stores, Supermarkets,5411,198.76,2025-06-08,94102,Cashback Card
txn_035,BLUE APRON,Fast Food Restaurants,5814,71.94,2025-06-15,,Cashback Card
txn_036,EQUINOX SPA,Health and Beauty Spas,7298,150.00,2025-06-21,94102,Premium Card
txn_037,BARNES & NOBLE,Book Stores,5942,45.80,2025-06-27,94102,Cashback Card
txn_038,VETERINARY CLINIC,Veterinary Services,0742,185.00,2025-07-07,94103,Checking
txn_039,HULU,Cable, Satellite, Streaming Services,4899,14.99,2025-07-12,,Cashback Card
txn_040,LYFT RIDE,Taxicabs and Rideshares,4121,35.80,2025-07-18,94102,Travel Card
txn_041,OLIVE GARDEN,Eating Places, Restaurants,5812,67.50,2025-07-23,94103,Cashback Card
txn_042,IKEA,Furniture, Home Furnishings Stores,5712,345.00,2025-07-28,94102,Checking
txn_043,ULTA BEAUTY,Cosmetic Stores,5977,92.30,2025-08-08,94102,Premium Card
txn_044,PETFOOD EXPRESS,Pet Shops, Pet Food and Supplies,5995,54.99,2025-08-15,94103,Cashback Card
txn_045,HBO MAX,Cable, Satellite, Streaming Services,4899,15.99,2025-08-22,,Cashback Card
txn_046,STARBUCKS COFFEE,Fast Food Restaurants,5814,6.75,2025-08-28,94102,Cashback Card
txn_047,RITE AID PHARMACY,Drug Stores, Pharmacies,5912,18.90,2025-09-07,94103,HSA
txn_048,NIKE STORE,Shoe Stores,5661,129.99,2025-09-12,94102,Cashback Card
txn_049,HILTON HOTELS,Hotels, Motels, Resorts,7011,425.00,2025-09-17,94102,Travel Card
txn_050,WHOLE FOODS,Grocery Stores, Supermarkets,5411,143.56,2025-09-22,94102,Cashback Card
txn_056,DELTA AIR LINES 0184 LGA,Airlines, Air Carriers,4511,520.00,2025-09-24,,Travel Card
txn_057,MARRIOTT TIMES SQ NYC,Hotels, Motels, Resorts,7011,950.00,2025-09-24,10036,Travel Card
txn_058,SHELL OIL QUEENS NY,Service Stations, Gas,5541,58.30,2025-09-24,11101,Travel Card
txn_059,UBER NYC,Taxicabs and Rideshares,4121,45.80,2025-09-24,10036,Travel Card
txn_060,STARBUCKS MANHATTAN,Fast Food Restaurants,5814,8.95,2025-09-25,10036,Travel Card
txn_061,JOES PIZZA NYC,Fast Food Restaurants,5814,22.50,2025-09-25,10001,Travel Card
txn_062,BROADWAY THEATRE Hamilton,Theatrical Producers, Ticket Agencies,7922,350.00,2025-09-25,10036,Travel Card
txn_063,UBER NYC,Taxicabs and Rideshares,4121,18.40,2025-09-25,10036,Travel Card
txn_064,SHELL OIL BROOKLYN,Service Stations, Gas,5541,62.15,2025-09-26,11211,Travel Card
txn_065,WHOLE FOODS MANHATTAN,Grocery Stores, Supermarkets,5411,45.70,2025-09-26,10001,Travel Card
txn_066,MET MUSEUM NYC,Professional Services, NEC,8999,30.00,2025-09-26,10028,Travel Card
txn_067,LYFT NYC,Taxicabs and Rideshares,4121,22.30,2025-09-26,10028,Travel Card
txn_051,PLANET FITNESS,Membership Clubs, Recreation,7997,22.99,2025-09-27,94102,Cashback Card
txn_068,CENTRAL PARK CAFE,Fast Food Restaurants,5814,28.60,2025-09-27,10024,Travel Card
txn_069,UBER NYC,Taxicabs and Rideshares,4121,52.90,2025-09-28,11101,Travel Card
txn_070,DELTA AIR LINES 0062 SFO,Airlines, Air Carriers,4511,480.00,2025-09-28,,Travel Card
txn_071,SHELL OIL LOCAL,Service Stations, Gas,5541,49.10,2025-09-29,94102,Cashback Card
txn_072,STARBUCKS COFFEE,Fast Food Restaurants,5814,6.75,2025-09-30,94102,Cashback Card
txn_052,WARBY PARKER,Pet Shops, Pet Food and Supplies,5995,195.00,2025-10-08,94102,HSA
txn_075,STANFORD VISITOR PARKING,Parking Lots and Garages,7523,25.00,2025-10-14,94305,Cashback Card
txn_053,GRUBHUB,Fast Food Restaurants,5814,42.30,2025-10-15,,Cashback Card
txn_054,LOWES,Lumber and Building Materials Stores,5211,87.45,2025-10-21,94103,Checking
txn_055,SHELL OIL LOCAL,Service Stations, Gas,5541,48.20,2025-10-27,94102,Cashback Card
`;

export const SAMPLE_CSV_SPORTS_WELLNESS = `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source
txn_s001,LULULEMON ATHLETICA,Sports and Riding Apparel Stores,5655,189.00,2024-11-01,,Premium Card
txn_s002,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,143.67,2024-11-05,78701,Cashback Card
txn_s003,EQUINOX AUSTIN,Membership Clubs, Recreation,7997,250.00,2024-11-10,,Premium Card
txn_s004,JUICE LAND,Fast Food Restaurants,5814,12.50,2024-11-15,,Cashback Card
txn_s005,GNC LIVE WELL,Miscellaneous Food Stores,5499,87.45,2024-11-19,,Cashback Card
txn_s006,REI CO-OP,Sporting Goods Stores,5941,234.99,2024-11-24,78701,Cashback Card
txn_s007,NIKE STORE AUSTIN,Shoe Stores,5661,159.99,2024-12-05,,Cashback Card
txn_s008,BARRYS BOOTCAMP,Membership Clubs, Recreation,7997,150.00,2024-12-10,,Premium Card
txn_s009,SNAP KITCHEN,Fast Food Restaurants,5814,89.50,2024-12-15,,Cashback Card
txn_s010,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,62.30,2024-12-19,,Cashback Card
txn_s011,TRADER JOES,Grocery Stores, Supermarkets,5411,67.89,2024-12-24,78701,Cashback Card
txn_s012,SOULCYCLE AUSTIN,Membership Clubs, Recreation,7997,85.00,2024-12-28,,Premium Card
txn_s013,ATHLETA,Sports and Riding Apparel Stores,5655,156.50,2025-01-06,,Premium Card
txn_s014,PICNIK AUSTIN,Fast Food Restaurants,5814,15.75,2025-01-11,,Cashback Card
txn_s015,DICKS SPORTING GOODS,Sporting Goods Stores,5941,178.90,2025-01-15,78701,Cashback Card
txn_s016,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,124.56,2025-01-20,78701,Cashback Card
txn_s017,LIFETIME FITNESS,Membership Clubs, Recreation,7997,95.00,2025-01-24,,Premium Card
txn_s018,SMOOTHIE KING,Fast Food Restaurants,5814,9.95,2025-01-28,,Cashback Card
txn_s019,UNDER ARMOUR,Sports and Riding Apparel Stores,5655,98.40,2025-02-06,,Cashback Card
txn_s020,SPROUTS FARMERS MARKET,Grocery Stores, Supermarkets,5411,89.23,2025-02-10,,Cashback Card
txn_s021,AUSTIN ROCK GYM,Membership Clubs, Recreation,7997,45.00,2025-02-14,,Cashback Card
txn_s022,ROGUE FITNESS AUSTIN,Sporting Goods Stores,5941,267.80,2025-02-18,78701,Cashback Card
txn_s023,ELEMENTS MASSAGE,Health and Beauty Spas,7298,145.00,2025-02-22,,Premium Card
txn_s024,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,78.90,2025-02-26,78701,Cashback Card
txn_s025,ORANGE THEORY FITNESS,Membership Clubs, Recreation,7997,189.00,2025-03-06,,Premium Card
txn_s026,PATAGONIA AUSTIN,Sports and Riding Apparel Stores,5655,198.50,2025-03-11,,Premium Card
txn_s027,FACTOR MEALS,Fast Food Restaurants,5814,119.94,2025-03-15,,Cashback Card
txn_s028,SEPHORA,Cosmetic Stores,5977,67.30,2025-03-20,,Premium Card
txn_s077,AUSTIN OB GYN ASSOCIATES,Physicians, Medical Services,8011,350.00,2025-03-20,78701,HSA
txn_s029,YOGA YOGA AUSTIN,Membership Clubs, Recreation,7997,120.00,2025-03-24,,Premium Card
txn_s030,JUICE LAND,Fast Food Restaurants,5814,16.50,2025-03-28,,Cashback Card
txn_s031,REI CO-OP,Sporting Goods Stores,5941,345.67,2025-04-07,,Cashback Card
txn_s032,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,156.78,2025-04-12,78701,Cashback Card
txn_s033,LULULEMON ATHLETICA,Sports and Riding Apparel Stores,5655,134.00,2025-04-17,,Premium Card
txn_s034,SHELL OIL,Service Stations, Gas,5541,52.30,2025-04-22,78701,Cashback Card
txn_s035,AUSTIN CHIROPRACTIC,Chiropodists, Podiatrists,8049,95.00,2025-04-27,,HSA
txn_s036,SNAP KITCHEN,Fast Food Restaurants,5814,67.50,2025-05-02,,Cashback Card
txn_s037,DICKS SPORTING GOODS,Sporting Goods Stores,5941,89.99,2025-05-06,78701,Cashback Card
txn_s038,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,65.00,2025-05-11,,Premium Card
txn_s039,TRADER JOES,Grocery Stores, Supermarkets,5411,73.45,2025-05-15,,Cashback Card
txn_s040,NIKE STORE AUSTIN,Shoe Stores,5661,198.00,2025-05-20,,Cashback Card
txn_s041,BARRYS BOOTCAMP,Membership Clubs, Recreation,7997,34.00,2025-05-24,,Premium Card
txn_s042,PICNIK AUSTIN,Fast Food Restaurants,5814,14.30,2025-06-06,,Cashback Card
txn_s076,BUY BUY BABY #0847,Children's and Infants' Wear,5641,1250.00,2025-06-08,78701,Cashback Card
txn_s043,GNC LIVE WELL,Miscellaneous Food Stores,5499,54.20,2025-06-10,,Cashback Card
txn_s044,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,132.90,2025-06-15,78701,Cashback Card
txn_s045,ATHLETA,Sports and Riding Apparel Stores,5655,112.50,2025-06-19,,Premium Card
txn_s046,SOULCYCLE AUSTIN,Membership Clubs, Recreation,7997,32.00,2025-06-23,,Premium Card
txn_s047,SMOOTHIE KING,Fast Food Restaurants,5814,10.50,2025-06-27,,Cashback Card
txn_s048,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,48.90,2025-07-06,,Cashback Card
txn_s049,SPROUTS FARMERS MARKET,Grocery Stores, Supermarkets,5411,95.67,2025-07-11,,Cashback Card
txn_s050,REI CO-OP,Sporting Goods Stores,5941,87.50,2025-07-15,,Cashback Card
txn_s051,ELEMENTS MASSAGE,Health and Beauty Spas,7298,95.00,2025-07-20,,Premium Card
txn_s052,LULULEMON ATHLETICA,Sports and Riding Apparel Stores,5655,78.00,2025-07-24,,Premium Card
txn_s053,FACTOR MEALS,Fast Food Restaurants,5814,119.94,2025-07-28,,Cashback Card
txn_s054,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,89.45,2025-08-06,78701,Cashback Card
txn_s055,ORANGE THEORY FITNESS,Membership Clubs, Recreation,7997,18.00,2025-08-11,,Premium Card
txn_s056,UNDER ARMOUR,Sports and Riding Apparel Stores,5655,87.30,2025-08-15,,Cashback Card
txn_s057,JUICE LAND,Fast Food Restaurants,5814,13.75,2025-08-20,,Cashback Card
txn_s058,DICKS SPORTING GOODS,Sporting Goods Stores,5941,45.99,2025-08-24,78701,Cashback Card
txn_s059,SHELL OIL,Service Stations, Gas,5541,48.70,2025-08-28,78701,Cashback Card
txn_s065,TRADER JOES,Grocery Stores, Supermarkets,5411,82.35,2025-09-06,78701,Cashback Card
txn_s066,BARRYS BOOTCAMP,Membership Clubs, Recreation,7997,150.00,2025-09-10,,Premium Card
txn_s060,HILTON DALLAS,Hotels, Motels, Resorts,7011,320.00,2025-09-13,75201,Travel Card
txn_s061,SHELL OIL DALLAS,Service Stations, Gas,5541,55.40,2025-09-13,75201,Travel Card
txn_s062,WHOLE FOODS DALLAS,Grocery Stores, Supermarkets,5411,45.60,2025-09-14,75201,Travel Card
txn_s063,YOGA STUDIO DALLAS,Membership Clubs, Recreation,7997,25.00,2025-09-14,,Travel Card
txn_s067,NIKE STORE AUSTIN,Shoe Stores,5661,45.50,2025-09-15,,Cashback Card
txn_s064,SHELL OIL,Service Stations, Gas,5541,51.20,2025-09-15,78701,Cashback Card
txn_s068,SNAP KITCHEN,Fast Food Restaurants,5814,78.00,2025-09-19,,Cashback Card
txn_s069,GNC LIVE WELL,Miscellaneous Food Stores,5499,36.80,2025-09-23,,Cashback Card
txn_s070,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,167.89,2025-09-27,78701,Cashback Card
txn_s071,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,175.00,2025-10-07,,Premium Card
txn_s078,POTTERY BARN KIDS #214,Furniture, Home Furnishings Stores,5712,485.00,2025-10-08,78701,Cashback Card
txn_s072,LULULEMON ATHLETICA,Sports and Riding Apparel Stores,5655,148.00,2025-10-12,,Premium Card
txn_s073,PICNIK AUSTIN,Fast Food Restaurants,5814,16.90,2025-10-17,,Cashback Card
txn_s074,ATHLETA,Sports and Riding Apparel Stores,5655,134.50,2025-10-22,,Premium Card
txn_s075,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,145.23,2025-10-27,78701,Cashback Card
`;

export const SAMPLE_CSV_FOOD_HOME = `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source
txn_h001,GIBSONS BAR & STEAKHOUSE,Eating Places, Restaurants,5812,287.50,2024-11-01,60614,Premium Card
txn_h002,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,167.89,2024-11-05,60614,Cashback Card
txn_h003,HOME DEPOT,Lumber and Building Materials Stores,5211,156.78,2024-11-09,60614,Checking
txn_h004,MARIANO'S,Grocery Stores, Supermarkets,5411,234.56,2024-11-13,60614,Cashback Card
txn_h005,STARBUCKS COFFEE,Fast Food Restaurants,5814,6.75,2024-11-17,60614,Cashback Card
txn_h006,UBER EATS,Fast Food Restaurants,5814,45.30,2024-11-21,60614,Cashback Card
txn_h007,MENARDS,Lumber and Building Materials Stores,5211,198.90,2024-11-25,60614,Checking
txn_h008,PORTILLOS HOT DOGS,Fast Food Restaurants,5814,18.45,2024-12-05,60614,Cashback Card
txn_h009,TRADER JOES,Grocery Stores, Supermarkets,5411,89.23,2024-12-10,60614,Cashback Card
txn_h010,NETFLIX,Cable, Satellite, Streaming Services,4899,15.99,2024-12-15,,Cashback Card
txn_h011,TARGET,Grocery Stores, Supermarkets,5411,145.67,2024-12-19,60614,Cashback Card
txn_h012,LOU MALNATIS PIZZERIA,Eating Places, Restaurants,5812,67.50,2024-12-24,60614,Premium Card
txn_h013,LOWE'S,Lumber and Building Materials Stores,5211,124.30,2024-12-28,60657,Checking
txn_h014,PANERA BREAD,Fast Food Restaurants,5814,16.90,2025-01-06,60614,Cashback Card
txn_h015,COSTCO WHOLESALE,Grocery Stores, Supermarkets,5411,298.76,2025-01-11,60614,Cashback Card
txn_h016,SHELL,Service Stations, Gas,5541,52.30,2025-01-15,60614,Cashback Card
txn_h017,CRATE AND BARREL,Furniture, Home Furnishings Stores,5712,156.50,2025-01-20,60614,Premium Card
txn_h018,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,124.56,2025-01-24,60614,Cashback Card
txn_h019,DOORDASH,Fast Food Restaurants,5814,38.60,2025-01-28,60614,Cashback Card
txn_h020,ACE HARDWARE,Hardware Stores,5251,67.80,2025-02-06,60614,Checking
txn_h021,CHIPOTLE MEXICAN GRILL,Fast Food Restaurants,5814,12.75,2025-02-10,60614,Cashback Card
txn_h022,WEST ELM,Furniture, Home Furnishings Stores,5712,567.90,2025-02-14,60610,Premium Card
txn_h023,MARIANO'S,Grocery Stores, Supermarkets,5411,178.45,2025-02-18,60614,Cashback Card
txn_h024,RPM ITALIAN,Eating Places, Restaurants,5812,198.75,2025-02-22,60610,Premium Card
txn_h025,HOME DEPOT,Lumber and Building Materials Stores,5211,234.99,2025-02-26,60614,Checking
txn_h026,HULU,Cable, Satellite, Streaming Services,4899,14.99,2025-03-02,,Cashback Card
txn_h027,STARBUCKS COFFEE,Fast Food Restaurants,5814,7.25,2025-03-05,60614,Cashback Card
txn_h028,TRADER JOES,Grocery Stores, Supermarkets,5411,95.67,2025-03-09,60614,Cashback Card
txn_h029,GRUBHUB,Fast Food Restaurants,5814,28.40,2025-03-13,60614,Cashback Card
txn_h030,COMED,Utilities: Electric, Gas, Water,4900,145.67,2025-03-17,60614,Checking
txn_h031,IKEA,Furniture, Home Furnishings Stores,5712,445.00,2025-03-21,60126,Checking
txn_h032,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,134.90,2025-03-25,60614,Cashback Card
txn_h033,PEQUODS PIZZA,Eating Places, Restaurants,5812,54.30,2025-04-06,60614,Cashback Card
txn_h034,BP,Service Stations, Gas,5541,48.70,2025-04-10,60614,Cashback Card
txn_h035,HOMEGOODS,Drapery, Window Coverings, Upholstery,5714,89.50,2025-04-15,60614,Cashback Card
txn_h036,MARIANO'S,Grocery Stores, Supermarkets,5411,187.34,2025-04-19,60614,Cashback Card
txn_h037,PEOPLES GAS,Utilities: Electric, Gas, Water,4900,89.45,2025-04-23,60614,Checking
txn_h076,GUARANTEED RATE MORTGAGE,Mortgage Brokers,6163,500.00,2025-04-25,60601,Checking
txn_h038,PANERA BREAD,Fast Food Restaurants,5814,13.60,2025-04-27,60614,Cashback Card
txn_h039,BEST BUY,Household Appliance Stores,5722,567.89,2025-05-06,60614,Checking
txn_h040,UBER EATS,Fast Food Restaurants,5814,42.30,2025-05-11,60614,Cashback Card
txn_h041,GIRL AND THE GOAT,Eating Places, Restaurants,5812,234.50,2025-05-15,60607,Premium Card
txn_h042,TARGET,Grocery Stores, Supermarkets,5411,98.45,2025-05-20,60614,Cashback Card
txn_h043,HELLOFRESH,Fast Food Restaurants,5814,89.94,2025-05-24,,Cashback Card
txn_h044,STARBUCKS COFFEE,Fast Food Restaurants,5814,6.95,2025-05-28,60614,Cashback Card
txn_h045,HOME DEPOT,Lumber and Building Materials Stores,5211,456.78,2025-06-06,60614,Checking
txn_h046,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,156.78,2025-06-10,60614,Cashback Card
txn_h047,COSTCO WHOLESALE,Grocery Stores, Supermarkets,5411,312.45,2025-06-15,60614,Cashback Card
txn_h048,ROTO-ROOTER,Heating, Plumbing, A/C Contractors,1711,285.00,2025-06-19,60614,Checking
txn_h049,CHIPOTLE MEXICAN GRILL,Fast Food Restaurants,5814,14.25,2025-06-23,60614,Cashback Card
txn_h050,CB2,Furniture, Home Furnishings Stores,5712,389.00,2025-06-27,60614,Premium Card
txn_h051,MARIANO'S,Grocery Stores, Supermarkets,5411,167.89,2025-07-02,60614,Cashback Card
txn_h052,DOORDASH,Fast Food Restaurants,5814,32.75,2025-07-05,60614,Cashback Card
txn_h053,SPOTIFY,Cable, Satellite, Streaming Services,4899,10.99,2025-07-09,,Cashback Card
txn_h077,CHICAGO HOME INSPECTIONS,Services, NEC,7389,450.00,2025-07-12,60614,Checking
txn_h054,LOWE'S,Lumber and Building Materials Stores,5211,678.90,2025-07-13,60657,Checking
txn_h055,PORTILLOS,Fast Food Restaurants,5814,24.50,2025-07-17,60614,Cashback Card
txn_h056,TRADER JOES,Grocery Stores, Supermarkets,5411,102.34,2025-07-21,60614,Cashback Card
txn_h057,MARATHON,Service Stations, Gas,5541,51.20,2025-07-25,60614,Cashback Card
txn_h058,STANLEY STEEMER,Carpet and Upholstery Cleaning,7217,195.00,2025-08-06,60614,Checking
txn_h059,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,178.90,2025-08-11,60614,Cashback Card
txn_h060,AMAZON PRIME,Miscellaneous and Specialty Retail,5999,139.00,2025-08-15,,Cashback Card
txn_h061,HOME DEPOT,Household Appliance Stores,5722,1289.00,2025-08-20,60614,Checking
txn_h062,LOU MALNATIS PIZZERIA,Eating Places, Restaurants,5812,89.40,2025-08-24,60614,Premium Card
txn_h063,CVS PHARMACY,Drug Stores, Pharmacies,5912,34.67,2025-08-28,60614,Cashback Card
txn_h064,PANERA BREAD,Fast Food Restaurants,5814,22.80,2025-09-06,60614,Cashback Card
txn_h065,WAYFAIR,Furniture, Home Furnishings Stores,5712,445.67,2025-09-10,,Checking
txn_h066,COSTCO WHOLESALE,Grocery Stores, Supermarkets,5411,245.78,2025-09-15,60614,Cashback Card
txn_h067,ULTA BEAUTY,Cosmetic Stores,5977,87.50,2025-09-19,60614,Premium Card
txn_h068,STARBUCKS COFFEE,Fast Food Restaurants,5814,9.45,2025-09-23,60614,Cashback Card
txn_h069,MARIANO'S,Grocery Stores, Supermarkets,5411,189.56,2025-09-27,60614,Cashback Card
txn_h070,GRUBHUB,Fast Food Restaurants,5814,51.30,2025-10-06,60614,Cashback Card
txn_h071,WALGREENS,Drug Stores, Pharmacies,5912,28.90,2025-10-10,60614,HSA
txn_h078,CHICAGO TITLE COMPANY,Insurance Services,6411,1200.00,2025-10-12,60601,Checking
txn_h072,AMC THEATRES,Motion Picture Theaters,7832,42.00,2025-10-15,60610,Cashback Card
txn_h073,MUSIC BOX THEATRE,Motion Picture Theaters,7832,28.00,2025-10-19,60614,Cashback Card
txn_h074,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,167.34,2025-10-23,60614,Cashback Card
txn_h075,ETSY,Direct Marketing, Other,5969,78.25,2025-10-27,,Cashback Card
`;

export const SOURCE_COLORS: Record<string, string> = {
  "Cashback Card": "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  "Travel Card": "bg-blue-500/10 text-blue-700 border-blue-500/20",
  "Premium Card": "bg-purple-500/10 text-purple-700 border-purple-500/20",
  "Checking": "bg-slate-500/10 text-slate-700 border-slate-500/20",
  "HSA": "bg-amber-500/10 text-amber-700 border-amber-500/20",
};

export const getSourceColor = (source: string) =>
  SOURCE_COLORS[source] ?? "bg-slate-100 text-slate-600 border-slate-300";

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

export const SAMPLE_CSV_TRAVEL_FAMILY_12 = `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source
txn_sf001,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2024-11-01,94102,Checking
txn_sf002,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2024-11-01,94102,Checking
txn_sf003,KIDS SOCCER LEAGUE,Athletic Fields, Commercial Sports,7941,295.00,2024-11-05,94102,Checking
txn_sf004,SAFEWAY,Grocery Stores, Supermarkets,5411,178.90,2024-11-11,94102,Cashback Card
txn_sf005,CHEVRON,Service Stations, Gas,5541,69.40,2024-11-13,94102,Cashback Card
txn_sf006,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,223.45,2024-11-18,94102,Cashback Card
txn_sf007,UNITED AIRLINES UA2847 BOZ,Airlines, Air Carriers,4511,1345.00,2024-11-25,94102,Travel Card
txn_sf008,BUDGET BOZEMAN,Automobile Rental Agency,7512,467.00,2024-11-25,59715,Travel Card
txn_sf009,YELLOWSTONE LODGE,Hotels, Motels, Resorts,7011,1234.00,2024-11-25,82190,Travel Card
txn_sf010,SHELL MONTANA,Service Stations, Gas,5541,64.80,2024-11-25,59715,Travel Card
txn_sf011,ALBERTSONS BOZEMAN,Grocery Stores, Supermarkets,5411,98.60,2024-11-25,59715,Travel Card
txn_sf012,YELLOWSTONE TOURS,Recreation Services, NEC,7999,289.00,2024-11-26,82190,Travel Card
txn_sf013,SHELL YELLOWSTONE,Service Stations, Gas,5541,72.30,2024-11-26,82190,Travel Card
txn_sf014,OLD FAITHFUL INN,Eating Places, Restaurants,5812,145.70,2024-11-26,82190,Travel Card
txn_sf015,YELLOWSTONE GIFT SHOP,Miscellaneous and Specialty Retail,5999,67.80,2024-11-27,82190,Travel Card
txn_sf016,SHELL MONTANA,Service Stations, Gas,5541,68.90,2024-11-28,59715,Travel Card
txn_sf017,MONTANA CAFE,Eating Places, Restaurants,5812,189.00,2024-11-28,59715,Travel Card
txn_sf018,SHELL BOZEMAN,Service Stations, Gas,5541,66.40,2024-11-29,59715,Travel Card
txn_sf019,BUDGET,Automobile Rental Agency,7512,0.00,2024-11-29,59715,Travel Card
txn_sf020,UNITED AIRLINES UA2847,Airlines, Air Carriers,4511,1345.00,2024-11-29,,Travel Card
txn_sf021,CHEVRON,Service Stations, Gas,5541,70.20,2024-11-30,94102,Cashback Card
txn_sf022,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2024-12-01,94102,Checking
txn_sf023,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2024-12-01,94102,Checking
txn_sf024,COSTCO WHOLESALE,Wholesale Clubs,5300,287.90,2024-12-02,94102,Cashback Card
txn_sf025,SAFEWAY,Grocery Stores, Supermarkets,5411,189.45,2024-12-09,94102,Cashback Card
txn_sf026,CHEVRON,Service Stations, Gas,5541,69.70,2024-12-11,94102,Cashback Card
txn_sf027,TARGET,Grocery Stores, Supermarkets,5411,456.78,2024-12-15,94102,Cashback Card
txn_sf028,TOYS R US,Hobby, Toy, and Game Shops,5945,334.90,2024-12-18,94102,Cashback Card
txn_sf029,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,312.56,2024-12-20,94102,Cashback Card
txn_sf030,CHEVRON,Service Stations, Gas,5541,71.30,2024-12-22,94102,Cashback Card
txn_sf031,AMAZON.COM,Miscellaneous and Specialty Retail,5999,789.00,2024-12-19,,Cashback Card
txn_sf032,COSTCO WHOLESALE,Wholesale Clubs,5300,234.67,2024-12-23,94102,Cashback Card
txn_sf033,SAFEWAY,Grocery Stores, Supermarkets,5411,289.90,2024-12-24,94102,Cashback Card
txn_sf034,AMC THEATRES,Motion Picture Theaters,7832,62.00,2024-12-26,94102,Cashback Card
txn_sf035,CHEVRON,Service Stations, Gas,5541,70.50,2024-12-30,94102,Cashback Card
txn_sf036,SAFEWAY,Grocery Stores, Supermarkets,5411,178.45,2025-01-02,94102,Cashback Card
txn_sf037,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2025-01-02,94102,Checking
txn_sf038,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-01-01,94102,Checking
txn_sf039,COSTCO WHOLESALE,Wholesale Clubs,5300,298.67,2025-01-06,94102,Cashback Card
txn_sf040,CHEVRON,Service Stations, Gas,5541,72.10,2025-01-08,94102,Cashback Card
txn_sf041,TRADER JOES,Grocery Stores, Supermarkets,5411,156.78,2025-01-13,94102,Cashback Card
txn_sf042,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,234.56,2025-01-20,94102,Cashback Card
txn_sf043,CHEVRON,Service Stations, Gas,5541,70.30,2025-01-23,94102,Cashback Card
txn_sf044,SAFEWAY,Grocery Stores, Supermarkets,5411,189.34,2025-01-27,94102,Cashback Card
txn_sf045,KIDS SWIM LESSONS,Athletic Fields, Commercial Sports,7941,185.00,2025-01-29,94102,Checking
txn_sf046,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2025-02-01,94102,Checking
txn_sf047,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-02-01,94102,Checking
txn_sf048,CHEVRON,Service Stations, Gas,5541,69.80,2025-02-03,94102,Cashback Card
txn_sf200,ACT REGISTRATION,Schools, Educational Services,8299,68.00,2025-02-15,,Checking
txn_sf049,ANA ALL NIPPON NH007 NRT,Airlines, Air Carriers,4511,3456.00,2025-02-10,94102,Travel Card
txn_sf050,TIMES CAR RENTAL,Automobile Rental Agency,7512,678.00,2025-02-10,100,Travel Card
txn_sf051,KEIO PLAZA TOKYO,Hotels, Motels, Resorts,7011,3890.00,2025-02-10,160,Travel Card
txn_sf052,ENEOS GAS TOKYO,Service Stations, Gas,5541,45.60,2025-02-11,100,Travel Card
txn_sf053,FAMILY MART,Grocery Stores, Supermarkets,5411,34.50,2025-02-11,100,Travel Card
txn_sf054,TOKYO DISNEYLAND,Amusement Parks, Carnivals, Fairs,7996,456.00,2025-02-12,279,Travel Card
txn_sf055,DISNEY RESTAURANT TOKYO,Eating Places, Restaurants,5812,98.70,2025-02-12,279,Travel Card
txn_sf056,ENEOS GAS,Service Stations, Gas,5541,48.30,2025-02-13,100,Travel Card
txn_sf057,TEAMLAB BORDERLESS,Aquariums, Zoos, Museums,7998,134.00,2025-02-13,135,Travel Card
txn_sf058,LAWSON STORE,Grocery Stores, Supermarkets,5411,56.80,2025-02-14,160,Travel Card
txn_sf059,TOKYO DISNEYSEA,Amusement Parks, Carnivals, Fairs,7996,456.00,2025-02-14,279,Travel Card
txn_sf060,SUSHI RESTAURANT TOKYO,Eating Places, Restaurants,5812,178.90,2025-02-15,100,Travel Card
txn_sf061,ENEOS GAS,Service Stations, Gas,5541,47.20,2025-02-16,100,Travel Card
txn_sf062,UENO ZOO,Aquariums, Zoos, Museums,7998,23.40,2025-02-16,110,Travel Card
txn_sf063,AKIHABARA SHOPS,Miscellaneous and Specialty Retail,5999,234.60,2025-02-17,101,Travel Card
txn_sf064,RAMEN ICHIRAN,Fast Food Restaurants,5814,45.80,2025-02-17,150,Travel Card
txn_sf065,ENEOS GAS,Service Stations, Gas,5541,46.90,2025-02-18,100,Travel Card
txn_sf066,TOKYO TOWER,Amusement Parks, Carnivals, Fairs,7996,67.80,2025-02-18,105,Travel Card
txn_sf067,FAMILY MART,Grocery Stores, Supermarkets,5411,28.90,2025-02-19,100,Travel Card
txn_sf068,ENEOS GAS,Service Stations, Gas,5541,44.70,2025-02-19,100,Travel Card
txn_sf069,TIMES CAR,Automobile Rental Agency,7512,0.00,2025-02-19,100,Travel Card
txn_sf070,NARITA EXPRESS,Local/Suburban Commuter Transportation,4111,89.00,2025-02-20,282,Travel Card
txn_sf071,ANA ALL NIPPON NH008,Airlines, Air Carriers,4511,3456.00,2025-02-20,,Travel Card
txn_sf072,CHEVRON,Service Stations, Gas,5541,71.50,2025-02-21,94102,Cashback Card
txn_sf073,COSTCO WHOLESALE,Wholesale Clubs,5300,298.90,2025-02-24,94102,Cashback Card
txn_sf074,SAFEWAY,Grocery Stores, Supermarkets,5411,189.45,2025-03-03,94102,Cashback Card
txn_sf075,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2025-03-01,94102,Checking
txn_sf076,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-03-01,94102,Checking
txn_sf077,CHEVRON,Service Stations, Gas,5541,70.30,2025-03-05,94102,Cashback Card
txn_sf078,TRADER JOES,Grocery Stores, Supermarkets,5411,167.89,2025-03-10,94102,Cashback Card
txn_sf079,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,234.56,2025-03-17,94102,Cashback Card
txn_sf080,CHEVRON,Service Stations, Gas,5541,69.80,2025-03-20,94102,Cashback Card
txn_sf081,KIDS SOCCER LEAGUE,Athletic Fields, Commercial Sports,7941,295.00,2025-03-18,94102,Checking
txn_sf082,SAFEWAY,Grocery Stores, Supermarkets,5411,198.34,2025-03-24,94102,Cashback Card
txn_sf083,COSTCO WHOLESALE,Wholesale Clubs,5300,289.67,2025-03-31,94102,Cashback Card
txn_sf084,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2025-04-01,94102,Checking
txn_sf085,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-04-01,94102,Checking
txn_sf086,CHEVRON,Service Stations, Gas,5541,72.10,2025-04-03,94102,Cashback Card
txn_sf201,PRINCETON REVIEW,Schools, Educational Services,8299,1599.00,2025-04-12,94102,Checking
txn_sf087,UNITED AIRLINES UA1892 SJO,Airlines, Air Carriers,4511,1678.00,2025-04-08,94102,Travel Card
txn_sf088,ECONOMY RENT-A-CAR,Automobile Rental Agency,7512,567.00,2025-04-08,20101,Travel Card
txn_sf089,FOUR SEASONS PAPAGAYO,Hotels, Motels, Resorts,7011,3890.00,2025-04-08,50503,Travel Card
txn_sf090,PURA VIDA GAS,Service Stations, Gas,5541,42.60,2025-04-09,20101,Travel Card
txn_sf091,AUTOMERCADO,Grocery Stores, Supermarkets,5411,67.80,2025-04-09,20101,Travel Card
txn_sf092,ZIP LINE TOUR COSTA RICA,Recreation Services, NEC,7999,234.00,2025-04-10,50503,Travel Card
txn_sf093,LOCAL RESTAURANT CR,Eating Places, Restaurants,5812,98.50,2025-04-10,20101,Travel Card
txn_sf094,PURA VIDA GAS,Service Stations, Gas,5541,45.30,2025-04-11,20101,Travel Card
txn_sf095,MANUEL ANTONIO PARK,Amusement Parks, Carnivals, Fairs,7996,67.00,2025-04-11,60601,Travel Card
txn_sf096,BEACH RESTAURANT CR,Fast Food Restaurants,5814,76.40,2025-04-11,60601,Travel Card
txn_sf097,WILDLIFE SANCTUARY,Recreation Services, NEC,7999,89.00,2025-04-12,50503,Travel Card
txn_sf098,PURA VIDA GAS,Service Stations, Gas,5541,44.80,2025-04-13,20101,Travel Card
txn_sf099,SNORKELING TOUR CR,Recreation Services, NEC,7999,178.00,2025-04-13,50503,Travel Card
txn_sf100,TAMARINDO RESTAURANT,Eating Places, Restaurants,5812,134.60,2025-04-14,50309,Travel Card
txn_sf101,SOUVENIR SHOP CR,Miscellaneous and Specialty Retail,5999,87.50,2025-04-14,20101,Travel Card
txn_sf102,PURA VIDA GAS,Service Stations, Gas,5541,43.90,2025-04-14,20101,Travel Card
txn_sf103,ECONOMY,Automobile Rental Agency,7512,0.00,2025-04-15,20101,Travel Card
txn_sf104,UNITED AIRLINES UA1893,Airlines, Air Carriers,4511,1678.00,2025-04-15,,Travel Card
txn_sf105,CHEVRON,Service Stations, Gas,5541,70.80,2025-04-16,94102,Cashback Card
txn_sf106,COSTCO WHOLESALE,Wholesale Clubs,5300,312.45,2025-04-21,94102,Cashback Card
txn_sf107,SAFEWAY,Grocery Stores, Supermarkets,5411,189.56,2025-04-28,94102,Cashback Card
txn_sf108,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2025-05-01,94102,Checking
txn_sf109,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-05-01,94102,Checking
txn_sf110,CHEVRON,Service Stations, Gas,5541,71.30,2025-05-05,94102,Cashback Card
txn_sf111,TRADER JOES,Grocery Stores, Supermarkets,5411,167.89,2025-05-12,94102,Cashback Card
txn_sf112,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,234.67,2025-05-19,94102,Cashback Card
txn_sf113,CHEVRON,Service Stations, Gas,5541,70.50,2025-05-22,94102,Cashback Card
txn_sf114,PEDIATRICIAN SF,Physicians, Medical Services,8011,180.00,2025-05-23,94102,HSA
txn_sf115,SAFEWAY,Grocery Stores, Supermarkets,5411,198.45,2025-05-26,94102,Cashback Card
txn_sf116,KIDS ART CLASS,Recreation Services, NEC,7999,240.00,2025-05-27,94102,Checking
txn_sf117,CHEVRON,Service Stations, Gas,5541,69.90,2025-05-29,94102,Cashback Card
txn_sf118,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-06-01,94102,Checking
txn_sf119,SUMMER CAMP,Schools, Educational Services,8299,1200.00,2025-06-01,94102,Checking
txn_sf120,COSTCO WHOLESALE,Wholesale Clubs,5300,298.76,2025-06-02,94102,Cashback Card
txn_sf121,CHEVRON,Service Stations, Gas,5541,72.40,2025-06-05,94102,Cashback Card
txn_sf122,SAFEWAY,Grocery Stores, Supermarkets,5411,178.90,2025-06-09,94102,Cashback Card
txn_sf123,TRADER JOES,Grocery Stores, Supermarkets,5411,156.78,2025-06-16,94102,Cashback Card
txn_sf202,UC BERKELEY PARKING,Parking Lots and Garages,7523,20.00,2025-06-14,94720,Checking
txn_sf124,CHEVRON,Service Stations, Gas,5541,71.20,2025-06-19,94102,Cashback Card
txn_sf125,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,234.56,2025-06-23,94102,Cashback Card
txn_sf126,SAFEWAY,Grocery Stores, Supermarkets,5411,189.34,2025-06-30,94102,Cashback Card
txn_sf127,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-07-01,94102,Checking
txn_sf128,SUMMER CAMP,Schools, Educational Services,8299,1200.00,2025-07-01,94102,Checking
txn_sf129,CHEVRON,Service Stations, Gas,5541,70.60,2025-07-03,94102,Cashback Card
txn_sf130,COSTCO WHOLESALE,Wholesale Clubs,5300,312.67,2025-07-07,94102,Cashback Card
txn_sf131,BRITISH AIRWAYS BA287 LHR,Airlines, Air Carriers,4511,3890.00,2025-07-15,94102,Travel Card
txn_sf132,EUROPCAR LONDON,Automobile Rental Agency,7512,1234.00,2025-07-15,SW1,Travel Card
txn_sf133,PREMIER INN LONDON WC2,Hotels, Motels, Resorts,7011,1890.00,2025-07-15,WC2,Travel Card
txn_sf134,BP LONDON,Service Stations, Gas,5541,78.60,2025-07-16,SW1,Travel Card
txn_sf135,TESCO EXPRESS,Grocery Stores, Supermarkets,5411,67.40,2025-07-16,SW1,Travel Card
txn_sf136,TOWER OF LONDON,Amusement Parks, Carnivals, Fairs,7996,134.00,2025-07-16,EC3,Travel Card
txn_sf137,PRET A MANGER,Fast Food Restaurants,5814,34.80,2025-07-16,SW1,Travel Card
txn_sf138,LONDON EYE,Amusement Parks, Carnivals, Fairs,7996,178.00,2025-07-17,SE1,Travel Card
txn_sf139,BRITISH MUSEUM,Miscellaneous and Specialty Retail,5999,56.70,2025-07-17,WC1,Travel Card
txn_sf140,PUB DINNER LONDON,Eating Places, Restaurants,5812,98.60,2025-07-17,SW1,Travel Card
txn_sf141,BP LONDON,Service Stations, Gas,5541,82.30,2025-07-18,SW1,Travel Card
txn_sf142,HARRY POTTER STUDIO,Amusement Parks, Carnivals, Fairs,7996,234.00,2025-07-18,WD25,Travel Card
txn_sf143,SAINSBURYS,Grocery Stores, Supermarkets,5411,54.20,2025-07-19,SW1,Travel Card
txn_sf144,LONDON TRANSPORT,Local/Suburban Commuter Transportation,4111,89.00,2025-07-19,SW1,Travel Card
txn_sf145,BP LONDON,Service Stations, Gas,5541,85.90,2025-07-20,SW1,Travel Card
txn_sf146,CHANNEL TUNNEL,Transportation Services, NEC,4789,289.00,2025-07-20,CT21,Travel Card
txn_sf147,TOTAL PARIS,Service Stations, Gas,5541,72.40,2025-07-20,75001,Travel Card
txn_sf148,MERCURE PARIS CHAMPS,Hotels, Motels, Resorts,7011,2340.00,2025-07-20,75001,Travel Card
txn_sf149,CARREFOUR PARIS,Grocery Stores, Supermarkets,5411,78.50,2025-07-21,75001,Travel Card
txn_sf150,EIFFEL TOWER,Amusement Parks, Carnivals, Fairs,7996,189.00,2025-07-21,75007,Travel Card
txn_sf151,CAFE PARIS,Fast Food Restaurants,5814,67.80,2025-07-21,75007,Travel Card
txn_sf152,TOTAL PARIS,Service Stations, Gas,5541,69.30,2025-07-22,75001,Travel Card
txn_sf153,LOUVRE MUSEUM,Amusement Parks, Carnivals, Fairs,7996,167.00,2025-07-22,75001,Travel Card
txn_sf154,PARIS RESTAURANT,Eating Places, Restaurants,5812,134.70,2025-07-22,75001,Travel Card
txn_sf155,DISNEYLAND PARIS,Amusement Parks, Carnivals, Fairs,7996,567.00,2025-07-23,77700,Travel Card
txn_sf156,TOTAL PARIS,Service Stations, Gas,5541,74.60,2025-07-23,75001,Travel Card
txn_sf157,DISNEY RESTAURANT PARIS,Eating Places, Restaurants,5812,98.40,2025-07-23,77700,Travel Card
txn_sf158,ARC DE TRIOMPHE,Amusement Parks, Carnivals, Fairs,7996,45.00,2025-07-24,75008,Travel Card
txn_sf159,MONOPRIX PARIS,Miscellaneous and Specialty Retail,5999,134.60,2025-07-24,75001,Travel Card
txn_sf160,TOTAL PARIS,Service Stations, Gas,5541,71.80,2025-07-25,75001,Travel Card
txn_sf161,VERSAILLES PALACE,Amusement Parks, Carnivals, Fairs,7996,189.00,2025-07-25,78000,Travel Card
txn_sf162,SEINE RIVER CRUISE,Recreation Services, NEC,7999,134.00,2025-07-26,75001,Travel Card
txn_sf163,PARISIAN BISTRO,Eating Places, Restaurants,5812,189.50,2025-07-26,75001,Travel Card
txn_sf164,TOTAL PARIS,Service Stations, Gas,5541,68.90,2025-07-27,75001,Travel Card
txn_sf165,CHANNEL TUNNEL,Transportation Services, NEC,4789,289.00,2025-07-27,62100,Travel Card
txn_sf166,BP LONDON,Service Stations, Gas,5541,79.40,2025-07-27,SW1,Travel Card
txn_sf167,EUROPCAR,Automobile Rental Agency,7512,0.00,2025-07-27,SW1,Travel Card
txn_sf168,BRITISH AIRWAYS BA288,Airlines, Air Carriers,4511,3890.00,2025-07-27,,Travel Card
txn_sf169,CHEVRON,Service Stations, Gas,5541,71.90,2025-07-28,94102,Cashback Card
txn_sf170,COSTCO WHOLESALE,Wholesale Clubs,5300,334.56,2025-07-30,94102,Cashback Card
txn_sf171,SAFEWAY,Grocery Stores, Supermarkets,5411,198.45,2025-08-04,94102,Cashback Card
txn_sf172,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-08-01,94102,Checking
txn_sf173,SUMMER CAMP,Schools, Educational Services,8299,1200.00,2025-08-01,94102,Checking
txn_sf174,CHEVRON,Service Stations, Gas,5541,70.80,2025-08-06,94102,Cashback Card
txn_sf203,DEL WEBB COMMUNITY,Real Estate Agents and Managers,6531,0.00,2025-08-09,,Checking
txn_sf175,TARGET,Grocery Stores, Supermarkets,5411,512.90,2025-08-11,94102,Cashback Card
txn_sf176,TRADER JOES,Grocery Stores, Supermarkets,5411,167.89,2025-08-11,94102,Cashback Card
txn_sf177,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,245.67,2025-08-18,94102,Cashback Card
txn_sf178,CHEVRON,Service Stations, Gas,5541,72.30,2025-08-21,94102,Cashback Card
txn_sf179,SAFEWAY,Grocery Stores, Supermarkets,5411,189.56,2025-08-25,94102,Cashback Card
txn_sf180,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2025-09-01,94102,Checking
txn_sf181,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-09-01,94102,Checking
txn_sf182,KIDS PIANO LESSONS,Recreation Services, NEC,7999,120.00,2025-09-02,94102,Checking
txn_sf183,COSTCO WHOLESALE,Wholesale Clubs,5300,298.90,2025-09-08,94102,Cashback Card
txn_sf184,CHEVRON,Service Stations, Gas,5541,71.50,2025-09-10,94102,Cashback Card
txn_sf204,ESTATE PLANNING ATTORNEY,Legal Services,8111,750.00,2025-09-13,94102,Checking
txn_sf185,TRADER JOES,Grocery Stores, Supermarkets,5411,156.78,2025-09-15,94102,Cashback Card
txn_sf186,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,234.56,2025-09-22,94102,Cashback Card
txn_sf187,CHEVRON,Service Stations, Gas,5541,70.30,2025-09-25,94102,Cashback Card
txn_sf188,SAFEWAY,Grocery Stores, Supermarkets,5411,198.34,2025-09-29,94102,Cashback Card
txn_sf189,AFTER SCHOOL CARE,Schools, Educational Services,8299,450.00,2025-10-01,94102,Checking
txn_sf190,SF PARKING GARAGE,Parking Lots and Garages,7523,225.00,2025-10-01,94102,Checking
txn_sf191,KIDS SOCCER LEAGUE,Athletic Fields, Commercial Sports,7941,295.00,2025-10-03,94102,Checking
txn_sf192,CHEVRON,Service Stations, Gas,5541,69.80,2025-10-06,94102,Cashback Card
txn_sf193,COSTCO WHOLESALE,Wholesale Clubs,5300,312.45,2025-10-13,94102,Cashback Card
txn_sf194,TARGET,Grocery Stores, Supermarkets,5411,156.78,2025-10-17,94102,Cashback Card
txn_sf195,TRADER JOES,Grocery Stores, Supermarkets,5411,167.89,2025-10-20,94102,Cashback Card
txn_sf196,CHEVRON,Service Stations, Gas,5541,71.20,2025-10-23,94102,Cashback Card
txn_sf197,WHOLE FOODS MARKET,Grocery Stores, Supermarkets,5411,234.67,2025-10-27,94102,Cashback Card
txn_sf198,AMAZON.COM,Miscellaneous and Specialty Retail,5999,102.50,2025-10-25,,Cashback Card
txn_sf199,SAFEWAY,Grocery Stores, Supermarkets,5411,189.45,2025-10-30,94102,Cashback Card
txn_sf205,KELLER WILLIAMS REALTY,Real Estate Agents and Managers,6531,0.00,2025-11-16,94102,Checking
`;

export const SAMPLE_CSV_NYC_SPORTS_HOME_12 = `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source
txn_ny001,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2024-11-01,10003,Premium Card
txn_ny002,TRADER JOES,Grocery Stores, Supermarkets,5411,87.45,2024-11-02,10003,Cashback Card
txn_ny003,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2024-11-01,10003,Checking
txn_ny004,NIKE STORE NYC,Shoe Stores,5661,165.00,2024-11-03,10001,Cashback Card
txn_ny005,STARBUCKS NYC,Fast Food Restaurants,5814,6.75,2024-11-04,10003,Cashback Card
txn_ny006,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,124.56,2024-11-05,10003,Cashback Card
txn_ny007,WEST ELM,Furniture, Home Furnishings Stores,5712,389.00,2024-11-06,10003,Premium Card
txn_ny008,SWEETGREEN,Fast Food Restaurants,5814,16.50,2024-11-07,10003,Cashback Card
txn_ny009,LULULEMON NYC,Sports and Riding Apparel Stores,5655,134.00,2024-11-08,10003,Premium Card
txn_ny010,HOME DEPOT NYC,Lumber and Building Materials Stores,5211,156.78,2024-11-09,10003,Checking
txn_ny011,AMAZON.COM,Miscellaneous and Specialty Retail,5999,89.90,2024-11-10,,Cashback Card
txn_ny012,TRADER JOES,Grocery Stores, Supermarkets,5411,92.34,2024-11-11,10003,Cashback Card
txn_ny013,CITI BIKE,Membership Clubs, Recreation,7997,19.95,2024-11-01,10003,Cashback Card
txn_ny014,CHIPOTLE NYC,Fast Food Restaurants,5814,14.25,2024-11-12,10003,Cashback Card
txn_ny015,GNC NYC,Miscellaneous Food Stores,5499,78.50,2024-11-13,10003,Cashback Card
txn_ny016,TARGET EAST VILLAGE,Grocery Stores, Supermarkets,5411,67.80,2024-11-14,10003,Cashback Card
txn_ny017,SOULCYCLE FLATIRON,Membership Clubs, Recreation,7997,175.00,2024-11-15,10010,Premium Card
txn_ny018,BLUESTONE LANE,Fast Food Restaurants,5814,12.80,2024-11-16,10003,Cashback Card
txn_ny019,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,134.67,2024-11-18,10003,Cashback Card
txn_ny020,CB2 NYC,Furniture, Home Furnishings Stores,5712,567.00,2024-11-19,10003,Premium Card
txn_ny021,NETFLIX,Cable, Satellite, Streaming Services,4899,15.99,2024-11-15,,Cashback Card
txn_ny022,SEAMLESS,Fast Food Restaurants,5814,38.60,2024-11-20,10003,Cashback Card
txn_ny023,DICKS SPORTING GOODS,Sporting Goods Stores,5941,145.90,2024-11-21,10003,Cashback Card
txn_ny024,TRADER JOES,Grocery Stores, Supermarkets,5411,112.45,2024-11-23,10003,Cashback Card
txn_ny025,UBER NYC,Taxicabs and Rideshares,4121,24.50,2024-11-24,10003,Cashback Card
txn_ny026,SPOTIFY,Cable, Satellite, Streaming Services,4899,10.99,2024-11-15,,Cashback Card
txn_ny027,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2024-12-01,10003,Premium Card
txn_ny028,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2024-12-01,10003,Checking
txn_ny029,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,127.89,2024-12-02,10003,Cashback Card
txn_ny030,IKEA BROOKLYN,Furniture, Home Furnishings Stores,5712,445.00,2024-12-03,11231,Checking
txn_ny031,LULULEMON NYC,Sports and Riding Apparel Stores,5655,198.00,2024-12-04,10003,Premium Card
txn_ny032,SWEETGREEN,Fast Food Restaurants,5814,17.25,2024-12-05,10003,Cashback Card
txn_ny033,BROOKLYN BOULDERS,Membership Clubs, Recreation,7997,32.00,2024-12-06,11206,Cashback Card
txn_ny034,TRADER JOES,Grocery Stores, Supermarkets,5411,95.67,2024-12-09,10003,Cashback Card
txn_ny035,CONED,Utilities: Electric, Gas, Water,4900,125.67,2024-12-10,10003,Checking
txn_ny036,AMAZON.COM,Miscellaneous and Specialty Retail,5999,78.90,2024-12-11,,Cashback Card
txn_ny037,NIKE STORE NYC,Shoe Stores,5661,112.50,2024-12-12,10001,Cashback Card
txn_ny038,STARBUCKS NYC,Fast Food Restaurants,5814,7.25,2024-12-13,10003,Cashback Card
txn_ny039,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,56.80,2024-12-14,10003,Cashback Card
txn_ny040,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,145.78,2024-12-16,10003,Cashback Card
txn_ny041,HOME DEPOT NYC,Lumber and Building Materials Stores,5211,234.56,2024-12-17,10003,Checking
txn_ny042,PANERA BREAD,Fast Food Restaurants,5814,16.90,2024-12-18,10003,Cashback Card
txn_ny043,HOMEGOODS NYC,Drapery, Window Coverings, Upholstery,5714,89.50,2024-12-19,10003,Cashback Card
txn_ny044,TRADER JOES,Grocery Stores, Supermarkets,5411,134.90,2024-12-21,10003,Cashback Card
txn_ny045,UBER NYC,Taxicabs and Rideshares,4121,32.80,2024-12-22,10003,Cashback Card
txn_ny046,PELOTON,Membership Clubs, Recreation,7997,44.00,2024-12-15,,Premium Card
txn_ny047,BEST BUY NYC,Electronics Stores,5732,267.89,2024-12-23,10003,Checking
txn_ny048,SEAMLESS,Fast Food Restaurants,5814,42.30,2024-12-24,10003,Cashback Card
txn_ny049,AMC LINCOLN SQUARE,Motion Picture Theaters,7832,36.00,2024-12-26,10023,Cashback Card
txn_ny050,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,98.45,2024-12-28,10003,Cashback Card
txn_ny051,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-01-01,10003,Premium Card
txn_ny052,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-01-01,10003,Checking
txn_ny053,TRADER JOES,Grocery Stores, Supermarkets,5411,89.23,2025-01-02,10003,Cashback Card
txn_ny236,LINKEDIN PREMIUM,Direct Marketing Subscription,5968,359.88,2025-01-15,,Checking
txn_ny054,ATHLETA NYC,Sports and Riding Apparel Stores,5655,278.00,2025-01-03,10003,Premium Card
txn_ny055,REI NYC,Sporting Goods Stores,5941,189.00,2025-01-04,10003,Cashback Card
txn_ny056,AMTRAK,Local/Suburban Commuter Transportation,4111,145.00,2025-01-10,10001,Travel Card
txn_ny057,BUDGET BURLINGTON,Automobile Rental Agency,7512,187.00,2025-01-10,05401,Travel Card
txn_ny058,SHELL VERMONT,Service Stations, Gas,5541,52.30,2025-01-10,05401,Travel Card
txn_ny059,STOWE MOUNTAIN,Ski Lodges, Resorts,7012,298.00,2025-01-11,05672,Travel Card
txn_ny060,MOUNTAIN LODGE VT,Hotels, Motels, Resorts,7011,345.00,2025-01-10,05672,Travel Card
txn_ny061,SKI RENTAL STOWE,Recreation Services, NEC,7999,89.00,2025-01-11,05672,Travel Card
txn_ny062,SLOPE SIDE CAFE,Fast Food Restaurants,5814,34.80,2025-01-11,05672,Travel Card
txn_ny063,SHELL VERMONT,Service Stations, Gas,5541,48.70,2025-01-12,05401,Travel Card
txn_ny064,VERMONT RESTAURANT,Eating Places, Restaurants,5812,87.50,2025-01-12,05672,Travel Card
txn_ny065,BUDGET,Automobile Rental Agency,7512,0.00,2025-01-13,05401,Travel Card
txn_ny066,AMTRAK,Local/Suburban Commuter Transportation,4111,145.00,2025-01-13,05401,Travel Card
txn_ny067,TRADER JOES,Grocery Stores, Supermarkets,5411,102.34,2025-01-14,10003,Cashback Card
txn_ny068,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,134.56,2025-01-20,10003,Cashback Card
txn_ny069,NIKE STORE NYC,Shoe Stores,5661,89.00,2025-01-22,10001,Cashback Card
txn_ny070,SOULCYCLE FLATIRON,Membership Clubs, Recreation,7997,175.00,2025-01-23,10010,Premium Card
txn_ny071,SWEETGREEN,Fast Food Restaurants,5814,16.75,2025-01-24,10003,Cashback Card
txn_ny072,CONED,Utilities: Electric, Gas, Water,4900,134.89,2025-01-25,10003,Checking
txn_ny073,TRADER JOES,Grocery Stores, Supermarkets,5411,95.78,2025-01-27,10003,Cashback Card
txn_ny074,TARGET EAST VILLAGE,Grocery Stores, Supermarkets,5411,87.45,2025-01-29,10003,Cashback Card
txn_ny075,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-02-01,10003,Premium Card
txn_ny076,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-02-01,10003,Checking
txn_ny077,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,145.67,2025-02-03,10003,Cashback Card
txn_ny078,WAYFAIR,Furniture, Home Furnishings Stores,5712,389.00,2025-02-04,,Checking
txn_ny079,LULULEMON NYC,Sports and Riding Apparel Stores,5655,128.00,2025-02-05,10003,Premium Card
txn_ny080,GNC NYC,Miscellaneous Food Stores,5499,67.90,2025-02-06,10003,Cashback Card
txn_ny081,CHIPOTLE NYC,Fast Food Restaurants,5814,13.50,2025-02-07,10003,Cashback Card
txn_ny082,TRADER JOES,Grocery Stores, Supermarkets,5411,89.45,2025-02-10,10003,Cashback Card
txn_ny083,HOME DEPOT NYC,Lumber and Building Materials Stores,5211,167.89,2025-02-11,10003,Checking
txn_ny084,STARBUCKS NYC,Fast Food Restaurants,5814,6.95,2025-02-12,10003,Cashback Card
txn_ny085,UNDER ARMOUR NYC,Sports and Riding Apparel Stores,5655,45.60,2025-02-13,10003,Cashback Card
txn_ny086,SEAMLESS,Fast Food Restaurants,5814,36.80,2025-02-14,10003,Cashback Card
txn_ny087,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,134.78,2025-02-17,10003,Cashback Card
txn_ny088,CB2 NYC,Furniture, Home Furnishings Stores,5712,456.00,2025-02-18,10003,Premium Card
txn_ny089,BROOKLYN BOULDERS,Membership Clubs, Recreation,7997,89.00,2025-02-19,11206,Cashback Card
txn_ny090,TRADER JOES,Grocery Stores, Supermarkets,5411,98.56,2025-02-24,10003,Cashback Card
txn_ny091,CONED,Utilities: Electric, Gas, Water,4900,118.45,2025-02-26,10003,Checking
txn_ny092,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-03-01,10003,Premium Card
txn_ny093,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-03-01,10003,Checking
txn_ny094,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,142.34,2025-03-03,10003,Cashback Card
txn_ny095,NIKE STORE NYC,Shoe Stores,5661,145.00,2025-03-04,10001,Cashback Card
txn_ny237,E*TRADE STOCK OPTIONS,Security Brokers and Dealers,6211,75.00,2025-03-08,,Checking
txn_ny096,SWEETGREEN,Fast Food Restaurants,5814,17.50,2025-03-05,10003,Cashback Card
txn_ny097,DICKS SPORTING GOODS,Sporting Goods Stores,5941,98.90,2025-03-06,10003,Cashback Card
txn_ny098,TRADER JOES,Grocery Stores, Supermarkets,5411,91.23,2025-03-10,10003,Cashback Card
txn_ny099,WEST ELM,Furniture, Home Furnishings Stores,5712,134.00,2025-03-11,10003,Premium Card
txn_ny100,LULULEMON NYC,Sports and Riding Apparel Stores,5655,189.00,2025-03-12,10003,Premium Card
txn_ny101,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,78.60,2025-03-13,10003,Cashback Card
txn_ny102,CHIPOTLE NYC,Fast Food Restaurants,5814,14.75,2025-03-14,10003,Cashback Card
txn_ny103,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,156.78,2025-03-17,10003,Cashback Card
txn_ny104,IKEA BROOKLYN,Furniture, Home Furnishings Stores,5712,234.50,2025-03-18,11231,Checking
txn_ny105,STARBUCKS NYC,Fast Food Restaurants,5814,7.50,2025-03-19,10003,Cashback Card
txn_ny106,SEAMLESS,Fast Food Restaurants,5814,39.80,2025-03-20,10003,Cashback Card
txn_ny107,TRADER JOES,Grocery Stores, Supermarkets,5411,94.67,2025-03-24,10003,Cashback Card
txn_ny108,HOME DEPOT NYC,Lumber and Building Materials Stores,5211,189.90,2025-03-25,10003,Checking
txn_ny109,CONED,Utilities: Electric, Gas, Water,4900,109.34,2025-03-26,10003,Checking
txn_ny110,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,138.45,2025-03-31,10003,Cashback Card
txn_ny111,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-04-01,10003,Premium Card
txn_ny112,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-04-01,10003,Checking
txn_ny113,TRADER JOES,Grocery Stores, Supermarkets,5411,96.78,2025-04-07,10003,Cashback Card
txn_ny114,SOULCYCLE FLATIRON,Membership Clubs, Recreation,7997,175.00,2025-04-08,10010,Premium Card
txn_ny115,NIKE STORE NYC,Shoe Stores,5661,67.00,2025-04-09,10001,Cashback Card
txn_ny116,SWEETGREEN,Fast Food Restaurants,5814,16.90,2025-04-10,10003,Cashback Card
txn_ny117,REI NYC,Sporting Goods Stores,5941,178.00,2025-04-11,10003,Cashback Card
txn_ny118,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,145.89,2025-04-14,10003,Cashback Card
txn_ny119,TARGET EAST VILLAGE,Grocery Stores, Supermarkets,5411,78.45,2025-04-15,10003,Cashback Card
txn_ny120,GNC NYC,Miscellaneous Food Stores,5499,65.80,2025-04-16,10003,Cashback Card
txn_ny121,SEAMLESS,Fast Food Restaurants,5814,41.20,2025-04-17,10003,Cashback Card
txn_ny122,TRADER JOES,Grocery Stores, Supermarkets,5411,89.56,2025-04-21,10003,Cashback Card
txn_ny123,HOMEGOODS NYC,Drapery, Window Coverings, Upholstery,5714,112.30,2025-04-22,10003,Cashback Card
txn_ny124,CONED,Utilities: Electric, Gas, Water,4900,95.67,2025-04-23,10003,Checking
txn_ny125,CHIPOTLE NYC,Fast Food Restaurants,5814,13.95,2025-04-24,10003,Cashback Card
txn_ny126,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,134.67,2025-04-28,10003,Cashback Card
txn_ny127,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-05-01,10003,Premium Card
txn_ny128,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-05-01,10003,Checking
txn_ny129,TRADER JOES,Grocery Stores, Supermarkets,5411,92.34,2025-05-05,10003,Cashback Card
txn_ny130,LULULEMON NYC,Sports and Riding Apparel Stores,5655,156.00,2025-05-06,10003,Premium Card
txn_ny131,UNDER ARMOUR NYC,Sports and Riding Apparel Stores,5655,87.50,2025-05-07,10003,Cashback Card
txn_ny132,SWEETGREEN,Fast Food Restaurants,5814,17.25,2025-05-08,10003,Cashback Card
txn_ny239,WEIL GOTSHAL ESTATE,Legal Services,8111,1500.00,2025-05-10,10153,Checking
txn_ny133,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,142.78,2025-05-12,10003,Cashback Card
txn_ny134,WEST ELM,Furniture, Home Furnishings Stores,5712,98.00,2025-05-13,10003,Premium Card
txn_ny135,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,72.40,2025-05-14,10003,Cashback Card
txn_ny136,SEAMLESS,Fast Food Restaurants,5814,38.90,2025-05-15,10003,Cashback Card
txn_ny137,TRADER JOES,Grocery Stores, Supermarkets,5411,95.67,2025-05-19,10003,Cashback Card
txn_ny138,NIKE STORE NYC,Shoe Stores,5661,56.80,2025-05-20,10001,Cashback Card
txn_ny139,CONED,Utilities: Electric, Gas, Water,4900,87.23,2025-05-21,10003,Checking
txn_ny140,CHIPOTLE NYC,Fast Food Restaurants,5814,14.25,2025-05-22,10003,Cashback Card
txn_ny141,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,138.90,2025-05-26,10003,Cashback Card
txn_ny142,HOME DEPOT NYC,Lumber and Building Materials Stores,5211,289.00,2025-05-27,10003,Checking
txn_ny143,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-06-01,10003,Premium Card
txn_ny144,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-06-01,10003,Checking
txn_ny145,TRADER JOES,Grocery Stores, Supermarkets,5411,91.45,2025-06-02,10003,Cashback Card
txn_ny146,JETBLUE B6 1247 MIA,Airlines, Air Carriers,4511,267.00,2025-06-12,10003,Travel Card
txn_ny147,ALAMO MIAMI,Automobile Rental Agency,7512,178.00,2025-06-12,33142,Travel Card
txn_ny148,SHELL MIAMI,Service Stations, Gas,5541,54.30,2025-06-12,33139,Travel Card
txn_ny149,MARRIOTT SOUTH BEACH,Hotels, Motels, Resorts,7011,567.00,2025-06-12,33139,Travel Card
txn_ny150,PUBLIX MIAMI,Grocery Stores, Supermarkets,5411,45.60,2025-06-13,33139,Travel Card
txn_ny151,SOUTH BEACH RESTAURANT,Eating Places, Restaurants,5812,98.50,2025-06-13,33139,Travel Card
txn_ny152,SHELL MIAMI,Service Stations, Gas,5541,52.80,2025-06-14,33139,Travel Card
txn_ny153,BEACH CAFE MIAMI,Fast Food Restaurants,5814,43.70,2025-06-14,33139,Travel Card
txn_ny154,WYNWOOD WALLS,Recreation Services, NEC,7999,25.00,2025-06-14,33127,Travel Card
txn_ny155,MIAMI RESTAURANT,Eating Places, Restaurants,5812,87.40,2025-06-14,33127,Travel Card
txn_ny156,SHELL MIAMI,Service Stations, Gas,5541,49.60,2025-06-15,33139,Travel Card
txn_ny157,ALAMO,Automobile Rental Agency,7512,0.00,2025-06-15,33142,Travel Card
txn_ny158,JETBLUE B6 1248,Airlines, Air Carriers,4511,267.00,2025-06-15,,Travel Card
txn_ny159,TRADER JOES,Grocery Stores, Supermarkets,5411,98.34,2025-06-16,10003,Cashback Card
txn_ny160,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,145.67,2025-06-23,10003,Cashback Card
txn_ny161,LULULEMON NYC,Sports and Riding Apparel Stores,5655,134.00,2025-06-24,10003,Premium Card
txn_ny162,SWEETGREEN,Fast Food Restaurants,5814,16.80,2025-06-25,10003,Cashback Card
txn_ny163,GNC NYC,Miscellaneous Food Stores,5499,56.90,2025-06-26,10003,Cashback Card
txn_ny164,TRADER JOES,Grocery Stores, Supermarkets,5411,94.56,2025-06-30,10003,Cashback Card
txn_ny165,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-07-01,10003,Premium Card
txn_ny166,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-07-01,10003,Checking
txn_ny167,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,138.78,2025-07-07,10003,Cashback Card
txn_ny168,CONED,Utilities: Electric, Gas, Water,4900,145.89,2025-07-09,10003,Checking
txn_ny169,NIKE STORE NYC,Shoe Stores,5661,112.50,2025-07-10,10001,Cashback Card
txn_ny170,CHIPOTLE NYC,Fast Food Restaurants,5814,13.75,2025-07-11,10003,Cashback Card
txn_ny240,KPMG TAX ADVISORY,Accounting, Auditing, Bookkeeping,8721,2500.00,2025-07-12,10154,Checking
txn_ny171,TRADER JOES,Grocery Stores, Supermarkets,5411,96.78,2025-07-14,10003,Cashback Card
txn_ny172,BROOKLYN BOULDERS,Membership Clubs, Recreation,7997,32.00,2025-07-15,11206,Cashback Card
txn_ny173,SEAMLESS,Fast Food Restaurants,5814,39.60,2025-07-16,10003,Cashback Card
txn_ny174,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,142.34,2025-07-21,10003,Cashback Card
txn_ny175,CB2 NYC,Furniture, Home Furnishings Stores,5712,189.00,2025-07-22,10003,Premium Card
txn_ny176,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,68.50,2025-07-23,10003,Cashback Card
txn_ny177,TRADER JOES,Grocery Stores, Supermarkets,5411,89.45,2025-07-28,10003,Cashback Card
txn_ny178,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-08-01,10003,Premium Card
txn_ny179,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-08-01,10003,Checking
txn_ny180,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,145.89,2025-08-04,10003,Cashback Card
txn_ny181,LULULEMON NYC,Sports and Riding Apparel Stores,5655,178.00,2025-08-05,10003,Premium Card
txn_ny182,SWEETGREEN,Fast Food Restaurants,5814,17.40,2025-08-06,10003,Cashback Card
txn_ny183,HOME DEPOT NYC,Lumber and Building Materials Stores,5211,134.67,2025-08-07,10003,Checking
txn_ny184,TRADER JOES,Grocery Stores, Supermarkets,5411,92.56,2025-08-11,10003,Cashback Card
txn_ny185,SOULCYCLE FLATIRON,Membership Clubs, Recreation,7997,175.00,2025-08-12,10010,Premium Card
txn_ny186,CONED,Utilities: Electric, Gas, Water,4900,167.34,2025-08-13,10003,Checking
txn_ny187,GNC NYC,Miscellaneous Food Stores,5499,73.80,2025-08-14,10003,Cashback Card
txn_ny188,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,134.67,2025-08-18,10003,Cashback Card
txn_ny189,TARGET EAST VILLAGE,Grocery Stores, Supermarkets,5411,87.90,2025-08-19,10003,Cashback Card
txn_ny190,CHIPOTLE NYC,Fast Food Restaurants,5814,14.50,2025-08-20,10003,Cashback Card
txn_ny191,SEAMLESS,Fast Food Restaurants,5814,41.30,2025-08-21,10003,Cashback Card
txn_ny192,TRADER JOES,Grocery Stores, Supermarkets,5411,95.78,2025-08-25,10003,Cashback Card
txn_ny193,NIKE STORE NYC,Shoe Stores,5661,158.00,2025-08-26,10001,Cashback Card
txn_ny194,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-09-01,10003,Premium Card
txn_ny195,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-09-01,10003,Checking
txn_ny196,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,142.56,2025-09-02,10003,Cashback Card
txn_ny197,WEST ELM,Furniture, Home Furnishings Stores,5712,456.00,2025-09-03,10003,Premium Card
txn_ny198,UNDER ARMOUR NYC,Sports and Riding Apparel Stores,5655,123.50,2025-09-04,10003,Cashback Card
txn_ny199,SWEETGREEN,Fast Food Restaurants,5814,16.95,2025-09-05,10003,Cashback Card
txn_ny200,TRADER JOES,Grocery Stores, Supermarkets,5411,89.34,2025-09-08,10003,Cashback Card
txn_ny201,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,65.70,2025-09-09,10003,Cashback Card
txn_ny202,CONED,Utilities: Electric, Gas, Water,4900,123.45,2025-09-10,10003,Checking
txn_ny238,FIDELITY 401K ROLLOVER,Security Brokers and Dealers,6211,0.00,2025-09-12,,Checking
txn_ny203,AMTRAK,Local/Suburban Commuter Transportation,4111,145.00,2025-09-18,10001,Travel Card
txn_ny204,ENTERPRISE BURLINGTON,Automobile Rental Agency,7512,234.00,2025-09-18,05401,Travel Card
txn_ny205,SHELL VERMONT,Service Stations, Gas,5541,56.80,2025-09-18,05401,Travel Card
txn_ny206,GREEN MOUNTAIN INN,Hotels, Motels, Resorts,7011,456.00,2025-09-18,05672,Travel Card
txn_ny207,VERMONT GENERAL STORE,Grocery Stores, Supermarkets,5411,45.30,2025-09-19,05672,Travel Card
txn_ny208,HIKING TRAIL CAFE,Fast Food Restaurants,5814,34.60,2025-09-19,05672,Travel Card
txn_ny209,SHELL VERMONT,Service Stations, Gas,5541,52.40,2025-09-20,05401,Travel Card
txn_ny210,FALL FOLIAGE TOUR,Recreation Services, NEC,7999,78.00,2025-09-20,05672,Travel Card
txn_ny211,MOUNTAIN RESTAURANT VT,Eating Places, Restaurants,5812,98.70,2025-09-20,05672,Travel Card
txn_ny212,VERMONT MAPLE SHOP,Miscellaneous and Specialty Retail,5999,56.80,2025-09-21,05672,Travel Card
txn_ny213,SHELL VERMONT,Service Stations, Gas,5541,49.90,2025-09-21,05401,Travel Card
txn_ny214,ENTERPRISE,Automobile Rental Agency,7512,0.00,2025-09-21,05401,Travel Card
txn_ny215,AMTRAK,Local/Suburban Commuter Transportation,4111,145.00,2025-09-21,05401,Travel Card
txn_ny216,TRADER JOES,Grocery Stores, Supermarkets,5411,102.45,2025-09-22,10003,Cashback Card
txn_ny217,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,138.67,2025-09-29,10003,Cashback Card
txn_ny218,EQUINOX GRAMERCY,Membership Clubs, Recreation,7997,245.00,2025-10-01,10003,Premium Card
txn_ny219,MTA METROCARD,Local/Suburban Commuter Transportation,4111,132.00,2025-10-01,10003,Checking
txn_ny220,NIKE STORE NYC,Shoe Stores,5661,134.00,2025-10-02,10001,Cashback Card
txn_ny221,LULULEMON NYC,Sports and Riding Apparel Stores,5655,189.00,2025-10-03,10003,Premium Card
txn_ny222,TRADER JOES,Grocery Stores, Supermarkets,5411,94.56,2025-10-06,10003,Cashback Card
txn_ny223,SWEETGREEN,Fast Food Restaurants,5814,17.10,2025-10-07,10003,Cashback Card
txn_ny224,GNC NYC,Miscellaneous Food Stores,5499,76.90,2025-10-08,10003,Cashback Card
txn_ny225,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,145.78,2025-10-13,10003,Cashback Card
txn_ny226,IKEA BROOKLYN,Furniture, Home Furnishings Stores,5712,234.00,2025-10-14,11231,Checking
txn_ny227,CHIPOTLE NYC,Fast Food Restaurants,5814,14.25,2025-10-15,10003,Cashback Card
txn_ny228,CONED,Utilities: Electric, Gas, Water,4900,112.67,2025-10-16,10003,Checking
txn_ny229,SEAMLESS,Fast Food Restaurants,5814,40.80,2025-10-17,10003,Cashback Card
txn_ny230,TRADER JOES,Grocery Stores, Supermarkets,5411,91.34,2025-10-20,10003,Cashback Card
txn_ny231,HOME DEPOT NYC,Lumber and Building Materials Stores,5211,67.80,2025-10-21,10003,Checking
txn_ny232,BROOKLYN BOULDERS,Membership Clubs, Recreation,7997,32.00,2025-10-22,11206,Cashback Card
txn_ny233,WHOLE FOODS UNION SQ,Grocery Stores, Supermarkets,5411,134.56,2025-10-27,10003,Cashback Card
txn_ny234,SOULCYCLE FLATIRON,Membership Clubs, Recreation,7997,175.00,2025-10-28,10010,Premium Card
txn_ny235,AMAZON.COM,Miscellaneous and Specialty Retail,5999,98.70,2025-10-29,,Cashback Card
txn_ny241,FIDELITY TRUST SERVICES,Security Brokers and Dealers,6211,250.00,2025-11-14,,Checking
`;

export const SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12 = `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source
txn_ch001,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2024-11-01,60610,Premium Card
txn_ch002,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,134.56,2024-11-02,60610,Cashback Card
txn_ch003,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2024-11-01,60610,Checking
txn_ch004,TENNIS PRO SHOP,Sporting Goods Stores,5941,85.00,2024-11-03,60610,Cashback Card
txn_ch005,SWEETGREEN,Fast Food Restaurants,5814,17.25,2024-11-04,60610,Cashback Card
txn_ch006,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,156.00,2024-11-05,60610,Premium Card
txn_ch007,GNC CHICAGO,Miscellaneous Food Stores,5499,89.50,2024-11-06,60610,Cashback Card
txn_ch008,TRADER JOES,Grocery Stores, Supermarkets,5411,92.34,2024-11-07,60610,Cashback Card
txn_ch009,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2024-11-08,60610,Premium Card
txn_ch010,PRESSED JUICERY,Fast Food Restaurants,5814,12.50,2024-11-09,60610,Cashback Card
txn_ch011,NIKE CHICAGO,Shoe Stores,5661,145.00,2024-11-10,60610,Cashback Card
txn_ch012,CHIPOTLE,Fast Food Restaurants,5814,13.75,2024-11-11,60610,Cashback Card
txn_ch013,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2024-11-12,60610,Premium Card
txn_ch014,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,145.67,2024-11-13,60610,Cashback Card
txn_ch015,WILSON TENNIS,Sporting Goods Stores,5941,48.90,2024-11-14,60610,Cashback Card
txn_ch016,AMAZON.COM,Miscellaneous and Specialty Retail,5999,67.80,2024-11-15,,Cashback Card
txn_ch017,ARGO TEA,Fast Food Restaurants,5814,6.75,2024-11-16,60610,Cashback Card
txn_ch018,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,72.40,2024-11-17,60610,Cashback Card
txn_ch019,TRADER JOES,Grocery Stores, Supermarkets,5411,87.45,2024-11-18,60610,Cashback Card
txn_ch020,EAST BANK CLUB,Membership Clubs, Recreation,7997,35.00,2024-11-19,60610,Premium Card
txn_ch021,NETFLIX,Cable, Satellite, Streaming Services,4899,15.99,2024-11-15,,Cashback Card
txn_ch022,PRESSED JUICERY,Fast Food Restaurants,5814,56.00,2024-11-20,60610,Cashback Card
txn_ch023,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,134.00,2024-11-21,60610,Premium Card
txn_ch024,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,167.89,2024-11-22,60610,Cashback Card
txn_ch025,UBER CHICAGO,Taxicabs and Rideshares,4121,18.50,2024-11-23,60610,Travel Card
txn_ch026,RPM ITALIAN,Eating Places, Restaurants,5812,87.60,2024-11-24,60610,Premium Card
txn_ch027,SPOTIFY,Cable, Satellite, Streaming Services,4899,10.99,2024-11-15,,Cashback Card
txn_ch028,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2024-12-01,60610,Premium Card
txn_ch029,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2024-12-01,60610,Checking
txn_ch030,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,142.34,2024-12-02,60610,Cashback Card
txn_ch031,TENNIS TOURNAMENT,Recreation Services, NEC,7999,85.00,2024-12-03,60610,Cashback Card
txn_ch032,SWEETGREEN,Fast Food Restaurants,5814,16.90,2024-12-04,60610,Cashback Card
txn_ch033,GNC CHICAGO,Miscellaneous Food Stores,5499,78.50,2024-12-05,60610,Cashback Card
txn_ch034,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,189.00,2024-12-06,60610,Premium Card
txn_ch035,TRADER JOES,Grocery Stores, Supermarkets,5411,95.67,2024-12-07,60610,Cashback Card
txn_ch036,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,75.00,2024-12-08,60610,Premium Card
txn_ch037,COMED,Utilities: Electric, Gas, Water,4900,98.45,2024-12-09,60610,Checking
txn_ch038,NIKE CHICAGO,Shoe Stores,5661,45.00,2024-12-10,60610,Cashback Card
txn_ch039,PRESSED JUICERY,Fast Food Restaurants,5814,13.25,2024-12-11,60610,Cashback Card
txn_ch040,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,65.80,2024-12-12,60610,Cashback Card
txn_ch041,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,156.78,2024-12-13,60610,Cashback Card
txn_ch042,TENNIS PRO SHOP,Sporting Goods Stores,5941,198.00,2024-12-14,60610,Cashback Card
txn_ch043,CHIPOTLE,Fast Food Restaurants,5814,14.25,2024-12-15,60610,Cashback Card
txn_ch044,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2024-12-16,60610,Premium Card
txn_ch045,TRADER JOES,Grocery Stores, Supermarkets,5411,112.45,2024-12-17,60610,Cashback Card
txn_ch046,AMAZON.COM,Miscellaneous and Specialty Retail,5999,234.90,2024-12-18,,Cashback Card
txn_ch047,SWEETGREEN,Fast Food Restaurants,5814,17.50,2024-12-19,60610,Cashback Card
txn_ch048,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,267.00,2024-12-20,60610,Premium Card
txn_ch049,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,189.56,2024-12-22,60610,Cashback Card
txn_ch050,UBER CHICAGO,Taxicabs and Rideshares,4121,24.80,2024-12-23,60610,Travel Card
txn_ch051,GIRL AND THE GOAT,Eating Places, Restaurants,5812,134.50,2024-12-24,60610,Premium Card
txn_ch052,AMC RIVER EAST,Motion Picture Theaters,7832,32.00,2024-12-26,60610,Cashback Card
txn_ch053,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-01-01,60610,Premium Card
txn_ch054,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-01-01,60610,Checking
txn_ch055,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,134.67,2025-01-02,60610,Cashback Card
txn_ch056,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2025-01-03,60610,Premium Card
txn_ch057,GNC CHICAGO,Miscellaneous Food Stores,5499,98.70,2025-01-04,60610,Cashback Card
txn_ch058,NIKE CHICAGO,Shoe Stores,5661,165.00,2025-01-05,60610,Cashback Card
txn_ch059,TRADER JOES,Grocery Stores, Supermarkets,5411,89.45,2025-01-06,60610,Cashback Card
txn_ch060,PRESSED JUICERY,Fast Food Restaurants,5814,12.75,2025-01-07,60610,Cashback Card
txn_ch061,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,65.00,2025-01-08,60610,Premium Card
txn_ch062,SWEETGREEN,Fast Food Restaurants,5814,17.25,2025-01-09,60610,Cashback Card
txn_ch243,JAMES ALLEN DIAMONDS,Jewelry, Watch, Clock Stores,5944,8500.00,2025-01-09,,Premium Card
txn_ch063,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,145.89,2025-01-10,60610,Cashback Card
txn_ch064,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,156.00,2025-01-11,60610,Premium Card
txn_ch065,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,72.30,2025-01-12,60610,Cashback Card
txn_ch066,CHIPOTLE,Fast Food Restaurants,5814,13.95,2025-01-13,60610,Cashback Card
txn_ch067,TRADER JOES,Grocery Stores, Supermarkets,5411,94.56,2025-01-14,60610,Cashback Card
txn_ch068,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-01-15,60610,Premium Card
txn_ch069,TENNIS PRO SHOP,Sporting Goods Stores,5941,289.00,2025-01-16,60610,Cashback Card
txn_ch070,COMED,Utilities: Electric, Gas, Water,4900,134.78,2025-01-17,60610,Checking
txn_ch071,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,138.45,2025-01-20,60610,Cashback Card
txn_ch072,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,98.00,2025-01-21,60610,Premium Card
txn_ch073,PRESSED JUICERY,Fast Food Restaurants,5814,13.50,2025-01-22,60610,Cashback Card
txn_ch074,SWEETGREEN,Fast Food Restaurants,5814,16.80,2025-01-23,60610,Cashback Card
txn_ch075,TRADER JOES,Grocery Stores, Supermarkets,5411,91.23,2025-01-27,60610,Cashback Card
txn_ch076,GNC CHICAGO,Miscellaneous Food Stores,5499,67.90,2025-01-28,60610,Cashback Card
txn_ch077,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-02-01,60610,Premium Card
txn_ch078,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-02-01,60610,Checking
txn_ch079,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,142.67,2025-02-03,60610,Cashback Card
txn_ch080,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2025-02-04,60610,Premium Card
txn_ch081,NIKE CHICAGO,Shoe Stores,5661,134.00,2025-02-05,60610,Cashback Card
txn_ch082,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,85.00,2025-02-06,60610,Premium Card
txn_ch083,TRADER JOES,Grocery Stores, Supermarkets,5411,87.56,2025-02-07,60610,Cashback Card
txn_ch084,PRESSED JUICERY,Fast Food Restaurants,5814,18.00,2025-02-08,60610,Cashback Card
txn_ch085,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,76.40,2025-02-09,60610,Cashback Card
txn_ch086,SWEETGREEN,Fast Food Restaurants,5814,17.40,2025-02-10,60610,Cashback Card
txn_ch087,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,156.89,2025-02-11,60610,Cashback Card
txn_ch088,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,128.00,2025-02-12,60610,Premium Card
txn_ch089,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-02-13,60610,Premium Card
txn_ch090,CHIPOTLE,Fast Food Restaurants,5814,14.50,2025-02-14,60610,Cashback Card
txn_ch091,TRADER JOES,Grocery Stores, Supermarkets,5411,95.78,2025-02-17,60610,Cashback Card
txn_ch092,TENNIS PRO SHOP,Sporting Goods Stores,5941,67.00,2025-02-18,60610,Cashback Card
txn_ch093,GNC CHICAGO,Miscellaneous Food Stores,5499,58.90,2025-02-19,60610,Cashback Card
txn_ch094,COMED,Utilities: Electric, Gas, Water,4900,112.34,2025-02-20,60610,Checking
txn_ch095,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,145.67,2025-02-24,60610,Cashback Card
txn_ch096,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,87.00,2025-02-25,60610,Premium Card
txn_ch097,PRESSED JUICERY,Fast Food Restaurants,5814,12.90,2025-02-26,60610,Cashback Card
txn_ch098,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-03-01,60610,Premium Card
txn_ch099,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-03-01,60610,Checking
txn_ch100,TRADER JOES,Grocery Stores, Supermarkets,5411,89.45,2025-03-03,60610,Cashback Card
txn_ch244,FOUR SEASONS CHICAGO,Hotels, Motels, Resorts,7011,10000.00,2025-03-09,60611,Checking
txn_ch101,TENNIS TOURNAMENT,Recreation Services, NEC,7999,95.00,2025-03-04,60610,Cashback Card
txn_ch102,SWEETGREEN,Fast Food Restaurants,5814,17.10,2025-03-05,60610,Cashback Card
txn_ch103,NIKE CHICAGO,Shoe Stores,5661,158.00,2025-03-06,60610,Cashback Card
txn_ch104,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,142.34,2025-03-10,60610,Cashback Card
txn_ch105,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,175.00,2025-03-11,60610,Premium Card
txn_ch106,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,82.60,2025-03-12,60610,Cashback Card
txn_ch107,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,178.00,2025-03-13,60610,Premium Card
txn_ch108,TRADER JOES,Grocery Stores, Supermarkets,5411,94.67,2025-03-17,60610,Cashback Card
txn_ch109,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-03-18,60610,Premium Card
txn_ch110,PRESSED JUICERY,Fast Food Restaurants,5814,168.00,2025-03-19,60610,Cashback Card
txn_ch111,CHIPOTLE,Fast Food Restaurants,5814,13.75,2025-03-20,60610,Cashback Card
txn_ch112,GNC CHICAGO,Miscellaneous Food Stores,5499,89.40,2025-03-21,60610,Cashback Card
txn_ch113,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,156.78,2025-03-24,60610,Cashback Card
txn_ch114,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2025-03-25,60610,Premium Card
txn_ch115,COMED,Utilities: Electric, Gas, Water,4900,95.67,2025-03-26,60610,Checking
txn_ch116,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,98.00,2025-03-27,60610,Premium Card
txn_ch117,TRADER JOES,Grocery Stores, Supermarkets,5411,91.34,2025-03-31,60610,Cashback Card
txn_ch118,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-04-01,60610,Premium Card
txn_ch119,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-04-01,60610,Checking
txn_ch120,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,145.89,2025-04-07,60610,Cashback Card
txn_ch121,NIKE CHICAGO,Shoe Stores,5661,67.00,2025-04-08,60610,Cashback Card
txn_ch122,SWEETGREEN,Fast Food Restaurants,5814,17.25,2025-04-09,60610,Cashback Card
txn_ch123,PRESSED JUICERY,Fast Food Restaurants,5814,12.50,2025-04-10,60610,Cashback Card
txn_ch124,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,75.00,2025-04-11,60610,Premium Card
txn_ch125,TRADER JOES,Grocery Stores, Supermarkets,5411,87.45,2025-04-14,60610,Cashback Card
txn_ch126,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,72.80,2025-04-15,60610,Cashback Card
txn_ch127,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,156.00,2025-04-16,60610,Premium Card
txn_ch128,TENNIS PRO SHOP,Sporting Goods Stores,5941,48.00,2025-04-17,60610,Cashback Card
txn_ch129,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,138.67,2025-04-21,60610,Cashback Card
txn_ch130,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-04-22,60610,Premium Card
txn_ch131,GNC CHICAGO,Miscellaneous Food Stores,5499,64.90,2025-04-23,60610,Cashback Card
txn_ch132,CHIPOTLE,Fast Food Restaurants,5814,14.25,2025-04-24,60610,Cashback Card
txn_ch133,TRADER JOES,Grocery Stores, Supermarkets,5411,92.56,2025-04-28,60610,Cashback Card
txn_ch134,COMED,Utilities: Electric, Gas, Water,4900,87.23,2025-04-29,60610,Checking
txn_ch135,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-05-01,60610,Premium Card
txn_ch136,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-05-01,60610,Checking
txn_ch137,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,142.34,2025-05-05,60610,Cashback Card
txn_ch138,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2025-05-06,60610,Checking
txn_ch139,NIKE CHICAGO,Shoe Stores,5661,145.00,2025-05-07,60610,Cashback Card
txn_ch140,SWEETGREEN,Fast Food Restaurants,5814,16.90,2025-05-08,60610,Cashback Card
txn_ch245,SHANNON GAIL WEDDINGS,Business Services, NEC,7399,3500.00,2025-05-11,60614,Checking
txn_ch141,PRESSED JUICERY,Fast Food Restaurants,5814,13.25,2025-05-09,60610,Cashback Card
txn_ch142,TRADER JOES,Grocery Stores, Supermarkets,5411,89.45,2025-05-12,60610,Cashback Card
txn_ch143,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,65.00,2025-05-13,60610,Premium Card
txn_ch144,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,78.60,2025-05-14,60610,Cashback Card
txn_ch145,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,78.00,2025-05-15,60610,Premium Card
txn_ch146,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,156.78,2025-05-19,60610,Cashback Card
txn_ch147,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-05-20,60610,Premium Card
txn_ch148,GNC CHICAGO,Miscellaneous Food Stores,5499,72.40,2025-05-21,60610,Cashback Card
txn_ch149,CHIPOTLE,Fast Food Restaurants,5814,13.95,2025-05-22,60610,Cashback Card
txn_ch150,TRADER JOES,Grocery Stores, Supermarkets,5411,94.67,2025-05-26,60610,Cashback Card
txn_ch151,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,189.00,2025-05-27,60610,Premium Card
txn_ch152,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-06-01,60610,Premium Card
txn_ch153,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-06-01,60610,Checking
txn_ch154,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,145.89,2025-06-02,60610,Cashback Card
txn_ch155,TENNIS TOURNAMENT,Recreation Services, NEC,7999,110.00,2025-06-03,60610,Checking
txn_ch156,COMED,Utilities: Electric, Gas, Water,4900,78.45,2025-06-04,60610,Checking
txn_ch157,NIKE CHICAGO,Shoe Stores,5661,87.00,2025-06-05,60610,Cashback Card
txn_ch158,SWEETGREEN,Fast Food Restaurants,5814,17.40,2025-06-06,60610,Cashback Card
txn_ch159,TRADER JOES,Grocery Stores, Supermarkets,5411,91.23,2025-06-09,60610,Cashback Card
txn_ch160,PRESSED JUICERY,Fast Food Restaurants,5814,12.80,2025-06-10,60610,Cashback Card
txn_ch161,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,85.00,2025-06-11,60610,Premium Card
txn_ch162,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,45.60,2025-06-12,60610,Cashback Card
txn_ch163,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,138.67,2025-06-16,60610,Cashback Card
txn_ch164,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-06-17,60610,Premium Card
txn_ch165,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,134.00,2025-06-18,60610,Premium Card
txn_ch166,GNC CHICAGO,Miscellaneous Food Stores,5499,58.90,2025-06-19,60610,Cashback Card
txn_ch167,TRADER JOES,Grocery Stores, Supermarkets,5411,87.56,2025-06-23,60610,Cashback Card
txn_ch168,TENNIS PRO SHOP,Sporting Goods Stores,5941,34.00,2025-06-24,60610,Cashback Card
txn_ch169,CHIPOTLE,Fast Food Restaurants,5814,14.50,2025-06-25,60610,Cashback Card
txn_ch170,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-07-01,60610,Premium Card
txn_ch171,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-07-01,60610,Checking
txn_ch172,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,142.34,2025-07-07,60610,Cashback Card
txn_ch173,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2025-07-08,60610,Checking
txn_ch174,SWEETGREEN,Fast Food Restaurants,5814,17.10,2025-07-09,60610,Cashback Card
txn_ch175,NIKE CHICAGO,Shoe Stores,5661,165.00,2025-07-10,60610,Cashback Card
txn_ch246,NORTHWESTERN OB GYN,Physicians, Medical Services,8011,400.00,2025-07-13,60611,HSA
txn_ch176,PRESSED JUICERY,Fast Food Restaurants,5814,18.00,2025-07-11,60610,Cashback Card
txn_ch177,TRADER JOES,Grocery Stores, Supermarkets,5411,89.45,2025-07-14,60610,Cashback Card
txn_ch178,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,75.00,2025-07-15,60610,Premium Card
txn_ch179,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,82.70,2025-07-16,60610,Cashback Card
txn_ch180,COMED,Utilities: Electric, Gas, Water,4900,145.89,2025-07-17,60610,Checking
txn_ch181,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,167.00,2025-07-18,60610,Premium Card
txn_ch182,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,156.78,2025-07-21,60610,Cashback Card
txn_ch183,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-07-22,60610,Premium Card
txn_ch184,GNC CHICAGO,Miscellaneous Food Stores,5499,89.60,2025-07-23,60610,Cashback Card
txn_ch185,TRADER JOES,Grocery Stores, Supermarkets,5411,94.56,2025-07-28,60610,Cashback Card
txn_ch186,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,189.00,2025-07-29,60610,Premium Card
txn_ch187,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-08-01,60610,Premium Card
txn_ch188,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-08-01,60610,Checking
txn_ch189,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,145.67,2025-08-04,60610,Cashback Card
txn_ch190,TENNIS TOURNAMENT,Recreation Services, NEC,7999,125.00,2025-08-05,60610,Checking
txn_ch191,SWEETGREEN,Fast Food Restaurants,5814,17.25,2025-08-06,60610,Cashback Card
txn_ch192,NIKE CHICAGO,Shoe Stores,5661,134.00,2025-08-07,60610,Cashback Card
txn_ch193,PRESSED JUICERY,Fast Food Restaurants,5814,12.90,2025-08-08,60610,Cashback Card
txn_ch194,TRADER JOES,Grocery Stores, Supermarkets,5411,91.34,2025-08-11,60610,Cashback Card
txn_ch195,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,175.00,2025-08-12,60610,Premium Card
txn_ch196,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,76.80,2025-08-13,60610,Cashback Card
txn_ch197,CHIPOTLE,Fast Food Restaurants,5814,14.25,2025-08-14,60610,Cashback Card
txn_ch198,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,138.67,2025-08-18,60610,Cashback Card
txn_ch199,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-08-19,60610,Premium Card
txn_ch200,COMED,Utilities: Electric, Gas, Water,4900,167.34,2025-08-20,60610,Checking
txn_ch201,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,178.00,2025-08-21,60610,Premium Card
txn_ch202,GNC CHICAGO,Miscellaneous Food Stores,5499,64.90,2025-08-22,60610,Cashback Card
txn_ch203,TRADER JOES,Grocery Stores, Supermarkets,5411,87.56,2025-08-25,60610,Cashback Card
txn_ch204,TENNIS PRO SHOP,Sporting Goods Stores,5941,56.00,2025-08-26,60610,Cashback Card
txn_ch205,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,98.00,2025-08-27,60610,Premium Card
txn_ch206,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-09-01,60610,Premium Card
txn_ch207,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-09-01,60610,Checking
txn_ch208,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,142.34,2025-09-02,60610,Cashback Card
txn_ch209,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2025-09-03,60610,Checking
txn_ch210,SWEETGREEN,Fast Food Restaurants,5814,16.90,2025-09-04,60610,Cashback Card
txn_ch211,NIKE CHICAGO,Shoe Stores,5661,156.00,2025-09-05,60610,Cashback Card
txn_ch212,PRESSED JUICERY,Fast Food Restaurants,5814,13.25,2025-09-06,60610,Cashback Card
txn_ch213,TRADER JOES,Grocery Stores, Supermarkets,5411,89.45,2025-09-08,60610,Cashback Card
txn_ch214,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,65.00,2025-09-09,60610,Premium Card
txn_ch215,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,78.90,2025-09-10,60610,Cashback Card
txn_ch216,COMED,Utilities: Electric, Gas, Water,4900,123.45,2025-09-11,60610,Checking
txn_ch247,NORTHWESTERN MUTUAL,Insurance Underwriting,6311,150.00,2025-09-11,,Checking
txn_ch217,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,156.78,2025-09-15,60610,Cashback Card
txn_ch218,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-09-16,60610,Premium Card
txn_ch219,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,189.00,2025-09-17,60610,Premium Card
txn_ch220,GNC CHICAGO,Miscellaneous Food Stores,5499,72.40,2025-09-18,60610,Cashback Card
txn_ch221,TRADER JOES,Grocery Stores, Supermarkets,5411,94.67,2025-09-22,60610,Cashback Card
txn_ch222,CHIPOTLE,Fast Food Restaurants,5814,13.95,2025-09-23,60610,Cashback Card
txn_ch223,TENNIS PRO SHOP,Sporting Goods Stores,5941,134.00,2025-09-24,60610,Cashback Card
txn_ch224,EAST BANK CLUB,Membership Clubs, Recreation,7997,295.00,2025-10-01,60610,Premium Card
txn_ch225,CTA VENTRA,Local/Suburban Commuter Transportation,4111,105.00,2025-10-01,60610,Checking
txn_ch226,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,145.89,2025-10-06,60610,Cashback Card
txn_ch227,TENNIS TOURNAMENT,Recreation Services, NEC,7999,115.00,2025-10-07,60610,Checking
txn_ch228,SWEETGREEN,Fast Food Restaurants,5814,17.40,2025-10-08,60610,Cashback Card
txn_ch229,NIKE CHICAGO,Shoe Stores,5661,165.00,2025-10-09,60610,Cashback Card
txn_ch230,PRESSED JUICERY,Fast Food Restaurants,5814,12.75,2025-10-10,60610,Cashback Card
txn_ch231,TRADER JOES,Grocery Stores, Supermarkets,5411,91.23,2025-10-13,60610,Cashback Card
txn_ch232,RESTORE HYPER WELLNESS,Health and Beauty Spas,7298,85.00,2025-10-14,60610,Premium Card
txn_ch233,VITAMIN SHOPPE,Miscellaneous Food Stores,5499,76.80,2025-10-15,60610,Cashback Card
txn_ch234,COMED,Utilities: Electric, Gas, Water,4900,112.67,2025-10-16,60610,Checking
txn_ch235,ATHLETA CHICAGO,Sports and Riding Apparel Stores,5655,156.00,2025-10-17,60610,Premium Card
txn_ch236,WHOLE FOODS CHICAGO,Grocery Stores, Supermarkets,5411,138.67,2025-10-20,60610,Cashback Card
txn_ch237,MASSAGE ENVY,Health and Beauty Spas,7298,95.00,2025-10-21,60610,Premium Card
txn_ch238,GNC CHICAGO,Miscellaneous Food Stores,5499,89.50,2025-10-22,60610,Cashback Card
txn_ch239,CHIPOTLE,Fast Food Restaurants,5814,14.50,2025-10-23,60610,Cashback Card
txn_ch240,TRADER JOES,Grocery Stores, Supermarkets,5411,87.45,2025-10-27,60610,Cashback Card
txn_ch241,LULULEMON CHICAGO,Sports and Riding Apparel Stores,5655,178.00,2025-10-28,60610,Premium Card
txn_ch242,TENNIS LESSONS,Recreation Services, NEC,7999,120.00,2025-10-29,60610,Checking
txn_ch248,SIDLEY AUSTIN LLP,Legal Services,8111,1200.00,2025-11-22,60603,Checking
`;
