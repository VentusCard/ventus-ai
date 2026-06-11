// Auto-generated. Static per-signal microsegment campaign emails for each automated flow.
export interface FlowMicrosegment {
  signalLabel: string;
  title: string;
  subject: string;
  body: string;
  cta: string;
}

export const FLOW_MICROSEGMENTS: Record<string, FlowMicrosegment[]> = {
  "529-plan": [
    {
      "signalLabel": "[life-event] Newborn purchase cluster \u2014 Buy Buy Baby, Carter's, pediatric copays within 90 days",
      "title": "New Parents College Savings",
      "subject": "Save for their bright future!",
      "body": "Hi {{first_name}}, congratulations on this exciting new chapter! It's never too early to start planning for your child's education, and a 529 College Savings Plan can help you get there.",
      "cta": "Plan for College"
    },
    {
      "signalLabel": "[life-event] Dependent age inference (0\u20132 yrs) \u2014 Diaper subscriptions, daycare ACH, formula brands",
      "title": "Parents of Toddlers College Savings",
      "subject": "Building their education fund!",
      "body": "Hi {{first_name}}, watching your little one grow is wonderful! A 529 College Savings Plan can help you nurture their future academic dreams with tax advantages.",
      "cta": "Start Saving Today"
    },
    {
      "signalLabel": "[life-event] College-age dependent (16\u201318 yrs) \u2014 Private school tuition, SAT/ACT fees, college tour travel",
      "title": "Parents of College-Bound Students",
      "subject": "Prepare for college expenses!",
      "body": "Hi {{first_name}}, the college years are fast approaching! A 529 College Savings Plan offers a smart way to manage education costs with potential tax benefits.",
      "cta": "Explore 529 Plans"
    },
    {
      "signalLabel": "[behavioral] Stated savings intent \u2014 Search behavior for 'college savings' on bank web app",
      "title": "Expressed College Savings Interest",
      "subject": "Your college savings journey starts now!",
      "body": "Hi {{first_name}}, it's great you're thinking about saving for college! A 529 College Savings Plan can help you pursue your education funding goals with tax-advantaged growth.",
      "cta": "Learn About 529s"
    }
  ],
  "self-directed-brokerage": [
    {
      "signalLabel": "[behavioral] External brokerage transfers \u2014 Recurring ACH to third-party retail brokerage apps",
      "title": "External Brokerage Transfers",
      "subject": "A smart home for your investments",
      "body": "Hi {{first_name}}, Managing your investments can be an easy, rewarding experience. Bring your portfolio to us and discover new possibilities for growth.",
      "cta": "Explore investing"
    },
    {
      "signalLabel": "[behavioral] Crypto exchange activity \u2014 Card or ACH spend at major crypto on-ramps",
      "title": "Crypto Exchange Activity",
      "subject": "Trade crypto with confidence",
      "body": "Hi {{first_name}}, Ready to explore transparent and secure crypto trading? We offer the tools and insights to help you navigate the market with ease.",
      "cta": "Invest in crypto"
    },
    {
      "signalLabel": "[behavioral] Idle cash with investing intent \u2014 Checking balance > $10k + research-site visits in-app",
      "title": "Idle Cash Investing Intent",
      "subject": "Grow your savings with confidence",
      "body": "Hi {{first_name}}, You have a wonderful opportunity to grow your savings. Put your money to work and build a brighter financial future with smart investments.",
      "cta": "Start investing"
    }
  ],
  "robo-portfolio": [
    {
      "signalLabel": "[behavioral] First-time investor signals \u2014 Small recurring transfers to investing apps under $200",
      "title": "First-Time Investors",
      "subject": "Start investing with ease!",
      "body": "Hi {{first_name}}, Building your wealth can be simpler than you think. Discover a path to growing your money with confidence and without the jargon.",
      "cta": "Start Investing"
    },
    {
      "signalLabel": "[behavioral] Idle savings drift \u2014 Savings balance flat for 6+ months while income rises",
      "title": "Idle Savings",
      "subject": "Make your money work harder!",
      "body": "Hi {{first_name}}, Your savings are ready for a new adventure. Let's explore how to grow them effortlessly and reach your financial dreams sooner.",
      "cta": "Grow Savings"
    },
    {
      "signalLabel": "[behavioral] Stated goal-based intent \u2014 Goal-planner tool engagement in bank app",
      "title": "Goal-Oriented Planners",
      "subject": "Achieve your goals faster!",
      "body": "Hi {{first_name}}, You're already dreaming big, and we're here to help make those dreams a reality. Let's empower your financial goals with smart, simple strategies.",
      "cta": "Plan Your Future"
    }
  ],
  "hybrid-advisor-portfolio": [
    {
      "signalLabel": "[behavioral] Mass-affluent balance band \u2014 Investable assets $100k\u2013$1M across linked accounts",
      "title": "Mass-Affluent Balance Band",
      "subject": "Unlock new possibilities for your wealth!",
      "body": "Hi {{first_name}},\nDiscover how combining smart technology with expert financial guidance can help grow your investments. It\u2019s a powerful path to pursuing your financial dreams.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Advisor search engagement \u2014 Repeated visits to 'find an advisor' page",
      "title": "Advisor Search Engagement",
      "subject": "Personalized advice to guide your journey!",
      "body": "Hi {{first_name}},\nImagine having a dedicated financial expert to discuss your goals and help shape your financial future. We are here to support your ambitions.",
      "cta": "Connect now"
    },
    {
      "signalLabel": "[life-event] Life transition trigger \u2014 Inheritance deposit, severance, or business-sale inflow",
      "title": "Life Transition Trigger",
      "subject": "Navigate your next chapter with confidence!",
      "body": "Hi {{first_name}},\nAs life unfolds with new opportunities, our team is here to help you manage your finances with ease. Let\u2019s make the most of this exciting time together.",
      "cta": "Plan ahead"
    }
  ],
  "wealth-management": [
    {
      "signalLabel": "[behavioral] Large equity comp deposit \u2014 Quarterly RSU vest, ESPP buyback inflows",
      "title": "Equity Comp Recipient",
      "subject": "Unlock the potential of your recent equity",
      "body": "Hi {{first_name}},\nWe're here to help you make the most of your recent equity compensation. Let's explore strategies to grow and protect your financial future.",
      "cta": "Explore your options"
    },
    {
      "signalLabel": "[behavioral] Recurring brokerage transfers \u2014 Outbound ACH to external brokerage > $5k/mo",
      "title": "Active Investor",
      "subject": "Grow your investments with confidence",
      "body": "Hi {{first_name}},\n Seamlessly manage your investments and discover new opportunities. We're here to help you build a robust and diversified portfolio.",
      "cta": "View strategies"
    },
    {
      "signalLabel": "[behavioral] Country club dues \u2014 Recurring private club, golf, yacht club ACH",
      "title": "Club Member",
      "subject": "Enhance your financial lifestyle",
      "body": "Hi {{first_name}},\nEnjoy the finer things in life while simplifying your financial affairs. We offer tailored solutions to complement your distinguished lifestyle.",
      "cta": "Discover more"
    },
    {
      "signalLabel": "[behavioral] Private aviation indicator \u2014 Charter operator card spend, fractional jet membership",
      "title": "Private Aviation User",
      "subject": "Soar to new financial heights",
      "body": "Hi {{first_name}},\nExperience unparalleled financial guidance that matches your elevated lifestyle. Let's ensure your wealth journey is as smooth as your travels.",
      "cta": "Chart your course"
    }
  ],
  "private-wealth": [
    {
      "signalLabel": "[life-event] Eight-figure inflow event \u2014 Single deposit > $5M from M&A escrow or IPO",
      "title": "Sudden Wealth Recipient",
      "subject": "Make your new wealth work for you",
      "body": "Hi {{first_name}},\nThat recent influx opens doors to incredible possibilities. Let's explore how dedicated Private Wealth Management can help turn your financial milestones into lasting legacies.",
      "cta": "Explore Your Options"
    },
    {
      "signalLabel": "[behavioral] Multi-property tax footprint \u2014 Property tax ACH to 3+ counties annually",
      "title": "Multi-Property Owner",
      "subject": "Simplify your multi-property finances",
      "body": "Hi {{first_name}},\nManaging multiple properties can be complex. Discover how our Private Wealth Management team can streamline your financial life and optimize your holdings.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] Family office indicator \u2014 Recurring payroll outflows + multi-entity transfers",
      "title": "Family Office Candidate",
      "subject": "Elevate your family's financial future",
      "body": "Hi {{first_name}},\nImagine a future where your family's financial endeavors are seamlessly managed and strategically aligned. Our Private Wealth Management is here to help you achieve that vision.",
      "cta": "Learn How"
    }
  ],
  "ira": [
    {
      "signalLabel": "[life-event] Job change rollover trigger \u2014 Final payroll deposit followed by new employer ACH",
      "title": "Job Change Rollover",
      "subject": "A fresh start for your retirement savings!",
      "body": "Hi {{first_name}}, It looks like you're in a new chapter, and it's a great time to bring your retirement savings with you. Let's make sure your money keeps working hard for your future.",
      "cta": "Roll over now"
    },
    {
      "signalLabel": "[behavioral] Maxed 401(k) saver \u2014 Consistent pre-tax payroll deferrals near IRS limit",
      "title": "Maxed 401k Saver",
      "subject": "Unlock even more retirement savings!",
      "body": "Hi {{first_name}}, You're a super saver, and there are even more ways to boost your retirement nest egg! Discover options to grow your wealth with additional tax advantages.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Self-employed income \u2014 1099 deposits without W-2 payroll",
      "title": "Self-Employed Retirement",
      "subject": "Build your self-made retirement!",
      "body": "Hi {{first_name}}, As a self-starter, you have unique opportunities to build a powerful retirement fund. Explore smart ways to grow your wealth and enjoy financial comfort later.",
      "cta": "See your choices"
    }
  ],
  "trust-estate": [
    {
      "signalLabel": "[behavioral] Estate planning attorney spend \u2014 Recurring legal ACH plus notary fees",
      "title": "Estate Planning Engagement",
      "subject": "Secure your family's financial future",
      "body": "Hi {{first_name}}, Planning your estate can bring peace of mind, knowing your loved ones are cared for. We're here to help you navigate these important decisions with confidence.",
      "cta": "Plan with us"
    },
    {
      "signalLabel": "[life-event] Aging household signal \u2014 Primary holder 65+ with charitable giving uptick",
      "title": "Later Life Philanthropy",
      "subject": "Make a lasting impact with your legacy",
      "body": "Hi {{first_name}}, Many people find joy in giving back and creating a legacy. Discover how you can make a meaningful difference for generations to come.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Beneficiary update activity \u2014 In-app beneficiary form interactions",
      "title": "Beneficiary Review",
      "subject": "Keep your wishes up to date",
      "body": "Hi {{first_name}}, Life changes, and so can your plans. It's a great opportunity to confirm your beneficiaries reflect your current wishes.",
      "cta": "Review now"
    }
  ],
  "values-portfolio": [
    {
      "signalLabel": "[behavioral] Sustainable consumer pattern \u2014 Recurring spend at certified-B / organic grocers",
      "title": "Eco-Conscious Investor",
      "subject": "Invest in what you believe in",
      "body": "Hi {{first_name}},\nYou're making choices every day that reflect your values. Now, your investments can too, helping you grow your wealth while doing good.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Charitable giving cadence \u2014 Monthly donations to environmental or social causes",
      "title": "Philanthropic Investor",
      "subject": "Your giving can grow your future",
      "body": "Hi {{first_name}},\nEvery contribution you make helps build a better world. Imagine the impact your investments could have when aligned with your generous spirit.",
      "cta": "Discover portfolios"
    },
    {
      "signalLabel": "[behavioral] EV ownership \u2014 Charging network subscriptions and EV-tax-credit refund",
      "title": "Sustainable Living Investor",
      "subject": "Align your money with your mission",
      "body": "Hi {{first_name}},\nYou're already driving change with your lifestyle. Let your financial future reflect your commitment to a sustainable world.",
      "cta": "See how"
    }
  ],
  "mortgage": [
    {
      "signalLabel": "[behavioral] Rent above local median \u2014 Recurring rent ACH > regional 75th percentile",
      "title": "High Rent, Mortgage Opportunity",
      "subject": "Imagine your own home!",
      "body": "Hi {{first_name}}, Tired of paying rent? It might be the perfect time to explore buying a home and investing in your own future. Let's make it happen!",
      "cta": "Explore Mortgages"
    },
    {
      "signalLabel": "[life-event] Pre-approval inquiry \u2014 Soft-pull or rate-quote interaction in bank app",
      "title": "Pre-Approved Mortgage Inquiry",
      "subject": "Ready to find your dream home?",
      "body": "Hi {{first_name}}, You're one step closer to homeownership! Let's connect and turn that pre-approval into keys in your hand.",
      "cta": "Continue Application"
    },
    {
      "signalLabel": "[behavioral] Down-payment accumulation \u2014 Savings balance growth trajectory + low debt service",
      "title": "Saving for Down Payment",
      "subject": "Your homeownership dream is close!",
      "body": "Hi {{first_name}}, It's exciting to see you building towards a down payment. Let us help you take the next step toward owning your own home.",
      "cta": "Plan Your Mortgage"
    }
  ],
  "heloc": [
    {
      "signalLabel": "[behavioral] Home renovation spend \u2014 Home Depot, Lowe's, contractor ACH > $1,000",
      "title": "Home Renovation Enthusiasm",
      "subject": "Unlock your home's potential!",
      "body": "Hi {{first_name}}, Dreaming of a fresh new look for your home? A Home Equity Line of Credit can help you bring those renovation dreams to life with flexible financing.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Property tax payment \u2014 Annual or semi-annual county treasurer ACH",
      "title": "Property Tax Payer",
      "subject": "Put your home equity to work!",
      "body": "Hi {{first_name}}, Your home can help you achieve your financial goals. A Home Equity Line of Credit offers a smart way to manage large expenses.",
      "cta": "Learn more"
    },
    {
      "signalLabel": "[life-event] Long-term homeowner \u2014 Mortgage on file > 5 years with current bank",
      "title": "Long-Term Homeowner",
      "subject": "Your home, your opportunities!",
      "body": "Hi {{first_name}}, As a long-term homeowner, you've built significant equity. Now, let it open new possibilities for you with a flexible Home Equity Line of Credit.",
      "cta": "Discover benefits"
    }
  ],
  "auto-loan": [
    {
      "signalLabel": "[behavioral] Repeated dealer visits \u2014 Card-present spend at dealerships across 2+ weekends",
      "title": "Dealership visitor",
      "subject": "Ready for a new ride?",
      "body": "Hi {{first_name}},\nSearching for your perfect vehicle? We can help you finance a new or used car with a great rate, so you can drive away with confidence.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] Lease-end timing \u2014 Captive lender ACH ending in 60\u201390 days",
      "title": "Lease ending soon",
      "subject": "Time for a change?",
      "body": "Hi {{first_name}},\nConsidering your options as your lease concludes? We make it easy to finance your next car, whether you're buying or leasing again.",
      "cta": "See possibilities"
    },
    {
      "signalLabel": "[behavioral] Auto insurance shop-around \u2014 Multiple insurer one-time charges within 30 days",
      "title": "Shopping for auto insurance",
      "subject": "Drive more, save more",
      "body": "Hi {{first_name}},\nLooking for ways to save on your car expenses? Refinancing your auto loan could free up cash for other things, like great insurance rates.",
      "cta": "Check your rate"
    }
  ],
  "auto-refi": [
    {
      "signalLabel": "[behavioral] High-APR captive lender \u2014 Monthly ACH to subprime auto lender > 24 months",
      "title": "High-APR Refinance Opportunity",
      "subject": "Unlock a lower car payment",
      "body": "Hi {{first_name}},\nGood news! You could significantly lower your monthly car payment and save money over the life of your loan. Imagine what you could do with those extra savings!",
      "cta": "See your savings"
    },
    {
      "signalLabel": "[behavioral] Credit score improvement \u2014 Bureau-pulled score up 60+ pts since origination",
      "title": "Improved Credit Refinance",
      "subject": "You could save on your auto loan",
      "body": "Hi {{first_name}},\nYour financial health is looking strong! This could be a fantastic time to revisit your auto loan and potentially secure a much better rate.",
      "cta": "Check your rate"
    },
    {
      "signalLabel": "[life-event] Income step-up \u2014 Payroll deposit increase > 15% sustained 6 months",
      "title": "Income Increase Auto Refinance",
      "subject": "Ready for a smarter auto loan?",
      "body": "Hi {{first_name}},\nWith your new financial growth, you have a wonderful opportunity to optimize your auto loan. Imagine a lower payment that aligns with your upward trajectory!",
      "cta": "Explore your options"
    }
  ],
  "personal-loan": [
    {
      "signalLabel": "[behavioral] Repeated BNPL usage \u2014 Affirm, Klarna, Afterpay charges across 3+ merchants",
      "title": "BNPL User",
      "subject": "Bring your plans together",
      "body": "Hi {{first_name}}, Let's get all your recent buys and plans in one easy place. Imagine the freedom of a single, simple monthly payment!",
      "cta": "Explore Loans"
    },
    {
      "signalLabel": "[behavioral] Cash-advance recovery \u2014 Card cash-advance followed by paycheck-aligned paydown",
      "title": "Cash Advance User",
      "subject": "Unlock new possibilities",
      "body": "Hi {{first_name}}, Have you been thinking about a seamless way to handle those unexpected costs? A personal loan can help you step forward with confidence.",
      "cta": "Discover Options"
    },
    {
      "signalLabel": "[behavioral] Revolving balance creep \u2014 Card utilization rising for 4+ consecutive cycles",
      "title": "Revolving Balance",
      "subject": "Simplify your credit",
      "body": "Hi {{first_name}}, Ready to simplify your monthly payments and gain more control? A personal loan can help you beautifully combine those balances.",
      "cta": "Learn More"
    }
  ],
  "small-business-loan": [
    {
      "signalLabel": "[behavioral] Vendor ACH cluster \u2014 5+ distinct business-supplier ACH counterparties",
      "title": "Vendor payments",
      "subject": "Grow your business with more ease",
      "body": "Hi {{first_name}}, \\n\\nImagine what your business could do with extra funding. We can help you get more working capital to grow your operations.",
      "cta": "Explore loans"
    },
    {
      "signalLabel": "[behavioral] Square / Stripe deposits \u2014 Recurring processor deposits to personal account",
      "title": "Gig worker deposits",
      "subject": "Financial flow for your hustle",
      "body": "Hi {{first_name}}, \\n\\nKeep your business thriving with aACCss to flexible funding options. We're here to help you achieve your goals.",
      "cta": "Unlock possibilities"
    },
    {
      "signalLabel": "[behavioral] Business-pattern card use \u2014 Office supply + SaaS subscription combo",
      "title": "Business spenders",
      "subject": "More power for your purchases",
      "body": "Hi {{first_name}}, \\n\\nExpand your purchasing power and invest in what your business needs most. We make it simple to get the funds you need.",
      "cta": "See loan options"
    }
  ],
  "starter-checking": [
    {
      "signalLabel": "[life-event] Student inflow pattern \u2014 University refunds, work-study payroll, parent transfers",
      "title": "Student frequent depositor",
      "subject": "Your college cash flow",
      "body": "Hi {{first_name}}, Managing your money while in college can be an adventure! We're here to help you make the most of your funds and reach your financial goals.",
      "cta": "Explore student banking"
    },
    {
      "signalLabel": "[life-event] Thin-file young adult \u2014 Age 18\u201324 with single low-volume account",
      "title": "Young adult new to banking",
      "subject": "Your financial journey starts now",
      "body": "Hi {{first_name}}, Welcome to the world of banking! It\u2019s an exciting step towards building a bright financial future, and we\u2019re thrilled to support you.",
      "cta": "Discover your options"
    },
    {
      "signalLabel": "[behavioral] Prepaid card top-ups \u2014 Recurring loads to prepaid debit programs",
      "title": "Prepaid card user",
      "subject": "Unlock more from your money",
      "body": "Hi {{first_name}}, You're already taking charge of your finances with your prepaid card. Imagine what more you could do with a checking account designed to help you save and succeed!",
      "cta": "See how we can help"
    }
  ],
  "everyday-checking": [
    {
      "signalLabel": "[behavioral] Direct deposit anchor \u2014 Recurring W-2 payroll deposit as primary inflow",
      "title": "Deposits, primary",
      "subject": "Your paychecks, simplified",
      "body": "Hi {{first_name}}, Managing your money is easier when your paycheck goes straight into your account. We're here to help you make the most of it!",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] Recurring bill-pay use \u2014 5+ scheduled bill-pay payees active monthly",
      "title": "Bill Pay, established",
      "subject": "Effortless bill paying ahead",
      "body": "Hi {{first_name}}, You're a pro at managing your bills, and we love to see it! Let us help you keep things running smoothly, every month.",
      "cta": "Review payments"
    },
    {
      "signalLabel": "[life-event] Household formation \u2014 Recent address change + joint account opening",
      "title": "Household, new",
      "subject": "Making a home, together",
      "body": "Hi {{first_name}}, Starting a new chapter is exciting! As you build your life together, we're here to support your shared financial journey.",
      "cta": "Discover more"
    }
  ],
  "relationship-checking": [
    {
      "signalLabel": "[behavioral] Multi-product household \u2014 Customer holds 3+ products across deposits, cards, and lending",
      "title": "Deepening Households",
      "subject": "Unlock more with your existing relationship",
      "body": "Hi {{first_name}}, we appreciate you choosing us for your financial needs. Did you know you could be enjoying even more benefits and rewards?",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] High average balance \u2014 Combined deposits > $20k for trailing 90 days",
      "title": "High Balance Deposit",
      "subject": "Make your money work harder for you",
      "body": "Hi {{first_name}}, imagine your savings growing even faster. Discover how to maximize your financial potential and enjoy premium banking features.",
      "cta": "Discover more"
    },
    {
      "signalLabel": "[behavioral] Wealth product overlap \u2014 Linked brokerage or advised assets on file",
      "title": "Wealth Product Overlap",
      "subject": "Simplify and enhance your financial life",
      "body": "Hi {{first_name}}, managing your finances can be effortless and rewarding. Consolidate your banking and investments for a more integrated financial journey.",
      "cta": "Connect accounts"
    }
  ],
  "core-savings": [
    {
      "signalLabel": "[behavioral] Round-up saver pattern \u2014 Frequent small recurring transfers from checking",
      "title": "Round-up Saver Engaged",
      "subject": "Effortless savings, bigger smiles!",
      "body": "Hi {{first_name}}, small steps can lead to big achievements! Watch your savings grow without a second thought, making your financial dreams more accessible.",
      "cta": "See Your Savings"
    },
    {
      "signalLabel": "[behavioral] Goal-based saving \u2014 Self-named savings sub-accounts created in-app",
      "title": "Goal-Based Saver Engaged",
      "subject": "Your goals, your way!",
      "body": "Hi {{first_name}}, it's inspiring to see you reaching for your dreams! Keep up the great work building dedicated funds for everything you envision.",
      "cta": "View Your Goals"
    },
    {
      "signalLabel": "[life-event] Tax-refund inflow \u2014 IRS or state refund deposit > $1,000",
      "title": "Tax Season Windfall",
      "subject": "Make your refund shine!",
      "body": "Hi {{first_name}}, a little extra can go a long way towards your financial aspirations! Consider boosting your savings and see your future grow even brighter.",
      "cta": "Grow Your Savings"
    }
  ],
  "high-yield-savings": [
    {
      "signalLabel": "[behavioral] Idle checking balance \u2014 Avg balance > $25k for 90 consecutive days",
      "title": "Idle Checking Balances",
      "subject": "Make Your Money Work Harder",
      "body": "Hi {{first_name}},\nReady to grow your savings effortlessly? Discover how a high-yield account can transform your financial journey with brighter returns.",
      "cta": "Explore Yields"
    },
    {
      "signalLabel": "[behavioral] Outbound yield-seeking \u2014 Recurring ACH to neobank or money-market app",
      "title": "Outbound Yield-Seeking",
      "subject": "Elevate Your Earning Potential",
      "body": "Hi {{first_name}},\nIt\u2019s wonderful to seek out growth for your money. We offer a high-yield savings option designed to bring those benefits closer to home.",
      "cta": "Discover More"
    }
  ],
  "certificate-of-deposit": [
    {
      "signalLabel": "[life-event] Maturing external CD \u2014 Lump-sum inflow from competitor bank near month-end",
      "title": "CD Rollover Opportunity",
      "subject": "Your new CD opportunity is here!",
      "body": "Hi {{first_name}}, Looking for a smart place to grow your savings? A Certificate of Deposit offers you a secure way to boost your financial future with a guaranteed rate.",
      "cta": "Explore CDs"
    },
    {
      "signalLabel": "[life-event] Retirement-age saver \u2014 Primary holder 60+ with conservative balance growth",
      "title": "Retirement Savings Growth",
      "subject": "Grow your retirement savings!",
      "body": "Hi {{first_name}}, Ready to make the most of your retirement savings? Our Certificates of Deposit can help you secure a bright financial future with guaranteed growth.",
      "cta": "Plan retirement"
    },
    {
      "signalLabel": "[behavioral] Treasury-purchase activity \u2014 Outbound ACH to TreasuryDirect or T-bill ETFs",
      "title": "Treasury Alternative CD",
      "subject": "A guaranteed way to save!",
      "body": "Hi {{first_name}}, Enjoy stable growth with predictable returns. Our Certificates of Deposit offer a secure path to watch your savings flourish.",
      "cta": "View CD rates"
    }
  ],
  "category-cashback-card": [
    {
      "signalLabel": "[behavioral] Concentrated category spend \u2014 Single category > 40% of card spend (gas, dining, online)",
      "title": "Category Spender",
      "subject": "Unlock more cash back!",
      "body": "Hi {{first_name}},! Your spending habits could be earning you even more cash back. Imagine getting rewarded for the things you buy most.",
      "cta": "Explore Rewards"
    },
    {
      "signalLabel": "[behavioral] Competitor rewards card use \u2014 External card statement payments via bill-pay",
      "title": "Outside Card User",
      "subject": "Maximize your rewards potential!",
      "body": "Hi {{first_name}},! We want to help you get the most out of every purchase. Discover a card that truly rewards your everyday spending.",
      "cta": "See Your Perks"
    },
    {
      "signalLabel": "[behavioral] First-card upgrade signal \u2014 Holds entry-level card with rising monthly volume",
      "title": "First Card Upgrade",
      "subject": "Elevate your card, elevate your rewards!",
      "body": "Hi {{first_name}},! It's time to take your rewards to the next level. A world of elevated benefits and greater earning potential awaits.",
      "cta": "Upgrade Now"
    }
  ],
  "flat-cashback-card": [
    {
      "signalLabel": "[behavioral] Diversified everyday spend \u2014 No single category > 25% of card volume",
      "title": "Diversified Spender",
      "subject": "Cash back on everything you buy!",
      "body": "Hi {{first_name}},\nImagine earning cash back on all your everyday purchases, no matter what they are. It\u2019s an easy way to get more back from your spending.",
      "cta": "Get Details"
    },
    {
      "signalLabel": "[behavioral] High monthly card volume \u2014 Card spend > $3k/mo across 50+ merchants",
      "title": "High Volume Spender",
      "subject": "Unlock more cash back rewards!",
      "body": "Hi {{first_name}},\nMake your significant spending work harder for you. Enjoy limitless cash back that adds up beautifully, making every large purchase more rewarding.",
      "cta": "Explore Now"
    },
    {
      "signalLabel": "[behavioral] Simplicity preference \u2014 Customer ignores category-activation prompts in app",
      "title": "Simplicity Seeker",
      "subject": "Effortless cash back, every day.",
      "body": "Hi {{first_name}},\nLife is complicated enough, your rewards shouldn't be. Enjoy the pure simplicity of earning cash back without tracking categories or activating offers.",
      "cta": "Learn More"
    }
  ],
  "travel-card": [
    {
      "signalLabel": "[behavioral] Multi-airline spend \u2014 Spend across 2+ carriers in trailing 12 months",
      "title": "Multi-airline traveler",
      "subject": "See the world, earn rewards",
      "body": "Hi {{first_name}},\nReady for your next adventure? Travel often comes with big expenses, and our card helps you earn rewards on every journey.",
      "cta": "Explore travel benefits"
    },
    {
      "signalLabel": "[behavioral] Hotel diversity \u2014 3+ distinct hotel chains within 6 months",
      "title": "Hotel hopper",
      "subject": "Stay and save, wherever you go",
      "body": "Hi {{first_name}},\nEvery new place brings new experiences. Make your stays even more rewarding with a card that travels with you.",
      "cta": "Unlock hotel perks"
    },
    {
      "signalLabel": "[behavioral] International transactions \u2014 Foreign-currency spend in trailing 6 months",
      "title": "International spender",
      "subject": "Travel with ease and rewards",
      "body": "Hi {{first_name}},\nExploring the globe is a wonderful journey. Our card makes international spending simple and helps you earn rewards wherever you are.",
      "cta": "Discover global perks"
    }
  ],
  "premium-travel-card": [
    {
      "signalLabel": "[behavioral] Frequent business travel \u2014 Weekly hotel + airline pattern Mon\u2013Thu",
      "title": "Frequent Business Traveler",
      "subject": "Travel more, earn more",
      "body": "Hi {{first_name}}, Elevate your frequent travel with a card that rewards you generously. Enjoy every journey with premium benefits designed for comfort and luxury.",
      "cta": "Explore travel benefits"
    },
    {
      "signalLabel": "[behavioral] Lounge-day-pass spend \u2014 Card spend at airport lounges or day-pass providers",
      "title": "Lounge Enthusiast",
      "subject": "Relax before you fly",
      "body": "Hi {{first_name}}, Make your time at the airport a true pleasure. Discover how a premium travel card can transform your pre-flight experience with exclusive lounge access.",
      "cta": "Unlock lounge access"
    },
    {
      "signalLabel": "[behavioral] Annual-fee tolerance \u2014 Existing $95+ annual-fee card paid on time 24+ months",
      "title": "Open to Annual Fees",
      "subject": "Experience premium rewards",
      "body": "Hi {{first_name}}, Unlock a world of exclusive benefits and elevated rewards. A premium travel card can open doors to experiences that truly enhance your lifestyle.",
      "cta": "Discover your rewards"
    }
  ],
  "ultra-premium-travel-card": [
    {
      "signalLabel": "[behavioral] Luxury hotel pattern \u2014 Stays at 5-star chains averaging > $600/night",
      "title": "Luxury Hotel Enthusiast",
      "subject": "Elevate Your Stays",
      "body": "Hi {{first_name}}, enhance every luxurious hotel experience. Discover unparalleled benefits that make every stay even more rewarding and effortless.",
      "cta": "Explore Benefits"
    },
    {
      "signalLabel": "[behavioral] International first/business class \u2014 Single-ticket airline charges > $5,000",
      "title": "International First Class Traveler",
      "subject": "Unlock Exclusive Travel",
      "body": "Hi {{first_name}}, transform your international journeys into extraordinary adventures. Enjoy a world of premium travel benefits designed for you.",
      "cta": "See Card Details"
    },
    {
      "signalLabel": "[behavioral] High investable assets \u2014 Linked advised assets > $1M",
      "title": "High Asset Investor",
      "subject": "Optimize Your Wealth",
      "body": "Hi {{first_name}}, thoughtfully manage your financial success with exclusive advantages. Unlock a suite of premium benefits designed to complement your lifestyle.",
      "cta": "Discover More"
    }
  ],
  "balance-transfer-card": [
    {
      "signalLabel": "[behavioral] External card revolve \u2014 Recurring bill-pay to external issuers with minimum-payment pattern",
      "title": "External Balances, Minimum Payments",
      "subject": "Lighten Your Load with a Lower Rate",
      "body": "Hi {{first_name}}, Imagine freeing up cash for what matters most. A balance transfer could help you simplify your payments and save on interest.",
      "cta": "Explore Your Rate"
    },
    {
      "signalLabel": "[behavioral] High-APR debt service \u2014 Estimated finance charges > $75/mo on outside debt",
      "title": "High-APR Debt Service",
      "subject": "Unlock Savings on Your Balances",
      "body": "Hi {{first_name}}, You could be saving more each month! A balance transfer can help you reduce the interest you're paying and reach your financial goals faster.",
      "cta": "See How Much"
    },
    {
      "signalLabel": "[behavioral] Stable income, no delinquencies \u2014 On-time payments 24+ months across all accounts",
      "title": "Stable Income, No Delinquencies",
      "subject": "Rewarding Your Responsible Habits",
      "body": "Hi {{first_name}}, You've earned a fresh start! Take advantage of your excellent payment history with an opportunity to consolidate debt and pay less interest.",
      "cta": "Claim Your Offer"
    }
  ],
  "cobrand-card": [
    {
      "signalLabel": "[behavioral] Single-brand loyalty \u2014 60%+ of category spend with one airline, hotel, or retailer",
      "title": "Single-Brand Loyalist",
      "subject": "Make Your Loyalty Even More Rewarding",
      "body": "Hi {{first_name}}, make your everyday spending even more rewarding with a card that celebrates your brand loyalty. Turn every purchase into opportunities for exclusive benefits and experiences.",
      "cta": "Explore Rewards"
    },
    {
      "signalLabel": "[behavioral] Loyalty-program engagement \u2014 Recurring redemptions or status-qualifying spend",
      "title": "Loyalty Program Engaged",
      "subject": "Unlock More Value From Your Rewards",
      "body": "Hi {{first_name}}, you love to make the most of your loyalty programs. Discover a card that supercharges your points and perks, bringing you closer to your next great reward.",
      "cta": "Boost Rewards"
    },
    {
      "signalLabel": "[behavioral] Seasonal travel pattern \u2014 Predictable annual booking cadence with same brand",
      "title": "Seasonal Traveler",
      "subject": "Elevate Your Every Adventure",
      "body": "Hi {{first_name}}, your travel plans are always something to look forward to. Enjoy exclusive travel benefits and earn rewards that make every journey even more delightful.",
      "cta": "Discover Benefits"
    }
  ],
  "life-insurance": [
    {
      "signalLabel": "[life-event] Recent family formation \u2014 Newborn cluster + first dependent listed on account",
      "title": "New Family Income Protection",
      "subject": "Protect your family's future",
      "body": "Hi {{first_name}}, Congratulations on your growing family! Life insurance can help you protect their future, offering peace of mind during this exciting time.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] New mortgage holder \u2014 Mortgage opened within trailing 12 months",
      "title": "New Homeowner Protection",
      "subject": "Safeguard your new home",
      "body": "Hi {{first_name}}, Your new home is a wonderful achievement! Life insurance can help protect this significant investment for your loved ones.",
      "cta": "Get a quote"
    },
    {
      "signalLabel": "[behavioral] Single-earner household \u2014 One W-2 deposit source supporting 2+ dependents",
      "title": "Primary Earner Protection",
      "subject": "Secure your family's well-being",
      "body": "Hi {{first_name}}, You work hard to provide for your family. Life insurance can help ensure their financial security, no matter what life brings.",
      "cta": "Learn more"
    }
  ],
  "permanent-life": [
    {
      "signalLabel": "[behavioral] Estate planning attorney spend \u2014 Recurring legal ACH plus trust formation fees",
      "title": "Estate Planning Focus",
      "subject": "Secure your family's future",
      "body": "Hi {{first_name}},\nPlanning for the future brings peace of mind. Discover how permanent life insurance can help protect your legacy and provide for generations to come.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] High investable assets \u2014 Linked advised assets > $2M with tax-efficiency focus",
      "title": "High Net Worth Individuals",
      "subject": "Grow and protect your wealth",
      "body": "Hi {{first_name}},\nUnlock new possibilities for your assets. Permanent life insurance offers a unique way to enhance your financial strategy and build lasting value.",
      "cta": "Learn more"
    },
    {
      "signalLabel": "[behavioral] Multi-generational gifting \u2014 Annual transfers near IRS gift-tax exclusion to family members",
      "title": "Philanthropic Gifting",
      "subject": "Empower your family's legacy",
      "body": "Hi {{first_name}},\nLeave a lasting impact for your loved ones. Permanent life insurance can be a powerful tool for multi-generational wealth transfer and enduring support.",
      "cta": "Discover benefits"
    }
  ],
  "ltc-insurance": [
    {
      "signalLabel": "[life-event] Pre-retiree age band \u2014 Primary holder 55\u201365 with stable income",
      "title": "Pre-retiree long-term care",
      "subject": "Plan for a bright future",
      "body": "Hi {{first_name}},\nThinking about your future is a smart move. Long-term care insurance can help protect your savings and provide peace of mind for the road ahead.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Parent-care indicators \u2014 Recurring ACH to assisted-living or in-home care providers",
      "title": "Supporting aging loved ones",
      "subject": "Care for those who cared for you",
      "body": "Hi {{first_name}},\nSupporting loved ones can inspire your own planning. Long-term care insurance offers a way to prepare for your own future needs, just as you help with others'.",
      "cta": "Learn more"
    },
    {
      "signalLabel": "[behavioral] Health-cost uptick \u2014 Rising medical specialist copays and pharmacy spend",
      "title": "Proactive health planning",
      "subject": "Embrace your health journey",
      "body": "Hi {{first_name}},\nTaking charge of your health means planning for every stage of life. Long-term care insurance can help you maintain your independence and well-being as you age.",
      "cta": "Discover benefits"
    }
  ],
  "annuity": [
    {
      "signalLabel": "[life-event] Retirement countdown \u2014 Primary holder 60\u201370 with declining payroll deposits",
      "title": "Retirement Countdown",
      "subject": "Your plan for a bright retirement",
      "body": "Hi {{first_name}},\nIt's a wonderful time to envision your retirement dreams. Let's make sure your financial future is as secure and joyful as you imagine.",
      "cta": "Plan My Future"
    },
    {
      "signalLabel": "[life-event] Pension lump-sum offer \u2014 Unusually large single deposit from former employer",
      "title": "Pension Lump-Sum Offer",
      "subject": "Make your pension work even harder",
      "body": "Hi {{first_name}},\nTurning a pension offer into lasting financial security is a great opportunity. Discover smart ways to grow what you've earned.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Conservative allocation drift \u2014 Linked advised assets shifting to fixed income > 60%",
      "title": "Conservative Allocation Drift",
      "subject": "Grow your wealth, your way",
      "body": "Hi {{first_name}},\nIt's smart to align your investments with your comfort level. Let's explore options that offer both growth and peace of mind for your wealth.",
      "cta": "Review My Growth"
    }
  ]
};
