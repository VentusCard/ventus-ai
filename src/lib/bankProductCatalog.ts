import {
  CreditCard,
  Wallet,
  PiggyBank,
  Home,
  Car,
  LineChart,
  Landmark,
  Briefcase,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface BankProduct {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  /** Headline price/rate (reference / sample values). */
  pricing?: string;
  /** Key terms line (reference / sample values). */
  terms?: string;
}

export interface BankProductCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for the small icon chip — keep light-theme. */
  accent: string;
  description: string;
  products: BankProduct[];
}

export const BANK_PRODUCT_CATEGORIES: BankProductCategory[] = [
  {
    id: "credit-cards",
    label: "Credit Cards",
    icon: CreditCard,
    accent: "bg-blue-50 text-blue-600 border-blue-200",
    description: "Consumer credit portfolio across cash back, travel, and co-brand.",
    products: [
      { id: "cc-customized-cash", name: "Customized Cash Rewards", tagline: "3% category of choice, 2% groceries & wholesale clubs.", pricing: "$0 annual fee", terms: "Variable purchase APR 19.24%–29.24%; 0% intro APR 15 billing cycles" },
      { id: "cc-unlimited-cash", name: "Unlimited Cash Rewards", tagline: "Flat 1.5% cash back on every purchase.", pricing: "$0 annual fee", terms: "Variable purchase APR 19.24%–29.24%; 0% intro APR 15 billing cycles" },
      { id: "cc-travel-rewards", name: "Travel Rewards", tagline: "1.5x points on all purchases, no foreign transaction fees.", pricing: "$0 annual fee", terms: "Variable APR 19.24%–29.24%; 0% FX fee" },
      { id: "cc-premium-rewards", name: "Premium Rewards", tagline: "2x travel & dining, $95 annual fee with airline credits.", pricing: "$95 annual fee", terms: "Variable APR 22.24%–29.24%; $100 annual airline incidental credit" },
      { id: "cc-premium-rewards-elite", name: "Premium Rewards Elite", tagline: "Lounge access, $550 fee, premium travel & lifestyle credits.", pricing: "$550 annual fee", terms: "$300 airline incidental + $150 lifestyle credits; Priority Pass Select" },
      { id: "cc-bankamericard", name: "BankAmericard", tagline: "Long 0% intro APR for balance transfers and purchases.", pricing: "$0 annual fee", terms: "0% intro APR 18 billing cycles; 3% balance transfer fee (60 days)" },
      { id: "cc-bankamericard-secured", name: "BankAmericard Secured", tagline: "Credit building card with refundable security deposit.", pricing: "$0 annual fee", terms: "Refundable deposit $300–$4,900; variable APR 28.24%" },
      { id: "cc-susan-g-komen", name: "Susan G. Komen Cash Rewards", tagline: "Affinity cash back card supporting Komen mission.", pricing: "$0 annual fee", terms: "Variable APR 19.24%–29.24%; 0.08% donated per purchase" },
      { id: "cc-alaska-visa", name: "Alaska Airlines Visa Signature", tagline: "Famous Companion Fare and Alaska Mileage Plan miles.", pricing: "$95 annual fee", terms: "Variable APR 21.24%–29.24%; annual $122 Companion Fare" },
      { id: "cc-alaska-business", name: "Alaska Airlines Business", tagline: "Business co-brand with annual Companion Fare.", pricing: "$70 + $25 per card annual fee", terms: "Variable APR 21.24%–29.24%; annual Companion Fare" },
      { id: "cc-airfrance-klm", name: "Air France KLM World Elite", tagline: "Flying Blue miles, status accelerators, lounge passes.", pricing: "$89 annual fee", terms: "Variable APR 21.24%–29.24%; 2 lounge passes per year" },
      { id: "cc-free-spirit-elite", name: "Free Spirit Travel More World Elite", tagline: "Spirit Airlines co-brand with status and bonus points.", pricing: "$79 annual fee", terms: "Variable APR 21.24%–29.24%; Silver status at $10k spend" },
    ],
  },
  {
    id: "deposit",
    label: "Debit & Checking",
    icon: Wallet,
    accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
    description: "Everyday transaction accounts and Preferred Rewards tiering.",
    products: [
      { id: "dep-safebalance", name: "Advantage SafeBalance Banking", tagline: "Checkless account with no overdraft fees.", pricing: "$4.95/mo", terms: "Waived for under-25 students; no overdraft fees" },
      { id: "dep-plus", name: "Advantage Plus Banking", tagline: "Flexible checking with optional overdraft protection.", pricing: "$12/mo", terms: "Waived with $250 direct deposit or $1,500 min balance" },
      { id: "dep-relationship", name: "Advantage Relationship Banking", tagline: "Interest checking with tiered relationship benefits.", pricing: "$25/mo", terms: "Waived with $20,000 combined balance; tiered interest" },
      { id: "dep-preferred-rewards", name: "Preferred Rewards Program", tagline: "Gold / Platinum / Platinum Honors / Diamond tier benefits.", badge: "Tiered", pricing: "No fee to enroll", terms: "Tiers at $20k / $50k / $100k / $1M combined balances" },
      { id: "dep-safebalance-student", name: "SafeBalance for Students", tagline: "Fee-waived checking for students under 25.", pricing: "$0/mo", terms: "Fee waived while enrolled and under 25" },
      { id: "dep-custom-debit", name: "Custom Debit Card", tagline: "Personalized debit card art for any consumer account.", pricing: "$5 one-time design fee", terms: "Available on eligible consumer checking accounts" },
    ],
  },
  {
    id: "savings",
    label: "Savings & CDs",
    icon: PiggyBank,
    accent: "bg-amber-50 text-amber-600 border-amber-200",
    description: "Liquid savings and term deposits.",
    products: [
      { id: "sav-advantage", name: "Advantage Savings", tagline: "Variable-rate savings with Preferred Rewards interest boost.", pricing: "0.01%–0.04% APY", terms: "$100 min opening; $8/mo fee waived with $500 balance" },
      { id: "sav-featured-cd", name: "Featured CD", tagline: "Promotional rate certificates of deposit.", pricing: "Promotional APY (7 & 13 mo)", terms: "$1,000 minimum; early withdrawal penalty applies" },
      { id: "sav-fixed-cd", name: "Fixed-Term CD", tagline: "Standard term CDs from 28 days to 10 years.", pricing: "0.03%–0.05% APY (sample)", terms: "$1,000 min; terms 28 days–10 years" },
      { id: "sav-flexible-cd", name: "Flexible CD", tagline: "9-month CD with one penalty-free withdrawal.", pricing: "0.03% APY (sample)", terms: "$1,000 min; one penalty-free withdrawal after 6 days" },
      { id: "sav-minor", name: "Minor Savings", tagline: "Custodial savings account for under-18 beneficiaries.", pricing: "0.01% APY", terms: "$25 min opening; monthly fee waived while minor" },
    ],
  },
  {
    id: "home-loans",
    label: "Home Loans",
    icon: Home,
    accent: "bg-violet-50 text-violet-600 border-violet-200",
    description: "Mortgages, refinance, and home equity.",
    products: [
      { id: "hl-fixed", name: "Fixed-Rate Mortgage", tagline: "15/20/30-year conforming purchase loans.", pricing: "~6.75% APR (30-yr sample)", terms: "15/20/30-yr; 3% min down with PMI" },
      { id: "hl-arm", name: "Adjustable-Rate Mortgage (ARM)", tagline: "5/6, 7/6, 10/6 ARMs with introductory rate periods.", pricing: "~6.25% APR (7/6 sample)", terms: "Rate adjusts every 6 mo after intro; SOFR + margin" },
      { id: "hl-fha", name: "FHA Loan", tagline: "Low down-payment loan backed by FHA.", pricing: "~6.50% APR (sample)", terms: "3.5% min down; upfront + annual MIP required" },
      { id: "hl-va", name: "VA Loan", tagline: "Zero-down financing for eligible veterans and service members.", pricing: "~6.35% APR (sample)", terms: "$0 down; VA funding fee 1.25%–3.3%" },
      { id: "hl-affordable", name: "Affordable Loan Solution", tagline: "3% down, no mortgage insurance for eligible buyers.", badge: "BofA proprietary", pricing: "~6.60% APR (sample)", terms: "3% min down; no PMI; income limits apply" },
      { id: "hl-jumbo", name: "Jumbo Mortgage", tagline: "Loans above conforming limits for high-value properties.", pricing: "~6.85% APR (sample)", terms: "Loan amount > $766,550 (2024 limit); 10%+ down typical" },
      { id: "hl-heloc", name: "Home Equity Line of Credit", tagline: "Variable-rate revolving line secured by home equity.", pricing: "Prime + margin (variable)", terms: "10-yr draw / 20-yr repay; up to 85% CLTV" },
      { id: "hl-refi", name: "Mortgage Refinance", tagline: "Rate-and-term and cash-out refinance options.", pricing: "~6.75% APR (sample)", terms: "Rate/term or cash-out; up to 80% LTV cash-out" },
    ],
  },
  {
    id: "auto-personal",
    label: "Auto & Personal Lending",
    icon: Car,
    accent: "bg-rose-50 text-rose-600 border-rose-200",
    description: "Vehicle financing and equity lending.",
    products: [
      { id: "auto-new", name: "New Auto Loan", tagline: "Financing for new vehicles purchased at dealerships.", pricing: "From 6.29% APR", terms: "12–75 mo; up to $100k; Preferred Rewards discount" },
      { id: "auto-used", name: "Used Auto Loan", tagline: "Financing for used vehicles up to model-year limits.", pricing: "From 6.59% APR", terms: "12–75 mo; vehicles < 10 years / < 125k miles" },
      { id: "auto-refi", name: "Auto Refinance", tagline: "Refinance an existing auto loan from another lender.", pricing: "From 6.79% APR", terms: "12–75 mo; $7,500 min loan amount" },
      { id: "auto-lease-buyout", name: "Lease Buyout", tagline: "Purchase a vehicle at the end of an existing lease.", pricing: "From 6.99% APR", terms: "12–75 mo; up to $100k" },
      { id: "auto-vehicle-equity", name: "Vehicle Equity Loan", tagline: "Borrow against the equity in a paid-off vehicle.", pricing: "From 7.49% APR", terms: "12–60 mo; requires lien-free title" },
    ],
  },
  {
    id: "investing",
    label: "Investing — Merrill",
    icon: LineChart,
    accent: "bg-indigo-50 text-indigo-600 border-indigo-200",
    description: "Self-directed, guided, and advisor-led investing.",
    products: [
      { id: "inv-self-directed", name: "Merrill Edge Self-Directed", tagline: "Commission-free online stock and ETF trading.", pricing: "$0 online equity & ETF trades", terms: "No account minimum; $0.65/contract options" },
      { id: "inv-guided", name: "Merrill Guided Investing", tagline: "Digital portfolio management by Merrill investment team.", pricing: "0.45% annual advisory fee", terms: "$1,000 minimum; digital-only" },
      { id: "inv-guided-advisor", name: "Merrill Guided Investing with Advisor", tagline: "Digital portfolios paired with a dedicated advisor.", pricing: "0.85% annual advisory fee", terms: "$20,000 minimum; dedicated advisor access" },
      { id: "inv-ml-wealth", name: "Merrill Lynch Wealth Management", tagline: "Full-service financial advisor relationship.", pricing: "Advisor-negotiated fee schedule", terms: "Typically $250k+ investable assets" },
      { id: "inv-trad-ira", name: "Traditional IRA", tagline: "Tax-deferred retirement account.", pricing: "$0 account fee", terms: "$7,000 annual contribution limit (2024); $8,000 age 50+" },
      { id: "inv-roth-ira", name: "Roth IRA", tagline: "Tax-free growth retirement account.", pricing: "$0 account fee", terms: "Income phase-outs apply; $7,000 annual limit" },
      { id: "inv-rollover-ira", name: "Rollover IRA", tagline: "Consolidate 401(k) and prior-employer plans.", pricing: "$0 rollover fee", terms: "Direct or indirect rollovers supported" },
      { id: "inv-sep-ira", name: "SEP IRA", tagline: "Retirement plan for self-employed and small business owners.", pricing: "$0 account fee", terms: "Contributions up to 25% of comp or $69,000 (2024)" },
      { id: "inv-529", name: "529 College Savings Plan", tagline: "Tax-advantaged education savings account.", pricing: "Plan-specific fees (0.10%–0.50%)", terms: "State tax benefits vary; up to $18k/yr gift exclusion" },
      { id: "inv-custodial", name: "Custodial UGMA / UTMA", tagline: "Investment account held for the benefit of a minor.", pricing: "$0 account fee", terms: "Assets transfer at age of majority (state-dependent)" },
    ],
  },
  {
    id: "wealth",
    label: "Wealth & Private Bank",
    icon: Landmark,
    accent: "bg-sky-50 text-sky-600 border-sky-200",
    description: "Private Bank services for high-net-worth clients.",
    products: [
      { id: "wm-private-bank", name: "Bank of America Private Bank", tagline: "Integrated wealth management for HNW relationships.", pricing: "Custom advisory fee schedule", terms: "Typically $3M+ investable assets" },
      { id: "wm-trust", name: "Trust Services", tagline: "Revocable, irrevocable, and charitable trust administration.", pricing: "Fee based on assets under administration", terms: "Requires trust document and funding" },
      { id: "wm-estate", name: "Estate Planning Services", tagline: "Wealth transfer, legacy, and estate structuring.", pricing: "Included in Private Bank relationship", terms: "Coordinated with client's attorney and CPA" },
      { id: "wm-philanthropy", name: "Philanthropic Solutions", tagline: "Donor-advised funds and private foundation services.", pricing: "Tiered admin fee (0.60%–1.00%)", terms: "$25,000 minimum DAF contribution" },
      { id: "wm-specialty-assets", name: "Specialty Asset Management", tagline: "Real estate, farm, ranch, and closely-held business assets.", pricing: "Custom fee by asset type", terms: "Ongoing management & valuation services" },
      { id: "wm-family-office", name: "Family Office Services", tagline: "Multi-generational planning and family governance.", pricing: "Retainer + AUM fee schedule", terms: "Typically $50M+ family net worth" },
    ],
  },
  {
    id: "small-business",
    label: "Small Business & Insurance",
    icon: Briefcase,
    accent: "bg-teal-50 text-teal-600 border-teal-200",
    description: "Business banking, lending, and merchant services.",
    products: [
      { id: "sb-checking", name: "Business Advantage Checking", tagline: "Fundamentals and Relationship Banking tiers for SMB.", pricing: "$16/mo (Fundamentals) or $29.95/mo (Relationship)", terms: "Fundamentals waived w/ $5k avg balance or $250 card spend" },
      { id: "sb-savings", name: "Business Advantage Savings", tagline: "Interest-bearing savings for business reserves.", pricing: "0.01%–0.04% APY", terms: "$10/mo fee waived with $2,500 balance" },
      { id: "sb-cc-cash", name: "Business Customized / Unlimited Cash Cards", tagline: "Cash back business credit cards.", badge: "Series", pricing: "$0 annual fee", terms: "Variable APR 18.49%–28.49%; Preferred Rewards for Business bonus" },
      { id: "sb-cc-travel", name: "Business Travel Rewards Card", tagline: "Travel points business card with no annual fee.", pricing: "$0 annual fee", terms: "Variable APR 18.49%–28.49%; no FX fees" },
      { id: "sb-cc-platinum-plus", name: "Business Platinum Plus Mastercard", tagline: "Low-rate business card for everyday expenses.", pricing: "$0 annual fee", terms: "Variable APR 15.24%–25.24%; 0% intro 7 cycles" },
      { id: "sb-loc", name: "Business Line of Credit", tagline: "Revolving working-capital credit line.", pricing: "From Prime + 1.50%", terms: "Unsecured up to $100k; secured up to $250k" },
      { id: "sb-sba", name: "SBA Loans", tagline: "7(a), 504, and Express SBA-guaranteed financing.", pricing: "Prime + 2.75%–4.75%", terms: "Up to $5M; 10–25 yr terms; SBA guarantee fees apply" },
      { id: "sb-practice", name: "Practice Solutions", tagline: "Specialized lending for medical and dental practices.", pricing: "Custom-priced by specialty", terms: "Up to 100% financing; terms up to 15 yrs" },
      { id: "sb-equipment", name: "Equipment Financing", tagline: "Term loans and leases for business equipment.", pricing: "From 6.75% APR (sample)", terms: "$25k+ loans; terms up to 60 mo" },
      { id: "sb-merchant", name: "Merchant Services", tagline: "Payment acceptance, terminals, and gateway services.", pricing: "Interchange + 0.25% + $0.10 (sample)", terms: "3-year merchant agreement; hardware sold or leased" },
    ],
  },
  {
    id: "protection",
    label: "Protection & Services",
    icon: ShieldCheck,
    accent: "bg-slate-100 text-slate-600 border-slate-200",
    description: "Liquidity safety nets and digital banking services.",
    products: [
      { id: "ps-balance-assist", name: "Balance Assist", tagline: "Short-term small-dollar loan up to $500.", pricing: "$5 flat fee", terms: "$100–$500; repay in 3 monthly installments" },
      { id: "ps-overdraft", name: "Overdraft Protection", tagline: "Link a savings or credit account to cover overdrafts.", pricing: "$0 transfer fee", terms: "Linked eligible deposit or credit account required" },
      { id: "ps-identity", name: "Identity Protection", tagline: "Credit monitoring and identity theft alerts.", pricing: "From $14.99/mo (3rd-party)", terms: "Delivered via partner; enrollment through banking app" },
      { id: "ps-digital", name: "Mobile & Online Banking", tagline: "Digital banking apps, alerts, and money management.", pricing: "Free", terms: "Included with all consumer & small business accounts" },
      { id: "ps-zelle", name: "Zelle", tagline: "Send and receive money between U.S. bank accounts.", pricing: "Free", terms: "Send limits by account tier; U.S. bank accounts only" },
      { id: "ps-erica", name: "Erica AI Assistant", tagline: "Virtual financial assistant inside the BofA mobile app.", pricing: "Free", terms: "Included with mobile banking; English & Spanish" },
    ],
  },
];

export const BANK_PRODUCT_TOTAL = BANK_PRODUCT_CATEGORIES.reduce(
  (sum, c) => sum + c.products.length,
  0,
);
