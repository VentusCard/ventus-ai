// TypeScript interfaces for Advisor Console data structures
import { AIInsights } from "@/types/lifestyle-signals";

// Next Steps data structures
export interface NextStepsActionItem {
  id: string;
  text: string;
  completed: boolean;
  source: 'chat' | 'transcript' | 'manual' | 'timeline' | 'notes';
  chipSource?: string; // Track which chip generated this action item
  timestamp: Date;
}

export interface PsychologicalInsight {
  aspect: string;
  assessment: string;
  sliderValue?: number; // 1-5 scale
  evidence: string;
  confidence: number;
  actionTip?: string;
}

export interface NextStepsData {
  actionItems: NextStepsActionItem[];
  psychologicalInsights: PsychologicalInsight[];
  lastUpdated: Date | null;
}

export interface MeetingNotesResult {
  actionItems: NextStepsActionItem[];
  sentiment?: string;
  productsDiscussed: string[];
  meetingType: string;
  nextMeetingDate?: Date;
  nextMeetingTopic?: string;
  chatSummary: string;
}

export interface NextMeetingInfo {
  date: Date;
  topic?: string;
  participants?: string[];
}

// Sentiment to psychology mapping
export const SENTIMENT_PSYCHOLOGY_MAP: Record<string, { sliderValue: number; assessment: string; actionTip: string }> = {
  very_positive: { sliderValue: 5, assessment: "Highly engaged and optimistic", actionTip: "Leverage momentum" },
  positive: { sliderValue: 4, assessment: "Comfortable and receptive", actionTip: "Introduce new ideas" },
  neutral: { sliderValue: 3, assessment: "Balanced, no strong signals", actionTip: "Build rapport" },
  concerned: { sliderValue: 2, assessment: "Showing worry, needs reassurance", actionTip: "Address concerns first" },
  anxious: { sliderValue: 1, assessment: "Elevated anxiety, handle with care", actionTip: "Listen actively, reassure" },
};

// Life event detection keywords
export const LIFE_EVENT_KEYWORDS = [
  "retirement", "baby", "child", "wedding", "marriage", "home purchase",
  "house", "college", "inheritance", "divorce", "job change", "relocation"
];

export interface ClientData {
  name: string;
  segment: 'Preferred' | 'Private' | 'Premium';
  aum: string;
  tenure: string;
  advisor: string;
  holdings: {
    deposit: number;
    credit: number;
    mortgage: boolean;
    mortgageAmount?: number;
    investments: number;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  demographics: {
    age: number;
    occupation: string;
    familyStatus: string;
  };
}

export interface LifestyleSignal {
  category: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  confidence: number;
  icon: string;
}

export interface LifeTrigger {
  date: string;
  event: string;
  type: 'family' | 'financial' | 'lifestyle' | 'professional';
  description: string;
}

export interface ComplianceData {
  kycStatus: 'Current' | 'Pending' | 'Expired';
  lastReview: string;
  nextReview: string;
  riskProfile: string;
  notes: string;
}

export interface Milestone {
  date: string;
  event: string;
  category: 'account' | 'investment' | 'banking' | 'rewards';
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'advisor';
  content: string;
  timestamp: Date;
  actions?: {
    savedToDoc?: boolean;
    addedToTodo?: boolean;
    completed?: boolean;
  };
  relatedLifestyleChip?: string;
}

export interface Task {
  id: string;
  title: string;
  category: 'today' | 'this-week' | 'later';
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export interface Meeting {
  date: string;
  time: string;
  duration: number;
  participants: string[];
  talkingPoints: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface DocumentBlock {
  id: string;
  type: 'client-overview' | 'lifestyle-summary' | 'portfolio-snapshot' | 'next-steps';
  title: string;
  content: string;
  order: number;
  lastEdited: string;
}

export interface EngagementHealth {
  status: 'high' | 'medium' | 'low';
  metrics: {
    lastContact: string;
    meetingAttendance: number;
    responseRate: number;
    reviewFrequency: string;
    proactiveInquiries: number;
  };
}

export interface DepositProduct {
  id: string;
  type: 'checking' | 'savings' | 'money-market' | 'cd';
  name: string;
  accountNumber: string;
  balance: number;
  apy?: number;
  opened: string;
}

export interface CreditProduct {
  id: string;
  type: 'credit-card' | 'line-of-credit';
  name: string;
  accountNumber: string;
  balance: number;
  creditLimit: number;
  apr: number;
  rewards?: string;
  opened: string;
}

export interface MortgageProduct {
  id: string;
  type: 'primary' | 'investment';
  name: string;
  accountNumber: string;
  balance: number;
  originalAmount: number;
  rate: number;
  term: string;
  monthlyPayment: number;
  originated: string;
  property: string;
}

export interface InvestmentProduct {
  id: string;
  type: 'brokerage' | 'ira' | 'roth-ira' | '401k';
  name: string;
  accountNumber: string;
  balance: number;
  assetAllocation?: {
    stocks: number;
    bonds: number;
    cash: number;
    other: number;
  };
  ytdReturn?: number;
  opened: string;
}

export interface HoldingsDetails {
  deposits: DepositProduct[];
  credit: CreditProduct[];
  mortgages: MortgageProduct[];
  investments: InvestmentProduct[];
}

// Sample Client Profile Data
export const sampleClientData: ClientData = {
  name: "Client Name",
  segment: "Private",
  aum: "$2.3M",
  tenure: "4.2 years",
  advisor: "Advisor Name",
  holdings: {
    deposit: 450000,
    credit: 15000,
    mortgage: true,
    mortgageAmount: 680000,
    investments: 1850000
  },
  contact: {
    email: "client@email.com",
    phone: "(XXX) XXX-XXXX",
    address: "City, State ZIP"
  },
  demographics: {
    age: 42,
    occupation: "Senior Product Manager, Tech",
    familyStatus: "Married, 1 child"
  }
};

// Lifestyle Signals (Transaction-derived insights)
export const sampleLifestyleSignals: LifestyleSignal[] = [
  {
    category: "Travel",
    trend: "up",
    change: 21,
    confidence: 87,
    icon: "Plane"
  },
  {
    category: "Family",
    trend: "down",
    change: -8,
    confidence: 73,
    icon: "Users"
  },
  {
    category: "Philanthropy",
    trend: "up",
    change: 15,
    confidence: 91,
    icon: "Heart"
  },
  {
    category: "Dining",
    trend: "up",
    change: 12,
    confidence: 79,
    icon: "UtensilsCrossed"
  },
  {
    category: "Health & Wellness",
    trend: "up",
    change: 18,
    confidence: 84,
    icon: "Activity"
  }
];

// Recent Life Triggers
export const sampleLifeTriggers: LifeTrigger[] = [
  {
    date: "YYYY-MM-DD",
    event: "Major Donation",
    type: "financial",
    description: "$25K donation to Charitable Organization"
  },
  {
    date: "YYYY-MM-DD",
    event: "New Dependent",
    type: "family",
    description: "Birth of first child, updated beneficiaries"
  },
  {
    date: "YYYY-MM-DD",
    event: "Relocation",
    type: "lifestyle",
    description: "Moved from downtown to suburban area"
  },
  {
    date: "YYYY-MM-DD",
    event: "Mortgage Increase",
    type: "financial",
    description: "Refinanced to larger home, +$180K mortgage balance"
  }
];

// Compliance & Risk Data
export const sampleComplianceData: ComplianceData = {
  kycStatus: "Current",
  lastReview: "Month DD, YYYY",
  nextReview: "Month DD, YYYY",
  riskProfile: "Moderate-Aggressive",
  notes: "Annual review completed. Estate planning documents updated for new dependent."
};

// Client Milestones Timeline
export const sampleMilestones: Milestone[] = [
  {
    date: "Month YYYY",
    event: "Account Opening",
    category: "account"
  },
  {
    date: "Month YYYY",
    event: "First Investment Portfolio Funding ($850K)",
    category: "investment"
  },
  {
    date: "Month YYYY",
    event: "Mortgage Origination ($500K)",
    category: "banking"
  },
  {
    date: "Month YYYY",
    event: "Private Banking Upgrade",
    category: "account"
  },
  {
    date: "Month YYYY",
    event: "Estate Planning Update",
    category: "account"
  }
];

// Chat Messages
export const sampleChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "ai",
    content: "Good afternoon. I've analyzed the client's recent transaction patterns and identified several opportunities for your upcoming review meeting. Their travel spending is up 21% over the past 6 months, with frequent premium airline and hotel bookings. This suggests they may benefit from our Premium Travel Rewards card with 5x points on travel and complementary lounge access.",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS"),
    relatedLifestyleChip: "Travel"
  },
  {
    id: "msg-2",
    role: "advisor",
    content: "That's helpful context. Can you generate talking points for our Q2 portfolio review meeting scheduled for Month DD?",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS")
  },
  {
    id: "msg-3",
    role: "ai",
    content: "Here are the key discussion topics for the Q2 review:\n\n1. **Portfolio Performance**: YTD return of +8.2%, outperforming benchmark by 1.4%\n2. **Travel Rewards Opportunity**: Premium card upgrade could save ~$3,200 annually based on current spending\n3. **Estate Planning**: Review beneficiary designations following birth of first child\n4. **529 Education Plan**: Recommend opening plan for newborn with $10K initial funding\n5. **Philanthropic Strategy**: Discuss donor-advised fund to optimize $25K+ annual giving\n6. **Tax-Loss Harvesting**: Identify $12K in potential tax savings from strategic rebalancing\n\nWould you like me to generate a detailed brief for any of these topics?",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS"),
    actions: {
      savedToDoc: true,
      addedToTodo: false,
      completed: false
    }
  },
  {
    id: "msg-4",
    role: "advisor",
    content: "Yes, please provide more detail on the 529 education plan recommendation.",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS")
  },
  {
    id: "msg-5",
    role: "ai",
    content: "**529 Education Savings Plan Recommendation**\n\n**Current Situation:**\n- New parent (child born Month YYYY, 3 months old)\n- Strong income profile (Senior PM in tech)\n- High tax bracket (likely 35-37% federal)\n- Demonstrated commitment to long-term planning\n\n**Recommendation:**\n- Open State 529 plan\n- Initial funding: $10,000\n- Monthly contributions: $500 (automatic)\n- Projected value at age 18: ~$185,000 (assuming 7% growth)\n\n**Tax Benefits:**\n- Federal tax-free growth\n- Contributions reduce taxable estate (important for HNW clients)\n- Withdrawals for qualified education expenses are tax-free\n\n**Action Items:**\n- Present at upcoming meeting\n- Provide enrollment packet\n- Set up automatic monthly contributions\n- Discuss gift-giving strategy (grandparents can contribute up to $18K/year)\n\n**Talking Point:** 'Congratulations again on your new addition. Many of our clients find that starting a 529 plan early provides tremendous flexibility for future education expenses, whether that's private school, college, or graduate programs. Based on your current tax situation and long-term planning mindset, I'd recommend we establish this account with an initial $10K investment.'",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS"),
    actions: {
      savedToDoc: true,
      addedToTodo: false,
      completed: false
    }
  },
  {
    id: "msg-6",
    role: "advisor",
    content: "Perfect. Add a task to prepare the 529 enrollment packet before our meeting.",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS"),
    actions: {
      addedToTodo: true
    }
  },
  {
    id: "msg-7",
    role: "ai",
    content: "✓ Task added: 'Prepare 529 enrollment packet' — Priority: High, Due: Month DD, YYYY\n\nI've also noticed increased philanthropic activity. The $25K donation in Month YYYY represents a significant uptick from historical $8-12K annual giving. This could indicate:\n\n1. **Unexpected windfall** (bonus, stock options vesting)\n2. **Tax planning strategy** (maximizing deductions)\n3. **Values shift** (new parent seeking to support children's causes)\n\nRecommendation: Discuss establishing a donor-advised fund (DAF) to optimize charitable giving strategy. A DAF would allow:\n- Make a large tax-deductible contribution in high-income years\n- Distribute to charities over time as they identify causes\n- Potentially donate appreciated securities for additional tax benefits\n- Involve family in giving decisions (values education for child)\n\nShould I add this as a discussion topic for the upcoming meeting?",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS"),
    relatedLifestyleChip: "Philanthropy"
  },
  {
    id: "msg-8",
    role: "advisor",
    content: "Yes, add that to the meeting agenda. Also mark the 529 talking points as ready to present.",
    timestamp: new Date("YYYY-MM-DDTHH:MM:SS"),
    actions: {
      completed: true
    }
  }
];

// Tasks & To-Dos
export const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Review Q1 portfolio performance report",
    category: "today",
    completed: false,
    priority: "high",
    dueDate: "YYYY-MM-DD"
  },
  {
    id: "task-2",
    title: "Prepare travel rewards card comparison sheet",
    category: "today",
    completed: false,
    priority: "high",
    dueDate: "YYYY-MM-DD"
  },
  {
    id: "task-3",
    title: "Prepare 529 enrollment packet",
    category: "today",
    completed: false,
    priority: "high",
    dueDate: "YYYY-MM-DD"
  },
  {
    id: "task-4",
    title: "Schedule Q2 portfolio review meeting",
    category: "this-week",
    completed: true,
    priority: "medium",
    dueDate: "YYYY-MM-DD"
  },
  {
    id: "task-5",
    title: "Update estate planning documents (new dependent)",
    category: "this-week",
    completed: true,
    priority: "high",
    dueDate: "YYYY-MM-DD"
  },
  {
    id: "task-6",
    title: "Prepare donor-advised fund presentation materials",
    category: "this-week",
    completed: false,
    priority: "medium",
    dueDate: "YYYY-MM-DD"
  },
  {
    id: "task-7",
    title: "Research 529 education plans and tax strategies",
    category: "later",
    completed: true,
    priority: "low"
  },
  {
    id: "task-8",
    title: "Analyze tax-loss harvesting opportunities",
    category: "later",
    completed: false,
    priority: "medium"
  },
  {
    id: "task-9",
    title: "Prepare beneficiary update forms",
    category: "later",
    completed: false,
    priority: "low"
  }
];

// Upcoming Meeting
export const sampleMeeting: Meeting = {
  date: "Month DD, YYYY",
  time: "HH:MM AM/PM",
  duration: 60,
  participants: [
    "Client Name (Client)",
    "Advisor Name (Advisor)",
    "Specialist Name (Wealth Planning Specialist)"
  ],
  talkingPoints: [
    "Q1 Portfolio Performance Review (+8.2% YTD)",
    "Travel Rewards Card Upgrade Opportunity (~$3,200 annual value)",
    "Estate Planning Updates (New Dependent Beneficiary)",
    "529 Education Savings Plan Recommendation ($10K initial + $500/mo)",
    "Donor-Advised Fund for Philanthropic Giving Strategy",
    "Tax-Loss Harvesting Opportunities (~$12K potential savings)",
    "Investment Portfolio Rebalancing (Reduce tech concentration)",
    "Mortgage Refinancing Review (Current rates vs. client's rate)"
  ],
  status: "upcoming"
};

// Document Blocks (for Client Brief Builder)
export const sampleDocumentBlocks: DocumentBlock[] = [
  {
    id: "block-1",
    type: "client-overview",
    title: "Client Overview",
    content: `**Client Name — Private Banking Client**

*Profile Summary:*
Client is a 42-year-old Senior Product Manager in the technology sector with $2.3M in assets under management. They have been a valued client for 4.2 years, progressing from Preferred to Private Banking status. Client recently became a first-time parent (Month YYYY) and relocated to suburban area.

*Account Structure:*
• Deposit Accounts: $450,000
• Credit Facilities: $15,000 utilization
• Mortgage: $680,000 (3.2% fixed, refinanced YYYY)
• Investment Portfolio: $1,850,000

*Advisor:* Advisor Name, Senior Wealth Advisor
*Risk Profile:* Moderate-Aggressive (suitable for 80/20 equity/fixed allocation)
*Relationship Tenure:* 4.2 years (since Month YYYY)`,
    order: 1,
    lastEdited: "YYYY-MM-DDTHH:MM:SS"
  },
  {
    id: "block-2",
    type: "lifestyle-summary",
    title: "Lifestyle & Spending Insights",
    content: `**Transaction-Derived Lifestyle Analysis**

*Key Trends (Last 6 Months):*
• **Travel ↑ 21%** (Confidence: 87%) — Frequent premium airline bookings, international hotels, consistent business/leisure travel patterns. Opportunity: Premium Travel Rewards card upgrade.

• **Philanthropy ↑ 15%** (Confidence: 91%) — Significant increase in charitable giving, including $25K donation to Charitable Organization in Month YYYY. Recommendation: Donor-advised fund for tax optimization.

• **Health & Wellness ↑ 18%** (Confidence: 84%) — Increased spending on fitness, wellness services, and premium gym memberships post-relocation.

• **Dining ↑ 12%** (Confidence: 79%) — Elevated restaurant spending, premium takeout services. Correlation with new parent lifestyle adjustment.

• **Family ↓ 8%** (Confidence: 73%) — Slight decrease in traditional "family" category spending, potentially due to newborn care focus vs. discretionary family activities.

*Recent Life Triggers:*
• New dependent (Month YYYY) — Estate planning updated
• Relocation to suburban area (Month YYYY) — Larger home, family-focused
• Major charitable donation (Month YYYY) — Values-driven giving
• Mortgage refinance (Month YYYY) — +$180K balance for home upgrade`,
    order: 2,
    lastEdited: "YYYY-MM-DDTHH:MM:SS"
  },
  {
    id: "block-3",
    type: "portfolio-snapshot",
    title: "Portfolio Performance Snapshot",
    content: `**Investment Portfolio — Q1 YYYY Performance**

*Current Market Value:* $1,850,000 (+$140,000 YTD)

*Asset Allocation:*
• US Equities: 55% ($1,017,500)
• International Equities: 25% ($462,500)
• Fixed Income: 15% ($277,500)
• Alternative Investments: 5% ($92,500)

*Performance Metrics:*
• YTD Return: +8.2%
• Benchmark (60/40): +6.8%
• Alpha: +1.4%
• Sharpe Ratio: 1.32

*Holdings Analysis:*
• Tech sector concentration: 42% (above target 35%)
• Recommendation: Rebalance $130K from tech to diversified sectors
• Tax-loss harvesting opportunity: ~$12K in unrealized losses available

*Portfolio Health:*
✓ Well-diversified across asset classes
✓ Strong performance vs. benchmark
⚠ Tech sector overweight (rebalancing recommended)
✓ Risk profile aligned with client objectives

*Next Review:* Month DD, YYYY (Q2 Planning Meeting)`,
    order: 3,
    lastEdited: "YYYY-MM-DDTHH:MM:SS"
  },
  {
    id: "block-4",
    type: "next-steps",
    title: "Recommended Next Steps",
    content: `**Action Items & Recommendations — Month YYYY**

*Immediate Actions (Before Meeting):*
1. ✓ Complete Q1 portfolio performance analysis
2. ⏳ Prepare Premium Travel Rewards card comparison
3. ⏳ Assemble 529 education savings plan materials
4. ⏳ Draft donor-advised fund presentation
5. ✓ Update estate planning documents for new dependent

*Discussion Topics for Upcoming Meeting:*
1. **Portfolio Performance & Rebalancing**
   - Review +8.2% YTD performance
   - Discuss tech sector reduction strategy
   - Execute tax-loss harvesting (~$12K savings)

2. **Travel Rewards Optimization**
   - Present Premium Travel card benefits
   - Calculate ~$3,200 annual value based on spending
   - Process upgrade application if client agrees

3. **Family Planning & Education Savings**
   - Recommend 529 plan: $10K initial + $500/month
   - Discuss grandparent gifting strategy
   - Provide enrollment packet

4. **Philanthropic Giving Strategy**
   - Present donor-advised fund concept
   - Discuss tax benefits of lumpy giving
   - Review client's charitable goals and values

5. **Estate Planning Review**
   - Confirm beneficiary updates completed
   - Discuss trust structures for newborn
   - Review life insurance coverage adequacy

*Follow-Up Actions (Post-Meeting):*
• Process any account applications/changes
• Schedule next quarterly review
• Implement approved portfolio rebalancing
• Monitor lifestyle signal changes for proactive outreach

*Engagement Health:* 🟢 Strong (Last contact: XX days ago | 95% meeting attendance)`,
    order: 4,
    lastEdited: "YYYY-MM-DDTHH:MM:SS"
  }
];

// Engagement Health Metrics
export const sampleEngagementData: EngagementHealth = {
  status: "high",
  metrics: {
    lastContact: "XX days ago",
    meetingAttendance: 95,
    responseRate: 88,
    reviewFrequency: "Quarterly",
    proactiveInquiries: 3
  }
};

// Holdings Details
export const sampleHoldingsDetails: HoldingsDetails = {
  deposits: [
    {
      id: 'dep-1',
      type: 'checking',
      name: 'Private Banking Checking',
      accountNumber: '****3847',
      balance: 85000,
      opened: 'Month YYYY'
    },
    {
      id: 'dep-2',
      type: 'savings',
      name: 'Premium Savings',
      accountNumber: '****4921',
      balance: 250000,
      apy: 4.5,
      opened: 'Month YYYY'
    },
    {
      id: 'dep-3',
      type: 'money-market',
      name: 'Money Market Account',
      accountNumber: '****5612',
      balance: 115000,
      apy: 4.8,
      opened: 'Month YYYY'
    }
  ],
  credit: [
    {
      id: 'cred-1',
      type: 'credit-card',
      name: 'Premium Rewards Card',
      accountNumber: '****8294',
      balance: 8500,
      creditLimit: 50000,
      apr: 18.99,
      rewards: '2x points on all purchases',
      opened: 'Month YYYY'
    },
    {
      id: 'cred-2',
      type: 'credit-card',
      name: 'Business Platinum Card',
      accountNumber: '****2103',
      balance: 6500,
      creditLimit: 75000,
      apr: 19.99,
      rewards: '3x points on business expenses',
      opened: 'Month YYYY'
    }
  ],
  mortgages: [
    {
      id: 'mtg-1',
      type: 'primary',
      name: 'Primary Residence Mortgage',
      accountNumber: '****7845',
      balance: 680000,
      originalAmount: 860000,
      rate: 3.2,
      term: '30-year fixed',
      monthlyPayment: 3680,
      originated: 'Month YYYY',
      property: 'Street Address, City State ZIP'
    }
  ],
  investments: [
    {
      id: 'inv-1',
      type: 'brokerage',
      name: 'Individual Brokerage Account',
      accountNumber: '****9102',
      balance: 1250000,
      assetAllocation: {
        stocks: 68,
        bonds: 20,
        cash: 10,
        other: 2
      },
      ytdReturn: 8.5,
      opened: 'Month YYYY'
    },
    {
      id: 'inv-2',
      type: 'roth-ira',
      name: 'Roth IRA',
      accountNumber: '****3456',
      balance: 425000,
      assetAllocation: {
        stocks: 85,
        bonds: 10,
        cash: 5,
        other: 0
      },
      ytdReturn: 9.2,
      opened: 'Month YYYY'
    },
    {
      id: 'inv-3',
      type: 'ira',
      name: 'Traditional IRA',
      accountNumber: '****7821',
      balance: 175000,
      assetAllocation: {
        stocks: 75,
        bonds: 20,
        cash: 5,
        other: 0
      },
      ytdReturn: 7.8,
      opened: 'Month YYYY'
    }
  ]
};

// Sample AI Insights (Lifestyle Signal Detection)
export const sampleAIInsights: AIInsights = {
  detected_events: [
    {
      event_name: "College Preparation Phase",
      confidence: 94,
      evidence: [
        {
          merchant: "Test Prep Provider",
          amount: 399,
          date: "YYYY-MM-DD",
          relevance: "SAT prep course indicates active college planning"
        },
        {
          merchant: "College Board",
          amount: 60,
          date: "YYYY-MM-DD",
          relevance: "SAT registration fee confirms test-taking timeline"
        },
        {
          merchant: "University Tour",
          amount: 45,
          date: "YYYY-MM-DD",
          relevance: "Campus visit shows serious college consideration"
        },
        {
          merchant: "Test Prep Provider",
          amount: 299,
          date: "YYYY-MM-DD",
          relevance: "Additional prep investment demonstrates commitment"
        }
      ],
      talking_points: [
        "I noticed you've invested in SAT preparation for the dependent - that shows real commitment to their academic future",
        "Many parents are surprised to learn 529 plans can cover test prep and application costs, not just tuition",
        "Based on your tax situation and the timing of these college expenses, let's discuss a strategic funding plan that maximizes benefits",
        "Have you thought about how you'll balance saving for college with your other financial goals? We can model different scenarios together",
        "The SAT timeline suggests college applications are about a year away - now's the perfect time to optimize your education funding strategy"
      ]
    }
  ]
};

// Sample Meeting Transcripts for Tone Analysis
export interface MeetingTranscript {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  transcript: string;
  expectedTone?: 'excited' | 'anxious' | 'optimistic' | 'concerned' | 'satisfied';
  context: string;
}

export const sampleMeetingTranscripts: MeetingTranscript[] = [
  {
    id: "transcript-1",
    title: "Q2 Portfolio Review - College Planning Discussion",
    date: "2024-06-15",
    duration: "45 minutes",
    participants: ["Client", "Advisor"],
    expectedTone: "anxious",
    context: "Client discussing college planning for dependent who recently took SAT prep course",
    transcript: `Advisor: Thanks for meeting with me today. I wanted to touch base on the portfolio performance and also discuss some of the changes I've noticed in your spending patterns.

Client: Yeah, of course. I've been meaning to talk to you actually. Things have been... well, a bit stressful lately if I'm being honest.

Advisor: I'm here to help. What's on your mind?

Client: It's just that Sarah took her SAT prep course last month, and the whole college application process is becoming very real. We went on a campus visit to Stanford a few weeks ago, and I keep thinking about how we're going to pay for all this. The tuition numbers are just... they're staggering.

Advisor: I can understand that concern. College costs can feel overwhelming. Let me pull up your current education savings...

Client: That's the thing - we don't really have a dedicated college fund. We've been meaning to set one up, but with the new house and everything, it just kept getting pushed back. Now I'm worried we're too late. Sarah's a junior now, so we only have about a year and a half before applications are due.

Advisor: It's definitely not too late, but I hear your concern about the timeline. Let's talk about some strategies...

Client: I just keep doing the math in my head. Even if she gets some scholarships, we're probably looking at what, $50,000, $60,000 a year? Over four years that's a quarter million dollars. And what if she wants to go to grad school? I don't want her to graduate with a mountain of debt like I did.

Advisor: Those are valid concerns. Based on what I'm seeing in your transaction data, you're financially positioned to handle this, but we need to be strategic about it.

Client: I hope so. My wife and I have been arguing about it actually. She thinks we should just take out parent loans, but I really want to avoid that if possible. We just refinanced to a bigger mortgage when we moved, and I don't want to add more debt on top of that.

Advisor: That's a very responsible way to think about it. Let me walk you through some options that might ease your concerns...`
  },
  {
    id: "transcript-2",
    title: "Year-End Review - Philanthropy and Tax Planning",
    date: "2024-11-20",
    duration: "35 minutes",
    participants: ["Client", "Advisor"],
    expectedTone: "optimistic",
    context: "Client discussing charitable giving strategy and strong portfolio performance",
    transcript: `Client: Hey! Thanks for fitting me in before the holidays. I know this is your busy season.

Advisor: Always happy to meet with you. How have things been?

Client: Really good, actually. Work has been great - we just closed a major product launch, and I got a nice bonus as a result. The team is performing well, and I'm feeling pretty optimistic about next year.

Advisor: That's wonderful to hear. Congratulations on the launch!

Client: Thanks! So that's actually part of why I wanted to meet. With the bonus coming in, I've been thinking a lot about giving back. You know, my wife and I have been volunteering at the local children's hospital, and it's been really rewarding. We want to make a significant donation before year-end.

Advisor: That's a great impulse. Have you thought about how much you're considering?

Client: We're thinking somewhere in the $25,000 to $30,000 range. I know that's a big number, but with the way the portfolio has performed this year and my bonus, we feel like we're in a position to do something meaningful.

Advisor: That's quite generous. Before we finalize that, let me make sure we're optimizing it from a tax perspective. There are some strategies we could employ to maximize both the impact and your tax benefits.

Client: Oh, I hadn't really thought about that angle. I just want to make sure the money does the most good.

Advisor: Absolutely, and we can accomplish both. Given your income level this year with the bonus, we could potentially structure this donation in a way that gives you significant tax advantages while still delivering the full amount to the charity.

Client: That sounds perfect. You know, it's funny - a few years ago I would have been terrified to write a check that large. But now, with everything we've built, I feel like we're finally at a point where we can give back without worrying about our own stability. That feels really good.

Advisor: That's a sign of excellent financial health, and it speaks well to the planning we've done together. Let me put together a few options for you...`
  },
  {
    id: "transcript-3",
    title: "Portfolio Check-in - Travel Plans and Market Volatility",
    date: "2024-03-10",
    duration: "30 minutes",
    participants: ["Client", "Advisor"],
    expectedTone: "concerned",
    context: "Client expressing concerns about market volatility while planning significant international travel",
    transcript: `Advisor: Good morning! How was your weekend?

Client: It was okay. I've been watching the news a lot lately, and I have to admit, I'm getting a little nervous about the markets. Everything seems so volatile right now.

Advisor: I understand that concern. The first quarter has definitely seen some ups and downs. What specifically is worrying you?

Client: Well, we're planning this big trip to Europe for our anniversary - three weeks in June. It's going to be expensive, probably $20,000 or more with flights, hotels, the whole thing. And I keep seeing headlines about a potential recession, and I'm wondering if now is really the right time to be spending that kind of money.

Advisor: Let me pull up your portfolio and we can look at this together. How are you planning to fund the trip?

Client: We were just going to pull it from savings, but that'll basically wipe out our emergency fund. And then I think, what if something happens? What if one of us loses our job? With the new mortgage and everything...

Advisor: These are all reasonable concerns. Let's talk through your overall financial picture...

Client: I know you've told me before not to panic about market swings, but it's different when you're actually watching your account balance go down every day. Last month we were up, what, $80,000? And now we've given back almost half of that. It just feels like we're going backwards.

Advisor: I hear your frustration. Let me show you something - if we zoom out and look at your returns over the past few years...

Client: I know, I know - long-term perspective. But it's hard not to worry. Especially with college coming up for Sarah in a couple years. I just keep thinking, what if the market crashes right when we need to start paying tuition?

Advisor: That's a very valid concern, and actually it's something we should address in your asset allocation. The fact that you're thinking about this timeline means we need to make some adjustments...

Client: Should we cancel the trip? I mean, my wife would kill me, but if it's the responsible thing to do...

Advisor: Let's not make any rash decisions. Let me walk you through exactly where you stand financially, and then we can make an informed decision together about the trip and about your overall strategy going forward.`
  },
  {
    id: "transcript-4",
    title: "New Parent Financial Planning Session",
    date: "2024-02-28",
    duration: "50 minutes",
    participants: ["Client", "Spouse", "Advisor"],
    expectedTone: "excited",
    context: "New parents discussing updated financial plan after birth of first child",
    transcript: `Advisor: Congratulations again on the new arrival! How are you both adjusting?

Client: Thank you! We're exhausted but so happy. It's been amazing.

Spouse: The best kind of exhausted, really. We can't stop staring at her.

Client: Yeah, everything feels different now. In the best way. Actually, that's why we wanted to meet - we know we need to update a bunch of things now that we're officially parents.

Advisor: Absolutely. This is one of the most important financial planning moments in your life. There's a lot to cover, but we'll take it step by step.

Spouse: We've already started a list. Life insurance is number one, right? We need to make sure she's taken care of no matter what.

Client: Yeah, I've been thinking about that a lot. Before, it was just the two of us, and we could have managed. But now... we need to make sure we're protected.

Advisor: That's exactly right, and it shows you're thinking like parents now. Let's talk about coverage amounts and beneficiaries.

Client: We also updated our wills last week. Named my sister and her husband as guardians if something were to happen to both of us. That was a hard conversation to have, but I'm glad we did it.

Advisor: That's excellent. Many people put that off, so you're ahead of the game. What else is on your list?

Spouse: Education savings. We want to start a 529 plan. Even if she's only a month old, we know it'll make a huge difference if we start now.

Client: Exactly. I did the math - if we put away just $500 a month starting now, by the time she's 18, that could be over $200,000 assuming decent returns. That could cover most of a college education.

Advisor: I love that you've already done the research. Starting early is one of the smartest moves you can make.

Client: You know what's wild? Six months ago I was stressed about money - the new house, the bigger mortgage, all of that. But now, looking at her, I just feel... motivated. Like, we're going to make this work. We're going to give her every opportunity.

Spouse: We've already been looking at preschools. Can you believe it? She can't even roll over yet and we're touring preschools!

Client: [laughing] We're those parents now. But seriously, we want to do this right. We want to set her up for success. Whatever that takes.

Advisor: You're both clearly committed to this, and you have the means to do it. Let me put together a comprehensive plan that covers life insurance, education savings, estate planning updates, and we should also talk about updating your beneficiaries on all your accounts...`
  },
  {
    id: "transcript-5",
    title: "Mid-Year Check-in - Work-Life Balance Discussion",
    date: "2024-07-22",
    duration: "40 minutes",
    participants: ["Client", "Advisor"],
    expectedTone: "satisfied",
    context: "Client reflecting on financial progress and improved work-life balance",
    transcript: `Client: I've been looking forward to this meeting. I feel like we have a lot to catch up on.

Advisor: Absolutely. It's been about six months since our last comprehensive review. How have things been?

Client: Really good, honestly. Better than I expected. You remember last year when I was working 70-hour weeks and barely seeing my family?

Advisor: I do remember you mentioning that. Has that improved?

Client: Dramatically. After the baby was born, I made a conscious decision to set better boundaries at work. I talked to my manager, and we restructured my responsibilities. I'm working maybe 45 hours a week now, and it's made such a difference.

Advisor: That's fantastic. How's it affecting things financially? I know you were concerned about that.

Client: That was my big worry - that setting boundaries would hurt my career or my earnings. But actually, my last performance review was one of the best I've had. Turns out being well-rested and focused makes you more productive. Who knew? [laughs]

Advisor: That's a great realization. And I can see from your account activity that you're still meeting all your savings goals.

Client: Yeah! We're actually ahead of where I thought we'd be. The 529 is growing nicely, we've been maxing out my 401k, and we even managed to take that Europe trip without touching our emergency fund. I moved some money around from the bonus, and it all worked out.

Advisor: How was the trip?

Client: Incredible. Three weeks in Italy and France. My wife and I really needed that time together, especially after the chaos of the first year with the baby. Her parents watched Sarah, and we just... reconnected. It was perfect.

Advisor: That's wonderful to hear. And you don't seem stressed about the money you spent on it.

Client: Not at all. That's the thing - I feel like we're finally at a place where we can enjoy the money we've earned without constantly worrying. We work hard, we save responsibly, and we can also enjoy life. It feels balanced for the first time in years.

Advisor: That's the sweet spot we always aim for. Let me show you where things stand across all your accounts...

Client: I'm also thinking about the future differently now. It's not just about accumulating anymore. It's about what kind of life we want to build for our family. That trip showed me that experiences matter. Sarah won't remember if we had an extra $50,000 in the bank, but she'll remember if we took her to see the world.

Advisor: That's a very mature perspective. And the beauty of your situation is that you don't have to choose one or the other. Let's talk about how we can budget for experiences while still meeting your long-term goals...`
  }
];
