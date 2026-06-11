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
  ]
};
