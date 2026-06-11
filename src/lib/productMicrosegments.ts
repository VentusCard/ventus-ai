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
      "title": "New Parent Education Savings Guide",
      "cta": "Learn about 529 plans",
      "subject": "Preparing for your little one's big future",
      "signalLabel": "[life-event] Newborn purchase cluster — Buy Buy Baby, Carter's, pediatric copays within 90 days",
      "body": "Hi {{first_name}}, as you settle into life with your newest family member, long term planning often takes on a new meaning. We noticed your recent focus on nursery and healthcare essentials and want to help you balance those immediate needs with future goals. A 529 plan allows you to start small now so that your child has a dedicated educational foundation later. Explore how easy it is to begin saving today."
    },
    {
      "body": "Hi {{first_name}}, managing the daily costs of childcare and toddler essentials is a significant part of your family's journey right now. While you are focused on these early milestones, it is also a powerful time to take advantage of tax-deferred growth for future schooling. Setting up a dedicated education account now can help your savings keep pace with your growing family. Discover the benefits of early education planning.",
      "signalLabel": "[life-event] Dependent age inference (0–2 yrs) — Diaper subscriptions, daycare ACH, formula brands",
      "subject": "Small steps for their future education",
      "cta": "View your savings options",
      "title": "Early Childhood Growth and Planning"
    },
    {
      "body": "Hi {{first_name}}, with college applications and campus visits likely on your mind, managing the upcoming costs of higher education is a top priority. A 529 plan can be a strategic tool for your family to handle upcoming tuition and qualified expenses efficiently. We can help you navigate this transition and maximize the impact of your existing savings. Review our college funding strategies.",
      "signalLabel": "[life-event] College-age dependent (16–18 yrs) — Private school tuition, SAT/ACT fees, college tour travel",
      "subject": "Strategic planning for the college years",
      "title": "High School Senior Transition Strategy",
      "cta": "Explore college funding tools"
    },
    {
      "body": "Hi {{first_name}}, we noticed you have been exploring your options for funding a future education on our website. It is a smart move to research how tax-advantaged accounts can help your family's assets grow more effectively over time. We can provide the specific details you need to decide if a 529 plan fits your overall financial strategy. Let us help you find the right path forward.",
      "signalLabel": "[behavioral] Stated savings intent — Search behavior for 'college savings' on bank web app",
      "subject": "Information regarding your college savings search",
      "cta": "Get started with 529s",
      "title": "Education Savings Resource and Support"
    }
  ],
  "heloc": [
    {
      "cta": "Explore renovation financing options",
      "body": "Hi {{first_name}}, we noticed your recent project activity and wanted to help you keep that momentum going. Whether you are updating a kitchen or starting a major structural renovation, having flexible funds can make the process much smoother. A home equity line of credit provides a dedicated source of capital to see your vision through to completion. Let's talk about how you can use your home to fund its own transformation.",
      "subject": "A flexible way to fund your home projects",
      "title": "Project Momentum Home Equity Solution",
      "signalLabel": "behavioral] Home renovation spend — Home Depot, Lowe's, contractor ACH > $1,000"
    },
    {
      "title": "Smart Equity Management for Homeowners",
      "signalLabel": "behavioral] Property tax payment — Annual or semi-annual county treasurer ACH",
      "cta": "View your equity options",
      "body": "Hi {{first_name}}, keeping up with the ongoing costs of your property is a significant part of successful homeownership. Since you have stayed current on your local obligations, you may be in a strong position to access the equity you have built over time. This can serve as a valuable financial tool for anticipated expenses or future investments. We would love to show you how your home equity can work harder for you.",
      "subject": "Unlocking the value in your property"
    },
    {
      "subject": "Your home has grown in value over the years",
      "body": "Hi {{first_name}}, as someone who has been in your home for several years, you have likely built up a significant amount of equity during that time. This milestone is a great opportunity to explore how those years of ownership can help you reach your next financial goal. Whether you are looking to consolidate debt or prepare for a major life event, your home is a powerful resource. We are here to help you understand the borrowing power you have earned.",
      "cta": "Calculate your available equity",
      "signalLabel": "life-event] Long-term homeowner — Mortgage on file > 5 years with current bank",
      "title": "Long Term Homeowner Equity Access"
    }
  ],
  "wealth-management": [
    {
      "body": "Hi {{first_name}}, we noticed some significant activity in your account following your recent equity vesting period. Managing concentrated stock positions often requires a specialized strategy to balance your long-term growth with immediate tax considerations. Our advisors can help you integrate these vests into a comprehensive plan that looks at your entire balance sheet. We should discuss how to optimize these milestone events for your broader financial goals.",
      "title": "Executive Equity Compensation Advisory",
      "signalLabel": "Large equity comp deposit",
      "subject": "Planning for your recent equity vesting",
      "cta": "Review your equity strategy"
    },
    {
      "cta": "Explore unified portfolio management",
      "subject": "Optimizing your monthly investment strategy",
      "body": "Hi {{first_name}}, we noticed your regular contributions toward your external investment accounts and wanted to discuss a more integrated approach. Consolidating your assets under a single holistic strategy can often provide better visibility and more sophisticated risk management. Our team specializes in coordinating complex portfolios to ensure every dollar is working toward your specific objectives. I would value the chance to show you the benefits of our unified platform.",
      "signalLabel": "Recurring brokerage transfers",
      "title": "Sophisticated Wealth Management Integration"
    },
    {
      "cta": "Connect with an advisor",
      "subject": "Tailored advisory for your lifestyle",
      "body": "Hi {{first_name}}, we recognize that your lifestyle involves unique commitments and community engagements that require careful financial navigation. Our wealth management team serves households with complex social and personal balance sheets by providing high-touch, bespoke advisory services. We focus on protecting your legacy while ensuring your liquidity moves in lockstep with your personal priorities. Let us show you how we assist families with similar profiles.",
      "title": "Personalized Family Office Services",
      "signalLabel": "Country club dues"
    },
    {
      "cta": "Schedule a private consultation",
      "subject": "Sophisticated management for your complex needs",
      "body": "Hi {{first_name}}, given your frequent travel requirements and high-value transactions, we believe a more structured partnership could provide significant advantages. Our private wealth advisors are equipped to handle the logistical and financial complexities that come with major asset management and premium transport services. We can help you streamline your cash flow management to match the pace of your professional and personal life. Please let us know when you have a moment to discuss a coordinated approach.",
      "title": "High Net Worth Concierge Advisory",
      "signalLabel": "Private aviation indicator"
    }
  ],
  "auto-loan": [
    {
      "signalLabel": "[behavioral] Repeated dealer visits — Card-present spend at dealerships across 2+ weekends",
      "body": "Hi {{first_name}}, mapping out your next vehicle purchase takes time and effort to find the right fit. Since you have been exploring local options recently, we want to help you move quickly when you find the perfect match. Our pre-approval process gives you the bargaining power of a cash buyer before you even head back to the lot. Let us help you finalize your decision with confidence.",
      "subject": "Ready to bring home your next vehicle?",
      "cta": "Get your pre-approval now",
      "title": "The Proactive Car Buyer Guide"
    },
    {
      "subject": "Planning for the end of your lease",
      "signalLabel": "[life-event] Lease-end timing — Captive lender ACH ending in 60–90 days",
      "body": "Hi {{first_name}}, as your current vehicle lease approaches its final months, it is the perfect time to evaluate your next steps. Whether you plan to purchase your current car or transition into something new, securing your financing early ensures a smooth transition. We offer flexible terms designed to fit your upcoming change in pace. Explore your buyout and new purchase options today.",
      "cta": "View your financing options",
      "title": "Smooth Transition For Lease Ends"
    },
    {
      "title": "Maximizing Your Total Auto Savings",
      "cta": "Check your personalized rate",
      "signalLabel": "[behavioral] Auto insurance shop-around — Multiple insurer one-time charges within 30 days",
      "body": "Hi {{first_name}}, finding the right coverage for your vehicle is a great first step toward managing your total cost of ownership. If you are looking to upgrade your ride or lower your monthly payment, our competitive rates can help you maximize your budget. We can provide a quick quote that complements your new insurance plan perfectly. See how much you could save on your journey.",
      "subject": "New insurance calls for a better rate"
    }
  ],
  "mortgage": [
    {
      "body": "Hi {{first_name}}, finding your own space is a major step toward building long term stability. Your history of consistent monthly housing payments shows you are already managing a significant home expense with ease. Applying that same budget toward a home of your own could help you build equity instead of paying a landlord. Explore how your current spending power translates into homeownership.",
      "title": "Path to Home Ownership archetype",
      "cta": "View your home options",
      "signalLabel": "Rent above local median",
      "subject": "Put your monthly housing budget toward equity"
    },
    {
      "subject": "Take the next step in your home search",
      "title": "Actionable Rate Follow Up archetype",
      "cta": "Continue your mortgage application",
      "signalLabel": "Pre-approval inquiry",
      "body": "Hi {{first_name}}, it was great to see you exploring mortgage options in our digital center recently. Getting a clear picture of current rates is a smart way to prepare for your upcoming home search. Our team is here to help you turn those initial figures into a formal plan for your next move. Review your personalized rate details with us today."
    },
    {
      "subject": "Your milestones are bringing you closer to home",
      "signalLabel": "Down-payment accumulation",
      "cta": "Check your purchase power",
      "title": "Financial Goal Alignment archetype",
      "body": "Hi {{first_name}}, your commitment to building a strong financial foundation is impressive and has put you in a great position. With your growing reserves and steady management of monthly obligations, you may find that a new home is well within reach. We would love to show you how your recent progress aligns with our flexible lending options. See what your savings can do for you."
    }
  ],
  "personal-loan": [
    {
      "body": "Hi {{first_name}}, we noticed you have been using several different payment plans to manage your recent purchases across various stores. While these tools are convenient, keeping track of multiple schedules and due dates can become a bit complicated. A personal loan could help you bring those balances together into one predictable monthly payment with a fixed timeline. This is a simple way to streamline your monthly budget and gain more clarity over your spending.",
      "subject": "Simplify your recent purchase payments",
      "signalLabel": "behavioral] Repeated BNPL usage — Affirm, Klarna, Afterpay charges across 3+ merchants",
      "title": "Consolidated Payment Structure Specialist",
      "cta": "View your loan options"
    },
    {
      "body": "Hi {{first_name}}, your recent account activity shows you have been diligently managing short-term cash needs alongside your regular pay cycle. We would like to offer a more sustainable way to bridge those gaps or handle larger upcoming expenses without the pressure of a quick turnaround. A personal installment loan provides a stable source of funds with a repayment schedule that fits naturally into your long-term financial plan. This approach gives you more flexibility while keeping your daily banking predictable.",
      "subject": "A more flexible way to manage cash flow",
      "signalLabel": "behavioral] Cash-advance recovery — Card cash-advance followed by paycheck-aligned paydown",
      "title": "Stable Cash Flow Solutions Expert",
      "cta": "Check your personal rate"
    },
    {
      "subject": "A structured path for your card balances",
      "body": "Hi {{first_name}}, as your credit card usage has trended upward over the last few months, you might be looking for a more efficient way to manage your total interest. Moving a revolving balance into a fixed-rate personal loan can often reduce your monthly obligations and provide a clear end date for your debt. This transition helps protect your credit health by lowering your utilization across your active cards. We are here to help you find a structured path toward a zero balance.",
      "signalLabel": "behavioral] Revolving balance creep — Card utilization rising for 4+ consecutive cycles",
      "title": "Credit Utilization Strategy Advisor",
      "cta": "Explore consolidation benefits"
    }
  ],
  "high-yield-savings": [
    {
      "subject": "Put your everyday balance to work",
      "title": "Maximizing Surplus Checking Funds",
      "cta": "View your growth options",
      "body": "Hi {{first_name}}, we noticed you have been keeping a substantial cushion in your everyday account lately. While having immediate access to those funds is helpful, a significant portion of that balance could be working harder for you in a dedicated space. Our high-yield savings option allows you to maintain liquidity while ensuring your primary deposits earn a premium rate. Explore how a simple transfer can increase your monthly earnings.",
      "signalLabel": "[behavioral] Idle checking balance — Avg balance > $25k for 90 consecutive days"
    },
    {
      "body": "Hi {{first_name}}, we noticed you are actively moving funds into external wealth management and savings platforms to capture higher yields. We want to ensure you can achieve those same growth goals right here without the need for manual transfers or external apps. Our premium savings account offers a competitive rate designed to keep your assets consolidated and performing at their peak. Check out our current rates to see how we compare.",
      "signalLabel": "[behavioral] Outbound yield-seeking — Recurring ACH to neobank or money-market app",
      "cta": "Review our premium rates",
      "title": "Consolidating Wealth for Better Yield",
      "subject": "A premium rate for your savings"
    }
  ],
  "travel-card": [
    {
      "body": "Hi {{first_name}}, we noticed you have been exploring several different flight options recently. Rather than choosing between loyalty programs, you could be earning flexible rewards that work across all your preferred carriers. Our premium card ensures that every ticket you book brings you closer to your next getaway with enhanced travel benefits. Discover how to make your air travel more rewarding.",
      "subject": "Get more from every flight you book",
      "signalLabel": "Multi-airline spend",
      "title": "Flexible Rewards for Frequent Flyers",
      "cta": "View travel benefits"
    },
    {
      "body": "Hi {{first_name}}, your recent stays across a variety of hotel collections show you value finding the right experience for every trip. We would like to offer a way to earn consistent rewards and enjoy lounge access regardless of where you choose to rest. This card is designed to complement your diverse travel style with premium protections and points. Explore our premium card features.",
      "subject": "Premium perks for your next stay",
      "signalLabel": "Hotel diversity",
      "title": "A Better Way to Stay",
      "cta": "Upgrade your stays"
    },
    {
      "signalLabel": "International transactions",
      "body": "Hi {{first_name}}, since your recent activity shows you frequently spend across borders, you deserve a card that is as global as your lifestyle. You can enjoy seamless international spending while earning points on every purchase made abroad. Plus, our travel protections provide extra peace of mind for all your upcoming departures. Learn about our international benefits.",
      "subject": "Your companion for international travel",
      "cta": "Explore global rewards",
      "title": "Rewards Without Borders"
    }
  ],
  "small-business-loan": [
    {
      "cta": "Explore your funding options",
      "title": "Scaling Your Supplier Infrastructure",
      "subject": "Supporting your growing list of business partners",
      "body": "Hi {{first_name}}, we noticed your recent payments to various professional suppliers and vendors are becoming a regular part of your operations. As your network of partners grows, having dedicated working capital can help you manage these relationships more effectively. Our flexible business loans are designed to bridge the gap between paying your suppliers and receiving your own revenue. We would love to discuss how a line of credit could support your ongoing procurement needs.",
      "signalLabel": "Vendor ACH cluster"
    },
    {
      "cta": "View business loan rates",
      "title": "Professional Capital for Digital Sellers",
      "signalLabel": "Square / Stripe deposits",
      "subject": "Fueling your digital sales growth",
      "body": "Hi {{first_name}}, it looks like your digital payment processing is gaining significant momentum based on your recent deposit activity. Moving from informal processing to a structured business loan can provide the capital you need to scale your sales even further. We offer financing solutions that align with your monthly revenue patterns to help you invest in new growth areas. Let us help you turn that processing volume into a long term expansion plan."
    },
    {
      "cta": "Check your eligibility now",
      "title": "Financing for your business tools",
      "subject": "Investing in your business essentials",
      "body": "Hi {{first_name}}, your recent investments in software subscriptions and essential office supplies suggest you are building a formal foundation for your work. Managing these recurring overhead costs is simpler when you have access to a dedicated term loan for your business expenses. Our lending products are built to help sole proprietors invest in the tools and technology required to stay competitive. See how a small business loan can help you upgrade your professional toolkit today.",
      "signalLabel": "Business-pattern card use"
    }
  ],
  "life-insurance": [
    {
      "title": "New Family Security Planning Account",
      "signalLabel": "life-event] Recent family formation — Newborn cluster + first dependent listed on account",
      "cta": "Explore family protection options",
      "body": "Hi {{first_name}}, congratulations on the recent growth of your family. As you adjust to life with your newest member, ensuring their long term financial security is a natural next step. Term life insurance provides a simple way to protect your family's future so you can focus on the moments that matter today. We would be happy to help you explore coverage options that fit your new household needs.",
      "subject": "Protecting your family's newest chapter"
    },
    {
      "subject": "Securing your new home's future",
      "body": "Hi {{first_name}}, congratulations on your recent home purchase. A new mortgage is a significant milestone, and it often changes how you think about protecting your primary residence and your loved ones. Term life insurance can provide the peace of mind that your home remains a permanent sanctuary for your family regardless of what the future holds. We can help you align your coverage with your new responsibilities as a homeowner.",
      "cta": "View homeowner coverage plans",
      "signalLabel": "life-event] New mortgage holder — Mortgage opened within trailing 12 months",
      "title": "Mortgage Protection Strategy Email"
    },
    {
      "title": "Primary Earner Income Protection Guide",
      "signalLabel": "behavioral] Single-earner household — One W-2 deposit source supporting 2+ dependents",
      "cta": "Review your protection fit",
      "subject": "Peace of mind for your household",
      "body": "Hi {{first_name}}, you work hard to provide for your household and manage your family's daily needs. When others rely on a single source of income, having a dedicated safety net becomes an essential part of a sound financial plan. Term life insurance is designed to replace that income and maintain your family's standard of living for years to come. Let's look at how we can help safeguard the lifestyle you provide for your dependents."
    }
  ],
  "self-directed-brokerage": [
    {
      "body": "Hi {{first_name}},\n\nWe've noticed you're actively managing your investments. Did you know you can consolidate your portfolio and enjoy commission-free trading with us? Gain more control and simplify your financial life all in one place. Explore a world of investment opportunities designed for self-directed investors like you.",
      "signalLabel": "[behavioral] External brokerage transfers \u2014 Recurring ACH to third-party retail brokerage apps",
      "cta": "Explore Commission-Free Trading",
      "subject": "Take control of your investments with commission-free trading",
      "title": "Active Investor, Diversify Your Portfolio"
    },
    {
      "title": "Crypto Curious? Diversify Your Holdings.",
      "subject": "Unlock new investment opportunities beyond crypto",
      "cta": "Discover Diversification Options",
      "body": "Hi {{first_name}},\n\nWe see you're interested in digital assets. While crypto can be exciting, diversifying your portfolio is key to long-term growth. Explore a wide range of traditional investments like stocks, ETFs, and more, all commission-free. Broaden your financial horizons and build a resilient portfolio.",
      "signalLabel": "[behavioral] Crypto exchange activity \u2014 Card or ACH spend at major crypto on-ramps"
    },
    {
      "body": "Hi {{first_name}},\n\nIt looks like you have a healthy cash balance and an interest in investing. Why let your money sit still when it could be working for you? Explore our commission-free platform to easily invest in stocks, ETFs, and more. It's time to put your money to work and achieve your financial goals.",
      "signalLabel": "[behavioral] Idle cash with investing intent \u2014 Checking balance > $10k + research-site visits in-app",
      "cta": "Start Investing Today",
      "title": "Ready to Invest? Grow Your Savings.",
      "subject": "Turn your idle cash into growth opportunities"
    }
  ],
  "robo-portfolio": [
    {
      "title": "New to Investing, Grow Your Wealth",
      "body": "Hi {{first_name}}, we've noticed you're exploring ways to invest. It's a great time to start building your financial future, and we can help make it simple and stress-free. Our guided portfolios are designed for hands-off investors like you, offering diversification and low costs. Let's make your money work harder for you.",
      "cta": "Start investing today",
      "subject": "Ready to grow your investments with ease?",
      "signalLabel": "[behavioral] First-time investor signals \u2014 Small recurring transfers to investing apps under $200"
    },
    {
      "subject": "Make your idle savings work harder for you",
      "signalLabel": "[behavioral] Idle savings drift \u2014 Savings balance flat for 6+ months while income rises",
      "title": "Savings Sitting Still? Time to Grow.",
      "body": "Hi {{first_name}}, it looks like your savings have been steady, and that's great! Have you considered putting some of that money to work? Our guided portfolios can help your savings grow over time, without you needing to lift a finger. It's a smart way to maximize your financial potential.",
      "cta": "Invest your savings"
    },
    {
      "title": "Achieve Your Goals with Smart Investing",
      "cta": "Plan and invest now",
      "body": "Hi {{first_name}}, we saw you're planning for your future using our goal-planner tool \u2013 that's fantastic! Now, let's talk about how to achieve those goals faster. Our guided portfolios can align with your aspirations, providing a diversified and low-cost way to reach your milestones. Let us help you make your dreams a reality.",
      "subject": "Turn your financial goals into reality",
      "signalLabel": "[behavioral] Stated goal-based intent \u2014 Goal-planner tool engagement in bank app"
    }
  ],
  "hybrid-advisor-portfolio": [
    {
      "body": "Hi {{first_name}}, we've noticed your dedication to building wealth, and we believe you're in a prime position to make the most of your financial future. Our Hybrid Advisor Portfolio offers the perfect blend of intelligent investing and personalized human advice to help you reach your goals. Let us help you navigate the complexities of the market with confidence and grow your assets strategically. It's time to elevate your financial strategy.",
      "title": "Build Wealth with Expert Guidance",
      "signalLabel": "[behavioral] Mass-affluent balance band \u2014 Investable assets $100k\u2013$1M across linked accounts",
      "subject": "Unlock Your Portfolio's Full Potential",
      "cta": "Explore Hybrid Advisor Portfolio"
    },
    {
      "subject": "Connect with an Advisor Who Understands You",
      "cta": "Meet Your Financial Advisor",
      "signalLabel": "[behavioral] Advisor search engagement \u2014 Repeated visits to 'find an advisor' page",
      "body": "Hi {{first_name}}, finding the right financial guidance is essential, and we noticed you've been exploring options. Our Hybrid Advisor Portfolio connects you with a dedicated human advisor who can provide personalized insights and support. Gain peace of mind knowing you have an expert by your side, ready to help you make informed decisions. Let's find the perfectly tailored solution for your financial aspirations.",
      "title": "Your Dedicated Advisor Awaits"
    },
    {
      "signalLabel": "[life-event] Life transition trigger \u2014 Inheritance deposit, severance, or business-sale inflow",
      "title": "Navigate New Wealth with Confidence",
      "body": "Hi {{first_name}}, significant life changes often bring new financial opportunities and questions. Our Hybrid Advisor Portfolio is designed to help you strategically manage recent inflows and optimize your financial path forward. Partner with an expert advisor who can provide personalized insights and guide you through this exciting new chapter. Let's ensure your financial future is as bright as possible.",
      "subject": "Expert Guidance for Your Recent Financial Change",
      "cta": "Plan Your Financial Future"
    }
  ],
  "private-wealth": [
    {
      "cta": "Explore Wealth Management Solutions",
      "title": "Sudden Wealth, Lasting Financial Security",
      "signalLabel": "[life-event] Eight-figure inflow event \u2014 Single deposit > $5M from M&A escrow or IPO",
      "subject": "Guidance for Your Recent Financial Milestone",
      "body": "Hi {{first_name}}, congratulations on your recent financial success. An eight-figure liquidity event opens new opportunities for generational wealth and impact. Our team specializes in helping clients like you navigate significant financial transitions with personalized strategies. Let's discuss how we can help you maximize this opportunity and achieve your long-term goals."
    },
    {
      "body": "Hi {{first_name}}, managing multiple properties can be complex, and we understand the challenges involved. Our integrated wealth management approach can help simplify your financial life, offering solutions that bring clarity and efficiency to your diverse holdings. We're here to help you optimize your multi-property portfolio and ensure its continued growth. Discover how our expertise can benefit you.",
      "subject": "Streamline Your Multi-Property Portfolio",
      "title": "Simplify Multi-Property Financial Management",
      "cta": "Discover Property Management Solutions",
      "signalLabel": "[behavioral] Multi-property tax footprint \u2014 Property tax ACH to 3+ counties annually"
    },
    {
      "signalLabel": "[behavioral] Family office indicator \u2014 Recurring payroll outflows + multi-entity transfers",
      "title": "Sophisticated Support for Complex Family Finances",
      "cta": "Learn About Family Office Services",
      "subject": "Enhance Your Family's Financial Operations",
      "body": "Hi {{first_name}}, we recognize the unique complexities of managing substantial family wealth and multiple financial entities. Our private wealth management services are designed to provide the sophisticated support your family needs, integrating advisory, lending, and trust services. We can help streamline your financial operations and ensure your legacy is preserved for future generations. Let us help you achieve your family's financial aspirations."
    }
  ],
  "ira": [
    {
      "signalLabel": "[life-event] Job change rollover trigger \u2014 Final payroll deposit followed by new employer ACH",
      "cta": "Explore Rollover IRA options",
      "body": "Hi {{first_name}}, congratulations on your recent career move! We noticed some account activity that suggests you might be transitioning between employers. This is a perfect time to consider rolling over your old 401(k) into an IRA to keep your retirement savings growing. We're here to help make the process smooth and stress-free.",
      "title": "Seamless Rollover for Your New Chapter",
      "subject": "Congratulations on the new job! Let's talk retirement."
    },
    {
      "signalLabel": "[behavioral] Maxed 401(k) saver \u2014 Consistent pre-tax payroll deferrals near IRS limit",
      "body": "Hi {{first_name}}, your consistent dedication to saving for retirement is truly impressive. We see you're making excellent use of your 401(k) and are likely approaching the maximum contribution limits. An Individual Retirement Account (IRA) could be an excellent way to further boost your tax-advantaged savings. Let's explore how you can continue building your wealth.",
      "cta": "Discover IRA opportunities",
      "title": "Maximize Your Retirement Savings Potential",
      "subject": "You're a great saver! Ready to do more for retirement?"
    },
    {
      "cta": "Plan your self-employed retirement",
      "body": "Hi {{first_name}}, as a self-employed individual, you have unique opportunities to save for retirement. We've noticed your income reflects a strong independent spirit, and we want to ensure your financial future is just as strong. An Individual Retirement Account (IRA) can offer significant tax advantages and flexibility tailored to your entrepreneurial journey. Let us help you plan for a secure retirement.",
      "signalLabel": "[behavioral] Self-employed income \u2014 1099 deposits without W-2 payroll",
      "title": "Retirement Solutions for the Self-Employed",
      "subject": "Self-employed? Build your retirement wealth with an IRA."
    }
  ],
  "trust-estate": [
    {
      "cta": "Explore Estate Solutions",
      "body": "Hi {{first_name}}, we've noticed your dedication to securing your family's future through careful planning. It's a proactive step that truly makes a difference. Our Trust & Estate Services are designed to complement your efforts, providing comprehensive multi-generational wealth structuring and administration. Let us help ensure your legacy is preserved and your wishes are honored for years to come. We're here to offer seamless support and expert guidance.",
      "signalLabel": "[behavioral] Estate planning attorney spend \u2014 Recurring legal ACH plus notary fees",
      "subject": "Guidance for your estate and legacy planning",
      "title": "Proactive Estate Planning & Wealth Transfer"
    },
    {
      "signalLabel": "[life-event] Aging household signal \u2014 Primary holder 65+ with charitable giving uptick",
      "title": "Legacy Building & Philanthropic Giving",
      "subject": "Thoughtful ways to amplify your charitable impact",
      "cta": "Plan Your Charitable Legacy",
      "body": "Hi {{first_name}}, it's inspiring to see your continued commitment to causes you care about. As life evolves, so too can your capacity for making a meaningful difference. Our Trust & Estate Services can help you integrate your philanthropic goals with your overall wealth strategy, ensuring your generosity creates a lasting impact. We specialize in structuring multi-generational plans that align with your values and provide peace of mind."
    },
    {
      "body": "Hi {{first_name}}, periodically reviewing your beneficiary information is a smart way to ensure your assets are distributed according to your wishes. Life changes, and your plans may need to as well. Our Trust & Estate Services can provide a comprehensive review of your current arrangements and help you implement any necessary updates. We're here to ensure your intentions are clearly understood and legally sound, offering you complete peace of mind.",
      "cta": "Update Your Beneficiaries",
      "signalLabel": "[behavioral] Beneficiary update activity \u2014 In-app beneficiary form interactions",
      "title": "Ensuring Your Beneficiary Designations Are Current",
      "subject": "Reviewing your beneficiary arrangements for accuracy"
    }
  ],
  "values-portfolio": [
    {
      "signalLabel": "[behavioral] Sustainable consumer pattern \u2014 Recurring spend at certified-B / organic grocers",
      "body": "Hi {{first_name}},\n\nIt's clear you're committed to making responsible choices with your purchases. What if your investments could reflect that same dedication to sustainability and impact? Our Values-Aligned Portfolio helps you grow your wealth while supporting companies that share your vision for a better world. Let your money make a difference, just like your spending habits do.",
      "subject": "Invest in a future that aligns with your values.",
      "title": "Conscious Consumer, Conscious Investor",
      "cta": "Explore Sustainable Investing Options"
    },
    {
      "title": "Passionate Donor, Purposeful Investor",
      "cta": "Discover Impactful Investment Solutions",
      "subject": "Amplify your impact through values-aligned investing.",
      "body": "Hi {{first_name}},\n\nYour consistent support for important causes is truly inspiring. Imagine extending that positive influence to your investment portfolio. Our Values-Aligned Portfolio empowers you to invest in companies actively working towards environmental and social good, aligning your financial growth with your philanthropic spirit. It's an opportunity to create even greater change.",
      "signalLabel": "[behavioral] Charitable giving cadence \u2014 Monthly donations to environmental or social causes"
    },
    {
      "subject": "Drive your investments toward a sustainable future.",
      "cta": "Invest in a Sustainable Tomorrow",
      "title": "Eco-Conscious Driver, Green Investor",
      "signalLabel": "[behavioral] EV ownership \u2014 Charging network subscriptions and EV-tax-credit refund",
      "body": "Hi {{first_name}},\n\nYour choice to drive an electric vehicle demonstrates your commitment to a cleaner, more sustainable future. Why not extend that forward-thinking approach to your investments? Our Values-Aligned Portfolio focuses on companies pioneering sustainable solutions, including advancements in renewable energy and green technology. Invest in the innovations that power the world you want to see."
    }
  ],
  "auto-refi": [
    {
      "title": "Opportunity to Lower Your Auto Payments",
      "signalLabel": "[behavioral] High-APR captive lender \u2014 Monthly ACH to subprime auto lender > 24 months",
      "subject": "A New Path to Car Ownership Savings",
      "body": "Hi {{first_name}}, we've noticed you've been consistently managing your auto loan payments. We believe there might be an opportunity to significantly reduce your monthly expenses.\n\nImagine keeping more of your hard-earned money each month. An auto refinance could make that a reality, potentially lowering your interest rate and saving you money over the life of your loan.\n\nThis is a chance to move towards a more financially comfortable future.",
      "cta": "See Your New Rate"
    },
    {
      "cta": "Unlock Your Savings",
      "title": "Your Stronger Credit, Better Auto Loan",
      "signalLabel": "[behavioral] Credit score improvement \u2014 Bureau-pulled score up 60+ pts since origination",
      "body": "Hi {{first_name}}, we've seen positive changes in your credit profile recently. Congratulations on improving your financial standing!\n\nThis improved credit score could open doors to better financial opportunities, especially when it comes to your auto loan. You may now qualify for a lower interest rate, which could lead to significant savings.\n\nIt's a great time to review your current auto financing and see how your hard work can pay off.",
      "subject": "Great News: Your Credit Score Has Improved!"
    },
    {
      "cta": "Get Your Lower Payment",
      "body": "Hi {{first_name}}, it's great to see your financial situation has improved recently. That increased income provides a fantastic opportunity to optimize your expenses.\n\nWith your enhanced earning power, you may be in a prime position to refinance your auto loan at a much lower rate. This could free up more cash flow each month, giving you greater financial flexibility.\n\nConsider how much more you could save and achieve with reduced monthly payments.",
      "subject": "Your Recent Income Growth Can Save You More!",
      "signalLabel": "[life-event] Income step-up \u2014 Payroll deposit increase > 15% sustained 6 months",
      "title": "Higher Income, Lower Auto Payments"
    }
  ],
  "starter-checking": [
    {
      "cta": "Open Student Checking Account",
      "signalLabel": "[life-event] Student inflow pattern \u2014 University refunds, work-study payroll, parent transfers",
      "body": "Hi {{first_name}}, navigating student finances can be tricky, but it doesn't have to be. Our Starter Checking account is designed with features that make managing your money simple and stress-free. Enjoy peace of mind with no overdraft fees and easy ways to receive funds, so you can focus on what matters most \u2013 your studies. It\u2019s a smart way to handle your money as you embark on your academic journey.",
      "subject": "Unlock Financial Freedom for Your Student Life",
      "title": "Students: Easy Checking for Busy Lives"
    },
    {
      "signalLabel": "[life-event] Thin-file young adult \u2014 Age 18\u201324 with single low-volume account",
      "cta": "Start Your Financial Journey",
      "title": "Young Adults: Your First Real Bank",
      "body": "Hi {{first_name}}, as you're starting to build your financial independence, it's essential to have a checking account that grows with you. Our Starter Checking account is perfect for young adults looking for a secure and straightforward way to manage their money. With no overdraft fees, you can confidently take control of your finances without unexpected surprises. Let us help you lay a strong foundation for your financial journey.",
      "subject": "Build Your Financial Future, One Step at a Time"
    },
    {
      "signalLabel": "[behavioral] Prepaid card top-ups \u2014 Recurring loads to prepaid debit programs",
      "cta": "Upgrade to Starter Checking",
      "title": "Smart Spenders: Upgrade Your Banking",
      "body": "Hi {{first_name}}, if you're regularly adding funds to other cards, imagine the convenience and benefits of a full-featured checking account. Our Starter Checking account offers a more integrated banking experience, designed to simplify how you manage your everyday spending. Enjoy the security and flexibility of a traditional bank account without worrying about overdraft fees. It's time to elevate your financial routine.",
      "subject": "Get More From Your Money Without the Fees"
    }
  ],
  "everyday-checking": [
    {
      "subject": "Make the most of every payday!",
      "title": "Your Paycheck, Elevated: Everyday Checking",
      "signalLabel": "[behavioral] Direct deposit anchor \u2014 Recurring W-2 payroll deposit as primary inflow",
      "cta": "Upgrade Your Checking Now",
      "body": "Hi {{first_name}},\n\nWe noticed you're a pro at managing your finances, especially with your regular direct deposits. Everyday Checking can help you elevate your financial game even further. Enjoy peace of mind with reliable bill pay and easy ATM access nationwide. It's time to make your money work harder for you."
    },
    {
      "signalLabel": "[behavioral] Recurring bill-pay use \u2014 5+ scheduled bill-pay payees active monthly",
      "subject": "Simplify your spending with Everyday Checking",
      "title": "Streamlined Bills, Smarter Banking",
      "cta": "Discover Easy Bill Pay",
      "body": "Hi {{first_name}},\n\nManaging multiple bills can be a juggle, and it looks like you're on top of it! Our Everyday Checking account simplifies your financial life even more with robust bill pay features. Keep your payments organized and on schedule, all in one convenient place. Experience banking that keeps pace with your busy life."
    },
    {
      "cta": "Explore Joint Account Benefits",
      "body": "Hi {{first_name}},\n\nCongratulations on your recent move and new joint account! This exciting chapter is the perfect time to optimize your shared finances. Everyday Checking offers convenient features like direct deposit and extensive ATM access, making it easier to manage household expenses together. Let us help you build a strong financial foundation for your future.",
      "signalLabel": "[life-event] Household formation \u2014 Recent address change + joint account opening",
      "title": "New Beginnings, Shared Financial Journey",
      "subject": "Congrats on your new home and new account!"
    }
  ],
  "relationship-checking": [
    {
      "title": "Valued Multi-Product Household Member",
      "cta": "Explore Relationship Checking",
      "signalLabel": "[behavioral] Multi-product household \u2014 Customer holds 3+ products across deposits, cards, and lending",
      "body": "Hi {{first_name}}, we truly appreciate your relationship with us across multiple products. We'd like to ensure you're maximizing the benefits of banking with us. Our Relationship Checking account offers enhanced features and rewards designed for customers like you, who trust us with their diverse financial needs.",
      "subject": "Thank You For Being a Valued Customer!"
    },
    {
      "title": "High Balance Deposit Account Holder",
      "cta": "Discover Premium Checking",
      "subject": "Unlock More Value From Your Deposits",
      "body": "Hi {{first_name}}, your consistent high balances reflect your sound financial management. We believe your dedication deserves to be rewarded. Our Relationship Checking account could provide you with even greater benefits through rate bonuses and fee waivers, further enhancing the value of your deposits.",
      "signalLabel": "[behavioral] High average balance \u2014 Combined deposits > $20k for trailing 90 days"
    },
    {
      "title": "Wealth Management Client Benefits",
      "cta": "Enhance Your Banking",
      "subject": "Special Benefits For Our Wealth Clients",
      "body": "Hi {{first_name}}, as a valued wealth management client, we\u2019re always looking for ways to provide you with additional advantages. Our Relationship Checking account is designed to complement your existing financial strategies. Enjoy preferred rates and waived fees that align with your comprehensive financial approach, streamlining your banking experience.",
      "signalLabel": "[behavioral] Wealth product overlap \u2014 Linked brokerage or advised assets on file"
    }
  ],
  "core-savings": [
    {
      "signalLabel": "[behavioral] Round-up saver pattern \u2014 Frequent small recurring transfers from checking",
      "title": "Smart Savers: Grow Your Change",
      "subject": "Keep up the great saving, {{first_name}}!",
      "body": "Hi {{first_name}}, we've noticed you're a pro at saving those small amounts regularly. Imagine how much more you could save with a dedicated account designed to make every penny count. Our Core Savings account helps you reach your goals faster with seamless transfers. It\u2019s a simple way to build your savings effortlessly.\n",
      "cta": "Explore Core Savings Benefits"
    },
    {
      "title": "Achieve Your Savings Dreams",
      "signalLabel": "[behavioral] Goal-based saving \u2014 Self-named savings sub-accounts created in-app",
      "cta": "Supercharge Your Savings Goals",
      "subject": "Hey {{first_name}}, let's hit those goals together!",
      "body": "Hi {{first_name}}, it's inspiring to see you actively setting and striving for your financial goals. Our Core Savings account is the perfect companion to keep those dreams on track. With powerful automation tools, you can supercharge your progress towards each and every one of your aspirations. Let us help you turn those goals into reality.\n"
    },
    {
      "signalLabel": "[life-event] Tax-refund inflow \u2014 IRS or state refund deposit > $1,000",
      "title": "Your Refund, Smarter Savings",
      "body": "Hi {{first_name}}, with your recent deposit, now is a fantastic time to bolster your financial future. Our Core Savings account can transform that lump sum into lasting growth, giving you peace of mind. Set up easy transfers to ensure your savings continue to build momentum effortlessly. Turn your refund into a foundation for financial success.\n",
      "subject": "Make your tax refund work harder, {{first_name}}!",
      "cta": "Start Saving Your Refund"
    }
  ],
  "certificate-of-deposit": [
    {
      "signalLabel": "[life-event] Maturing external CD \u2014 Lump-sum inflow from competitor bank near month-end",
      "subject": "Time to Reinvest? Explore CD Options",
      "cta": "Explore CD Rates Now",
      "body": "Hi {{first_name}},\n\nWe noticed you recently received a significant deposit. This could be the perfect time to explore options for growing your savings securely. Our Certificates of Deposit offer guaranteed returns, allowing you to lock in a great rate. Let your money work harder for you with peace of mind.",
      "title": "Your Maturing CD & New Opportunities"
    },
    {
      "signalLabel": "[life-event] Retirement-age saver \u2014 Primary holder 60+ with conservative balance growth",
      "subject": "Grow Your Retirement Savings Safely",
      "body": "Hi {{first_name}},\n\nAs you enjoy your retirement years, ensuring the stability and growth of your savings remains a top priority. Our Certificates of Deposit are designed to provide a secure and predictable return on your investment. You can enjoy guaranteed rates and protect your principal, aligning with a conservative growth strategy. Let's discuss how CDs can fit into your financial plan.",
      "cta": "Learn About Retirement CDs",
      "title": "Secure Growth for Retirement Savings"
    },
    {
      "signalLabel": "[behavioral] Treasury-purchase activity \u2014 Outbound ACH to TreasuryDirect or T-bill ETFs",
      "subject": "Considering Treasuries? Look at Our CDs",
      "cta": "Discover Our CD Options",
      "body": "Hi {{first_name}},\n\nWe see you're actively seeking strong returns from fixed-income investments. Our Certificates of Deposit offer competitive, guaranteed rates that can complement your existing strategy. Enjoy the simplicity and security of a CD without market fluctuations. It's a great way to diversify your fixed-income portfolio.",
      "title": "Maximizing Your Fixed-Income Returns"
    }
  ],
  "category-cashback-card": [
    {
      "subject": "Unlock More Cash Back on What You Love!",
      "cta": "Choose Your Bonus Category",
      "signalLabel": "[behavioral] Concentrated category spend \u2014 Single category > 40% of card spend (gas, dining, online)",
      "body": "Hi {{first_name}},\n\nWe've noticed you have a favorite spending category, and we think you deserve to be rewarded even more for it! Our Category Cash Back Card lets you choose a bonus category for accelerated cash back, so you can earn more on the purchases you already make. It's an easy way to boost your rewards without changing your habits.\n\nSee how much more you could be earning today!",
      "title": "Maximize Rewards on Your Favorite Spend"
    },
    {
      "body": "Hi {{first_name}},\n\nWe see you're savvy about earning rewards, and we believe you deserve the best. Our Category Cash Back Card offers a unique opportunity to earn elevated cash back in a category you choose, giving you more control over your rewards. It's a great way to complement your existing rewards strategy and unlock even greater value.\n\nExplore higher cash back rewards now!",
      "title": "Boost Your Rewards Earning Potential",
      "signalLabel": "[behavioral] Competitor rewards card use \u2014 External card statement payments via bill-pay",
      "subject": "Discover Smarter Rewards with Our Cash Back Card",
      "cta": "Explore Category Cash Back"
    },
    {
      "signalLabel": "[behavioral] First-card upgrade signal \u2014 Holds entry-level card with rising monthly volume",
      "body": "Hi {{first_name}},\n\nWe've noticed your spending activity has increased, and that's great news! With your growing purchasing power, you're in a perfect position to maximize your rewards. Our Category Cash Back Card is the ideal next step, allowing you to choose a bonus category and earn more cash back on your everyday spending.\n\nIt's time your card kept up with your spending!",
      "title": "Your Spending Has Grown, Your Rewards Can Too",
      "cta": "Upgrade to More Rewards",
      "subject": "Upgrade Your Rewards with a Category Cash Back Card!"
    }
  ],
  "flat-cashback-card": [
    {
      "title": "Diverse Spender, Simple Rewards",
      "subject": "Unlock More Rewards on All Your Purchases",
      "cta": "Get Your Cash Back Card",
      "body": "Hi {{first_name}}, we've noticed your spending is wonderfully varied, covering all aspects of life! Imagine earning unlimited cash back on every single one of those purchases, without the hassle of tracking categories. Our Flat-Rate Cash Back Card is designed for just that\u2014effortless rewards no matter what you're buying. It's time to simplify your savings and maximize every dollar spent.",
      "signalLabel": "[behavioral] Diversified everyday spend \u2014 No single category > 25% of card volume"
    },
    {
      "subject": "Maximize Your Rewards with Every Transaction",
      "title": "High Spender, High Rewards Potential",
      "body": "Hi {{first_name}}, as someone who uses their card frequently across many different places, you're in a prime position to earn significant rewards. Our Flat-Rate Cash Back Card offers unlimited cash back on every purchase, truly rewarding your active lifestyle. No matter how much you spend or where, you'll always be earning. See how much more you could be getting back.",
      "signalLabel": "[behavioral] High monthly card volume \u2014 Card spend > $3k/mo across 50+ merchants",
      "cta": "Explore Unlimited Cash Back"
    },
    {
      "cta": "Simplify Your Rewards Now",
      "body": "Hi {{first_name}}, we understand that life is busy enough without having to remember to activate spending categories. Our Flat-Rate Cash Back Card is built for ultimate simplicity, offering unlimited cash back on every purchase you make. Forget about rotating categories or special offers; just swipe and earn. It's the easiest way to ensure you're always getting rewarded.",
      "signalLabel": "[behavioral] Simplicity preference \u2014 Customer ignores category-activation prompts in app",
      "title": "Effortless Rewards, No Category Hassle",
      "subject": "Simple Cash Back, No Activation Needed"
    }
  ],
  "premium-travel-card": [
    {
      "cta": "Upgrade Your Business Travel",
      "body": "Hi {{first_name}}, we've noticed your consistent travel for business. Imagine turning every trip into an opportunity for comfort and exclusive perks. Our Premium Travel Card is designed to enhance your journeys, offering benefits that cater to your on-the-go lifestyle. Apply now, and transform the way you travel for work.",
      "subject": "Make your frequent business travel more rewarding",
      "title": "Road Warrior's Elevated Travel Experience",
      "signalLabel": "[behavioral] Frequent business travel \u2014 Weekly hotel + airline pattern Mon\u2013Thu"
    },
    {
      "signalLabel": "[behavioral] Lounge-day-pass spend \u2014 Card spend at airport lounges or day-pass providers",
      "title": "Enjoy Exclusive Airport Lounge Access",
      "subject": "Unlock unlimited lounge access with our Premium Card",
      "body": "Hi {{first_name}}, we see you value comfort and convenience at the airport. Imagine having unlimited access to a network of airport lounges worldwide, enhancing your pre-flight experience every time. Our Premium Travel Card offers complimentary lounge access, making every wait a luxurious escape. Discover a better way to relax before your next journey.",
      "cta": "Access Premium Lounges Now"
    },
    {
      "cta": "Discover Premium Card Benefits",
      "body": "Hi {{first_name}}, our records indicate you appreciate the benefits of a premium card. Elevate your financial experience with a card that rewards your loyalty even further. The Premium Travel Card offers unparalleled perks, from extensive travel credits to exclusive access, making your annual fee an investment in luxury. See how much more you can gain.",
      "subject": "Get more from your annual fee \u2013 explore our premium card",
      "title": "Unlock More Value From Your Card",
      "signalLabel": "[behavioral] Annual-fee tolerance \u2014 Existing $95+ annual-fee card paid on time 24+ months"
    }
  ],
  "ultra-premium-travel-card": [
    {
      "body": "Hi {{first_name}}, we've noticed your preference for exceptional accommodations. Imagine enhancing those stays with exclusive benefits, from VIP treatment to complimentary upgrades. The Ultra-Premium Travel Card is designed to seamlessly integrate with your lifestyle, offering unparalleled perks that elevate every moment of your journey. Discover how effortless luxury travel can be.",
      "signalLabel": "[behavioral] Luxury hotel pattern \u2014 Stays at 5-star chains averaging > $600/night",
      "title": "Luxury hotel stays, elevated.",
      "cta": "Explore hotel benefits",
      "subject": "Unlock even more luxury on your next trip."
    },
    {
      "body": "Hi {{first_name}}, your global adventures deserve the finest. We understand you value comfort and exclusivity when traveling internationally. The Ultra-Premium Travel Card offers a suite of benefits, including exclusive lounge access and dedicated concierge services, to make every journey as effortless as it is luxurious. Elevate your flying experience from takeoff to touchdown.",
      "signalLabel": "[behavioral] International first/business class \u2014 Single-ticket airline charges > $5,000",
      "title": "Seamless, first-class global journeys.",
      "cta": "Discover travel advantages",
      "subject": "Experience smoother, more rewarding international travel."
    },
    {
      "subject": "Complimentary luxury travel with your financial profile.",
      "cta": "Maximize your travel",
      "title": "Your wealth, your world, enhanced.",
      "signalLabel": "[behavioral] High investable assets \u2014 Linked advised assets > $1M",
      "body": "Hi {{first_name}}, as someone with substantial investable assets, you appreciate strategic advantages. The Ultra-Premium Travel Card offers benefits that align perfectly with an affluent lifestyle, providing complimentary access to exclusive experiences and services. Maximize the value of your wealth through unparalleled travel perks, designed for those who expect the best. Enjoy a card that complements your financial success."
    }
  ],
  "balance-transfer-card": [
    {
      "body": "Hi {{first_name}},\n\nWe've noticed you're consistently managing your credit card payments, which is great to see. Imagine if those payments were working harder for you.\n\nOur Low-Rate Balance Transfer Card is designed for responsible cardholders like you who want to optimize their finances. Transfer your existing balances and enjoy a long 0% intro APR, giving you a valuable window to pay down debt faster.\n\nThis could significantly reduce your monthly interest payments and help you reach your financial goals sooner.",
      "signalLabel": "[behavioral] External card revolve \u2014 Recurring bill-pay to external issuers with minimum-payment pattern",
      "cta": "Transfer & Start Saving",
      "subject": "A smarter way to manage your balances.",
      "title": "Smart Payer, Smarter Card Choice"
    },
    {
      "subject": "Stop paying high interest. Start saving.",
      "title": "Reduce High-Interest Debt Now",
      "cta": "Lower Your Interest Now",
      "signalLabel": "[behavioral] High-APR debt service \u2014 Estimated finance charges > $75/mo on outside debt",
      "body": "Hi {{first_name}},\n\nIt looks like you're carrying some higher-interest balances, and we understand how that can impact your financial flexibility. What if you could significantly reduce those monthly interest payments?\n\nOur Low-Rate Balance Transfer Card offers a long 0% intro APR, allowing you to move your balances and focus on paying down the principal. This could free up more of your money to put towards your goals.\n\nTake control of your debt and experience meaningful savings."
    },
    {
      "subject": "An exclusive offer for responsible cardholders.",
      "title": "Excellent Payer, Excellent Card Offer",
      "body": "Hi {{first_name}},\n\nYour consistent history of on-time payments across all your accounts truly stands out, reflecting excellent financial management. We appreciate your dedication to responsible credit habits.\n\nFor customers like you, our Low-Rate Balance Transfer Card offers a fantastic opportunity to optimize your existing credit. Enjoy a long 0% intro APR when you transfer balances from other cards, giving you a clear path to becoming debt-free even faster.\n\nThis is our way of rewarding your financial prudence with a powerful tool for savings.",
      "signalLabel": "[behavioral] Stable income, no delinquencies \u2014 On-time payments 24+ months across all accounts",
      "cta": "Claim Your 0% APR"
    }
  ],
  "cobrand-card": [
    {
      "body": "Hi {{first_name}},\n\nWe've noticed you have a strong connection with a particular brand you love. Imagine getting even more out of every experience \u2013 from exclusive access to accelerated rewards. Our Co-Brand Partner Card is designed to elevate your loyalty into extraordinary benefits. It\u2019s time to make your everyday spending even more rewarding.",
      "signalLabel": "[behavioral] Single-brand loyalty \u2014 60%+ of category spend with one airline, hotel, or retailer",
      "cta": "Explore Your Card Benefits",
      "subject": "Unlock Greater Rewards with Your Favorite Brand",
      "title": "Your Loyalty Deserves More Rewards"
    },
    {
      "cta": "Discover Enhanced Rewards",
      "signalLabel": "[behavioral] Loyalty-program engagement \u2014 Recurring redemptions or status-qualifying spend",
      "subject": "Enhance Your Loyalty Program Experience",
      "body": "Hi {{first_name}},\n\nWe see you're actively engaging with loyalty programs, and that's fantastic! What if your loyalty could take you even further, turning every redemption and every qualifying spend into something even more meaningful? Our Co-Brand Partner Card is built to complement your dedication, offering ways to supercharge your existing benefits. It\u2019s a seamless way to get more from what you already enjoy.",
      "title": "Maximize Your Loyalty Program Perks"
    },
    {
      "body": "Hi {{first_name}},\n\nWe've noticed your consistent travel patterns with a brand you trust, making the most of every season. How would you like to make those predictable adventures even more rewarding, from booking to experiencing your destination? Our Co-Brand Partner Card is tailored to enhance your regular journeys, offering benefits that align with your travel habits. Turn your regular seasonal plans into opportunities for elevated rewards.",
      "subject": "Make Your Seasonal Travel More Rewarding",
      "signalLabel": "[behavioral] Seasonal travel pattern \u2014 Predictable annual booking cadence with same brand",
      "cta": "Upgrade Your Travel Rewards",
      "title": "Travel Smarter, Earn More Every Season"
    }
  ],
  "permanent-life": [
    {
      "body": "Hi {{first_name}}, when building a robust estate plan, it's wise to consider all your options. Permanent life insurance can be a valuable tool, offering not just a death benefit, but also cash value growth. This allows for both security and flexibility in your financial strategy. Let's explore how it can complement your existing plans.",
      "signalLabel": "[behavioral] Estate planning attorney spend \u2014 Recurring legal ACH plus trust formation fees",
      "cta": "Plan Your Estate",
      "subject": "A smart way to protect your legacy",
      "title": "Secure Your Legacy, Seamlessly"
    },
    {
      "body": "Hi {{first_name}}, with substantial assets, you understand the importance of smart wealth management. Permanent life insurance offers unique tax advantages, allowing your cash value to grow tax-deferred and providing a tax-free death benefit. This can be a strategic component in both preserving and growing your financial portfolio. Discover how it can work for you.",
      "signalLabel": "[behavioral] High investable assets \u2014 Linked advised assets > $2M with tax-efficiency focus",
      "cta": "Explore Tax Advantages",
      "subject": "Enhance your financial strategy with tax efficiency",
      "title": "Optimize Your Wealth, Tax-Efficiently"
    },
    {
      "cta": "Secure Their Future",
      "body": "Hi {{first_name}}, your commitment to supporting future generations is commendable. Permanent life insurance can be a powerful vehicle for multi-generational wealth transfer beyond annual gifting. It ensures a substantial legacy for your loved ones, often with tax benefits. Learn how to maximize your generosity.",
      "signalLabel": "[behavioral] Multi-generational gifting \u2014 Annual transfers near IRS gift-tax exclusion to family members",
      "subject": "A thoughtful way to leave a lasting gift",
      "title": "Gift Future Generations Securely"
    }
  ],
  "ltc-insurance": [
    {
      "title": "Planning for Your Financial Future",
      "subject": "A smart step for your retirement years",
      "cta": "Secure Your Future Now",
      "body": "Hi {{first_name}}, we understand you're in a key life stage, actively planning for your retirement. This is an ideal time to consider how Long-Term Care Insurance can safeguard your assets and provide peace of mind. Our coverage offers financial protection, ensuring you have options for care as you age. Let's explore how a personalized plan can fit your unique needs.",
      "signalLabel": "[life-event] Pre-retiree age band \u2014 Primary holder 55\u201365 with stable income"
    },
    {
      "title": "Supporting Loved Ones, Protecting Yourself",
      "subject": "Support your family and your finances",
      "cta": "Explore Your Coverage Options",
      "signalLabel": "[behavioral] Parent-care indicators \u2014 Recurring ACH to assisted-living or in-home care providers",
      "body": "Hi {{first_name}}, caring for a loved one is a rewarding, yet often challenging, experience. You're likely familiar with the financial commitment involved in providing quality care. Long-Term Care Insurance can help alleviate the burden, ensuring you have resources available should you ever need similar support. Protect your own financial well-being while continuing to provide excellent care."
    },
    {
      "subject": "Stay ahead of rising healthcare costs",
      "title": "Proactive Steps for Future Care",
      "signalLabel": "[behavioral] Health-cost uptick \u2014 Rising medical specialist copays and pharmacy spend",
      "body": "Hi {{first_name}}, with healthcare costs on the rise, it's wise to consider how you'll manage potential long-term care expenses. Long-Term Care Insurance offers a proactive solution to protect your savings and ensure access to the care you deserve. By planning ahead, you can reduce future financial stress and maintain your independence. Let\u2019s discuss how this coverage can benefit you.",
      "cta": "Understand Your LTC Choices"
    }
  ],
  "annuity": [
    {
      "signalLabel": "[life-event] Retirement countdown \u2014 Primary holder 60\u201370 with declining payroll deposits",
      "title": "Approaching Retirement? Secure Your Income.",
      "subject": "Your Retirement Income Plan",
      "body": "Hi {{first_name}},\n\nAs you approach retirement, we understand you're thinking about how to turn your savings into a reliable income stream. An annuity can provide guaranteed income for life, ensuring your financial security. Let's explore how it fits your retirement strategy.\n\nSecure your future today.",
      "cta": "Explore Guaranteed Income Options"
    },
    {
      "body": "Hi {{first_name}},\n\nReceiving a significant sum, like a pension payout, brings important financial decisions. An annuity offers a way to turn that lump sum into a steady, predictable income for your retirement years. It's a proactive step towards long-term financial stability.\n\nDiscover how to secure your future.",
      "subject": "Making the Most of Your Pension Payout",
      "cta": "Turn Lump Sum to Income",
      "signalLabel": "[life-event] Pension lump-sum offer \u2014 Unusually large single deposit from former employer",
      "title": "Pension Buyout? Maximize Your Choices."
    },
    {
      "signalLabel": "[behavioral] Conservative allocation drift \u2014 Linked advised assets shifting to fixed income > 60%",
      "title": "Protect & Grow Your Retirement Savings.",
      "subject": "Considering a More Conservative Approach?",
      "body": "Hi {{first_name}},\n\nWe've noticed you're exploring more conservative investment strategies. An annuity can complement this approach by offering tax-deferred growth and guaranteed income, providing stability in uncertain markets. It's an excellent way to balance growth potential with principal protection.\n\nLearn how to enhance your portfolio.",
      "cta": "Safeguard Your Retirement Savings"
    }
  ],
};
