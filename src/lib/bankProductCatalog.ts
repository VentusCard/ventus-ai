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
      { id: "cc-customized-cash", name: "Customized Cash Rewards", tagline: "3% category of choice, 2% groceries & wholesale clubs." },
      { id: "cc-unlimited-cash", name: "Unlimited Cash Rewards", tagline: "Flat 1.5% cash back on every purchase." },
      { id: "cc-travel-rewards", name: "Travel Rewards", tagline: "1.5x points on all purchases, no foreign transaction fees." },
      { id: "cc-premium-rewards", name: "Premium Rewards", tagline: "2x travel & dining, $95 annual fee with airline credits." },
      { id: "cc-premium-rewards-elite", name: "Premium Rewards Elite", tagline: "Lounge access, $550 fee, premium travel & lifestyle credits." },
      { id: "cc-bankamericard", name: "BankAmericard", tagline: "Long 0% intro APR for balance transfers and purchases." },
      { id: "cc-bankamericard-secured", name: "BankAmericard Secured", tagline: "Credit building card with refundable security deposit." },
      { id: "cc-susan-g-komen", name: "Susan G. Komen Cash Rewards", tagline: "Affinity cash back card supporting Komen mission." },
      { id: "cc-alaska-visa", name: "Alaska Airlines Visa Signature", tagline: "Famous Companion Fare and Alaska Mileage Plan miles." },
      { id: "cc-alaska-business", name: "Alaska Airlines Business", tagline: "Business co-brand with annual Companion Fare." },
      { id: "cc-airfrance-klm", name: "Air France KLM World Elite", tagline: "Flying Blue miles, status accelerators, lounge passes." },
      { id: "cc-free-spirit-elite", name: "Free Spirit Travel More World Elite", tagline: "Spirit Airlines co-brand with status and bonus points." },
    ],
  },
  {
    id: "deposit",
    label: "Debit & Checking",
    icon: Wallet,
    accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
    description: "Everyday transaction accounts and Preferred Rewards tiering.",
    products: [
      { id: "dep-safebalance", name: "Advantage SafeBalance Banking", tagline: "Checkless account with no overdraft fees." },
      { id: "dep-plus", name: "Advantage Plus Banking", tagline: "Flexible checking with optional overdraft protection." },
      { id: "dep-relationship", name: "Advantage Relationship Banking", tagline: "Interest checking with tiered relationship benefits." },
      { id: "dep-preferred-rewards", name: "Preferred Rewards Program", tagline: "Gold / Platinum / Platinum Honors / Diamond tier benefits.", badge: "Tiered" },
      { id: "dep-safebalance-student", name: "SafeBalance for Students", tagline: "Fee-waived checking for students under 25." },
      { id: "dep-custom-debit", name: "Custom Debit Card", tagline: "Personalized debit card art for any consumer account." },
    ],
  },
  {
    id: "savings",
    label: "Savings & CDs",
    icon: PiggyBank,
    accent: "bg-amber-50 text-amber-600 border-amber-200",
    description: "Liquid savings and term deposits.",
    products: [
      { id: "sav-advantage", name: "Advantage Savings", tagline: "Variable-rate savings with Preferred Rewards interest boost." },
      { id: "sav-featured-cd", name: "Featured CD", tagline: "Promotional rate certificates of deposit." },
      { id: "sav-fixed-cd", name: "Fixed-Term CD", tagline: "Standard term CDs from 28 days to 10 years." },
      { id: "sav-flexible-cd", name: "Flexible CD", tagline: "9-month CD with one penalty-free withdrawal." },
      { id: "sav-minor", name: "Minor Savings", tagline: "Custodial savings account for under-18 beneficiaries." },
    ],
  },
  {
    id: "home-loans",
    label: "Home Loans",
    icon: Home,
    accent: "bg-violet-50 text-violet-600 border-violet-200",
    description: "Mortgages, refinance, and home equity.",
    products: [
      { id: "hl-fixed", name: "Fixed-Rate Mortgage", tagline: "15/20/30-year conforming purchase loans." },
      { id: "hl-arm", name: "Adjustable-Rate Mortgage (ARM)", tagline: "5/6, 7/6, 10/6 ARMs with introductory rate periods." },
      { id: "hl-fha", name: "FHA Loan", tagline: "Low down-payment loan backed by FHA." },
      { id: "hl-va", name: "VA Loan", tagline: "Zero-down financing for eligible veterans and service members." },
      { id: "hl-affordable", name: "Affordable Loan Solution", tagline: "3% down, no mortgage insurance for eligible buyers.", badge: "BofA proprietary" },
      { id: "hl-jumbo", name: "Jumbo Mortgage", tagline: "Loans above conforming limits for high-value properties." },
      { id: "hl-heloc", name: "Home Equity Line of Credit", tagline: "Variable-rate revolving line secured by home equity." },
      { id: "hl-refi", name: "Mortgage Refinance", tagline: "Rate-and-term and cash-out refinance options." },
    ],
  },
  {
    id: "auto-personal",
    label: "Auto & Personal Lending",
    icon: Car,
    accent: "bg-rose-50 text-rose-600 border-rose-200",
    description: "Vehicle financing and equity lending.",
    products: [
      { id: "auto-new", name: "New Auto Loan", tagline: "Financing for new vehicles purchased at dealerships." },
      { id: "auto-used", name: "Used Auto Loan", tagline: "Financing for used vehicles up to model-year limits." },
      { id: "auto-refi", name: "Auto Refinance", tagline: "Refinance an existing auto loan from another lender." },
      { id: "auto-lease-buyout", name: "Lease Buyout", tagline: "Purchase a vehicle at the end of an existing lease." },
      { id: "auto-vehicle-equity", name: "Vehicle Equity Loan", tagline: "Borrow against the equity in a paid-off vehicle." },
    ],
  },
  {
    id: "investing",
    label: "Investing — Merrill",
    icon: LineChart,
    accent: "bg-indigo-50 text-indigo-600 border-indigo-200",
    description: "Self-directed, guided, and advisor-led investing.",
    products: [
      { id: "inv-self-directed", name: "Merrill Edge Self-Directed", tagline: "Commission-free online stock and ETF trading." },
      { id: "inv-guided", name: "Merrill Guided Investing", tagline: "Digital portfolio management by Merrill investment team." },
      { id: "inv-guided-advisor", name: "Merrill Guided Investing with Advisor", tagline: "Digital portfolios paired with a dedicated advisor." },
      { id: "inv-ml-wealth", name: "Merrill Lynch Wealth Management", tagline: "Full-service financial advisor relationship." },
      { id: "inv-trad-ira", name: "Traditional IRA", tagline: "Tax-deferred retirement account." },
      { id: "inv-roth-ira", name: "Roth IRA", tagline: "Tax-free growth retirement account." },
      { id: "inv-rollover-ira", name: "Rollover IRA", tagline: "Consolidate 401(k) and prior-employer plans." },
      { id: "inv-sep-ira", name: "SEP IRA", tagline: "Retirement plan for self-employed and small business owners." },
      { id: "inv-529", name: "529 College Savings Plan", tagline: "Tax-advantaged education savings account." },
      { id: "inv-custodial", name: "Custodial UGMA / UTMA", tagline: "Investment account held for the benefit of a minor." },
    ],
  },
  {
    id: "wealth",
    label: "Wealth & Private Bank",
    icon: Landmark,
    accent: "bg-sky-50 text-sky-600 border-sky-200",
    description: "Private Bank services for high-net-worth clients.",
    products: [
      { id: "wm-private-bank", name: "Bank of America Private Bank", tagline: "Integrated wealth management for HNW relationships." },
      { id: "wm-trust", name: "Trust Services", tagline: "Revocable, irrevocable, and charitable trust administration." },
      { id: "wm-estate", name: "Estate Planning Services", tagline: "Wealth transfer, legacy, and estate structuring." },
      { id: "wm-philanthropy", name: "Philanthropic Solutions", tagline: "Donor-advised funds and private foundation services." },
      { id: "wm-specialty-assets", name: "Specialty Asset Management", tagline: "Real estate, farm, ranch, and closely-held business assets." },
      { id: "wm-family-office", name: "Family Office Services", tagline: "Multi-generational planning and family governance." },
    ],
  },
  {
    id: "small-business",
    label: "Small Business & Insurance",
    icon: Briefcase,
    accent: "bg-teal-50 text-teal-600 border-teal-200",
    description: "Business banking, lending, and merchant services.",
    products: [
      { id: "sb-checking", name: "Business Advantage Checking", tagline: "Fundamentals and Relationship Banking tiers for SMB." },
      { id: "sb-savings", name: "Business Advantage Savings", tagline: "Interest-bearing savings for business reserves." },
      { id: "sb-cc-cash", name: "Business Customized / Unlimited Cash Cards", tagline: "Cash back business credit cards.", badge: "Series" },
      { id: "sb-cc-travel", name: "Business Travel Rewards Card", tagline: "Travel points business card with no annual fee." },
      { id: "sb-cc-platinum-plus", name: "Business Platinum Plus Mastercard", tagline: "Low-rate business card for everyday expenses." },
      { id: "sb-loc", name: "Business Line of Credit", tagline: "Revolving working-capital credit line." },
      { id: "sb-sba", name: "SBA Loans", tagline: "7(a), 504, and Express SBA-guaranteed financing." },
      { id: "sb-practice", name: "Practice Solutions", tagline: "Specialized lending for medical and dental practices." },
      { id: "sb-equipment", name: "Equipment Financing", tagline: "Term loans and leases for business equipment." },
      { id: "sb-merchant", name: "Merchant Services", tagline: "Payment acceptance, terminals, and gateway services." },
    ],
  },
  {
    id: "protection",
    label: "Protection & Services",
    icon: ShieldCheck,
    accent: "bg-slate-100 text-slate-600 border-slate-200",
    description: "Liquidity safety nets and digital banking services.",
    products: [
      { id: "ps-balance-assist", name: "Balance Assist", tagline: "Short-term small-dollar loan up to $500." },
      { id: "ps-overdraft", name: "Overdraft Protection", tagline: "Link a savings or credit account to cover overdrafts." },
      { id: "ps-identity", name: "Identity Protection", tagline: "Credit monitoring and identity theft alerts." },
      { id: "ps-digital", name: "Mobile & Online Banking", tagline: "Digital banking apps, alerts, and money management." },
      { id: "ps-zelle", name: "Zelle", tagline: "Send and receive money between U.S. bank accounts." },
      { id: "ps-erica", name: "Erica AI Assistant", tagline: "Virtual financial assistant inside the BofA mobile app." },
    ],
  },
];

export const BANK_PRODUCT_TOTAL = BANK_PRODUCT_CATEGORIES.reduce(
  (sum, c) => sum + c.products.length,
  0,
);
