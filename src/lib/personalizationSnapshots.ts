// AUTO-GENERATED demo snapshot — offers + product cards for the five example
// customers, produced once from their static signals for the DEFAULT demo bank.
// The personalization tabs serve these instantly (zero model calls). Live
// generation only runs when the demo bank is set to a custom name.

import type { RollupOfferGroup } from "@/components/exec-demo/NextOfferRationale";
import type { ProductCard } from "@/components/exec-demo/ProductCardsPhoneView";

export interface PersonalizationSnapshot {
  offers: RollupOfferGroup[] | null;
  productCards: ProductCard[] | null;
}

const SNAPSHOTS = {
  "c1": {
    "offers": [
      {
        "rollup": "Buying a house above $1.5M",
        "pillar": "Life Event",
        "collectionMessage": "Small touches to make your new place yours.",
        "suppressedCategories": [
          "Home Search Tools",
          "Real Estate Apps"
        ],
        "imageCategory": "home",
        "imageQuery": "luxury home modern exterior",
        "deals": [
          {
            "id": "le1_d1",
            "merchant": "Our Bank",
            "product": "Jumbo Mortgage Closing Credit",
            "rewardValue": "$1,500 Credit",
            "message": "Save on your closing costs for your new luxury home.",
            "valueLine": "$1,500 credit applied directly to closing costs on a $1.5M+ home purchase.",
            "valueMath": "$1,500 credit flat rate",
            "cta": "Secure Your Rate",
            "signal": "boost",
            "signalReason": "Multiple high-value Zillow searches \u2192 ready for jumbo mortgage support",
            "boostCategory": "Mortgage Solutions"
          },
          {
            "id": "le1_d2",
            "merchant": "White Glove Movers",
            "product": "Elite Relocation Package",
            "rewardValue": "10% Off",
            "message": "Let professionals handle your high-value items with absolute care.",
            "valueLine": "10% off premium moving package saves $500 on a typical $5,000 move.",
            "valueMath": "10% \u00d7 $5,000 move cost \u2248 $500",
            "cta": "Move Smarter",
            "signal": "boost",
            "signalReason": "Active real estate listings viewing \u2192 premium moving services needed",
            "boostCategory": "Moving Services"
          },
          {
            "id": "le1_d3",
            "merchant": "Ring",
            "product": "Whole-Home Security Kit",
            "rewardValue": "$150 Off",
            "message": "Protect your new property with advanced smart security systems.",
            "valueLine": "$150 off a premium $600 multi-camera security bundle.",
            "valueMath": "$600 bundle - $150 discount = $450",
            "cta": "Secure Your Home",
            "signal": "boost",
            "signalReason": "New home purchase pending \u2192 smart security system upgrade",
            "boostCategory": "Smart Home Tech"
          },
          {
            "id": "le1_d4",
            "merchant": "Restoration Hardware",
            "product": "Interior Design Consultation",
            "rewardValue": "15% Off",
            "message": "Furnish your spacious new rooms with beautiful timeless pieces.",
            "valueLine": "15% off a $10,000 initial living room furniture order saves $1,500.",
            "valueMath": "15% \u00d7 $10,000 purchase \u2248 $1,500",
            "cta": "Style Your Space",
            "signal": "boost",
            "signalReason": "High-end real estate activity \u2192 luxury interior furnishing needs",
            "boostCategory": "Interior Design"
          },
          {
            "id": "le1_d5",
            "merchant": "Our Bank",
            "product": "High-Value Home Insurance",
            "rewardValue": "$250 Rebate",
            "message": "Get comprehensive coverage tailored for your high-value property.",
            "valueLine": "$250 rebate on your annual high-value home insurance premium.",
            "valueMath": "$250 rebate on annual premium",
            "cta": "Protect Your Asset",
            "signal": "boost",
            "signalReason": "Closing on a home above $1.5M \u2192 high-value property insurance required",
            "boostCategory": "Home Insurance"
          }
        ]
      },
      {
        "rollup": "Recurring transfers to an outside brokerage",
        "pillar": "Financial Signal",
        "collectionMessage": "Keep your investments growing under one roof.",
        "suppressedCategories": [],
        "imageCategory": "finance",
        "imageQuery": "investment growth chart",
        "deals": [
          {
            "id": "fs1_d1",
            "merchant": "Our Bank",
            "product": "Traditional & Roth IRA",
            "rewardValue": "No Account Fees",
            "message": "Consolidate your external investments into a fee-free Our Bank IRA.",
            "valueLine": "Assuming $500/mo transfers, save ~$120/yr in external brokerage account maintenance fees.",
            "valueMath": "$10/mo fee * 12 mo = $120/yr saved",
            "cta": "Open Your IRA",
            "signal": "boost",
            "signalReason": "Recurring transfers to outside brokerage detected",
            "boostCategory": "IRA Rollover"
          },
          {
            "id": "fs1_d2",
            "merchant": "Our Bank",
            "product": "Guided Investing",
            "rewardValue": "0.25% Fee",
            "message": "Automate your investing with low-cost portfolios managed by Our Bank.",
            "valueLine": "Assuming $6,000 annual investment, pay just $15/yr in management fees.",
            "valueMath": "0.25% fee * $6,000 = $15/yr",
            "cta": "Start Investing",
            "signal": "boost",
            "signalReason": "Recurring transfers to outside brokerage detected",
            "boostCategory": "Guided Investing"
          },
          {
            "id": "fs1_d3",
            "merchant": "Our Bank",
            "product": "Personal Wealth Consultation",
            "rewardValue": "Free Review",
            "message": "Get a complimentary portfolio review with an Our Bank advisor.",
            "valueLine": "Optimize your asset allocation to potentially boost returns by 1% annually.",
            "valueMath": "1% optimization * $6,000/yr = $60/yr",
            "cta": "Book Free Review",
            "signal": "boost",
            "signalReason": "Recurring transfers to outside brokerage detected",
            "boostCategory": "Portfolio Review"
          },
          {
            "id": "fs1_d4",
            "merchant": "Our Bank",
            "product": "Automated Tax-Loss Harvesting",
            "rewardValue": "Tax-Efficient",
            "message": "Keep more of your gains with automatic tax-loss harvesting.",
            "valueLine": "Assuming a $6,000 balance, offset up to $300/yr in tax liabilities.",
            "valueMath": "5% tax savings * $6,000 = $300/yr",
            "cta": "Enable Tax Savings",
            "signal": "boost",
            "signalReason": "Recurring transfers to outside brokerage detected",
            "boostCategory": "Tax-Loss Harvesting"
          },
          {
            "id": "fs1_d5",
            "merchant": "Our Bank",
            "product": "High-Yield Savings Account",
            "rewardValue": "4.50% APY",
            "message": "Earn high yield on uninvested cash before you trade.",
            "valueLine": "Earn ~$270/yr in interest on a $6,000 average cash balance.",
            "valueMath": "4.50% APY * $6,000 balance = $270/yr",
            "cta": "Grow Your Cash",
            "signal": "boost",
            "signalReason": "Recurring transfers to outside brokerage detected",
            "boostCategory": "HYSA Sweep"
          }
        ]
      }
    ],
    "productCards": [
      {
        "theme": "home",
        "type": "life_event",
        "quote": "A relationship rate could save an estimated $2,400 a year.",
        "benefits": [
          "Get a 0.25% relationship rate discount with existing balances",
          "Lock in your rate for up to 90 days during house hunting",
          "Zero origination fees for preferred tier members saving $1,500+"
        ],
        "cta_sub": "Get a custom rate quote in minutes",
        "signal_label": "Buying a house above $1.5M",
        "cta": "Put Down Roots",
        "product_name": "Our Bank Preferred Mortgage",
        "offer_headline": "Our Bank Preferred Mortgage from 6.375% APR",
        "eligibility": "Preferred rewards members are pre-approved"
      },
      {
        "cta": "Reward Your Routine",
        "eligibility": "Preferred status guarantees automatic approval",
        "quote": "On your annual court spend, that's roughly $192 back in points.",
        "type": "behavioral",
        "offer_headline": "Earn 3x points on wellness and fitness spending",
        "theme": "wellness",
        "product_name": "Our Bank Premium Rewards Card",
        "benefits": [
          "Earn 3x points on wellness and fitness purchases",
          "Get $100 annual credit towards court fees or gym memberships",
          "No annual fee for the first 12 months"
        ],
        "cta_sub": "Decision in seconds \u00b7 Use card immediately",
        "signal_label": "Biweekly advanced tennis"
      },
      {
        "product_name": "Our Bank Guided Investing",
        "cta_sub": "Set up automatic contributions",
        "signal_label": "Recurring transfers to an outside brokerage",
        "offer_headline": "Professional portfolio management with a 0.30% advisory fee",
        "benefits": [
          "Build a personalized portfolio with a low 0.30% advisory fee",
          "Automatic tax-loss harvesting to save up to $3,000 annually",
          "Move money instantly from checking with $0 transfer fees"
        ],
        "theme": "retirement",
        "eligibility": "Open with as little as $5,000",
        "cta": "Optimize Your Wealth",
        "quote": "Consolidating your external transfers could grow to an estimated $85,000 over time.",
        "type": "financial_signal"
      }
    ]
  },
  "c2": {
    "offers": [
      {
        "rollup": "Tech-forward buyer",
        "pillar": "Technology",
        "collectionMessage": "Smarter upgrades for your daily tech routine.",
        "imageCategory": "tech",
        "imageQuery": "minimalist desk setup with gadgets",
        "suppressedCategories": [
          "Computers",
          "Software"
        ],
        "deals": [
          {
            "id": "tfb_d1",
            "merchant": "Sony",
            "product": "WH-1000XM5 Headphones",
            "rewardValue": "10% Cash Back",
            "message": "Block out the noise and focus on your rhythm.",
            "valueLine": "10% back saves $50 on your next upgrade, based on $533 monthly tech spend.",
            "valueMath": "10% × $533 ≈ $50",
            "cta": "Tune Into Focus",
            "signal": "boost",
            "signalReason": "Enhance your tech setup with premium noise-cancelling headphones.",
            "boostCategory": "Headphones"
          },
          {
            "id": "tfb_d2",
            "merchant": "Anker",
            "product": "Magnetic Wireless Charging Station",
            "rewardValue": "15% Off",
            "message": "Power your devices effortlessly with a sleek charging station.",
            "valueLine": "15% off saves $15 on a $100 charging hub, optimizing your tech spend.",
            "valueMath": "15% × $100 = $15",
            "cta": "Power Your Routine",
            "signal": "boost",
            "signalReason": "Streamline your charging setup with multi-device wireless power.",
            "boostCategory": "Accessories"
          },
          {
            "id": "tfb_d3",
            "merchant": "Garmin",
            "product": "Venu 3 Smartwatch",
            "rewardValue": "$50 Statement Credit",
            "message": "Track your fitness goals and daily tech metrics seamlessly.",
            "valueLine": "$50 credit offsets your tech and fitness spending this month.",
            "valueMath": "$50 credit on $3,800/yr fitness",
            "cta": "Track Your Progress",
            "signal": "boost",
            "signalReason": "Connects your tech habits with your $3,800 annual fitness routine.",
            "boostCategory": "Wearables"
          },
          {
            "id": "tfb_d4",
            "merchant": "Philips Hue",
            "product": "Smart LED Starter Kit",
            "rewardValue": "20% Off",
            "message": "Set the perfect mood with smart, responsive home lighting.",
            "valueLine": "20% off saves $40 on a starter kit, matching your tech lifestyle.",
            "valueMath": "20% × $200 = $40",
            "cta": "Brighten Your Space",
            "signal": "boost",
            "signalReason": "Expand your connected home ecosystem with smart lighting.",
            "boostCategory": "Smart Home"
          },
          {
            "id": "tfb_d5",
            "merchant": "Our Bank",
            "product": "Tech Rewards Credit Card",
            "rewardValue": "3% Cash Back",
            "message": "Earn more on every gadget with our specialized card.",
            "valueLine": "3% back earns $190 annually on your $6,400 tech spend.",
            "valueMath": "3% × $6,400 ≈ $190/yr",
            "cta": "Maximize Your Spend",
            "signal": "boost",
            "signalReason": "Earn higher rewards on your $6,400 annual technology purchases.",
            "boostCategory": "Credit Cards"
          }
        ]
      },
      {
        "rollup": "First home purchase underway",
        "pillar": "Life Event",
        "collectionMessage": "Small touches to make your new place yours.",
        "suppressedCategories": [
          "Home Search Tools",
          "Real Estate Listings"
        ],
        "imageCategory": "home",
        "imageQuery": "house keys handover",
        "deals": [
          {
            "id": "le1_d1",
            "merchant": "Our Bank",
            "product": "Mortgage Rate Lock",
            "rewardValue": "0.25% Rate Discount",
            "message": "Lock in your rate early and save on monthly payments.",
            "valueLine": "0.25% rate discount saves about $1,000 annually on a $400k loan.",
            "valueMath": "0.25% * $400,000 = $1,000/year",
            "cta": "Secure Your Rate",
            "signal": "boost",
            "signalReason": "Multiple Zillow and Redfin searches → ready to lock a mortgage rate",
            "boostCategory": "Mortgage Tools"
          },
          {
            "id": "le1_d2",
            "merchant": "TaskRabbit",
            "product": "Moving & Packing Help",
            "rewardValue": "$50 Off",
            "message": "Hire top-rated local helpers to pack your boxes stress-free.",
            "valueLine": "$50 off moving help reduces average $300 booking to $250.",
            "valueMath": "$300 booking - $50 discount = $250",
            "cta": "Move Smarter",
            "signal": "boost",
            "signalReason": "Address change checklist downloads → booking local moving assistance",
            "boostCategory": "Moving Services"
          },
          {
            "id": "le1_d3",
            "merchant": "Our Bank",
            "product": "Homeowners Insurance Policy",
            "rewardValue": "$150 Credit",
            "message": "Protect your new investment with comprehensive home coverage options.",
            "valueLine": "$150 statement credit on your first year of home insurance.",
            "valueMath": "$1,200 annual premium - $150 = $1,050",
            "cta": "Protect Your Home",
            "signal": "boost",
            "signalReason": "Home appraisal fee paid → time to secure homeowners insurance",
            "boostCategory": "Home Insurance"
          },
          {
            "id": "le1_d4",
            "merchant": "West Elm",
            "product": "Modern Living Room Furniture",
            "rewardValue": "15% Off",
            "message": "Fill your new living room with stylish, comfortable seating.",
            "valueLine": "15% off a $1,200 sofa saves $180 on move-in day.",
            "valueMath": "15% * $1,200 = $180",
            "cta": "Furnish the Space",
            "signal": "boost",
            "signalReason": "Frequent browsing of interior design blogs → furnishing the new space",
            "boostCategory": "Furniture"
          },
          {
            "id": "le1_d5",
            "merchant": "The Home Depot",
            "product": "Smart Kitchen Appliances",
            "rewardValue": "10% Off",
            "message": "Upgrade your kitchen with energy-efficient appliances for less.",
            "valueLine": "10% off a $2,000 appliance suite saves $200 instantly.",
            "valueMath": "10% * $2,000 = $200",
            "cta": "Upgrade Your Kitchen",
            "signal": "boost",
            "signalReason": "Home inspection report reviewed → replacing older kitchen appliances",
            "boostCategory": "Appliances"
          }
        ]
      },
      {
        "rollup": "Chasing a better rate",
        "pillar": "Financial Signal",
        "collectionMessage": "Stop overpaying and start earning more on your money.",
        "suppressedCategories": [],
        "imageCategory": "lifestyle",
        "imageQuery": "piggy bank rate growth",
        "deals": [
          {
            "id": "fs1_d1",
            "merchant": "Our Bank",
            "product": "High Yield Savings Account",
            "rewardValue": "4.50% APY",
            "message": "Move your cash to earn more on your savings.",
            "valueLine": "Earn ~$1,125/yr by moving an assumed $25k balance from 0.05% to 4.50% APY.",
            "valueMath": "4.45% diff × $25k ≈ $1,112.50/yr",
            "cta": "Open Account",
            "signal": "boost",
            "signalReason": "Seeking higher interest rates on lifestyle savings",
            "boostCategory": "High Yield Savings"
          },
          {
            "id": "fs1_d2",
            "merchant": "Our Bank",
            "product": "Balance Transfer Card",
            "rewardValue": "0% Intro APR",
            "message": "Stop paying high interest on your lifestyle card balances.",
            "valueLine": "Save ~$1,800 in interest by transferring an assumed $10k balance at 18% APR.",
            "valueMath": "18% APR × $10,000 = $1,800/yr",
            "cta": "Transfer Balance",
            "signal": "boost",
            "signalReason": "High-interest lifestyle debt consolidation opportunity",
            "boostCategory": "Balance Transfer"
          },
          {
            "id": "fs1_d3",
            "merchant": "Our Bank",
            "product": "Debt Consolidation Loan",
            "rewardValue": "From 6.99% APR",
            "message": "Consolidate high-rate retail loans into one lower payment.",
            "valueLine": "Save ~$100/mo consolidating an assumed $15k of 15% debt to 6.99% APR.",
            "valueMath": "(15% - 6.99%) × $15k ≈ $1,200/yr",
            "cta": "Get My Rate",
            "signal": "boost",
            "signalReason": "Consolidating high-rate lifestyle obligations",
            "boostCategory": "Personal Loan"
          },
          {
            "id": "fs1_d4",
            "merchant": "Our Bank",
            "product": "11-Month CD",
            "rewardValue": "5.00% APY",
            "message": "Lock in a guaranteed high rate for your lifestyle savings goals.",
            "valueLine": "Secure ~$458 in guaranteed interest by depositing an assumed $10,000 for 11 months.",
            "valueMath": "5.00% APY × $10,000 × (11/12) ≈ $458",
            "cta": "Lock Your Rate",
            "signal": "boost",
            "signalReason": "Locking in peak yields for lifestyle savings",
            "boostCategory": "CD Account"
          },
          {
            "id": "fs1_d5",
            "merchant": "Our Bank",
            "product": "Relationship Rate Boost",
            "rewardValue": "+0.25% APR Boost",
            "message": "Connect your direct deposit for premium rate discounts.",
            "valueLine": "Save ~$75/yr on an assumed $30k loan balance with relationship discounts.",
            "valueMath": "0.25% × $30,000 = $75/yr",
            "cta": "Link Account",
            "signal": "boost",
            "signalReason": "Maximizing relationship rate discounts",
            "boostCategory": "Relationship Rate"
          }
        ]
      }
    ],
    "productCards": [
      {
        "cta": "Put Down Roots",
        "benefits": [
          "No-fee pre-approvals locked in for 120 days",
          "Up to $3,000 credit toward eligible closing costs",
          "0.25% interest rate discount with relationship balance"
        ],
        "type": "life_event",
        "cta_sub": "Soft credit check · Get pre-qualified instantly",
        "quote": "A relationship rate could save an estimated $2,400 each year on your new home.",
        "eligibility": "Preferred Rewards members enjoy rate discounts",
        "theme": "home",
        "signal_label": "First home purchase underway",
        "product_name": "Our Bank Preferred Mortgage",
        "offer_headline": "Lock in your mortgage rate from 6.35% APR"
      },
      {
        "offer_headline": "Earn 50,000 bonus points after $4,000 spend in 90 days",
        "benefits": [
          "Earn 3x points on all hardware and software purchases",
          "Complimentary $150 annual tech subscription statement credit",
          "No foreign transaction fees for global travel"
        ],
        "theme": "shopping",
        "quote": "Earn 3x on favorite gear and platforms—roughly $192 back each year.",
        "eligibility": "Open to existing Our Bank clients",
        "cta_sub": "Apply in 2 minutes · Use card instantly",
        "product_name": "Our Bank Premium Tech Rewards Card",
        "signal_label": "Tech-forward buyer",
        "cta": "Upgrade Your Tech Rewards",
        "type": "behavioral"
      },
      {
        "product_name": "Our Bank Unlimited Cash Rewards Card",
        "signal_label": "Chasing a better rate",
        "theme": "lifestyle",
        "benefits": [
          "Earn 3% cash back on travel and dining purchases",
          "No annual fee and $0 foreign transaction fees",
          "$200 statement credit after spending $1,000 in 90 days"
        ],
        "quote": "Moving everyday card activity could return an estimated $280 each year.",
        "eligibility": "Pre-qualified based on relationship status",
        "offer_headline": "Earn unlimited 1.5% cash back on all everyday purchases",
        "type": "financial_signal",
        "cta_sub": "Apply online and get a decision in 60 seconds",
        "cta": "Maximize Your Daily Rewards"
      }
    ]
  },
  "c3": {
    "offers": [
      {
        "rollup": "Family-first household",
        "pillar": "Family",
        "collectionMessage": "Small upgrades that make your family time better.",
        "imageCategory": "kids",
        "imageQuery": "family playing board game",
        "suppressedCategories": [
          "Daycare",
          "School Supplies"
        ],
        "deals": [
          {
            "id": "fam_d1",
            "merchant": "KiwiCo",
            "product": "Monthly STEM & Art Crates",
            "rewardValue": "5% Cash Back",
            "message": "Spark curiosity and creativity with hands-on projects delivered monthly.",
            "valueLine": "5% back on family activities earns ~$320/yr on your ~$6,400 family spend.",
            "valueMath": "5% × $6,400 ≈ $320/yr",
            "cta": "Fuel Creative Minds",
            "signal": "boost",
            "signalReason": "Complements your family-first spending with educational, engaging home activities.",
            "boostCategory": "Kids Activities"
          },
          {
            "id": "fam_d2",
            "merchant": "Our Bank",
            "product": "High-Yield Family Savings Account",
            "rewardValue": "4.50% APY",
            "message": "Grow your family's future with a high-yield savings account.",
            "valueLine": "Earn ~$290/yr in interest by routing your ~$6,400 annual family budget here.",
            "valueMath": "4.50% × $6,400 ≈ $288/yr",
            "cta": "Secure Their Future",
            "signal": "boost",
            "signalReason": "Maximize interest on your family budget with high-yield savings.",
            "boostCategory": "Savings"
          },
          {
            "id": "fam_d3",
            "merchant": "Target",
            "product": "Household & Toy Essentials",
            "rewardValue": "3% Cash Back",
            "message": "Stock up on everyday essentials and toys for the kids.",
            "valueLine": "Save ~$190/yr with target rewards on your ~$6,400 family budget.",
            "valueMath": "3% × $6,400 ≈ $190/yr",
            "cta": "Simplify Your Shopping",
            "signal": "boost",
            "signalReason": "High-frequency family spend matches perfectly with Target rewards.",
            "boostCategory": "Retail"
          },
          {
            "id": "fam_d4",
            "merchant": "REI",
            "product": "Family Camping Gear",
            "rewardValue": "10% Member Dividend",
            "message": "Get outside together with durable, high-quality family camping gear.",
            "valueLine": "10% member dividend saves ~$640/yr if applied to your ~$6,400 family spend.",
            "valueMath": "10% × $6,400 ≈ $640/yr",
            "cta": "Gear Up Together",
            "signal": "boost",
            "signalReason": "Enhances family-first lifestyle with outdoor recreation options.",
            "boostCategory": "Outdoor Gear"
          },
          {
            "id": "fam_d5",
            "merchant": "Home Depot",
            "product": "Smart Home Security Kit",
            "rewardValue": "10% Off",
            "message": "Keep your family-first household safe with smart security upgrades.",
            "valueLine": "10% off smart security saves ~$380 on your ~$3,800 home projects budget.",
            "valueMath": "10% × $3,800 ≈ $380",
            "cta": "Protect Your Home",
            "signal": "boost",
            "signalReason": "Connects your home improvement spending with family safety needs.",
            "boostCategory": "Home Security"
          }
        ]
      },
      {
        "rollup": "Estate planning started",
        "pillar": "Life Event",
        "collectionMessage": "Small upgrades to make organizing your legacy smoother.",
        "suppressedCategories": [
          "Basic Will Templates"
        ],
        "imageCategory": "finance",
        "imageQuery": "family legacy planning documents",
        "deals": [
          {
            "id": "le1_d1",
            "merchant": "Trust & Will",
            "product": "Comprehensive Trust Plan",
            "rewardValue": "20% Off",
            "message": "Secure your family's future with a customized trust plan.",
            "valueLine": "20% off comprehensive trust plan saves $120 on a $600 plan.",
            "valueMath": "20% × $600 ≈ $120",
            "cta": "Protect Your Legacy",
            "signal": "boost",
            "signalReason": "Searched for estate planning attorneys → online trust setup",
            "boostCategory": "Trust Creation"
          },
          {
            "id": "le1_d2",
            "merchant": "Our Bank",
            "product": "Safe Deposit Box",
            "rewardValue": "$50 Credit",
            "message": "Keep your critical estate documents secure in our vaults.",
            "valueLine": "$50 credit covers the first year of a medium safe deposit box.",
            "valueMath": "$50 credit on $50 annual fee",
            "cta": "Secure Your Documents",
            "signal": "boost",
            "signalReason": "Downloaded estate planning checklist → safe deposit box storage",
            "boostCategory": "Asset Protection"
          },
          {
            "id": "le1_d3",
            "merchant": "SentrySafe",
            "product": "Fireproof Document Safe",
            "rewardValue": "15% Off",
            "message": "Protect physical deeds and wills from fire and water damage.",
            "valueLine": "15% off fireproof home safe saves $30 on a $200 safe.",
            "valueMath": "15% × $200 ≈ $30",
            "cta": "Guard Vital Records",
            "signal": "boost",
            "signalReason": "Notary public transaction completed → home safe upgrade",
            "boostCategory": "Document Storage"
          },
          {
            "id": "le1_d4",
            "merchant": "1Password",
            "product": "Families Plan",
            "rewardValue": "25% Off",
            "message": "Share digital credentials and vital estate access with loved ones.",
            "valueLine": "25% off annual family plan saves $15 on a $60 subscription.",
            "valueMath": "25% × $60 ≈ $15",
            "cta": "Share Access Safely",
            "signal": "boost",
            "signalReason": "Updated legacy contact settings on social media → secure digital vault",
            "boostCategory": "Digital Legacy"
          },
          {
            "id": "le1_d5",
            "merchant": "Shred-it",
            "product": "One-Time Shredding Service",
            "rewardValue": "10% Off",
            "message": "Safely dispose of outdated financial documents and old wills.",
            "valueLine": "10% off secure shredding service saves $15 on a $150 pickup.",
            "valueMath": "10% × $150 ≈ $15",
            "cta": "Clear Out Safely",
            "signal": "boost",
            "signalReason": "Completed estate inventory draft → shredding old financial statements",
            "boostCategory": "Document Disposal"
          }
        ]
      },
      {
        "rollup": "Investments held elsewhere",
        "pillar": "Financial Signal",
        "collectionMessage": "Consolidate your external accounts and maximize your growth potential.",
        "suppressedCategories": [],
        "imageCategory": "wealth",
        "imageQuery": "financial advisor meeting",
        "deals": [
          {
            "id": "fs1_d1",
            "merchant": "Our Bank",
            "product": "Traditional IRA Rollover",
            "rewardValue": "No Fee Transfer",
            "message": "Consolidate your external investments and eliminate account maintenance fees.",
            "valueLine": "Assuming a ~$100k external balance, save ~$150/yr by eliminating account maintenance fees.",
            "valueMath": "$100k balance × 0.15% fee savings = $150/yr",
            "cta": "Roll It Over",
            "signal": "boost",
            "signalReason": "External investment portfolio detected",
            "boostCategory": "IRA Rollover"
          },
          {
            "id": "fs1_d2",
            "merchant": "Our Bank",
            "product": "Automated Investing",
            "rewardValue": "0.25% Management Fee",
            "message": "Let our smart technology optimize your portfolio for growth.",
            "valueLine": "Assuming ~$100k assets, a low 0.25% fee saves ~$750/yr vs typical 1% advisors.",
            "valueMath": "(1.0% - 0.25%) × $100k = $750/yr saved",
            "cta": "Start Investing",
            "signal": "boost",
            "signalReason": "External investment portfolio detected",
            "boostCategory": "Guided Investing"
          },
          {
            "id": "fs1_d3",
            "merchant": "Our Bank",
            "product": "Wealth Advisory Consultation",
            "rewardValue": "Free Advisory Session",
            "message": "Get a personalized review of your external assets today.",
            "valueLine": "Identify potential tax savings of up to ~$1,200/yr on an assumed ~$100k portfolio.",
            "valueMath": "1.2% tax drag reduction × $100k = $1,200/yr",
            "cta": "Schedule Free Review",
            "signal": "boost",
            "signalReason": "External investment portfolio detected",
            "boostCategory": "Portfolio Review"
          },
          {
            "id": "fs1_d4",
            "merchant": "Our Bank",
            "product": "Smart Tax-Loss Harvesting",
            "rewardValue": "Offset Capital Gains",
            "message": "Automatically offset capital gains to lower your tax bill.",
            "valueLine": "Assuming a ~$100k portfolio, tax-loss harvesting can add up to ~$1,000/yr in value.",
            "valueMath": "1.0% tax-alpha benefit × $100k = $1,000/yr",
            "cta": "Optimize Taxes",
            "signal": "boost",
            "signalReason": "External investment portfolio detected",
            "boostCategory": "Tax Harvesting"
          },
          {
            "id": "fs1_d5",
            "merchant": "Our Bank",
            "product": "High-Yield Cash Sweep",
            "rewardValue": "4.50% APY",
            "message": "Earn high yield on uninvested cash swept from your portfolio.",
            "valueLine": "Assuming ~$10k idle cash, earn ~$450/yr vs near-zero at traditional brokerages.",
            "valueMath": "4.50% APY × $10k idle cash = $450/yr",
            "cta": "Sweep Your Cash",
            "signal": "boost",
            "signalReason": "External investment portfolio detected",
            "boostCategory": "HYSA Sweep"
          }
        ]
      }
    ],
    "productCards": [
      {
        "eligibility": "Open with as little as $25",
        "product_name": "Our Bank 529 College Savings Plan",
        "signal_label": "Estate planning started",
        "quote": "Saving $500 monthly could grow to an estimated $120,000 for their next chapter.",
        "benefits": [
          "Tax-free growth on qualified education expenses",
          "Up to $10,000 state tax deduction per year",
          "Transfer funds to alternative beneficiaries penalty-free"
        ],
        "type": "life_event",
        "cta": "Build the College Fund",
        "cta_sub": "Set up automatic monthly contributions",
        "offer_headline": "6% estimated growth for their future education",
        "theme": "education"
      },
      {
        "product_name": "Our Bank Unlimited Cash Rewards Card",
        "signal_label": "Family-first household",
        "benefits": [
          "Unlimited 2% cash back on all purchases",
          "No annual fee and $0 foreign fees",
          "Earn $200 bonus after $2,000 spend in 90 days"
        ],
        "cta_sub": "Apply in minutes · No credit impact",
        "theme": "family",
        "eligibility": "Pre-approved · Based on your Private relationship",
        "cta": "Maximize Your Family Budget",
        "type": "behavioral",
        "offer_headline": "Earn unlimited 2% cash back on family essentials",
        "quote": "Family purchases could earn an estimated $128 back on seasonal expenses."
      },
      {
        "type": "financial_signal",
        "cta": "Bring Your Investments Home",
        "benefits": [
          "Custom-built portfolios managed by our top advisors",
          "0.30% annual advisory fee based on balance",
          "No transaction fees on automatic rebalancing"
        ],
        "eligibility": "Preferred Rewards eligible for Private clients",
        "quote": "Coordinating external holdings could save an estimated $1,200 in annual fees.",
        "product_name": "Our Bank Guided Investing",
        "offer_headline": "Consolidate investments under 1.50% lower average fees",
        "signal_label": "Investments held elsewhere",
        "theme": "retirement",
        "cta_sub": "Seamless transfer process in 5 days"
      }
    ]
  },
  "c4": {
    "offers": [
      {
        "rollup": "Golf club member",
        "pillar": "Sports & Wellness",
        "collectionMessage": "Small upgrades for your days on the course.",
        "imageCategory": "golf",
        "imageQuery": "golf course green",
        "suppressedCategories": [
          "Golf Club Fees",
          "Green Fees"
        ],
        "deals": [
          {
            "id": "g1_d1",
            "merchant": "Titleist",
            "product": "Pro V1 Golf Balls",
            "rewardValue": "10% Cash Back",
            "message": "Bring tour-level precision and control to every single swing.",
            "valueLine": "10% back saves $50/yr on your $533/mo golf lifestyle spend.",
            "valueMath": "10% × $533 ≈ $50/yr",
            "cta": "Sharpen Your Game",
            "signal": "boost",
            "signalReason": "High frequency of golf club spend indicates a need for premium balls.",
            "boostCategory": "Golf Balls"
          },
          {
            "id": "g1_d2",
            "merchant": "TravisMathew",
            "product": "Performance Golf Polos",
            "rewardValue": "15% Off",
            "message": "Stay cool and comfortable from the front nine to the clubhouse.",
            "valueLine": "15% off saves $80/yr on your $533/mo golf apparel budget.",
            "valueMath": "15% × $533 ≈ $80/yr",
            "cta": "Upgrade Your Style",
            "signal": "boost",
            "signalReason": "Complements your active golf club membership lifestyle.",
            "boostCategory": "Apparel"
          },
          {
            "id": "g1_d3",
            "merchant": "Garmin",
            "product": "Approach Golf GPS Watch",
            "rewardValue": "5% Back",
            "message": "Navigate the course with precise yardages on your wrist.",
            "valueLine": "5% back saves $320/yr on your $6,400 annual golf spend.",
            "valueMath": "5% × $6,400 = $320/yr",
            "cta": "Track Your Swing",
            "signal": "boost",
            "signalReason": "Enhance your club rounds with advanced distance tracking.",
            "boostCategory": "Golf Tech"
          },
          {
            "id": "g1_d4",
            "merchant": "Callaway",
            "product": "Rogue ST Drivers",
            "rewardValue": "8% Cash Back",
            "message": "Unlock maximum distance and forgiveness on your next tee shot.",
            "valueLine": "8% back saves $40/mo on your $533/mo golf club spend.",
            "valueMath": "8% × $533 ≈ $40/mo",
            "cta": "Drive With Power",
            "signal": "boost",
            "signalReason": "Upgrade your equipment to match your frequent course play.",
            "boostCategory": "Golf Clubs"
          },
          {
            "id": "g1_d5",
            "merchant": "Our Bank",
            "product": "High-Yield Savings Account",
            "rewardValue": "4.5% APY",
            "message": "Grow your golf tournament fund faster with automated savings.",
            "valueLine": "Earn $290/yr on your $6,400 annual sports budget.",
            "valueMath": "4.5% × $6,400 ≈ $290/yr",
            "cta": "Grow Your Fund",
            "signal": "boost",
            "signalReason": "Put your annual golf budget to work when not in use.",
            "boostCategory": "Savings"
          }
        ]
      },
      {
        "rollup": "Retirement in sight",
        "pillar": "Life Event",
        "collectionMessage": "Smarter picks for your next chapter.",
        "suppressedCategories": [
          "Basic Savings Accounts"
        ],
        "imageCategory": "finance",
        "imageQuery": "retirement planning desk",
        "deals": [
          {
            "id": "le1_d1",
            "merchant": "Our Bank",
            "product": "Wealth Advisory Consultation",
            "rewardValue": "Complimentary",
            "message": "Map out your retirement income strategy with a dedicated professional.",
            "valueLine": "Complimentary consultation worth $250 to optimize your retirement portfolio.",
            "valueMath": "$250 standard fee waived",
            "cta": "Plan Your Future",
            "signal": "boost",
            "signalReason": "Frequent contributions to 401k -> transition to active wealth management",
            "boostCategory": "Wealth Advisory"
          },
          {
            "id": "le1_d2",
            "merchant": "Roadtrippers",
            "product": "Premium Annual Membership",
            "rewardValue": "20% Off",
            "message": "Map your scenic routes and explore the country at your pace.",
            "valueLine": "20% off annual membership saves $12 on a $60 subscription.",
            "valueMath": "20% * $60 = $12",
            "cta": "Hit the Road",
            "signal": "boost",
            "signalReason": "Recent RV rental search -> planning long-distance road trips",
            "boostCategory": "Leisure Travel"
          },
          {
            "id": "le1_d3",
            "merchant": "SilverSneakers",
            "product": "Fitness Program Enrollment",
            "rewardValue": "No-Cost Access",
            "message": "Stay active and connected with customized fitness classes near you.",
            "valueLine": "No-cost gym access saves approximately $40 per month on membership.",
            "valueMath": "$40 * 12 months = $480/year",
            "cta": "Stay Active",
            "signal": "boost",
            "signalReason": "Inquiries on Medicare supplement plans -> active lifestyle integration",
            "boostCategory": "Active Wellness"
          },
          {
            "id": "le1_d4",
            "merchant": "MasterClass",
            "product": "Annual Multi-User Pass",
            "rewardValue": "15% Off",
            "message": "Dive deep into new hobbies with lessons from world-class experts.",
            "valueLine": "15% off annual pass saves $27 on a $180 subscription.",
            "valueMath": "15% * $180 = $27",
            "cta": "Start Learning",
            "signal": "boost",
            "signalReason": "Searches for local cooking and photography classes -> online learning transition",
            "boostCategory": "Lifelong Learning"
          },
          {
            "id": "le1_d5",
            "merchant": "Trust & Will",
            "product": "Estate Planning Package",
            "rewardValue": "10% Off",
            "message": "Secure your legacy easily with customized online estate planning documents.",
            "valueLine": "10% off estate planning saves $16 on a standard $159 plan.",
            "valueMath": "10% * $159 = $15.90",
            "cta": "Secure Your Legacy",
            "signal": "boost",
            "signalReason": "Visits to retirement calculator tools -> protecting accumulated family wealth",
            "boostCategory": "Estate Planning"
          }
        ]
      },
      {
        "rollup": "Retirement money held away",
        "pillar": "Financial Signal",
        "collectionMessage": "Bring your retirement accounts home for better growth.",
        "suppressedCategories": [],
        "imageCategory": "investment",
        "imageQuery": "retirement planning advisor",
        "deals": [
          {
            "id": "fs1_d1",
            "merchant": "Our Bank",
            "product": "Traditional IRA Rollover",
            "rewardValue": "No Fee Transfer",
            "message": "Consolidate your outside retirement accounts into one easy-to-manage IRA.",
            "valueLine": "Consolidating an assumed $100k balance could save ~$500/yr by avoiding high external account fees.",
            "valueMath": "0.50% fee savings * $100k = $500/yr",
            "cta": "Roll It Over",
            "signal": "boost",
            "signalReason": "Retirement money held away detected",
            "boostCategory": "IRA Rollover"
          },
          {
            "id": "fs1_d2",
            "merchant": "Our Bank",
            "product": "Automated Investing Portfolio",
            "rewardValue": "0.25% Management Fee",
            "message": "Let our smart technology manage your retirement portfolio automatically.",
            "valueLine": "Save ~$750/yr compared to traditional 1.00% advisors on an assumed $100k portfolio.",
            "valueMath": "(1.00% - 0.25%) * $100k = $750/yr",
            "cta": "Start Investing",
            "signal": "boost",
            "signalReason": "Retirement money held away detected",
            "boostCategory": "Guided Investing"
          },
          {
            "id": "fs1_d3",
            "merchant": "Our Bank",
            "product": "Complimentary Wealth Advisory",
            "rewardValue": "Free Session",
            "message": "Meet with a certified advisor to optimize your retirement strategy.",
            "valueLine": "A free review of your assumed $100k portfolio can identify costly hidden fee leaks.",
            "valueMath": "1 free session = $250 advisor value",
            "cta": "Book Free Session",
            "signal": "boost",
            "signalReason": "Retirement money held away detected",
            "boostCategory": "Portfolio Review"
          },
          {
            "id": "fs1_d4",
            "merchant": "Our Bank",
            "product": "Tax-Smart Brokerage Account",
            "rewardValue": "Tax Optimization",
            "message": "Minimize your tax liability automatically with our smart harvesting tool.",
            "valueLine": "Offset up to $3,000 of ordinary income annually using strategic tax-loss harvesting.",
            "valueMath": "$3,000 deduction * 24% tax bracket = $720 saved",
            "cta": "Open Tax Account",
            "signal": "boost",
            "signalReason": "Retirement money held away detected",
            "boostCategory": "Tax Harvesting"
          },
          {
            "id": "fs1_d5",
            "merchant": "Our Bank",
            "product": "High-Yield Savings Sweep",
            "rewardValue": "4.50% APY",
            "message": "Keep your uninvested retirement cash earning our highest interest rate.",
            "valueLine": "Earn ~$450/yr in extra interest on an assumed $10,000 cash buffer.",
            "valueMath": "4.50% APY * $10,000 cash = $450/yr",
            "cta": "Set Up Sweep",
            "signal": "boost",
            "signalReason": "Retirement money held away detected",
            "boostCategory": "HYSA Sweep"
          }
        ]
      }
    ],
    "productCards": [
      {
        "eligibility": "Preferred Rewards eligible based on relationship",
        "offer_headline": "Maximize your retirement strategy with an Our Bank IRA",
        "theme": "retirement",
        "type": "life_event",
        "cta_sub": "Set up automatic contributions in minutes",
        "quote": "A consolidated retirement plan could add an estimated $12,000 over time.",
        "benefits": [
          "Up to 75% bonus rewards with Preferred Rewards membership",
          "Tax-advantaged growth on annual contributions up to $8,000",
          "$0 online trade commissions for stock and ETF trades"
        ],
        "cta": "Build Your Next Chapter",
        "product_name": "Our Bank Traditional IRA",
        "signal_label": "Retirement in sight"
      },
      {
        "type": "behavioral",
        "cta": "Reward Your Routine",
        "product_name": "Our Bank Premium Rewards Card",
        "cta_sub": "Decision in seconds · Use card immediately",
        "theme": "wellness",
        "signal_label": "Golf club member",
        "offer_headline": "Earn 3x points on golf, leisure, and wellness activities",
        "quote": "Premium rewards on club outings could return roughly $192 in travel value yearly.",
        "eligibility": "Pre-qualified · No impact to credit score",
        "benefits": [
          "Earn 3x points on golf green fees and country club dues",
          "75,000 bonus points after $4,000 spend in 90 days",
          "No foreign transaction fees for your international resort travel"
        ]
      },
      {
        "product_name": "Our Bank Guided Investing",
        "signal_label": "Retirement money held away",
        "cta": "Plan Your Next Phase",
        "quote": "Combining retirement accounts could save an estimated $1,800 in annual fees.",
        "type": "financial_signal",
        "cta_sub": "Consultation takes less than 10 minutes",
        "benefits": [
          "Consolidate multiple external accounts into one unified portfolio",
          "Professional portfolio design aligned to your 10-year outlook",
          "Tax-loss harvesting strategy for high-income earners saving 15%+"
        ],
        "eligibility": "Designed for balances over $250,000",
        "offer_headline": "Consolidate external assets with Our Bank Guided Investing",
        "theme": "retirement"
      }
    ]
  },
  "c5": {
    "offers": [
      {
        "rollup": "Fashion and retail regular",
        "pillar": "Shopping & Retail",
        "collectionMessage": "Small upgrades to make your daily style sharper.",
        "imageCategory": "fashion",
        "imageQuery": "chic modern wardrobe",
        "suppressedCategories": [
          "Department Stores",
          "Fast Fashion"
        ],
        "deals": [
          {
            "id": "fr_d1",
            "merchant": "Everlane",
            "product": "Premium Cotton Denim",
            "rewardValue": "10% Cash Back",
            "message": "Refresh your weekly wardrobe rotation with clean, sustainable basics.",
            "valueLine": "10% back earns you about $50 back on your typical monthly fashion spend.",
            "valueMath": "10% × $533/mo ≈ $50/mo",
            "cta": "Refine Your Wardrobe",
            "signal": "boost",
            "signalReason": "High monthly retail spend can be optimized with direct cash back.",
            "boostCategory": "Apparel"
          },
          {
            "id": "fr_d2",
            "merchant": "Nordstrom",
            "product": "Designer Shoes & Apparel",
            "rewardValue": "$50 Reward Note",
            "message": "Step out in style with timeless designer footwear and apparel.",
            "valueLine": "Earn a $50 reward when you spend $250 of your monthly retail budget.",
            "valueMath": "$50 reward on $250 spend",
            "cta": "Step Into Style",
            "signal": "boost",
            "signalReason": "Maximizes value on frequent high-end department store purchases.",
            "boostCategory": "Footwear"
          },
          {
            "id": "fr_d3",
            "merchant": "Reformation",
            "product": "Sustainable Dresses & Knits",
            "rewardValue": "15% Off",
            "message": "Add effortless, climate-neutral dresses and knits to your weekly rotation.",
            "valueLine": "Save $80 on your next refresh using your typical monthly budget.",
            "valueMath": "15% × $533/mo ≈ $80",
            "cta": "Embrace Sustainable Style",
            "signal": "boost",
            "signalReason": "Aligns with frequent apparel purchases with eco-friendly alternatives.",
            "boostCategory": "Dresses"
          },
          {
            "id": "fr_d4",
            "merchant": "Our Bank",
            "product": "Retail Rewards Credit Card",
            "rewardValue": "3% Cash Back",
            "message": "Earn unlimited rewards on all your retail and fashion purchases.",
            "valueLine": "3% cash back earns you $190 back on your annual retail spend.",
            "valueMath": "3% × $6,400 ≈ $190/yr",
            "cta": "Multiply Your Points",
            "signal": "boost",
            "signalReason": "Consolidates high annual retail spend into maximum cash rewards.",
            "boostCategory": "Credit Cards"
          },
          {
            "id": "fr_d5",
            "merchant": "Vuori",
            "product": "Performance Apparel",
            "rewardValue": "20% Off First Order",
            "message": "Transition from workouts to weekend errands in incredibly soft activewear.",
            "valueLine": "Save $105 on a wardrobe refresh using your monthly fashion budget.",
            "valueMath": "20% × $533/mo ≈ $105",
            "cta": "Upgrade Your Comfort",
            "signal": "boost",
            "signalReason": "Bridges the gap between your retail and wellness routine spending.",
            "boostCategory": "Activewear"
          }
        ]
      },
      {
        "rollup": "Career step-up",
        "pillar": "Life Event",
        "collectionMessage": "Small upgrades for your next professional chapter.",
        "suppressedCategories": [
          "Entry-Level Job Boards"
        ],
        "imageCategory": "fashion",
        "imageQuery": "professional business attire",
        "deals": [
          {
            "id": "le1_d1",
            "merchant": "Indochino",
            "product": "Custom Professional Suits",
            "rewardValue": "20% Off",
            "message": "Command the boardroom with custom-tailored suits built for your new role.",
            "valueLine": "20% off a custom suit saves $160 on an $800 wardrobe upgrade.",
            "valueMath": "20% * $800 ≈ $160",
            "cta": "Dress for Success",
            "signal": "boost",
            "signalReason": "Recent LinkedIn premium subscription indicates readiness for professional wardrobe upgrade.",
            "boostCategory": "Professional Attire"
          },
          {
            "id": "le1_d2",
            "merchant": "Our Bank",
            "product": "Premium Wealth Management",
            "rewardValue": "$500 Bonus",
            "message": "Maximize your new salary with personalized wealth planning and investment strategies.",
            "valueLine": "$500 cash bonus when depositing $10,000 of your new salary.",
            "valueMath": "$500 flat bonus on $10k deposit",
            "cta": "Grow Your Wealth",
            "signal": "boost",
            "signalReason": "Direct deposit increase of 15% signals a transition to higher income bracket.",
            "boostCategory": "Wealth Management"
          },
          {
            "id": "le1_d3",
            "merchant": "Apple",
            "product": "MacBook Pro",
            "rewardValue": "10% Off",
            "message": "Power through complex projects with the ultimate high-performance professional laptop.",
            "valueLine": "10% off MacBook Pro saves $200 on a $2,000 professional setup.",
            "valueMath": "10% * $2,000 ≈ $200",
            "cta": "Upgrade Your Tech",
            "signal": "boost",
            "signalReason": "Frequent purchases of productivity software indicate a need for upgraded hardware.",
            "boostCategory": "Work Laptops"
          },
          {
            "id": "le1_d4",
            "merchant": "Coursera",
            "product": "Leadership Certificate Programs",
            "rewardValue": "15% Off",
            "message": "Master advanced management skills with executive education from top-tier universities.",
            "valueLine": "15% off professional certification saves $60 on a $400 course.",
            "valueMath": "15% * $400 ≈ $60",
            "cta": "Lead with Confidence",
            "signal": "boost",
            "signalReason": "Completed introductory project management courses → ready for executive leadership training.",
            "boostCategory": "Executive Education"
          },
          {
            "id": "le1_d5",
            "merchant": "Tumi",
            "product": "Premium Business Briefcases",
            "rewardValue": "15% Off",
            "message": "Protect your tech and travel smarter with a durable ballistic nylon briefcase.",
            "valueLine": "15% off premium briefcase saves $75 on a $500 commute essential.",
            "valueMath": "15% * $500 ≈ $75",
            "cta": "Commute Smarter",
            "signal": "boost",
            "signalReason": "Three Uber rides to downtown business district weekly implies regular corporate commute.",
            "boostCategory": "Business Luggage"
          }
        ]
      },
      {
        "rollup": "Cash sitting idle",
        "pillar": "Financial Signal",
        "collectionMessage": "Put your idle cash to work and earn more today.",
        "suppressedCategories": [],
        "imageCategory": "investment",
        "imageQuery": "piggy bank coins savings",
        "deals": [
          {
            "id": "fs1_d1",
            "merchant": "Our Bank",
            "product": "High-Yield Savings Account",
            "rewardValue": "4.50% APY",
            "message": "Put your idle cash to work with a market-leading yield.",
            "valueLine": "Earn ~$1,125/yr on $25,000 of idle cash at 4.50% APY.",
            "valueMath": "4.50% APY × $25,000 = $1,125/yr",
            "cta": "Open Account",
            "signal": "boost",
            "signalReason": "Uninvested cash balance detected",
            "boostCategory": "HYSA"
          },
          {
            "id": "fs1_d2",
            "merchant": "Our Bank",
            "product": "11-Month Fixed CD",
            "rewardValue": "5.00% APY",
            "message": "Lock in a high guaranteed rate for your idle cash.",
            "valueLine": "Earn ~$1,250 in 11 months on a $25,000 CD deposit.",
            "valueMath": "5.00% APY × $25,000 = $1,250/yr",
            "cta": "Lock Your Rate",
            "signal": "boost",
            "signalReason": "Uninvested cash balance detected",
            "boostCategory": "Fixed CD"
          },
          {
            "id": "fs1_d3",
            "merchant": "Our Bank",
            "product": "Guided Investing Portfolio",
            "rewardValue": "$0 Advisory Fee",
            "message": "Automate your investing with low fees and personalized portfolios.",
            "valueLine": "Save ~$62.50/yr in advisory fees on a $25,000 managed portfolio.",
            "valueMath": "0.25% fee waived × $25,000 = $62.50/yr",
            "cta": "Start Investing",
            "signal": "boost",
            "signalReason": "Uninvested cash balance detected",
            "boostCategory": "Guided Investing"
          },
          {
            "id": "fs1_d4",
            "merchant": "Our Bank",
            "product": "Tax-Advantaged IRA",
            "rewardValue": "$100 Match",
            "message": "Maximize your retirement savings with tax-advantaged growth.",
            "valueLine": "Get a ~$100 bonus plus tax savings on a $7,000 contribution.",
            "valueMath": "$100 match + tax savings on $7k contribution",
            "cta": "Open an IRA",
            "signal": "boost",
            "signalReason": "Uninvested cash balance detected",
            "boostCategory": "IRA Savings"
          },
          {
            "id": "fs1_d5",
            "merchant": "Our Bank",
            "product": "Premium Money Market Account",
            "rewardValue": "4.25% APY",
            "message": "Enjoy high yield plus check-writing access for your cash.",
            "valueLine": "Earn ~$1,062/yr on $25,000 while maintaining check access.",
            "valueMath": "4.25% APY × $25,000 = $1,062.50/yr",
            "cta": "Apply Now",
            "signal": "boost",
            "signalReason": "Uninvested cash balance detected",
            "boostCategory": "Money Market"
          }
        ]
      }
    ],
    "productCards": [
      {
        "product_name": "Our Bank Premium Rewards Card",
        "offer_headline": "Earn 2.00% cash back with Our Bank Premium Rewards Card",
        "theme": "lifestyle",
        "type": "life_event",
        "signal_label": "Career step-up",
        "cta_sub": "Takes under 3 minutes to apply",
        "eligibility": "Pre-approved · Based on private relationship",
        "cta": "Prepare for the Milestone",
        "quote": "A rewards card for this next chapter could return an estimated $1,200 annually.",
        "benefits": [
          "Earn 2.00% cash back on all retail purchases",
          "Receive $200 annual statement credit for career services",
          "No foreign transaction fees on international travel"
        ]
      },
      {
        "benefits": [
          "Earn 3x points on designer fashion and retail brands",
          "Receive a $100 annual style and wardrobe credit",
          "Enjoy complimentary purchase protection up to $10,000"
        ],
        "eligibility": "Pre-qualified for Private Banking clients",
        "cta": "Elevate Your Shopping Routine",
        "quote": "Boutique purchases could earn roughly $192 back each season.",
        "offer_headline": "Earn 3x points on high-end fashion and retail purchases",
        "signal_label": "Fashion and retail regular",
        "product_name": "Our Bank Customized Cash Rewards Card",
        "theme": "shopping",
        "cta_sub": "Soft credit check only · No impact",
        "type": "behavioral"
      },
      {
        "quote": "Moving idle cash to savings could earn an estimated $2,250 more each year.",
        "benefits": [
          "Earn 4.50% APY — 10x the national average savings rate",
          "Enjoy $0 monthly service fees and $0 transfer fees",
          "Keep your funds fully secure with FDIC insurance up to $250,000"
        ],
        "cta": "Maximize Your Cash Reserves",
        "offer_headline": "Earn 4.50% APY with Our Bank Advantage Savings",
        "cta_sub": "Move funds instantly with zero friction",
        "signal_label": "Cash sitting idle",
        "theme": "retirement",
        "type": "financial_signal",
        "eligibility": "Open with as little as $100",
        "product_name": "Our Bank Advantage Savings"
      }
    ]
  }
} as unknown as Record<string, PersonalizationSnapshot>;

export function getPersonalizationSnapshot(customerId: string): PersonalizationSnapshot | null {
  return SNAPSHOTS[customerId] ?? null;
}
