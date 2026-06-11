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
      "title": "New Parents",
      "subject": "Save for their future!",
      "body": "Hi {{first_name}}, Becoming a parent opens up a world of dreams for your child's future. Start building their college fund today and watch their opportunities grow!",
      "cta": "Plan for college"
    },
    {
      "signalLabel": "[life-event] Dependent age inference (0\u20132 yrs) \u2014 Diaper subscriptions, daycare ACH, formula brands",
      "title": "Parents of Toddlers",
      "subject": "Bright future ahead!",
      "body": "Hi {{first_name}}, Your little one is growing so fast! Now is a wonderful time to start saving for their college education and help them achieve their dreams.",
      "cta": "Invest in education"
    },
    {
      "signalLabel": "[life-event] College-age dependent (16\u201318 yrs) \u2014 Private school tuition, SAT/ACT fees, college tour travel",
      "title": "Parents of College-Bound",
      "subject": "Ready for college!",
      "body": "Hi {{first_name}}, Your student is on the brink of an exciting new chapter! Smooth their path to college with smart savings that can make a real difference.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Stated savings intent \u2014 Search behavior for 'college savings' on bank web app",
      "title": "College Savers",
      "subject": "Dreams take flight!",
      "body": "Hi {{first_name}}, You're already thinking about college savings \u2013 that's a fantastic start! Discover how a 529 plan can help you reach your goals even faster.",
      "cta": "Learn more"
    }
  ],
  "self-directed-brokerage": [
    {
      "signalLabel": "[behavioral] External brokerage transfers \u2014 Recurring ACH to third-party retail brokerage apps",
      "title": "External Brokerage Transfers",
      "subject": "Bring your investments together!",
      "body": "Hi {{first_name}}, it looks like you're actively growing your investments. We make it easy to manage everything right here, commission-free.",
      "cta": "Explore investing"
    },
    {
      "signalLabel": "[behavioral] Crypto exchange activity \u2014 Card or ACH spend at major crypto on-ramps",
      "title": "Crypto Exchange Activity",
      "subject": "Expand your investment journey!",
      "body": "Hi {{first_name}}, we see you're exploring new ways to invest. Discover even more opportunities to diversify your portfolio, all in one place, commission-free.",
      "cta": "Explore crypto"
    },
    {
      "signalLabel": "[behavioral] Idle cash with investing intent \u2014 Checking balance > $10k + research-site visits in-app",
      "title": "Idle Cash with Investing Intent",
      "subject": "Make your money work harder!",
      "body": "Hi {{first_name}}, imagine the possibilities for your savings. Put your cash to work with smart, commission-free investing that helps you reach your financial goals.",
      "cta": "Start investing"
    }
  ],
  "robo-portfolio": [
    {
      "signalLabel": "[behavioral] First-time investor signals \u2014 Small recurring transfers to investing apps under $200",
      "title": "First-Time Investor Engagement",
      "subject": "Start building your brighter future!",
      "body": "Hi {{first_name}}, \nIt\u2019s exciting to begin your investing journey! We make it easy to grow your wealth with a smart, low-cost portfolio designed just for you.",
      "cta": "Explore Portfolios"
    },
    {
      "signalLabel": "[behavioral] Idle savings drift \u2014 Savings balance flat for 6+ months while income rises",
      "title": "Idle Savings Activation",
      "subject": "Make your money work harder!",
      "body": "Hi {{first_name}}, \nReady to boost your savings? Discover how a smart investment portfolio can help your money grow and reach its full potential.",
      "cta": "Grow Your Savings"
    },
    {
      "signalLabel": "[behavioral] Stated goal-based intent \u2014 Goal-planner tool engagement in bank app",
      "title": "Goal-Based Investor Support",
      "subject": "Achieve your goals with smart investing!",
      "body": "Hi {{first_name}}, \nYou have clear financial goals, and we're here to help you reach them. Our guided portfolios can help turn your dreams into reality.",
      "cta": "Plan Your Future"
    }
  ],
  "hybrid-advisor-portfolio": [
    {
      "signalLabel": "[behavioral] Mass-affluent balance band \u2014 Investable assets $100k\u2013$1M across linked accounts",
      "title": "Mass-Affluent Balance Band",
      "subject": "Unlock your portfolio's full potential!",
      "body": "Hi {{first_name}}, Managing your wealth can open up new opportunities. Discover how personalized guidance and a smart portfolio can help you achieve your financial dreams.",
      "cta": "Explore now"
    },
    {
      "signalLabel": "[behavioral] Advisor search engagement \u2014 Repeated visits to 'find an advisor' page",
      "title": "Advisor Search Engagement",
      "subject": "Your guide to a brighter financial future!",
      "body": "Hi {{first_name}}, Finding the right financial partner makes all the difference. Connect with an expert who can help shape your investment journey with confidence.",
      "cta": "Meet your advisor"
    },
    {
      "signalLabel": "[life-event] Life transition trigger \u2014 Inheritance deposit, severance, or business-sale inflow",
      "title": "Life Transition Trigger",
      "subject": "Grow your new beginnings!",
      "body": "Hi {{first_name}}, Exciting new chapters often bring new financial possibilities. Let's explore how to best grow your recent gains and secure a strong future for you.",
      "cta": "Plan your growth"
    }
  ],
  "wealth-management": [
    {
      "signalLabel": "[behavioral] Large equity comp deposit \u2014 Quarterly RSU vest, ESPP buyback inflows",
      "title": "Equity Comp Recipient",
      "subject": "Unlock the potential of your recent equity",
      "body": "Hi {{first_name}},\nBig financial moments like a recent equity deposit open up new possibilities. We're here to help you make the most of your expanded wealth.",
      "cta": "Explore wealth strategies"
    },
    {
      "signalLabel": "[behavioral] Recurring brokerage transfers \u2014 Outbound ACH to external brokerage > $5k/mo",
      "title": "External Brokerage Transfers",
      "subject": "Bring your financial picture all together",
      "body": "Hi {{first_name}},\nManaging multiple financial relationships can be a lot. Imagine the ease of having all your investments working seamlessly together.",
      "cta": "Simplify your wealth"
    },
    {
      "signalLabel": "[behavioral] Country club dues \u2014 Recurring private club, golf, yacht club ACH",
      "title": "Private Club Member",
      "subject": "Enjoy the finer things, effortlessly",
      "body": "Hi {{first_name}},\nYour lifestyle reflects your achievements. We understand the unique financial considerations that come with maintaining your passions and pursuits.",
      "cta": "Elevate your finances"
    },
    {
      "signalLabel": "[behavioral] Private aviation indicator \u2014 Charter operator card spend, fractional jet membership",
      "title": "Private Aviation User",
      "subject": "Your financial journey, elevated",
      "body": "Hi {{first_name}},\nFor those who reach for the skies, we offer financial guidance that matches your ambition. Let's ensure your wealth journey is as seamless as your travels.",
      "cta": "Chart your financial course"
    }
  ],
  "private-wealth": [
    {
      "signalLabel": "[life-event] Eight-figure inflow event \u2014 Single deposit > $5M from M&A escrow or IPO",
      "title": "Welcome to Wealth, Inflow",
      "subject": "Ready to Grow Your New Wealth?",
      "body": "Hi {{first_name}}, now that you've reached this significant financial milestone, let us help you maximize your opportunities. Our team is here to help you every step of the way.",
      "cta": "Explore Services"
    },
    {
      "signalLabel": "[behavioral] Multi-property tax footprint \u2014 Property tax ACH to 3+ counties annually",
      "title": "Wealth, Multi-Property Owner",
      "subject": "Simplify Your Property Portfolio?",
      "body": "Hi {{first_name}}, managing multiple properties can be complex, and we're here to help. Discover how our personalized strategies can bring ease and efficiency to your real estate endeavors.",
      "cta": "Discover Solutions"
    },
    {
      "signalLabel": "[behavioral] Family office indicator \u2014 Recurring payroll outflows + multi-entity transfers",
      "title": "Wealth, Family Office",
      "subject": "Optimize Your Family's Financial Future?",
      "body": "Hi {{first_name}}, as your family's financial needs grow, so do the opportunities. Partner with us to create a lasting legacy and navigate your financial journey with confidence.",
      "cta": "Learn How"
    }
  ],
  "ira": [
    {
      "signalLabel": "[life-event] Job change rollover trigger \u2014 Final payroll deposit followed by new employer ACH",
      "title": "Job Change Rollover",
      "subject": "Moving your retirement savings is easy!",
      "body": "Hi {{first_name}}, when you change jobs, it's a great opportunity to take control of your retirement savings. Keep your financial future growing strong with a plan that fits you best!",
      "cta": "Explore your options"
    },
    {
      "signalLabel": "[behavioral] Maxed 401(k) saver \u2014 Consistent pre-tax payroll deferrals near IRS limit",
      "title": "Maxed 401k Saver",
      "subject": "Keep building your wealth!",
      "body": "Hi {{first_name}}, you're a fantastic saver, and we can help you keep that momentum going! Discover new opportunities to make your retirement savings work even harder.",
      "cta": "Discover more options"
    },
    {
      "signalLabel": "[behavioral] Self-employed income \u2014 1099 deposits without W-2 payroll",
      "title": "Self-Employed Income",
      "subject": "Smart saving for the self-employed!",
      "body": "Hi {{first_name}}, being your own boss is rewarding, and setting up your retirement savings can be too! Explore tax-advantaged ways to secure your financial future.",
      "cta": "Plan your future"
    }
  ],
  "trust-estate": [
    {
      "signalLabel": "[behavioral] Estate planning attorney spend \u2014 Recurring legal ACH plus notary fees",
      "title": "Estate Planning Engagement",
      "subject": "Secure your family's future",
      "body": "Hi {{first_name}},\nPlanning for the future brings peace of mind. Let's make sure your legacy is well-protected and continues to benefit those you cherish most.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] Aging household signal \u2014 Primary holder 65+ with charitable giving uptick",
      "title": "Generational Wealth Steward",
      "subject": "Create a lasting legacy",
      "body": "Hi {{first_name}},\nIt's wonderful to think about your loved ones' future. You have a chance to shape a lasting legacy for generations to come.",
      "cta": "Plan your legacy"
    },
    {
      "signalLabel": "[behavioral] Beneficiary update activity \u2014 In-app beneficiary form interactions",
      "title": "Beneficiary Review Opportunity",
      "subject": "Review your beneficiaries",
      "body": "Hi {{first_name}},\nLife is always evolving, and so should your plans. Take a moment to ensure your beneficiaries are just as you intend.",
      "cta": "Update now"
    }
  ],
  "values-portfolio": [
    {
      "signalLabel": "[behavioral] Sustainable consumer pattern \u2014 Recurring spend at certified-B / organic grocers",
      "title": "Eco-Conscious Investor",
      "subject": "Invest in a better tomorrow",
      "body": "Hi {{first_name}},\nDiscover how your investments can help build a future you believe in. Align your financial growth with your personal values.",
      "cta": "Explore Portfolios"
    },
    {
      "signalLabel": "[behavioral] Charitable giving cadence \u2014 Monthly donations to environmental or social causes",
      "title": "Philanthropic Investor",
      "subject": "Grow your impact, beautifully",
      "body": "Hi {{first_name}},\nImagine a portfolio that reflects your generous spirit. Let your wealth amplify the causes you care about most.",
      "cta": "Learn More"
    },
    {
      "signalLabel": "[behavioral] EV ownership \u2014 Charging network subscriptions and EV-tax-credit refund",
      "title": "Sustainability Advocate Investor",
      "subject": "Drive change with your wealth",
      "body": "Hi {{first_name}},\nJust as you make thoughtful choices in life, your investments can also champion a sustainable world. Let's grow your future, together.",
      "cta": "Get Started"
    }
  ],
  "mortgage": [
    {
      "signalLabel": "[behavioral] Rent above local median \u2014 Recurring rent ACH > regional 75th percentile",
      "title": "High-Rent, Potential Homebuyer",
      "subject": "Imagine a home of your own!",
      "body": "Hi {{first_name}}, instead of paying rent, imagine putting that money towards a place to call yours. We can help make homeownership a reality.",
      "cta": "Explore Mortgages"
    },
    {
      "signalLabel": "[life-event] Pre-approval inquiry \u2014 Soft-pull or rate-quote interaction in bank app",
      "title": "Pre-Approved Mortgage Inquiry",
      "subject": "Your homeownership journey awaits!",
      "body": "Hi {{first_name}}, you're a step closer to your dream home! Let's explore flexible mortgage options tailored just for you.",
      "cta": "View Loan Options"
    },
    {
      "signalLabel": "[behavioral] Down-payment accumulation \u2014 Savings balance growth trajectory + low debt service",
      "title": "Saving for Down Payment",
      "subject": "Your homeownership dream is growing!",
      "body": "Hi {{first_name}}, it's inspiring to see your progress! Let's turn your down payment savings into the keys to your new home.",
      "cta": "See How"
    }
  ],
  "heloc": [
    {
      "signalLabel": "[behavioral] Home renovation spend \u2014 Home Depot, Lowe's, contractor ACH > $1,000",
      "title": "Home Renovation Spender",
      "subject": "Unlock your home's potential!",
      "body": "Hi {{first_name}}, Dreaming of a fresh new look for your home? Your home equity can open up a world of possibilities for renovations and upgrades.",
      "cta": "Explore your options"
    },
    {
      "signalLabel": "[behavioral] Property tax payment \u2014 Annual or semi-annual county treasurer ACH",
      "title": "Property Tax Payer",
      "subject": "Put your home equity to work!",
      "body": "Hi {{first_name}}, Your home is a valuable asset. Tap into its equity to help manage significant expenses and keep your financial plans flowing smoothly.",
      "cta": "Discover your power"
    },
    {
      "signalLabel": "[life-event] Long-term homeowner \u2014 Mortgage on file > 5 years with current bank",
      "title": "Long-Term Homeowner",
      "subject": "Celebrate your home's value!",
      "body": "Hi {{first_name}}, You've built significant equity in your home over the years. Now's a wonderful time to let your home's value work for you.",
      "cta": "Access your equity"
    }
  ],
  "auto-loan": [
    {
      "signalLabel": "[behavioral] Repeated dealer visits \u2014 Card-present spend at dealerships across 2+ weekends",
      "title": "Dealership Activity",
      "subject": "Ready for a new ride?",
      "body": "Hi {{first_name}}, Picking out a new car is exciting! Let us help you drive off the lot with a great rate on your auto loan.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] Lease-end timing \u2014 Captive lender ACH ending in 60\u201390 days",
      "title": "Lease Ending Soon",
      "subject": "Your lease is almost up!",
      "body": "Hi {{first_name}}, As your lease comes to an end, it\u2019s a great time to explore your options for a new car or to purchase your current one.",
      "cta": "See possibilities"
    },
    {
      "signalLabel": "[behavioral] Auto insurance shop-around \u2014 Multiple insurer one-time charges within 30 days",
      "title": "Auto Insurance Quotes",
      "subject": "Time for a new car?",
      "body": "Hi {{first_name}}, Shopping for car insurance often means you're looking for a new vehicle. We can help you finance your next adventure!",
      "cta": "Get A Quote"
    }
  ],
  "auto-refi": [
    {
      "signalLabel": "[behavioral] High-APR captive lender \u2014 Monthly ACH to subprime auto lender > 24 months",
      "title": "High-APR Auto Refi Opportunity",
      "subject": "Unlock a lower car payment!",
      "body": "Hi {{first_name}},\nWonderful news! You could significantly reduce your monthly car payment and save money over the life of your loan. Imagine what you could do with those extra savings!",
      "cta": "See your savings"
    },
    {
      "signalLabel": "[behavioral] Credit score improvement \u2014 Bureau-pulled score up 60+ pts since origination",
      "title": "Improved Credit Auto Refi",
      "subject": "You've earned a better rate!",
      "body": "Hi {{first_name}},\nAll your hard work is paying off! Your improved credit profile opens the door to exciting new financial opportunities, like a lower rate on your auto loan.",
      "cta": "Check your rate"
    },
    {
      "signalLabel": "[life-event] Income step-up \u2014 Payroll deposit increase > 15% sustained 6 months",
      "title": "Income Step-Up Auto Refi",
      "subject": "Enjoy more financial flexibility!",
      "body": "Hi {{first_name}},\nExciting times call for exciting opportunities! With your increased income, you have a fantastic chance to make your money work even harder for you, starting with your auto loan.",
      "cta": "Explore your options"
    }
  ],
  "personal-loan": [
    {
      "signalLabel": "[behavioral] Repeated BNPL usage \u2014 Affirm, Klarna, Afterpay charges across 3+ merchants",
      "title": "BNPL User",
      "subject": "Unlock new possibilities with a personal loan!",
      "body": "Hi {{first_name}}, Life is full of opportunities, and a personal loan can help you seize them with confidence and ease. Let us help you take the next step!",
      "cta": "Explore Loans"
    },
    {
      "signalLabel": "[behavioral] Cash-advance recovery \u2014 Card cash-advance followed by paycheck-aligned paydown",
      "title": "Cash Advance User",
      "subject": "Simplify your finances with a personal loan!",
      "body": "Hi {{first_name}}, Imagine a simpler way to manage life's expenses and reach your goals. A personal loan could be your key to financial peace of mind.",
      "cta": "Discover Options"
    },
    {
      "signalLabel": "[behavioral] Revolving balance creep \u2014 Card utilization rising for 4+ consecutive cycles",
      "title": "Revolving Balance",
      "subject": "Gain control with a smart personal loan!",
      "body": "Hi {{first_name}}, Take charge of your financial journey and open up a world of new opportunities. A personal loan can help you simplify and save.",
      "cta": "Learn More"
    }
  ],
  "small-business-loan": [
    {
      "signalLabel": "[behavioral] Vendor ACH cluster \u2014 5+ distinct business-supplier ACH counterparties",
      "title": "Small Biz: Vendor Payments",
      "subject": "Grow your business with more ease",
      "body": "Hi {{first_name}}, \\n\\nImagine saying yes to every opportunity for your business to grow. Unlock extra working capital to expand your inventory, operations, or team.",
      "cta": "Explore Loan Options"
    },
    {
      "signalLabel": "[behavioral] Square / Stripe deposits \u2014 Recurring processor deposits to personal account",
      "title": "Small Biz: Processor Deposits",
      "subject": "Nurture your business growth",
      "body": "Hi {{first_name}}, \\n\\nSeamlessly grow your business with a helpful Small Business Loan. Enjoy the freedom that comes with extra working capital to invest in your success.",
      "cta": "Explore Loan Options"
    },
    {
      "signalLabel": "[behavioral] Business-pattern card use \u2014 Office supply + SaaS subscription combo",
      "title": "Small Biz: Business Spend",
      "subject": "New possibilities for your business",
      "body": "Hi {{first_name}}, \\n\\nReady to elevate your business to the next level? Discover how a Small Business Loan can help you seize new opportunities and achieve your growth aspirations.",
      "cta": "Explore Loan Options"
    }
  ],
  "starter-checking": [
    {
      "signalLabel": "[life-event] Student inflow pattern \u2014 University refunds, work-study payroll, parent transfers",
      "title": "Student frequent depositor",
      "subject": "Your academic journey, empowered!",
      "body": "Hi {{first_name}}, big things are happening! Keep your financial momentum going strong as you achieve your academic goals.",
      "cta": "Keep it up!"
    },
    {
      "signalLabel": "[life-event] Thin-file young adult \u2014 Age 18\u201324 with single low-volume account",
      "title": "Young adult building credit",
      "subject": "Unlock your financial future!",
      "body": "Hi {{first_name}}, embark on an exciting financial journey! It\u2019s awesome to see you building a strong foundation for your future.",
      "cta": "Start building now"
    },
    {
      "signalLabel": "[behavioral] Prepaid card top-ups \u2014 Recurring loads to prepaid debit programs",
      "title": "Prepaid card user",
      "subject": "Easy ways to manage your money!",
      "body": "Hi {{first_name}}, make your money work even harder for you! Discover simple ways to keep your finances organized and growing.",
      "cta": "Simplify your saving"
    }
  ],
  "everyday-checking": [
    {
      "signalLabel": "[behavioral] Direct deposit anchor \u2014 Recurring W-2 payroll deposit as primary inflow",
      "title": "Deposits, primary",
      "subject": "Your paycheck, better",
      "body": "Hi {{first_name}},\nWe want to help you make the most of every paycheck. Discover tools and features that make money management easier and more rewarding.",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] Recurring bill-pay use \u2014 5+ scheduled bill-pay payees active monthly",
      "title": "Bill Pay, active",
      "subject": "Simplify your bills",
      "body": "Hi {{first_name}},\nMake bill day less of a to-do. Enjoy the ease of managing all your payments in one convenient place, on your schedule.",
      "cta": "Review features"
    },
    {
      "signalLabel": "[life-event] Household formation \u2014 Recent address change + joint account opening",
      "title": "Household, new",
      "subject": "Growing together",
      "body": "Hi {{first_name}},\nNew beginnings are exciting! Explore how our flexible accounts and features can help you and yours thrive, together.",
      "cta": "Discover accounts"
    }
  ],
  "relationship-checking": [
    {
      "signalLabel": "[behavioral] Multi-product household \u2014 Customer holds 3+ products across deposits, cards, and lending",
      "title": "Deepening Digital Relationships",
      "subject": "Unlock more with your banking!",
      "body": "Hi {{first_name}},\nDiscover how combining your financial products can bring you even greater benefits. Simplify your finances and enjoy exclusive rewards designed just for you.",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] High average balance \u2014 Combined deposits > $20k for trailing 90 days",
      "title": "High Balance Opportunity",
      "subject": "Make your money work harder!",
      "body": "Hi {{first_name}},\nIt's a great time to ensure your savings are growing with you. Explore options that offer premium benefits and maximize your financial potential.",
      "cta": "See your options"
    },
    {
      "signalLabel": "[behavioral] Wealth product overlap \u2014 Linked brokerage or advised assets on file",
      "title": "Wealth Product Customers",
      "subject": "Grow your wealth with ease!",
      "body": "Hi {{first_name}},\nSeamlessly integrate your banking and investment strategies for a more powerful financial future. Enjoy exclusive benefits that align with your long-term goals.",
      "cta": "Connect your accounts"
    }
  ],
  "core-savings": [
    {
      "signalLabel": "[behavioral] Round-up saver pattern \u2014 Frequent small recurring transfers from checking",
      "title": "Round-up Saver - Core",
      "subject": "Grow your savings without a second thought!",
      "body": "Hi {{first_name}},\nBuild your savings effortlessly with tools designed to make saving simple and automatic. Watch your balance grow with every small contribution!",
      "cta": "Start Saving"
    },
    {
      "signalLabel": "[behavioral] Goal-based saving \u2014 Self-named savings sub-accounts created in-app",
      "title": "Goal-Based Saver - Core",
      "subject": "Reach your dreams, one goal at a time!",
      "body": "Hi {{first_name}},\nAchieving your financial aspirations can be exciting and straightforward. Organize your savings around what matters most to you and make progress every day.",
      "cta": "Set Goals"
    },
    {
      "signalLabel": "[life-event] Tax-refund inflow \u2014 IRS or state refund deposit > $1,000",
      "title": "Tax Refund Inflow - Core",
      "subject": "Make the most of your tax refund!",
      "body": "Hi {{first_name}},\nConsider a bright opportunity to boost your financial well-being with any extra funds you have. A little can go a long way when you save it smart!",
      "cta": "Explore Options"
    }
  ],
  "high-yield-savings": [
    {
      "signalLabel": "[behavioral] Idle checking balance \u2014 Avg balance > $25k for 90 consecutive days",
      "title": "Idle Checking Balances",
      "subject": "Make Your Money Work Harder",
      "body": "Hi {{first_name}},\nReady to grow your savings effortlessly? Discover how a High-Yield Savings account can turn your idle funds into a powerful growth engine.",
      "cta": "Explore Yields"
    },
    {
      "signalLabel": "[behavioral] Outbound yield-seeking \u2014 Recurring ACH to neobank or money-market app",
      "title": "Outbound Yield-Seekers",
      "subject": "Boost Your Savings Potential",
      "body": "Hi {{first_name}},\nImagine earning even more on your savings. Our High-Yield Savings account offers a fantastic opportunity to maximize your financial growth.",
      "cta": "Discover More"
    }
  ],
  "certificate-of-deposit": [
    {
      "signalLabel": "[life-event] Maturing external CD \u2014 Lump-sum inflow from competitor bank near month-end",
      "title": "CD Rollover Opportunity",
      "subject": "Make the most of your maturing CD!",
      "body": "Hi {{first_name}}, now is a wonderful time to explore options for your maturing CD. Let's find a guaranteed rate that helps your savings grow.",
      "cta": "Explore CD Rates"
    },
    {
      "signalLabel": "[life-event] Retirement-age saver \u2014 Primary holder 60+ with conservative balance growth",
      "title": "Retirement Dreams CD",
      "subject": "Secure your retirement savings",
      "body": "Hi {{first_name}}, as you look towards retirement, a Certificate of Deposit can be a great way to secure your savings with a guaranteed return.",
      "cta": "Plan Your Future"
    },
    {
      "signalLabel": "[behavioral] Treasury-purchase activity \u2014 Outbound ACH to TreasuryDirect or T-bill ETFs",
      "title": "Treasury Alternative CD",
      "subject": "Discover new savings opportunities",
      "body": "Hi {{first_name}}, if you're exploring options for safe and steady growth, our Certificate of Deposit offers a pathway to guaranteed returns.",
      "cta": "See CD Options"
    }
  ],
  "category-cashback-card": [
    {
      "signalLabel": "[behavioral] Concentrated category spend \u2014 Single category > 40% of card spend (gas, dining, online)",
      "title": "High-Category Spender",
      "subject": "Earn more on what you love!",
      "body": "Hi {{first_name}},\nImagine getting rewarded for your everyday spending. Select your favorite spending category and watch your cash back grow, automatically!",
      "cta": "Explore Rewards"
    },
    {
      "signalLabel": "[behavioral] Competitor rewards card use \u2014 External card statement payments via bill-pay",
      "title": "Competitor Rewards User",
      "subject": "Unlock bigger rewards with us!",
      "body": "Hi {{first_name}},\nIt's great to maximize rewards from your spending. Our card lets you choose your top spending category to earn even more cash back, making every purchase brighter.",
      "cta": "Compare Benefits"
    },
    {
      "signalLabel": "[behavioral] First-card upgrade signal \u2014 Holds entry-level card with rising monthly volume",
      "title": "First-Card Upgrade",
      "subject": "Your rewards journey just got better!",
      "body": "Hi {{first_name}},\nReady for even more from your card? Discover how you can earn more cash back on the things you buy most, and make every day more rewarding.",
      "cta": "Upgrade Now"
    }
  ],
  "flat-cashback-card": [
    {
      "signalLabel": "[behavioral] Diversified everyday spend \u2014 No single category > 25% of card volume",
      "title": "Diversified Spenders",
      "subject": "Cash back on all your buys!",
      "body": "Hi {{first_name}}, Reward every part of your day with a card that keeps up. Enjoy unlimited cash back, no matter what you're buying.",
      "cta": "Explore Rewards"
    },
    {
      "signalLabel": "[behavioral] High monthly card volume \u2014 Card spend > $3k/mo across 50+ merchants",
      "title": "High Volume Spenders",
      "subject": "Unlock more cash back!",
      "body": "Hi {{first_name}}, Your spending power deserves to be rewarded. Discover a card that gives you unlimited cash back on every single purchase.",
      "cta": "See Your Perks"
    },
    {
      "signalLabel": "[behavioral] Simplicity preference \u2014 Customer ignores category-activation prompts in app",
      "title": "Simplicity Seekers",
      "subject": "Effortless cash back for you!",
      "body": "Hi {{first_name}}, Enjoy the ease of earning cash back without any extra effort. Get rewarded automatically on everything you buy.",
      "cta": "Get Started"
    }
  ],
  "travel-card": [
    {
      "signalLabel": "[behavioral] Multi-airline spend \u2014 Spend across 2+ carriers in trailing 12 months",
      "title": "Multi-airline Spender",
      "subject": "Make your travel even more rewarding!",
      "body": "Hi {{first_name}}, \\n \\n Elevate your journeys with a card that rewards every mile. Turn every flight into new possibilities and enjoy more along the way.",
      "cta": "Explore Rewards"
    },
    {
      "signalLabel": "[behavioral] Hotel diversity \u2014 3+ distinct hotel chains within 6 months",
      "title": "Hotel Diversity User",
      "subject": "Unlock new stays and earn!",
      "body": "Hi {{first_name}}, \\n \\n Discover a card that matches your spirit of adventure. Enjoy amazing benefits and earn points, no matter where your travels take you.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] International transactions \u2014 Foreign-currency spend in trailing 6 months",
      "title": "International Transactor",
      "subject": "Travel with ease and save!",
      "body": "Hi {{first_name}}, \\n \\n Experience the world with a card that's always on your side. Enjoy seamless international spending and travel with confidence.",
      "cta": "Learn Benefits"
    }
  ],
  "premium-travel-card": [
    {
      "signalLabel": "[behavioral] Frequent business travel \u2014 Weekly hotel + airline pattern Mon\u2013Thu",
      "title": "Frequent Business Traveler",
      "subject": "Travel well, effortlessly",
      "body": "Hi {{first_name}}, Travel can be a whirlwind! Make every journey more rewarding and relaxed with benefits designed for your on-the-go lifestyle.",
      "cta": "Explore travel"
    },
    {
      "signalLabel": "[behavioral] Lounge-day-pass spend \u2014 Card spend at airport lounges or day-pass providers",
      "title": "Lounge Day Pass User",
      "subject": "Your journey, elevated",
      "body": "Hi {{first_name}}, Enjoy a quiet, comfortable space before your flight. You deserve a little luxury and calm amidst the travel bustle.",
      "cta": "Discover comfort"
    },
    {
      "signalLabel": "[behavioral] Annual-fee tolerance \u2014 Existing $95+ annual-fee card paid on time 24+ months",
      "title": "Annual Fee Tolerant",
      "subject": "Unlock premium benefits",
      "body": "Hi {{first_name}}, Elevate your experiences and enjoy exclusive perks. A world of premium benefits is waiting for you to explore.",
      "cta": "View choices"
    }
  ],
  "ultra-premium-travel-card": [
    {
      "signalLabel": "[behavioral] Luxury hotel pattern \u2014 Stays at 5-star chains averaging > $600/night",
      "title": "Luxury hotel enthusiast",
      "subject": "Elevate your next stay",
      "body": "Hi {{first_name}}, discover a world where every hotel stay is an experience in pure luxury and comfort. Your journeys deserve the very best, and we're here to help you unlock it.",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] International first/business class \u2014 Single-ticket airline charges > $5,000",
      "title": "International premium flyer",
      "subject": "Travel in ultimate comfort",
      "body": "Hi {{first_name}}, experience the pinnacle of air travel with unparalleled comfort and exclusive privileges. Your international adventures can be even more rewarding.",
      "cta": "Discover more"
    },
    {
      "signalLabel": "[behavioral] High investable assets \u2014 Linked advised assets > $1M",
      "title": "High net worth individual",
      "subject": "Unlock new possibilities",
      "body": "Hi {{first_name}}, imagine a world where your financial achievements open doors to extraordinary travel experiences. We\u2019re here to help you explore those exciting new possibilities.",
      "cta": "See how"
    }
  ],
  "balance-transfer-card": [
    {
      "signalLabel": "[behavioral] External card revolve \u2014 Recurring bill-pay to external issuers with minimum-payment pattern",
      "title": "External Balances, Minimum Payments",
      "subject": "Lighten your load with a 0% intro APR",
      "body": "Hi {{first_name}}, Managing multiple balances can be a lot. Imagine simplifying your payments and having more money to put towards your goals.",
      "cta": "See How"
    },
    {
      "signalLabel": "[behavioral] High-APR debt service \u2014 Estimated finance charges > $75/mo on outside debt",
      "title": "High Interest Debt",
      "subject": "Save on interest, reach your goals faster",
      "body": "Hi {{first_name}}, High interest rates can make reaching your financial goals feel tough. A 0% intro APR could help you save and achieve them sooner.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Stable income, no delinquencies \u2014 On-time payments 24+ months across all accounts",
      "title": "Stable Income, No Delinquencies",
      "subject": "Unlock savings with a balance transfer",
      "body": "Hi {{first_name}}, Imagine turning your consistent financial habits into a real advantage. A balance transfer could help you save on interest and free up funds.",
      "cta": "Unlock Savings"
    }
  ],
  "cobrand-card": [
    {
      "signalLabel": "[behavioral] Single-brand loyalty \u2014 60%+ of category spend with one airline, hotel, or retailer",
      "title": "Single Brand Loyalist",
      "subject": "Unlock more joy with your favorite brand!",
      "body": "Hi {{first_name}}, we've found a special way to make your experiences with your favorite brand even more rewarding. Imagine getting more from every moment you spend!",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] Loyalty-program engagement \u2014 Recurring redemptions or status-qualifying spend",
      "title": "Engaged Loyalist",
      "subject": "Elevate your loyalty rewards!",
      "body": "Hi {{first_name}}, it's wonderful to see how much you enjoy your loyalty perks. Now, there\u2019s an exciting opportunity to supercharge those rewards even further!",
      "cta": "Discover more"
    },
    {
      "signalLabel": "[behavioral] Seasonal travel pattern \u2014 Predictable annual booking cadence with same brand",
      "title": "Seasonal Traveler",
      "subject": "Make your next trip even better!",
      "body": "Hi {{first_name}}, as you plan your getaways, imagine enhancing every journey with exclusive benefits. Your favorite travel experiences are about to become even more rewarding!",
      "cta": "Plan your trip"
    }
  ],
  "life-insurance": [
    {
      "signalLabel": "[life-event] Recent family formation \u2014 Newborn cluster + first dependent listed on account",
      "title": "New Family Income Protection",
      "subject": "Protect your family's future",
      "body": "Hi {{first_name}}, Becoming a new parent is a wonderful journey! Let's explore how to help protect your family's financial well-being as it grows.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] New mortgage holder \u2014 Mortgage opened within trailing 12 months",
      "title": "New Homeowner Protection",
      "subject": "Secure your new home",
      "body": "Hi {{first_name}}, Congratulations on your new home! Protecting your investment and loved ones is simpler than you think.",
      "cta": "Get started"
    },
    {
      "signalLabel": "[behavioral] Single-earner household \u2014 One W-2 deposit source supporting 2+ dependents",
      "title": "Sole Earner Income Protection",
      "subject": "Safeguard your family's stability",
      "body": "Hi {{first_name}}, Being the primary earner for your family is a big responsibility. Discover easy ways to help ensure their financial security always.",
      "cta": "Learn more"
    }
  ],
  "permanent-life": [
    {
      "signalLabel": "[behavioral] Estate planning attorney spend \u2014 Recurring legal ACH plus trust formation fees",
      "title": "Estate Planning",
      "subject": "Protect your family's future",
      "body": "Hi {{first_name}}, \nPlanning for the future can feel good. Life insurance offers a solid foundation for your legacy, ensuring your loved ones are cared for.",
      "cta": "Plan your legacy"
    },
    {
      "signalLabel": "[behavioral] High investable assets \u2014 Linked advised assets > $2M with tax-efficiency focus",
      "title": "Wealth Accumulation",
      "subject": "Grow your wealth wisely",
      "body": "Hi {{first_name}}, \nSmart financial choices can help your wealth grow. Discover how permanent life insurance can be a valuable part of your financial portfolio.",
      "cta": "Explore your options"
    },
    {
      "signalLabel": "[behavioral] Multi-generational gifting \u2014 Annual transfers near IRS gift-tax exclusion to family members",
      "title": "Generational Wealth Transfer",
      "subject": "Share your prosperity",
      "body": "Hi {{first_name}}, \nIt's wonderful to share your success with family. Permanent life insurance can help you secure your family's financial future for generations to come.",
      "cta": "Gift lasting security"
    }
  ],
  "ltc-insurance": [
    {
      "signalLabel": "[life-event] Pre-retiree age band \u2014 Primary holder 55\u201365 with stable income",
      "title": "Pre-retiree long-term care",
      "subject": "Plan for a bright future",
      "body": "Hi {{first_name}},\nThinking ahead to your retirement years can bring peace of mind. Let's explore options to help protect your financial well-being down the road.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Parent-care indicators \u2014 Recurring ACH to assisted-living or in-home care providers",
      "title": "Caregiving support",
      "subject": "Support for your loved ones",
      "body": "Hi {{first_name}},\nCaring for family is a generous act of love. Discover how to provide care for your loved ones while also securing your own future.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Health-cost uptick \u2014 Rising medical specialist copays and pharmacy spend",
      "title": "Health proactive planning",
      "subject": "Embrace a secure tomorrow",
      "body": "Hi {{first_name}},\nTaking proactive steps for your future health needs can lead to greater security. It's a wonderful way to plan for living life on your terms.",
      "cta": "Plan ahead"
    }
  ],
  "annuity": [
    {
      "signalLabel": "[life-event] Retirement countdown \u2014 Primary holder 60\u201370 with declining payroll deposits",
      "title": "Pre-retiree, income focused",
      "subject": "Your bridge to a steady retirement",
      "body": "Hi {{first_name}}, Planning for retirement brings exciting opportunities! Imagine a future with guaranteed income and a clear path to financial comfort.",
      "cta": "Explore your options"
    },
    {
      "signalLabel": "[life-event] Pension lump-sum offer \u2014 Unusually large single deposit from former employer",
      "title": "Pension lump-sum recipient",
      "subject": "Make your lump sum last",
      "body": "Hi {{first_name}}, You have a wonderful chance to grow your recent funds. Let\u2019s explore options to help secure your financial future and enjoy tax-deferred growth.",
      "cta": "Plan your growth"
    },
    {
      "signalLabel": "[behavioral] Conservative allocation drift \u2014 Linked advised assets shifting to fixed income > 60%",
      "title": "Conservative asset allocator",
      "subject": "Grow your wealth, your way",
      "body": "Hi {{first_name}}, When considering your financial future, it\u2019s wonderful to have options that align with your comfort. Discover how you can enjoy tax-deferred growth with confidence.",
      "cta": "Discover benefits"
    }
  ],
  "wedding-loan": [
    {
      "signalLabel": "[life-event] Engagement spend cluster \u2014 Jewelry purchase at premium retailer over $3k",
      "title": "Dream Engagement Ring Purchaser",
      "subject": "Fewer Worries, More \"I Do\"",
      "body": "Hi {{first_name}}, Planning a wedding can be a whirlwind of emotions and expenses. We're here to help you savor every moment with clever financing for all your wedding needs.",
      "cta": "Plan Your Wedding"
    },
    {
      "signalLabel": "[life-event] Venue and vendor deposits \u2014 Recurring deposits to catering, venue, and photography vendors",
      "title": "Wedding Planner",
      "subject": "Tie the Knot, Not Your Funds",
      "body": "Hi {{first_name}}, As your wedding plans come to life, managing deposits and payments can feel overwhelming. Enjoy a seamless journey to your special day with a personal loan.",
      "cta": "Explore Loan Options"
    },
    {
      "signalLabel": "[behavioral] Save-the-date stationery \u2014 Spend at print/stationery merchants plus dress retailers",
      "title": "Wedding Stationary Purchaser",
      "subject": "Your Dream Wedding Awaits",
      "body": "Hi {{first_name}}, You're already bringing your wedding vision to life, and we're here to help with all the exciting steps to come. Discover easy financing that fits your plans.",
      "cta": "Discover More"
    }
  ],
  "solo-restart-checking": [
    {
      "signalLabel": "[life-event] Joint-to-solo ACH shift \u2014 Shared bill-pay payees splitting to one holder",
      "title": "Solo Checking Transition",
      "subject": "Your fresh start begins now",
      "body": "Hi {{first_name}}, \n\nEmbrace your new financial chapter with a checking account designed for you. Discover tools to manage your money with ease and confidence.",
      "cta": "Explore Solo"
    },
    {
      "signalLabel": "[life-event] Family-law attorney spend \u2014 Recurring legal ACH to family-law firm over 60+ days",
      "title": "Legal Expense Support",
      "subject": "Navigate your path forward",
      "body": "Hi {{first_name}}, \n\nGet the dedicated support you need during significant life changes. Our checking account offers tools to help you manage your finances with clarity and control.",
      "cta": "Find Clarity"
    },
    {
      "signalLabel": "[life-event] Address change with single holder \u2014 New residential address tied to one name on account",
      "title": "New Home, New Beginnings",
      "subject": "Settle into your new home",
      "body": "Hi {{first_name}}, \n\nCongratulations on your new home! Make your new space truly yours with a checking account that simplifies managing your finances.",
      "cta": "Discover Features"
    }
  ],
  "inherited-ira": [
    {
      "signalLabel": "[life-event] Estate distribution inflow \u2014 Single deposit from estate or trust counsel over $50k",
      "title": "Estate Deposit Recipient",
      "subject": "Make Your Recent Inheritance Shine Brighter",
      "body": "Hi {{first_name}}, we're here to help you make the most of your recent inheritance. Let's explore options to grow and protect these assets for your future.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Beneficiary form activity \u2014 In-app beneficiary update or claim form interaction",
      "title": "Beneficiary Form Engager",
      "subject": "Secure Futures for Loved Ones",
      "body": "Hi {{first_name}}, planning for the future brings peace of mind. Ensure your legacy continues to support those you care about most.",
      "cta": "Review Beneficiaries"
    },
    {
      "signalLabel": "[life-event] Survivor signal \u2014 Joint account converting to single after death certificate",
      "title": "Recent Survivor",
      "subject": "We're Here to Support You Forward",
      "body": "Hi {{first_name}}, during times of change, new opportunities can emerge. We're here to help you navigate your financial path with confidence and ease.",
      "cta": "Discover More"
    }
  ],
  "second-home-mortgage": [
    {
      "signalLabel": "[behavioral] Repeated locale travel \u2014 Recurring vacation-rental spend in the same metro area",
      "title": "Second Home: Locale Traveler",
      "subject": "Dreaming of a getaway that's always yours?",
      "body": "Hi {{first_name}},\nImagine a place away from home that\u2019s all your own, ready whenever you are. Let's make that dream a reality!",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Multi-state property tax \u2014 Property tax ACH to a second county annually",
      "title": "Second Home: Property Owner",
      "subject": "Discover the joy of another home!",
      "body": "Hi {{first_name}},\nIt sounds like you appreciate the value of owning property. What if you could expand that feeling to another special place?",
      "cta": "Unlock Possibilities"
    },
    {
      "signalLabel": "[behavioral] High household income \u2014 Sustained payroll deposits in top income decile",
      "title": "Second Home: High Income",
      "subject": "Your financial strength can open new doors!",
      "body": "Hi {{first_name}},\nWith your strong financial footing, you have amazing opportunities. Consider turning a new second home into a smart investment and a personal retreat.",
      "cta": "See How"
    }
  ],
  "student-loan-refi": [
    {
      "signalLabel": "[behavioral] Student loan servicer ACH \u2014 Recurring monthly payment to a known student-loan servicer",
      "title": "Student Loan Borrower",
      "subject": "A fresh look at your student loans",
      "body": "Hi {{first_name}}, Managing student loan payments can feel like a marathon. We can help you explore options to make your payments more manageable and save money.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] Post-grad income step-up \u2014 Payroll deposit increase > 25% sustained 6+ months",
      "title": "Recent Grad Income Boost",
      "subject": "Celebrate your career growth!",
      "body": "Hi {{first_name}}, Your hard work is paying off, and your career is thriving! Now could be a great time to explore how your new income can work even harder for you.",
      "cta": "Discover possibilities"
    },
    {
      "signalLabel": "[behavioral] Credit profile strengthening \u2014 On-time payments 18+ months with rising score",
      "title": "Credit Conscious Borrower",
      "subject": "Your credit strength is an asset!",
      "body": "Hi {{first_name}}, Building strong credit opens up new doors for your financial future. Let's explore how your excellent payment history can lead to even bigger savings.",
      "cta": "Unlock savings"
    }
  ],
  "hsa": [
    {
      "signalLabel": "[behavioral] HDHP premium pattern \u2014 Employer health premium deduction sized for high-deductible plan",
      "title": "High Deductible Health Plan",
      "subject": "Unlock health savings!",
      "body": "Hi {{first_name}},\nDiscover a smart way to save on healthcare costs. An HSA can help you prepare for the future with incredible tax benefits.",
      "cta": "Explore HSA benefits"
    },
    {
      "signalLabel": "[behavioral] Recurring pharmacy and specialist copays \u2014 Steady out-of-pocket medical spend across providers",
      "title": "Frequent Medical Appointments",
      "subject": "Save on healthcare!",
      "body": "Hi {{first_name}},\nManaging healthcare costs just got easier. An HSA offers a triple-tax advantaged way to save and pay for medical expenses.",
      "cta": "Learn more"
    },
    {
      "signalLabel": "[life-event] Year-end FSA cliff \u2014 December spending spike at health-related merchants",
      "title": "FSA Year-End Rush",
      "subject": "Don't lose your FSA!",
      "body": "Hi {{first_name}},\nMake the most of your health savings. Learn how an HSA can complement your FSA and help you save for future medical needs.",
      "cta": "Discover your options"
    }
  ],
  "donor-advised-fund": [
    {
      "signalLabel": "[behavioral] Year-end charitable spike \u2014 Large Q4 donations to multiple 501(c)(3) recipients",
      "title": "Year-End Giving",
      "subject": "Make Your Year-End Giving Go Further",
      "body": "Hi {{first_name}}, now is a wonderful time to consider maximizing your charitable impact. You can create a lasting legacy while enjoying potential tax benefits.",
      "cta": "Explore Giving"
    },
    {
      "signalLabel": "[behavioral] Recurring nonprofit giving \u2014 Monthly donations across 3+ charities",
      "title": "Recurring Givers",
      "subject": "Amplify Your Ongoing Generosity",
      "body": "Hi {{first_name}}, your consistent support means so much. Imagine making an even bigger difference for the causes you care about, year after year.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] High investable assets \u2014 Linked advised assets > $500k",
      "title": "High Net Worth",
      "subject": "Unlock Your Giving Potential",
      "body": "Hi {{first_name}}, you have a unique opportunity to shape the future with your philanthropy. A Donor-Advised Fund can help you achieve your most ambitious goals.",
      "cta": "Learn How"
    }
  ],
  "personal-line-of-credit": [
    {
      "signalLabel": "[life-event] Payroll gap or step-down \u2014 Missed expected payroll cycle or sustained income drop",
      "title": "Income flow support",
      "subject": "Smooth out life's little bumps",
      "body": "Hi {{first_name}}, when life's rhythm changes, it's good to know you have options. A personal line of credit can provide financial flexibility right when you need it most.",
      "cta": "Explore your line"
    },
    {
      "signalLabel": "[behavioral] Healthy savings ratio \u2014 Savings buffer covers 3+ months of essential outflows",
      "title": "Savings protection",
      "subject": "Keep your savings shining bright",
      "body": "Hi {{first_name}}, you're doing great building up your savings! A personal line of credit can help you keep that momentum going, even with unexpected expenses.",
      "cta": "Protect your savings"
    },
    {
      "signalLabel": "[behavioral] Card utilization climbing \u2014 Card utilization rising for 3+ consecutive cycles",
      "title": "Credit utilization support",
      "subject": "Unlock more financial breathing room",
      "body": "Hi {{first_name}}, imagine having more flexibility with your finances. A personal line of credit can offer you an easy way to manage spending and open up opportunities.",
      "cta": "Discover your options"
    }
  ],
  "global-account": [
    {
      "signalLabel": "[life-event] International payroll inflow \u2014 Recurring deposit from foreign-domiciled employer",
      "title": "International Payroll Recipient",
      "subject": "Make your international earnings go further!",
      "body": "Hi {{first_name}},\nDiscover a brighter way to manage your international earnings. Our Global Account helps you keep more of what you make, making it simpler to grow your money across borders.",
      "cta": "Explore now"
    },
    {
      "signalLabel": "[behavioral] Foreign-currency card spend \u2014 Sustained card spend in non-USD across trailing 3 months",
      "title": "Frequent Foreign Spender",
      "subject": "Enjoy seamless spending abroad!",
      "body": "Hi {{first_name}},\nImagine experiencing the world without worrying about exchange rates. Our Global Account empowers your adventures with easy multi-currency spending and fewer fees.",
      "cta": "Learn more"
    },
    {
      "signalLabel": "[behavioral] Cross-border wires \u2014 Recurring outbound or inbound international wires",
      "title": "Cross-Border Remitter",
      "subject": "Simplify your global money transfers!",
      "body": "Hi {{first_name}},\nSending and receiving money across borders just got easier and more rewarding. Our Global Account offers a smooth experience with reduced fees for your international transfers.",
      "cta": "Discover benefits"
    }
  ],
  "homeowners-insurance": [
    {
      "signalLabel": "[life-event] New mortgage on file \u2014 Mortgage opened within trailing 6 months",
      "title": "New Homeowner",
      "subject": "Protect your new home!",
      "body": "Hi {{first_name}},\nCongratulations on your new home! Let's make sure your investment is well-protected with the right coverage.",
      "cta": "Get a quote"
    },
    {
      "signalLabel": "[behavioral] No insurer ACH detected \u2014 No recurring insurance premium tied to property address",
      "title": "Insurance Payment Opportunity",
      "subject": "Simplify your insurance payments",
      "body": "Hi {{first_name}},\nMake managing your homeowners insurance simple and stress-free. Discover an easier way to handle your payments.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Renovation completion \u2014 Large contractor ACH cluster wrapping up",
      "title": "Post-Renovation Protection",
      "subject": "Your updated home, better protected",
      "body": "Hi {{first_name}},\nGreat job with your recent home improvements! Now is the perfect time to ensure your refreshed home has the coverage it deserves.",
      "cta": "Update coverage"
    }
  ],
  "umbrella-insurance": [
    {
      "signalLabel": "[behavioral] Multi-property tax footprint \u2014 Property tax ACH to 2+ counties annually",
      "title": "Multiple Property Owners",
      "subject": "Protecting All You've Built",
      "body": "Hi {{first_name}}, Life\u2019s journey has led you to wonderful achievements. Let's make sure everything you've worked so hard for is well-protected.",
      "cta": "Explore Coverage"
    },
    {
      "signalLabel": "[life-event] Teen-driver insurance add \u2014 Auto premium step-up with new named driver",
      "title": "Households with Teen Drivers",
      "subject": "Extra Peace of Mind for Your Family",
      "body": "Hi {{first_name}}, As your family grows and changes, so do your protection needs. Let\u2019s ensure everyone, especially new drivers, is covered.",
      "cta": "Learn More"
    },
    {
      "signalLabel": "[behavioral] Mass-affluent wealth tier \u2014 Combined linked assets > $750k",
      "title": "Mass-Affluent Households",
      "subject": "Secure Your Financial Future",
      "body": "Hi {{first_name}}, You've built a strong financial foundation. Discover how to provide an extra layer of security for your achievements.",
      "cta": "Discover Protection"
    }
  ],
  "move-financing": [
    {
      "signalLabel": "[life-event] Moving-services spend \u2014 Van-rental, movers, or container-service charges",
      "title": "Moving Services Interest",
      "subject": "Support for a Smooth Move",
      "body": "Hi {{first_name}},\nMoving can be an exciting fresh start! We're here to help make your transition as smooth and stress-free as possible.",
      "cta": "Explore Loan Options"
    },
    {
      "signalLabel": "[life-event] Cross-state address change \u2014 New residential address in a different state on file",
      "title": "Cross-State Move",
      "subject": "Your New Beginning Awaits",
      "body": "Hi {{first_name}},\nStarting fresh in a new state is a wonderful adventure! Let's make sure you're supported every step of the way.",
      "cta": "Get Moving Support"
    },
    {
      "signalLabel": "[behavioral] New lease security deposit \u2014 Large one-time outflow to a property management company",
      "title": "Security Deposit Support",
      "subject": "Settle Into Your New Home",
      "body": "Hi {{first_name}},\nWelcome to your new place! We have options to help you comfortably manage the costs of getting settled.",
      "cta": "See Funding Choices"
    }
  ]
};
