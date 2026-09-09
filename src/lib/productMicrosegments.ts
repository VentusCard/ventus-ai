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
      "signalLabel": "[life-event] Newborn / toddler expense cluster \u2014 Clustered spend at baby supply retailers, pediatric specialist copays (card), and daycare tuition (ACH) post-birth record.",
      "title": "New Parents",
      "subject": "Save for their future, starting today!",
      "body": "Hi {{first_name}}, \nStarting a family is an exciting journey! Discover a smart way to begin saving for your child's education, giving them a bright future.",
      "cta": "Explore 529 Plans"
    },
    {
      "signalLabel": "[life-event] College-bound dependent inferred \u2014 Tuition payments to academic institutions (ACH/bill-pay), standardized test fees (card), and out-of-town travel to university towns.",
      "title": "Parents of College-Bound",
      "subject": "Plan for college with confidence!",
      "body": "Hi {{first_name}}, \nWith college on the horizon, it's a great time to ensure everything is in place. Secure their educational journey with a smart savings plan.",
      "cta": "Plan for College"
    },
    {
      "signalLabel": "[behavioral] Education savings visibility \u2014 Outbound ACH transfers to known 529 plan providers or brokerage education accounts, alongside internal transfers.",
      "title": "Savvy Savers",
      "subject": "Elevate your education savings!",
      "body": "Hi {{first_name}}, \nYou're already a step ahead in saving for education. Explore ways to maximize your efforts and grow their future even further.",
      "cta": "Optimize Savings"
    }
  ],
  "self-directed-brokerage": [
    {
      "signalLabel": "[behavioral] External brokerage funding \u2014 Regular ACH transfers or bill-pay to self-directed investment platforms beyond bank's offerings.",
      "title": "Outside Investor with ACH",
      "subject": "Grow your wealth with us",
      "body": "Hi {{first_name}}, we see you're actively growing your investments. We offer powerful, commission-free tools to help you manage your portfolio with confidence and build an even brighter financial future.",
      "cta": "Explore Features"
    },
    {
      "signalLabel": "[behavioral] Diversified crypto exposure \u2014 Card or ACH outflows to multiple cryptocurrency exchanges, including 'VEN*Crypto' or 'SQC*Coinbase'.",
      "title": "Crypto Curious Investor",
      "subject": "Discover new investment opportunities",
      "body": "Hi {{first_name}}, the world of digital assets is exciting, and we\u2019re here to help you explore its potential. Expand your portfolio with our diverse investment options.",
      "cta": "Invest Now"
    },
    {
      "signalLabel": "[behavioral] Investment research & cash hoarding \u2014 Sustained high checking balances coupled with subscription payments to investment research services or financial news.",
      "title": "Research-Oriented Saver",
      "subject": "Make your money work harder",
      "body": "Hi {{first_name}}, you're thoughtfully planning your financial future, and we admire that! Put your research to action and grow your savings with our self-directed investing options.",
      "cta": "Start Investing"
    }
  ],
  "robo-portfolio": [
    {
      "signalLabel": "[behavioral] New investor building capital \u2014 Multiple small-dollar P2P transfers and recurring ACH debits to investment platforms/brokerages like 'VEN*ACORN', 'CHASE INV' after initial funding.",
      "title": "New Investor, Building Capital",
      "subject": "Grow your wealth, effortlessly!",
      "body": "Hi {{first_name}}, Starting your investment journey is an exciting step! Imagine a smarter way to grow your money, designed to help you reach your financial goals with ease.",
      "cta": "Start investing"
    },
    {
      "signalLabel": "[behavioral] Competitive wealth product funding \u2014 Significant outbound ACH transfers/wires from DDA to external brokerage or robo-advisor (~$5k+) not associated with existing bank-managed investments.",
      "title": "Competitive Wealth Funding",
      "subject": "Unlock your portfolio's full potential!",
      "body": "Hi {{first_name}}, Ready to elevate your investment strategy? Discover a powerful way to make your money work harder for you, with a portfolio built for your success.",
      "cta": "Compare portfolios"
    },
    {
      "signalLabel": "[life-event] Late-career asset consolidation \u2014 Large, infrequent inbound ACH credits/wires from pension or 401k administrators, followed by transfers to a new singular brokerage account with robo-advisor features.",
      "title": "Late-Career Asset Consolidation",
      "subject": "Simplify your financial future!",
      "body": "Hi {{first_name}}, Consolidating your assets can bring peace of mind and clarity. Explore how a unified, intelligent portfolio can help manage your wealth for what's ahead.",
      "cta": "Consolidate assets"
    }
  ],
  "hybrid-advisor-portfolio": [
    {
      "signalLabel": "[life-event] Wealth Accumulation Trigger \u2014 Significant inflows from estate disbursement or business sale, followed by outflows to brokerage accounts or investment platforms.",
      "title": "Wealth Accumulation Trigger",
      "subject": "Unlock New Possibilities",
      "body": "Hi {{first_name}}, Life\u2019s big moments often bring new financial opportunities. We're here to help you make the most of your growing wealth.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Competitive Wealth Product Engagement \u2014 Recurring outbound ACH transfers to external brokerage firms or investment robo-advisors; no matching inbound investment income.",
      "title": "Competitive Wealth Product Engagement",
      "subject": "Grow Your Investments with Confidence",
      "body": "Hi {{first_name}}, It's great you're actively managing your investments. Discover a service that combines smart technology with expert human advice for even better results.",
      "cta": "Compare Solutions"
    },
    {
      "signalLabel": "[behavioral] Professional Financial Guidance Seeking \u2014 Frequent bill-pay to wealth management firms, financial advisors, or estate planning attorneys, coupled with large-value bank transfers.",
      "title": "Professional Financial Guidance Seeking",
      "subject": "Expert Guidance for Your Future",
      "body": "Hi {{first_name}}, Taking steps to plan your financial future is a great move. Partner with us for personalized advice to help you reach your goals with ease.",
      "cta": "Connect Today"
    }
  ],
  "wealth-management": [
    {
      "signalLabel": "[behavioral] Diversified equity compensation inflows \u2014 Significant quarterly inflows from corporate payroll (ACH) and brokerage (wire) indicating RSU vest, ESPP buyback, or option exercise.",
      "title": "Equity Growth Opportunity",
      "subject": "Unlock the potential of your equity",
      "body": "Hi {{first_name}},\nDiscover strategies to grow your wealth with your equity compensation. We're here to help you make the most of your financial journey.",
      "cta": "Explore Growth"
    },
    {
      "signalLabel": "[behavioral] Multi-institution wealth management \u2014 Consistent outbound ACHs over $10k to external brokerage or private bank names, coupled with wire transfers.",
      "title": "Optimize Your Total Wealth",
      "subject": "Bring your financial picture together",
      "body": "Hi {{first_name}},\nManaging wealth across different institutions can be complex. We offer a holistic view to help you streamline and optimize your entire financial portfolio.",
      "cta": "Unify Wealth"
    },
    {
      "signalLabel": "[behavioral] Luxury lifestyle memberships \u2014 Recurring card charges and ACH payments to canonical private clubs, golf courses, or fractional jet operators.",
      "title": "Enhance Your Lifestyle",
      "subject": "Experience more of what you love",
      "body": "Hi {{first_name}},\nYour lifestyle is important, and your financial planning should support it. Explore how our wealth management can enhance your personal passions.",
      "cta": "Elevate Life"
    },
    {
      "signalLabel": "[life-event] Complex asset liquidation event \u2014 Large inbound wire transfer from an estate counsel IOLTA or real estate attorney, following irregular outflows.",
      "title": "New Financial Chapter",
      "subject": "Seamlessly transition your assets",
      "body": "Hi {{first_name}},\nNavigating a large asset transition can open exciting new possibilities. We're here to provide clear guidance and support for your next financial chapter.",
      "cta": "Plan Ahead"
    }
  ],
  "private-wealth": [
    {
      "signalLabel": "[life-event] Significant Liquidity Event \u2014 Large inbound ACH or wire transfers from M&A escrow, trust disbursement, or capital gains, exceeding $5M.",
      "title": "Post-Liquidity Event Wealth",
      "subject": "Make the Most of Your Recent Success",
      "body": "Hi {{first_name}}, congratulations on your recent success! We can help you navigate your new financial landscape and explore strategies to grow and protect your wealth for generations.",
      "cta": "Explore Opportunities"
    },
    {
      "signalLabel": "[behavioral] Distributed Real Estate Portfolio \u2014 Recurring property tax payments via ACH or bill-pay to multiple distinct municipal or county entities.",
      "title": "Real Estate Investors",
      "subject": "Optimize Your Property Portfolio",
      "body": "Hi {{first_name}}, managing a diverse real estate portfolio comes with unique opportunities. Discover how our wealth management strategies can help you maximize your investments and streamline your financial operations.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] Complex Financial Management \u2014 Multiple payroll ACH outflows, inter-entity transfers, and recurring wire payments to various specialized financial counterparties (e.g., trust, legal).",
      "title": "Complex Financial Holdings",
      "subject": "Simplify Your Financial World",
      "body": "Hi {{first_name}}, we understand that managing complex finances can be time-consuming. Let us help you integrate your financial activities and create a unified approach to wealth management.",
      "cta": "Learn How"
    }
  ],
  "ira": [
    {
      "signalLabel": "[life-event] Retirement Account Consolidation \u2014 Direct ACH transfers from external brokerage accounts (",
      "title": "Retirement Account Consolidation",
      "subject": "Bring Your Retirement Dreams Together",
      "body": "Hi {{first_name}},\nReady to simplify your financial life? Consolidating your retirement accounts can make managing your future a breeze, giving you a clearer path to your goals.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Diversified Investment Strategy \u2014 Regular, simultaneous ACH transfers to multiple investment platforms (brokerage, robo-advisor, alternative assets).",
      "title": "Diversified Investment Strategy",
      "subject": "Grow Your Wealth Confidently",
      "body": "Hi {{first_name}},\nIt's wonderful to see your proactive approach to building a strong financial future! An IRA can further empower your diversified investment strategy.",
      "cta": "Discover IRAs"
    },
    {
      "signalLabel": "[life-event] Pre-Retirement Windfall \u2014 Large, one-time inbound wire or ACH, followed by significant outbound investment vehicle funding transfers.",
      "title": "Pre-Retirement Windfall",
      "subject": "Make Your Windfall Work for You",
      "body": "Hi {{first_name}},\nIt's a great time to ensure your recent financial gain works hard for your long-term future. Consider an IRA to optimize your savings for retirement.",
      "cta": "Plan Your Future"
    }
  ],
  "trust-estate": [
    {
      "signalLabel": "[life-event] Estate Counsel Engaged \u2014 Significant outgoing ACH/wire to identified estate counsel IOLTA, often alongside recurring bill-pay for legal retainers.",
      "title": "Estate Planning Engagement",
      "subject": "Plan for a bright future",
      "body": "Hi {{first_name}}, thoughtfully planning for the future can bring peace of mind. Let's explore how to secure your legacy for generations to come.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Eldercare Gifting/Payments \u2014 Consistent P2P (Zelle/Venmo) transfers to family/caregivers, coupled with ACH payments to assisted living or home health providers.",
      "title": "Supporting Loved Ones",
      "subject": "Care for family, made easy",
      "body": "Hi {{first_name}}, it's wonderful to support those you care about. We can help you manage financial arrangements for your loved ones with ease and confidence.",
      "cta": "Discover Solutions"
    },
    {
      "signalLabel": "[life-event] Wealth Transfer Indication \u2014 Large inbound wire deposits from estate accounts, or outgoing ACH to multiple individual beneficiaries following a life event.",
      "title": "Managing New Assets",
      "subject": "Grow your inherited wealth",
      "body": "Hi {{first_name}}, a new chapter often brings new opportunities. We're here to help you navigate and grow any recently acquired assets with confidence.",
      "cta": "Plan Your Legacy"
    }
  ],
  "values-portfolio": [
    {
      "signalLabel": "[behavioral] Ethical retail alignment \u2014 Consistent spend at certified B-corp merchants and specialty organic grocers across card and P2P rails.",
      "title": "Values-Aligned Spender",
      "subject": "Grow Your Future, Grow Your Impact",
      "body": "Hi {{first_name}},\nDiscover a way to align your investments with what matters most to you. It\u2019s a bright opportunity to build your wealth while reflecting your personal values.",
      "cta": "Explore Portfolios"
    },
    {
      "signalLabel": "[behavioral] Impact-driven philanthropy \u2014 Regular, multi-rail donations to environmental NGOs and social justice organizations, alongside impact-fund contributions.",
      "title": "Impact-Driven Donor",
      "subject": "Invest in a Better Tomorrow",
      "body": "Hi {{first_name}},\nImagine your investments amplifying the good you do in the world. Now you can build wealth with a portfolio that\u2019s truly aligned with your giving spirit.",
      "cta": "Discover Impact"
    },
    {
      "signalLabel": "[life-event] Green vehicle adoption \u2014 EV charging network subscriptions, home charging installations (ACH), and state-level EV rebate deposits.",
      "title": "Green Vehicle Owner",
      "subject": "Drive Your Values Forward",
      "body": "Hi {{first_name}},\nJust as you choose to move through the world mindfully, your investments can do the same. Explore how your portfolio can reflect your commitment to a brighter future.",
      "cta": "See How"
    }
  ],
  "mortgage": [
    {
      "signalLabel": "[behavioral] Rent payments above local median \u2014 Consistent ACH debits for rent, recurring P2P payments to 'landlord', or bill-pay to property management companies exceed local 75th percentile.",
      "title": "High Rent, Potential Buyer",
      "subject": "Imagine Life as a Homeowner!",
      "body": "Hi {{first_name}}, instead of paying rent, consider putting that money toward owning your own home. It might be more attainable than you think!",
      "cta": "Explore Mortgages"
    },
    {
      "signalLabel": "[behavioral] Significant savings for down payment \u2014 Consistent, increasing balance across savings accounts, coupled with incoming transfers from investment accounts or matured CDs, beyond regular income.",
      "title": "Saving for a Down Payment",
      "subject": "Your Homeownership Dream Awaits!",
      "body": "Hi {{first_name}}, you're building a strong foundation for your future. Let's explore how close you are to achieving your dream of homeownership!",
      "cta": "See Your Options"
    },
    {
      "signalLabel": "[life-event] Home-related expense surge \u2014 Increased card spend at home improvement stores, furniture retailers, and moving services, immediately following a large outflow for a down payment or closing costs.",
      "title": "New Home, New Possibilities",
      "subject": "Welcome to Your New Home!",
      "body": "Hi {{first_name}}, settling into a new place is exciting! Find ways to make your new house feel even more like home and handle those new expenses with ease.",
      "cta": "Discover Solutions"
    }
  ],
  "heloc": [
    {
      "signalLabel": "[life-event] Major home renovation underway \u2014 Improvement retail rising across consecutive months, repeated contractor payments in $3K to $20K increments, supply houses, flooring and appliances, or deposits to roofing, HVAC, solar, window and pool installers.",
      "title": "Renovation Underway",
      "subject": "Fund the project without touching your mortgage",
      "body": "Hi {{first_name}},\nWe see the build taking shape — building-material purchases, contractor payments, and permits adding up. A home equity line lets you draw only what you need, when you need it, and pay interest-only during the draw period.",
      "cta": "Check your line"
    },
    {
      "signalLabel": "[life-event] Large tuition obligation starting \u2014 Test prep and application fees, then an enrollment deposit, then the first tuition payment. Fires on annual obligations above $20K or per-term payments exceeding one month of household inflow.",
      "title": "Tuition Bill Ahead",
      "subject": "A smarter way to cover the next term",
      "body": "Hi {{first_name}},\nApplication fees, deposits, and tuition payments are on the calendar. Instead of draining savings or carrying high-rate balances, a home equity line can cover the gap at a lower cost.",
      "cta": "See your options"
    },
    {
      "signalLabel": "[life-event] Large medical expense \u2014 Hospital system payments, surgical center charges, or a new payment plan to a medical billing company. Fires on a single charge above $5K or a payment plan running past 12 months.",
      "title": "Medical Expense Coverage",
      "subject": "Handle the bill on your terms",
      "body": "Hi {{first_name}},\nA hospital system or surgical center charge, or a long payment plan, can strain monthly cash flow. A home equity line gives you flexible access to cover it without a rigid loan.",
      "cta": "Explore coverage"
    },
    {
      "signalLabel": "[life-event] Second property in progress \u2014 Inspection, appraisal, or title company payments while the existing mortgage continues. Down payment scale rather than transaction scale.",
      "title": "Second Property in Progress",
      "subject": "Bridge the down payment gap",
      "body": "Hi {{first_name}},\nInspection, appraisal, and title fees while your current mortgage continues mean liquidity matters. A home equity line can backstop the down payment so you don't have to liquidate other assets.",
      "cta": "Check your line"
    }
  ],
  "auto-loan": [
    {
      "signalLabel": "[behavioral] Auto shopping behavior \u2014 Card spend at multiple dealerships, with parallel ACH inquiries and insurance prepayments within 30 days.",
      "title": "In-market Auto Loan Prospect",
      "subject": "Ready for a new ride?",
      "body": "Hi {{first_name}},\nSearching for your perfect car is an adventure! We can help you find a financing option that fits your needs and gets you on the road with confidence.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] Outbound auto loan payoff \u2014 Large outbound wire or ACH to a captive auto lender, with concurrent DMV payment.",
      "title": "Recently Paid Off Auto Loan",
      "subject": "Ready for your next adventure?",
      "body": "Hi {{first_name}},\nCongratulations on paying off your auto loan! What an accomplishment. Now you have even more financial flexibility to achieve your dreams.",
      "cta": "See possibilities"
    },
    {
      "signalLabel": "[life-event] New auto loan origination \u2014 Large inbound ACH from a financial institution followed by regular outbound ACH payments to an auto lender.",
      "title": "New Auto Loan Customer",
      "subject": "Welcome to the family!",
      "body": "Hi {{first_name}},\nWelcome! We're so glad you chose us for your auto loan. We're here to help you make the most of your new vehicle and your financial journey.",
      "cta": "Manage loan"
    }
  ],
  "auto-refi": [
    {
      "signalLabel": "[behavioral] Outbound auto loan payments \u2014 Consistent ACH or bill-pay outflows to captive auto lenders, or transfers to external accounts followed by loan payments.",
      "title": "High APR Auto Loan",
      "subject": "Unlock Extra Savings!",
      "body": "Hi {{first_name}}, Imagine what you could do with extra money each month. Refinancing your auto loan could help you keep more of your hard-earned cash.",
      "cta": "See Your Rate"
    },
    {
      "signalLabel": "[life-event] Increased disposable income \u2014 Sustained increase in direct-deposit payroll or P2P inflows, with no corresponding increase in recurring bill-pay or card outflows.",
      "title": "Increased Disposable Income",
      "subject": "Make Your Money Go Further!",
      "body": "Hi {{first_name}}, You've got more room in your budget, and that's fantastic! Discover how a lower auto loan payment could help you achieve your financial dreams even faster.",
      "cta": "Refinance Today"
    },
    {
      "signalLabel": "[behavioral] Refinance research behavior \u2014 Frequent card transactions or ACH payments to credit reporting agencies, or inquiries to 'loan comparison' services.",
      "title": "Refinance Researching",
      "subject": "Smart Choices, Brighter Future!",
      "body": "Hi {{first_name}}, Taking control of your finances is a smart move. Explore how refinancing your auto loan could give you a better rate and more financial flexibility.",
      "cta": "Get Your Quote"
    }
  ],
  "personal-loan": [
    {
      "signalLabel": "[behavioral] Third-party lender repayment \u2014 ACH debits to known captive lenders, matched with bill-pay to non-bank lenders or external card paydowns for credit products.",
      "title": "Consolidate & Save: Loans",
      "subject": "Imagine a simpler financial picture!",
      "body": "Hi {{first_name}}, Life can be busy enough. One simple loan could help you bring your financial goals into focus, making everything more manageable.",
      "cta": "Explore Loans"
    },
    {
      "signalLabel": "[life-event] Emergency cash injection \u2014 Inbound P2P transfers from multiple individuals or cash-out activity from diverse sources like 'VEN*CASH-OUT' followed by immediate bill payments.",
      "title": "Emergency Expenses: Loans",
      "subject": "A little help, right when you need it.",
      "body": "Hi {{first_name}}, Sometimes life throws unexpected curveballs. A personal loan can provide the clear space you need to handle what's next with confidence.",
      "cta": "Get Support"
    },
    {
      "signalLabel": "[behavioral] Debt spiral risk \u2014 Consistent high-utilization credit card balances paired with increasing ACH debits to collection agencies or frequent 'STRP*LOAN' type transactions.",
      "title": "Debt Solution: Loans",
      "subject": "Breathe easier with one simple step.",
      "body": "Hi {{first_name}}, Taking control of your finances opens up new possibilities. A personal loan could be the refreshing change you're looking for.",
      "cta": "Discover Options"
    }
  ],
  "small-business-loan": [
    {
      "signalLabel": "[behavioral] Emerging microbusiness revenue \u2014 Regular deposits from payment processors like Stripe/Square/Paypal into a personal account, alongside business-category card spend.",
      "title": "Emerging Microbusiness Owners",
      "subject": "Grow your business with ease!",
      "body": "Hi {{first_name}},\nReady to take your growing business to the next level? Unlock new possibilities and reach your goals with a little extra support.",
      "cta": "Explore Funding"
    },
    {
      "signalLabel": "[behavioral] Business supplier network \u2014 Multiple distinct ACH payments to known business suppliers, combined with online bill-pays to professional services or software vendors.",
      "title": "Networked Small Businesses",
      "subject": "Expand your business network!",
      "body": "Hi {{first_name}},\nIs your business thriving through strong connections? We can help you cultivate those relationships and grow even further.",
      "cta": "Discover Opportunities"
    },
    {
      "signalLabel": "[behavioral] Dedicated business operations \u2014 Consistent card spending at office supply stores or SaaS providers, coupled with ACH transfers to a separate business account or payroll service.",
      "title": "Dedicated Business Operators",
      "subject": "Streamline your operations!",
      "body": "Hi {{first_name}},\nRunning a smooth and efficient business is key to success. Access the resources you need to optimize your operations and flourish.",
      "cta": "Learn More"
    }
  ],
  "starter-checking": [
    {
      "signalLabel": "[life-event] Educational Institution Inflows \u2014 Consistent ACH credits from universities or vocational schools alongside P2P from guardian counterparties.",
      "title": "Student Banking",
      "subject": "Your smart start to managing money",
      "body": "Hi {{first_name}},\nReady to take control of your finances? Our Starter Checking account is designed to help you manage your money with ease and confidence, setting you up for a bright financial future.",
      "cta": "Learn more"
    },
    {
      "signalLabel": "[life-event] Emerging Financial Footprint \u2014 Limited credit bureau data, with early-stage card and ACH activity showing reliance on cash alternatives and P2P payments.",
      "title": "New to Banking",
      "subject": "A fresh start for your finances",
      "body": "Hi {{first_name}},\nBeginning your banking journey is an exciting step! Discover our Starter Checking account, built to help you confidently navigate your finances and achieve your goals.",
      "cta": "Explore options"
    }
  ],
  "everyday-checking": [
    {
      "signalLabel": "[behavioral] Cross-rail payroll anchoring \u2014 Consistent W-2 payroll inflow via ACH, coupled with minimal P2P cash-out or external account transfers.",
      "title": "Payroll Direct Deposit",
      "subject": "Make paydays even easier!",
      "body": "Hi {{first_name}},\n\nEnjoy the convenience of seeing your pay sooner. Direct Deposit is a simple and secure way to have your money ready for you on payday, every time.",
      "cta": "Set up deposit"
    },
    {
      "signalLabel": "[behavioral] Bill-pay hub establishment \u2014 Multiple bill-pay transactions to utilities, rent, and captive auto lenders, indicating primary bill management.",
      "title": "Bill Pay Central",
      "subject": "Simplify your monthly bills!",
      "body": "Hi {{first_name}},\n\nManaging your bills just got easier. Our bill pay feature helps you stay organized and on top of your payments, all in one convenient place.",
      "cta": "Explore Bill Pay"
    },
    {
      "signalLabel": "[life-event] Joint financial anchoring \u2014 Shared address update alongside new joint account opening and recurring inter-account transfers to other known accounts.",
      "title": "New Shared Financials",
      "subject": "Building your future together!",
      "body": "Hi {{first_name}},\n\nIt's wonderful to share financial journeys. We're here to help you manage your shared goals and make progress together, every step of the way.",
      "cta": "Discover Joint Accounts"
    }
  ],
  "relationship-checking": [
    {
      "signalLabel": "[behavioral] Multi-product household indicator \u2014 Customer shows payments to captive auto lenders, mortgage servicers, and external credit cards across ACH and bill pay.",
      "title": "Connected Household Opportunity",
      "subject": "Unlock more together",
      "body": "Hi {{first_name}}, You've built a strong financial foundation. Discover how connecting your household's banking could bring even greater rewards.",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] High liquidity across rails \u2014 Consistent high balances in checking, plus inbound transfers from brokerages and outbound bill pays to external investment platforms.",
      "title": "Liquidity Optimization Potential",
      "subject": "Make your money move",
      "body": "Hi {{first_name}}, Your financial flow is impressive. Imagine unlocking even more potential from your cash with premium checking benefits.",
      "cta": "See how"
    },
    {
      "signalLabel": "[behavioral] Wealth management engagement \u2014 Regular ACH transfers to/from known investment platforms and advisory firms, alongside bill pay for estate counsel fees.",
      "title": "Wealth Management Alignment",
      "subject": "Grow your wealth wisely",
      "body": "Hi {{first_name}}, You're thoughtfully managing your financial future. Discover how our premium checking can complement your wealth strategy.",
      "cta": "Learn more"
    }
  ],
  "core-savings": [
    {
      "signalLabel": "[behavioral] Consistent micro-savings behavior \u2014 Daily small-dollar transfers from checking to savings, augmented by debit card round-up programs",
      "title": "Everyday Savers",
      "subject": "Watch your savings grow effortlessly!",
      "body": "Hi {{first_name}},\nEvery small step can lead to big achievements! Imagine building your savings consistently, without even thinking about it.",
      "cta": "Start Saving More"
    },
    {
      "signalLabel": "[behavioral] Dedicated savings goal \u2014 Recurring transfers to a savings account, often with a unique memo like 'down payment' or 'tuition fund'",
      "title": "Goal-Oriented Savers",
      "subject": "Unlock your savings goals with ease!",
      "body": "Hi {{first_name}},\nReady to make those big dreams a reality? We're here to help you reach your specific savings goals, one step at a time.",
      "cta": "Achieve Your Goals"
    },
    {
      "signalLabel": "[life-event] Significant tax refund received \u2014 Large annual inflow from tax authorities (IRS, state DOR) via ACH or direct deposit, frequently >$1,500",
      "title": "Tax Refund Recipients",
      "subject": "Make the most of your refund!",
      "body": "Hi {{first_name}},\nReceiving a tax refund is a wonderful opportunity! Imagine putting that extra money to work for your future financial well-being.",
      "cta": "Grow Your Refund"
    }
  ],
  "high-yield-savings": [
    {
      "signalLabel": "[behavioral] High Checking Balance, Low-Yield \u2014 Consistent checking account balances exceeding $25,000 for 90+ days, with minimal linked savings account activity.",
      "title": "Idle Checking, High Balance",
      "subject": "Make Your Money Work Harder",
      "body": "Hi {{first_name}},\nDiscover a brighter way to grow your savings. Our High-Yield Savings account can help your money reach its full potential, turning idle funds into future opportunities.",
      "cta": "Explore Yields"
    },
    {
      "signalLabel": "[behavioral] Outbound Yield-Seeking Transfers \u2014 Recurring ACH transfers to known investment platforms, brokerage accounts, or high-yield fintech savings products.",
      "title": "Outbound Yield Seeker",
      "subject": "Elevate Your Earnings",
      "body": "Hi {{first_name}},\nReady to amplify your financial growth? Our High-Yield Savings account offers a superb opportunity to boost your earnings and achieve your goals faster.",
      "cta": "See Your Growth"
    },
    {
      "signalLabel": "[life-event] Competitive Product Funding \u2014 Inbound ACH linked to a prominent challenger bank or investment product, followed by large outbound transfers from checking.",
      "title": "Competitive Product Funder",
      "subject": "Unlock Greater Savings",
      "body": "Hi {{first_name}},\nImagine a home for your savings where growth is a given. Our High-Yield Savings account provides a powerful path to expand your wealth and secure your financial future.",
      "cta": "Start Earning"
    }
  ],
  "certificate-of-deposit": [
    {
      "signalLabel": "[life-event] External CD Matures \u2014 Large inbound ACH or wire from another financial institution, paired with no matching outbound CD purchase.",
      "title": "CD Matures",
      "subject": "Ready for your next smart move?",
      "body": "Hi {{first_name}}, it's a great time to make your money work harder. Discover options that offer security and help you grow your savings with confidence.",
      "cta": "Explore CDs"
    },
    {
      "signalLabel": "[behavioral] Senior Wealth Builder \u2014 Consistent inbound Social Security or pension ACH, coupled with recurring bill-pay to retirement community and medical providers.",
      "title": "Senior Wealth Builder",
      "subject": "Grow your wealth, simply",
      "body": "Hi {{first_name}}, discover opportunities to enhance your financial security. Explore options designed to grow your savings steadily, offering peace of mind for your future.",
      "cta": "Grow Your Savings"
    },
    {
      "signalLabel": "[behavioral] Fixed Income Seeker \u2014 Frequent outbound transfers to online brokerage for bond/Treasury ETFs, or direct ACH to government treasury programs.",
      "title": "Fixed Income Seeker",
      "subject": "Aim for a steady income stream",
      "body": "Hi {{first_name}}, explore ways to secure a predictable return on your savings. Our options are designed to provide consistent growth and financial stability you can count on.",
      "cta": "Find Stability"
    }
  ],
  "category-cashback-card": [
    {
      "signalLabel": "[behavioral] Heavy discretionary category spend \u2014 Consistent high spend on selected reward categories like dining, entertainment, or travel, visible across card and P2P rails.",
      "title": "High_Value_Category_Spender",
      "subject": "Unlock more rewards easily!",
      "body": "Hi {{first_name}}, Your everyday spending has the potential to earn you even more! Discover how to amplify your rewards in the categories you love most.",
      "cta": "Explore Rewards"
    },
    {
      "signalLabel": "[behavioral] Competitor card funding \u2014 Regular bill-pay or ACH transfers to other card issuers, indicating external card payments and usage.",
      "title": "External_Card_User",
      "subject": "Simplify your finances!",
      "body": "Hi {{first_name}}, Managing multiple cards can be a lot. Imagine simplifying your spending and still earning great rewards with one easy solution.",
      "cta": "Learn More"
    },
    {
      "signalLabel": "[behavioral] Growing card engagement \u2014 Increasing monthly transaction volume and value on a single card, with new linked bill-pay or P2P activity.",
      "title": "Increasing_Card_Engagement",
      "subject": "Great choices lead to great rewards!",
      "body": "Hi {{first_name}}, It's wonderful to see your financial activity growing! There are even more ways to make your card work harder for you, maximizing every dollar.",
      "cta": "Discover Benefits"
    }
  ],
  "flat-cashback-card": [
    {
      "signalLabel": "[behavioral] Diversified everyday spend profile \u2014 Consistent multi-category general-purpose card spend across 50+ merchants, supplemented by recurring bill-pay and P2P for services.",
      "title": "Everyday Spender",
      "subject": "Cash back, simplified!",
      "body": "Hi {{first_name}},\nEnjoy unlimited cash back on every purchase. It's an easy way to get rewarded for all your everyday spending.",
      "cta": "Explore Card"
    },
    {
      "signalLabel": "[behavioral] High share of wallet, everyday spend \u2014 Large proportion of essential spending (groceries, fuel, dining) consistently captured on card, minimal external card paydown ACH.",
      "title": "Cash Back Enthusiast",
      "subject": "More cash back for you!",
      "body": "Hi {{first_name}},\nGet rewarded for every single purchase. Our card makes it simple to earn unlimited cash back on all your spending.",
      "cta": "Learn More"
    },
    {
      "signalLabel": "[behavioral] Simplified rewards preference \u2014 Ignored category-activation prompts on card, consistent P2P/ACH for structured bills, suggests preference for flat-rate rewards.",
      "title": "Simple Rewards Seeker",
      "subject": "Effortless cash back!",
      "body": "Hi {{first_name}},\nSimplify your rewards with unlimited cash back on everything you buy. No categories to track, just easy earnings.",
      "cta": "Discover Benefits"
    },
    {
      "signalLabel": "[behavioral] Cross-rail discretionary spending \u2014 Balanced discretionary spending across card (e.g., entertainment, apparel) and P2P (e.g., VEN* for social activities or shared expenses).",
      "title": "Flexible Spender",
      "subject": "Rewards for every choice!",
      "body": "Hi {{first_name}},\nEarn unlimited cash back on all your purchases, big or small. Enjoy rewards that fit every part of your life.",
      "cta": "Get Started"
    }
  ],
  "travel-card": [
    {
      "signalLabel": "[behavioral] Travel booked across providers \u2014 Card spend and ACH debits to multiple airlines, online travel agencies, and hotel groups within 90 days, including 'ACME Travel' and 'Expedia'.",
      "title": "Frequent Multi-Provider Traveler",
      "subject": "Unlock More Travel Rewards!",
      "body": "Hi {{first_name}},\nTurn your travel adventures into even more rewards! Our card helps you earn points across all your favorite airlines and hotels, making every trip more rewarding.",
      "cta": "Explore Benefits"
    },
    {
      "signalLabel": "[behavioral] Foreign transaction history \u2014 Card foreign currency transactions, plus international wire transfers or P2P to foreign persons, within the last six months.",
      "title": "International Spender",
      "subject": "Travel Without Fees!",
      "body": "Hi {{first_name}},\nSay goodbye to foreign transaction fees and hello to seamless international spending. Your purchases abroad can be easier and more rewarding.",
      "cta": "Learn More"
    },
    {
      "signalLabel": "[behavioral] Pre-travel spending surge \u2014 Elevated card spend at specialty apparel, luggage, and duty-free merchants, correlated with upcoming travel-related debits and P2P payments.",
      "title": "Pre-Travel Spender",
      "subject": "Prepare for Your Next Journey!",
      "body": "Hi {{first_name}},\nGet ready for your exciting trips with extra peace of mind. Our card offers protections that make your pre-travel shopping and your whole journey smoother.",
      "cta": "See How"
    }
  ],
  "premium-travel-card": [
    {
      "signalLabel": "[behavioral] Frequent business traveler \u2014 Regular T&E transactions across corporate cards, personal cards and expense reimbursements for lodging and airfare.",
      "title": "Business Travel Benefits",
      "subject": "Travel well, effortlessly.",
      "body": "Hi {{first_name}},\nElevate every business trip with comfort and ease. Our Premium Travel Card is designed to make your professional journeys more rewarding.",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[behavioral] Luxury travel indulgence \u2014 Consistent personal card spend at premium airlines, resorts, and fine dining establishments, often exceeding corporate travel budgets.",
      "title": "Luxury Travel Enhancements",
      "subject": "Experience travel, elevated.",
      "body": "Hi {{first_name}},\nTransform your getaways into unforgettable experiences. Discover how our Premium Travel Card can add a touch of luxury to your journeys.",
      "cta": "Unlock luxury"
    },
    {
      "signalLabel": "[behavioral] Broad travel ecosystem spend \u2014 Frequent transactions for ride-sharing, luggage, adaptive clothing, and travel medical, indicating extensive and diverse travel needs.",
      "title": "Holistic Travel Support",
      "subject": "Seamless journeys await.",
      "body": "Hi {{first_name}},\nEmbrace every aspect of your travels with confidence and convenience. Our Premium Travel Card supports your entire travel experience, big or small.",
      "cta": "Discover more"
    }
  ],
  "ultra-premium-travel-card": [
    {
      "signalLabel": "[behavioral] Premium travel ecosystem engagement \u2014 Consistent spend at luxury hotels and airlines, often with global lounge network, across card and bill-pay rails.",
      "title": "Luxury Travel Enthusiast",
      "subject": "Elevate Your Journeys",
      "body": "Hi {{first_name}},\nImagine every trip, enhanced. Your passion for premium travel experiences deserves a card that understands and amplifies your adventures.",
      "cta": "Explore Benefits"
    },
    {
      "signalLabel": "[behavioral] Affluent global traveler profile \u2014 Frequent, high-value foreign currency transactions and cross-border payments for travel services via cards and wires.",
      "title": "Global Explorer",
      "subject": "Unlock the World",
      "body": "Hi {{first_name}},\nReady to explore more? Your global lifestyle opens doors to unparalleled travel experiences, and we're here to make every journey seamless.",
      "cta": "See How"
    },
    {
      "signalLabel": "[behavioral] Concierge service dependency \u2014 Repeated card transactions with known concierge merchant types, often followed by high-end travel or experience purchases.",
      "title": "Effortless Experience Seeker",
      "subject": "Your Dedicated Service",
      "body": "Hi {{first_name}},\nDiscover a world where every detail is handled. Enjoy dedicated support designed to make your travel and experiences truly effortless and exceptional.",
      "cta": "Learn More"
    }
  ],
  "balance-transfer-card": [
    {
      "signalLabel": "[behavioral] External Card Debt Servicing \u2014 Consistent bill-pay to multiple external card issuers, identified via semantic merchant resolution from cryptic descriptors.",
      "title": "External Card Balances",
      "subject": "Lighten your load with a lower rate",
      "body": "Hi {{first_name}}, Imagine freeing up more of your money each month. A balance transfer could help you simplify your payments and save on interest.",
      "cta": "See How"
    },
    {
      "signalLabel": "[behavioral] High-Cost Debt Indicators \u2014 Recurring ACH transfers and bill-pays to non-bank lenders and credit card companies, showing high estimated interest payments.",
      "title": "High-Interest Debt",
      "subject": "Save more with a smarter move",
      "body": "Hi {{first_name}}, Picture a brighter financial future with less interest holding you back. A low-rate balance transfer can make a big difference.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Opportunity for Wallet Share \u2014 Significant external credit card payments observed across bill-pay and P2P, indicating potential to consolidate balances.",
      "title": "Consolidate External Debt",
      "subject": "Simplify your finances, save money",
      "body": "Hi {{first_name}}, Ready to bring all your balances together in one place? Our balance transfer card can help you streamline payments and potentially lower your rate.",
      "cta": "Get Started"
    }
  ],
  "cobrand-card": [
    {
      "signalLabel": "[behavioral] Deep brand loyalty \u2014 Majority of consumer spend at a single merchant and related ecosystem via card, with cross-rail recognition of brand payments.",
      "title": "Deep Brand Loyalty",
      "subject": "Unlock more joy with your favorite brand!",
      "body": "Hi {{first_name}}, Your loyalty is something special! Imagine getting even more out of the brands you love with rewards designed just for you. Explore new ways to make every purchase more rewarding.",
      "cta": "Explore Rewards"
    },
    {
      "signalLabel": "[behavioral] Competitive card wallet share \u2014 Inbound ACH transfers from other financial institutions for credit card payments, indicating competitor usage within the same spend category.",
      "title": "Competitive Card Wallet Share",
      "subject": "Discover a card that gives you more!",
      "body": "Hi {{first_name}}, You're making smart choices in managing your finances. What if one card could bring all your spending power together, offering richer rewards and exclusive benefits?",
      "cta": "Uncover Benefits"
    },
    {
      "signalLabel": "[behavioral] Brand-specific travel investment \u2014 Card and bill-pay transactions show consistent booking and payment for a single airline, cruise line, or related travel provider.",
      "title": "Brand-Specific Travel Investment",
      "subject": "Elevate your travel experiences!",
      "body": "Hi {{first_name}}, Your adventures are clearly a priority! Imagine a card that not only takes you to your favorite destinations but also rewards every step of your journey with exclusive travel perks.",
      "cta": "Start Your Journey"
    }
  ],
  "life-insurance": [
    {
      "signalLabel": "[life-event] New dependent expenses \u2014 Increased spend at pediatric offices (card), daycare centers (ACH), and children's apparel (card) following birth-event cluster.",
      "title": "New Parent Protection",
      "subject": "Protect your family's future",
      "body": "Hi {{first_name}}, You're building a wonderful life for your family, and we're here to help you keep it secure. Explore options to protect your loved ones' future.",
      "cta": "Get a quote"
    },
    {
      "signalLabel": "[life-event] Increased housing costs \u2014 New recurring ACH payments to a mortgage servicer or significantly larger rent payments (bill-pay) started recently.",
      "title": "New Homeowner Protection",
      "subject": "Secure your home and future",
      "body": "Hi {{first_name}}, Congratulations on your new home! We can help ensure your family can always enjoy the comfort and security of your new space.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Consolidated income dependency \u2014 One primary income source (ACH payroll) increasingly covers household expenses and transfers to other accounts (P2P, bill-pay).",
      "title": "Sole Provider Protection",
      "subject": "Protect your family's foundation",
      "body": "Hi {{first_name}}, You're doing an amazing job supporting your household. Let's make sure your family's financial well-being is always protected, no matter what.",
      "cta": "Learn more"
    }
  ],
  "permanent-life": [
    {
      "signalLabel": "[behavioral] Substantial legal & accounting spend \u2014 Consistent legal and accounting firm payments via ACH, wire, and bill pay, especially for trust and estate services.",
      "title": "Estate Planning Focus",
      "subject": "Secure your legacy with confidence.",
      "body": "Hi {{first_name}}, Planning for the future is a powerful act of love. Explore how permanent life insurance can be a cornerstone of your enduring legacy.",
      "cta": "Plan Your Legacy"
    },
    {
      "signalLabel": "[behavioral] Diversified asset management \u2014 Outflows to multiple brokerages, private equity firms or alternative investment vehicles via ACH and wire transfers.",
      "title": "Sophisticated Investor Outreach",
      "subject": "Enhance your financial portfolio.",
      "body": "Hi {{first_name}}, You've built a diverse financial world. Discover how permanent life insurance can add another layer of strength to your overall strategy.",
      "cta": "Explore Your Options"
    },
    {
      "signalLabel": "[behavioral] Intergenerational wealth transfer \u2014 Regular P2P and wire transfers to multiple family members, often near annual gift tax exclusion limits.",
      "title": "Family-Focused Gifting",
      "subject": "Gift a brighter future.",
      "body": "Hi {{first_name}}, Supporting your loved ones is incredibly rewarding. Learn how permanent life insurance can help you continue to provide for generations to come.",
      "cta": "Support Your Family"
    }
  ],
  "ltc-insurance": [
    {
      "signalLabel": "[behavioral] Emerging Eldercare Costs \u2014 Increased bill-pay to assisted-living facilities, recurring ACH to home healthcare agencies, and P2P payments for care services.",
      "title": "Proactive Eldercare Planners",
      "subject": "Plan for Tomorrow, Today",
      "body": "Hi {{first_name}},\nIt's wonderful to consider how you can support your loved ones' future needs. Planning ahead can bring peace of mind and ensure comfort for everyone.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[life-event] Family Financial Reorganization \u2014 New wires/ACH from family members, trust disbursements, or sudden large transfers to estate-counsel IOLTA accounts.",
      "title": "Family Financial Organizers",
      "subject": "Smooth Family Transitions",
      "body": "Hi {{first_name}},\nNavigating family financial changes can open doors to a more secure future for everyone involved. It\u2019s a great opportunity to strengthen your family's financial well-being.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] Complex Health Spend Uptick \u2014 Rising card spend at specialized medical practices combined with increasing P2P to nursing support or medical supply vendors.",
      "title": "Health & Wellness Advocates",
      "subject": "Embrace a Secure Future",
      "body": "Hi {{first_name}},\nPrioritizing health and well-being can lead to a brighter future. Discovering options for long-term care can bring you and your family greater security and peace of mind.",
      "cta": "Learn How"
    }
  ],
  "annuity": [
    {
      "signalLabel": "[life-event] Pension liquidation and rollover \u2014 Large inbound ACH from known pension administrator, followed by outbound wire to brokerage or mutual fund 'for deposit only'",
      "title": "Pension Rollover Customer",
      "subject": "Make Your Recent Rollover Work Harder",
      "body": "Hi {{first_name}}, You\u2019ve made a smart move for your future. Now, let\u2019s explore options to grow those funds with confidence and guaranteed lifetime income.",
      "cta": "Explore Annuities"
    },
    {
      "signalLabel": "[behavioral] Diversified retirement funding \u2014 Regular inbound transfers from multiple sources including employment income, investment dividends, and external annuity payments across ACH/wire.",
      "title": "Diversified Retirement Investor",
      "subject": "Enhance Your Retirement Income Stream",
      "body": "Hi {{first_name}}, You're a pro at building a diverse financial foundation. Discover how an annuity can add a layer of guaranteed income and tax-deferred growth to your strategy.",
      "cta": "Discover Guarantees"
    },
    {
      "signalLabel": "[life-event] Approaching retirement age \u2014 Consistent payroll deposits declining in frequency or amount, paired with increased medical spending (copays, prescriptions) via card or ACH.",
      "title": "Pre-Retiree",
      "subject": "Secure Your Income for Retirement",
      "body": "Hi {{first_name}}, Retirement is just around the corner, and it's an exciting time! Let\u2019s explore how an annuity can provide steady, guaranteed income so you can relax and truly enjoy it.",
      "cta": "Plan Your Future"
    }
  ],
  "wedding-loan": [
    {
      "signalLabel": "[life-event] High-value jewelry purchase \u2014 Card spend over $2k at fine-jewelry MCCs, often followed by credit card paydown.",
      "title": "Engagement Ring Buyer",
      "subject": "Make your dream wedding sparkle!",
      "body": "Hi {{first_name}}, Planning a wedding is an exciting journey, and we're here to help you shine every step of the way. Discover how easy it can be to manage your special day's expenses.",
      "cta": "Explore Loans"
    },
    {
      "signalLabel": "[life-event] Recurring wedding vendor payments \u2014 Clustered card, Bill-Pay, or ACH outflows to multiple wedding-related categories like venues, caterers, or event planners.",
      "title": "Active Wedding Planner",
      "subject": "Bringing your wedding vision to life!",
      "body": "Hi {{first_name}}, You're putting together an unforgettable celebration! Let us help you manage the many details so you can focus on creating beautiful memories.",
      "cta": "Discover Options"
    },
    {
      "signalLabel": "[life-event] Honeymoon travel bookings \u2014 Clusters of card or online travel agency (OTA) spend for flights, lodging, and experiences in common honeymoon destinations.",
      "title": "Honeymoon Booker",
      "subject": "Your perfect honeymoon awaits!",
      "body": "Hi {{first_name}}, Your dream getaway is within reach! Explore how we can help you create cherished moments as you start your new life together.",
      "cta": "Plan Your Trip"
    }
  ],
  "solo-restart-checking": [
    {
      "signalLabel": "[life-event] Emerging solo bill-pay pattern \u2014 Formerly joint bill-payees (e.g., utility, rent) now exclusively single-payer via ACH or bill-pay, often with new account numbers.",
      "title": "Solo Bill-Pay Transition",
      "subject": "Your fresh start, made easier!",
      "body": "Hi {{first_name}},\nIt's a great opportunity to simplify and refresh your financial routine. We're here to help you manage your solo finances with ease and confidence.",
      "cta": "Explore tools"
    },
    {
      "signalLabel": "[life-event] Family law/legal services engagement \u2014 Multiple disaggregated payments to legal services firms, ",
      "title": "Legal Services Engagement",
      "subject": "Support for your new chapter!",
      "body": "Hi {{first_name}},\nAs you navigate new beginnings, we want to support your financial well-being. Discover tools designed to bring clarity and control to your solo journey.",
      "cta": "Find out more"
    },
    {
      "signalLabel": "[life-event] New solo rent or mortgage payments \u2014 First-time or new recurring rent/mortgage payments via ACH or bill-pay, linked to a single individual, following a period of joint housing payments.",
      "title": "New Solo Housing Payments",
      "subject": "Welcome to your new home!",
      "body": "Hi {{first_name}},\nEmbrace the excitement of your new home and financial independence! We have resources to help you smoothly manage your housing payments and build a bright, solo future.",
      "cta": "Get started"
    }
  ],
  "inherited-ira": [
    {
      "signalLabel": "[life-event] Estate settlement inflow \u2014 Large inbound ACH or wire from an estate counsel IOLTA or trust disbursement, potentially preceded by multiple smaller legal/probate fees.",
      "title": "Estate settlement inflow",
      "subject": "Smooth management for your inheritance!",
      "body": "Hi {{first_name}}, Receiving an inheritance can open new doors for your financial future. Let us help you navigate the possibilities with ease and confidence.",
      "cta": "Plan your future"
    },
    {
      "signalLabel": "[behavioral] Recurring wealth transfer \u2014 Consistent outbound ACHs or bill-pays to a financial advisor or brokerage, following a large estate inflow event.",
      "title": "Recurring wealth transfer",
      "subject": "Keep your wealth growing!",
      "body": "Hi {{first_name}}, It's wonderful to see you actively managing your financial future. Discover new ways to help your wealth grow and support your long-term goals.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] Beneficiary data update \u2014 Digital engagement with beneficiary forms or account titling changes observed across multiple financial platforms or bank products.",
      "title": "Beneficiary data update",
      "subject": "Secure your loved ones' future!",
      "body": "Hi {{first_name}}, Taking steps to secure your legacy is a thoughtful way to care for your loved ones. We're here to help you ensure your wishes are honored for generations to come.",
      "cta": "Review your plan"
    }
  ],
  "second-home-mortgage": [
    {
      "signalLabel": "[behavioral] Vacation area lodging and dining \u2014 Card spend at resorts and restaurants in a distinct geographic region cross-referenced with ACH to local utilities or property management.",
      "title": "Vacation Spender",
      "subject": "Dreaming of a getaway that never ends?",
      "body": "Hi {{first_name}}, longing for a permanent escape to your favorite retreat? We can help make that dream a reality with a second home mortgage. Imagine endless relaxation!",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Second property tax payments \u2014 Multiple large-value ACH or bill-pay transactions to distinct county tax assessors with different geographic markers.",
      "title": "Second Property Tax Payer",
      "subject": "Unlock the door to your second home!",
      "body": "Hi {{first_name}}, you appreciate the value of a second property. Let us help you fully own your home away from home with flexible financing for a second mortgage.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] Remote property maintenance payments \u2014 Recurring card or bill-pay transactions to landscaping, pool, or home repair services in a non-primary residential area.",
      "title": "Remote Property Maintainer",
      "subject": "Your perfect second home is closer than you think!",
      "body": "Hi {{first_name}}, you understand the joy of having a special place. A second home mortgage can help you create even more memorable moments there.",
      "cta": "Learn How"
    },
    {
      "signalLabel": "[life-event] Out-of-area contractor payments \u2014 Large-value ACH or wire transfers to contractors and builders located outside the primary residence's metropolitan area.",
      "title": "Out-of-Area Contractor Payer",
      "subject": "Build your perfect getaway with ease!",
      "body": "Hi {{first_name}}, creating a special space requires vision and resources. We can help you finance your dream second home, exactly as you envision it.",
      "cta": "Start Building"
    }
  ],
  "student-loan-refi": [
    {
      "signalLabel": "[life-event] Student loan consolidation inquiry \u2014 Multiple recent hard credit inquiries from student lenders followed by a new recurring ACH to a consolidated servicer.",
      "title": "Post-Consolidation Refinance",
      "subject": "Unlock even greater savings!",
      "body": "Hi {{first_name}},\nGreat job taking control of your student loans! Now you could save even more with a lower rate on your consolidated loan.",
      "cta": "Check your rate"
    },
    {
      "signalLabel": "[life-event] Career launch income surge \u2014 Significant and sustained increase in payroll deposits, potentially combined with relocation expenses via card and bill pay.",
      "title": "New Career, New Possibilities",
      "subject": "Your career is taking off\u2014imagine your savings!",
      "body": "Hi {{first_name}},\nCongratulations on your career success! This is a perfect time to explore how a lower student loan rate can free up more for your exciting future.",
      "cta": "See your options"
    },
    {
      "signalLabel": "[behavioral] Student loan wallet share shift \u2014 Decreased or terminated ACH payments to original student loan servicers, replaced by new payments to a competing financial institution.",
      "title": "Refinance with Us",
      "subject": "A smarter way to pay off student loans.",
      "body": "Hi {{first_name}},\nReady to make progress on your student debt? Discover an opportunity to refinance with us and enjoy a simpler, more affordable repayment journey.",
      "cta": "Refinance now"
    }
  ],
  "hsa": [
    {
      "signalLabel": "[behavioral] HSA Contribution Trend \u2014 Regular inbound ACH transfers from employer payroll or personal funding to a health savings administrator; may see 'HSA' or 'HEALTH SA' in descriptor.",
      "title": "HSA Regular Contributions",
      "subject": "Grow your health savings!",
      "body": "Hi {{first_name}}, Regular contributions can help you build a strong financial foundation for healthcare. It's a great way to prepare for future medical needs and enjoy potential tax benefits.",
      "cta": "Save smarter"
    },
    {
      "signalLabel": "[behavioral] High Deductible Plan Medical Outflows \u2014 Consistent, out-of-pocket card or ACH payments to medical providers ('HOSPITAL', 'PEDIATRIC', 'RX') before typical insurance coverage limits are met.",
      "title": "HSA High Deductible Plan",
      "subject": "Unlock your health savings potential!",
      "body": "Hi {{first_name}}, Managing healthcare costs is easier when you're prepared. Discover how an HSA can help you save on medical expenses now and in the future.",
      "cta": "Explore benefits"
    },
    {
      "signalLabel": "[life-event] Catch-Up Contribution Eligibility \u2014 Periodic, larger-than-normal ACH or P2P contributions to an HSA administrator, often occurring around age 55, indicating catch-up contributions.",
      "title": "HSA Catch-Up Contributions",
      "subject": "Boost your health savings!",
      "body": "Hi {{first_name}}, You have a special opportunity to add even more to your health savings. Catch-up contributions can help you enhance your financial well-being for retirement healthcare.",
      "cta": "Maximize savings"
    }
  ],
  "donor-advised-fund": [
    {
      "signalLabel": "[behavioral] Significant annual giving \u2014 Large Q4 bill-pay and ACH outflows to diverse charitable organizations, exceeding prior yearly averages by 2x.",
      "title": "High-Volume Givers",
      "subject": "Make your giving go further",
      "body": "Hi {{first_name}}, we're here to help you amplify your giving power. Discover smart ways to support the causes you love, with even greater impact.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[behavioral] Diversified giving portfolio \u2014 Consistent P2P, bill-pay, and card donations to multiple distinct non-profit categories (e.g., education, arts, social services).",
      "title": "Diversified Givers",
      "subject": "Simplify your charitable giving",
      "body": "Hi {{first_name}}, imagine a single, streamlined way to manage all your charitable contributions. We can help you make a difference across every cause you care about.",
      "cta": "Learn More"
    },
    {
      "signalLabel": "[life-event] New philanthropic intent \u2014 Initial large ACH or wire transfer to a DAF sponsor or community foundation, followed by segmented outflows to charities.",
      "title": "New Philanthropic Intent",
      "subject": "Amplify your giving impact",
      "body": "Hi {{first_name}}, ready to make a significant difference in the world? We can help you create a lasting legacy for the causes closest to your heart.",
      "cta": "Get Started"
    }
  ],
  "personal-line-of-credit": [
    {
      "signalLabel": "[life-event] Income Interruption Or Reduction \u2014 Observed absence of typical payroll deposits or recurring income, or a sustained decrease in deposit amounts across ACH and P2P rails.",
      "title": "Income Fluctuation Support",
      "subject": "Smooth out life's financial ins & outs",
      "body": "Hi {{first_name}}, Life has its ups and downs, and we're here to help you navigate them. A personal line of credit can provide a flexible financial cushion when you need it most.",
      "cta": "Explore Options"
    },
    {
      "signalLabel": "[life-event] Emergency Savings Depletion/Creation \u2014 Rapid, multi-rail cash-out movements to external accounts or P2P; or new, consistent inflows from an external investment or savings provider.",
      "title": "Emergency Fund Evolution",
      "subject": "Build your financial safety net",
      "body": "Hi {{first_name}}, Whether you're building a rainy day fund or managing unexpected costs, a personal line of credit can offer peace of mind. It\u2019s a great way to ensure you always have a financial backstop.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] Sustained High Credit Utilization \u2014 Consistent external credit card payments via bill-pay show increasing principal paydowns, indicating rising revolving debt across card rails.",
      "title": "Credit Empowerment",
      "subject": "Take control of your credit",
      "body": "Hi {{first_name}}, Managing your credit can open up new opportunities. A personal line of credit can help you consolidate and simplify your financial landscape, putting you in a stronger position.",
      "cta": "Learn How"
    },
    {
      "signalLabel": "[behavioral] Increased Reliance On Non-Bank Financial Services \u2014 Recurring outbound transfers to alternative lenders or 'pay-over-time' services, indicating use of external credit providers.",
      "title": "Financial Flexibility Boost",
      "subject": "Unlock your financial potential",
      "body": "Hi {{first_name}}, We believe in empowering your financial journey. Explore how a personal line of credit can offer the flexibility you need to achieve your goals and make the most of every moment.",
      "cta": "Get Started"
    }
  ],
  "global-account": [
    {
      "signalLabel": "[life-event] Foreign payroll income \u2014 Recurring ACH or swift credits from foreign employer, with 'PAYROLL' or 'SALARY' in descriptor and non-USD original currency.",
      "title": "Foreign Payroll Recipient",
      "subject": "Make your international earnings go further",
      "body": "Hi {{first_name}}, Managing your foreign income just got easier! Discover a world of possibilities with an account designed to help your money work harder across borders.",
      "cta": "Explore Accounts"
    },
    {
      "signalLabel": "[behavioral] Multi-currency lifestyle indicator \u2014 Sustained card spend in non-USD across multiple currencies, combined with P2P to international recipients.",
      "title": "Global Spender",
      "subject": "Unlock effortless global spending",
      "body": "Hi {{first_name}}, Seamlessly manage your money across different currencies. Enjoy financial freedom and convenience wherever your adventures take you.",
      "cta": "Discover More"
    },
    {
      "signalLabel": "[behavioral] Frequent international transfers \u2014 Recurring outbound or inbound wires/ACH to/from foreign counterparties, including 'SWIFT' or 'IBAN' references.",
      "title": "International Transactor",
      "subject": "Simplify your international transfers",
      "body": "Hi {{first_name}}, Sending money across borders just got simpler and more affordable. Experience effortless international transfers with more savings for you.",
      "cta": "Send Money Now"
    }
  ],
  "homeowners-insurance": [
    {
      "signalLabel": "[life-event] Recent Home Purchase Mortgage \u2014 New mortgage disbursements and principal payments via ACH and wire to a known lender.",
      "title": "Recent Home Purchase",
      "subject": "Protect your new home, and your peace of mind",
      "body": "Hi {{first_name}},\nCongratulations on your new home! As you settle in, let us help you protect your investment and enjoy the peace of mind you deserve.",
      "cta": "Get a quote"
    },
    {
      "signalLabel": "[life-event] Home Improvement Project Concluding \u2014 Clustering of final large-dollar ACH payments to contractors and building material suppliers.",
      "title": "Home Improvement Project Concluding",
      "subject": "Protect your newly improved home",
      "body": "Hi {{first_name}},\nIt's wonderful to see your home improvement project come to life! Now, let's make sure your hard work and investment are well-protected.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[behavioral] No Recurring Home Insurance \u2014 Absence of recurring bill-pay or ACH payments to property & casualty insurers, despite property ownership.",
      "title": "No Recurring Home Insurance",
      "subject": "Safeguard your most valuable asset",
      "body": "Hi {{first_name}},\nYour home is a significant asset. It's a wonderful opportunity to ensure it's fully protected with the right coverage.",
      "cta": "Discover plans"
    }
  ],
  "umbrella-insurance": [
    {
      "signalLabel": "[behavioral] Multiple property tax footprint \u2014 Recurring property tax payments via ACH/BillPay to multiple distinct county/municipality entities indicate ownership of multiple properties.",
      "title": "Multiple Property Owners",
      "subject": "Protect your growing assets",
      "body": "Hi {{first_name}}, Managing multiple properties is a sign of great success! We're here to help you protect all you've built with confidence and ease.",
      "cta": "Explore Coverage"
    },
    {
      "signalLabel": "[life-event] Increased auto insurance premium \u2014 Significant increase in recurring auto insurance payments (card or ACH) following a new driver addition or vehicle purchase event.",
      "title": "New Driver/Vehicle Owners",
      "subject": "Extra protection for your ride",
      "body": "Hi {{first_name}}, Exciting changes often come with new responsibilities. We can help you enhance your coverage, so you can enjoy the road ahead with complete peace of mind.",
      "cta": "Get a Quote"
    },
    {
      "signalLabel": "[behavioral] High-value asset transfers \u2014 Large outbound wire transfers or ACH payments to known luxury good merchants or investment accounts, alongside inbound proceeds from asset sales.",
      "title": "High-Value Asset Owners",
      "subject": "Safeguard your valuable possessions",
      "body": "Hi {{first_name}}, It's wonderful to see your financial journey flourishing! We offer protection designed to secure your most significant assets and your financial future.",
      "cta": "Discover More"
    }
  ],
  "move-financing": [
    {
      "signalLabel": "[life-event] Moving services & deposits payments \u2014 Clustered card spend at movers, container services, and rental agencies, plus ACH/wire for security deposits and first month's rent.",
      "title": "Moving Services & Deposits",
      "subject": "Smooth move ahead!",
      "body": "Hi {{first_name}},\nGet ready for a fresh start! We can help you manage moving services and deposits with ease, so you can focus on settling into your new place.",
      "cta": "Explore options"
    },
    {
      "signalLabel": "[life-event] Out-of-state utility & rent payments \u2014 Concurrent bill-pay enrollment and recurring payments to utility providers and landlords in a new, distant geography.",
      "title": "Out-of-State Utilities & Rent",
      "subject": "New home, happy you!",
      "body": "Hi {{first_name}},\nEmbrace your new adventure! We're here to help you effortlessly manage those initial payments for your new utilities and rent.",
      "cta": "Get support"
    },
    {
      "signalLabel": "[life-event] New local-employer payroll deposit \u2014 New recurring ACH payroll credits from an employer geographically distant from prior employer's location.",
      "title": "New Local Employer Payroll",
      "subject": "New job, new possibilities!",
      "body": "Hi {{first_name}},\nCongratulations on your new role! Let us help you align your finances with this exciting new chapter in your career.",
      "cta": "Discover benefits"
    }
  ]
};
