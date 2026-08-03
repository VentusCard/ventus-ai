import { ClientProfileData } from "@/types/clientProfile";
import { PsychologicalInsight } from "@/components/tepilot/advisor-console/sampleData";

type Persona = 'youngProfessional' | 'growingFamily' | 'establishedProfessional' | 'preRetiree';

// Psychological insight generators based on persona
const psychologyConfig: Record<Persona, {
  decisionStyle: [number, number];
  riskTolerance: [number, number];
  emotionalState: [number, number];
  trustLevel: [number, number];
  communicationStyle: [number, number];
}> = {
  youngProfessional: {
    decisionStyle: [3, 5],      // More analytical
    riskTolerance: [4, 5],      // Risk-seeking
    emotionalState: [3, 5],     // Optimistic
    trustLevel: [2, 4],         // Building trust
    communicationStyle: [4, 5], // Prefers detailed
  },
  growingFamily: {
    decisionStyle: [2, 4],      // Balanced
    riskTolerance: [2, 4],      // Moderate
    emotionalState: [2, 4],     // Balanced/cautious
    trustLevel: [3, 4],         // Established
    communicationStyle: [3, 4], // Balanced
  },
  establishedProfessional: {
    decisionStyle: [4, 5],      // Analytical
    riskTolerance: [2, 4],      // Moderate
    emotionalState: [3, 5],     // Stable
    trustLevel: [4, 5],         // High trust
    communicationStyle: [3, 5], // Varies
  },
  preRetiree: {
    decisionStyle: [2, 4],      // Experience-based
    riskTolerance: [1, 3],      // Conservative
    emotionalState: [2, 4],     // Cautious optimism
    trustLevel: [4, 5],         // Long-term trust
    communicationStyle: [2, 4], // Concise
  },
};

const assessmentMaps = {
  decisionStyle: ['Highly Intuitive', 'Intuitive', 'Balanced', 'Analytical', 'Highly Analytical'],
  riskTolerance: ['Very Conservative', 'Conservative', 'Moderate', 'Growth-Oriented', 'Aggressive'],
  emotionalState: ['Anxious', 'Concerned', 'Neutral', 'Confident', 'Very Confident'],
  trustLevel: ['Building', 'Developing', 'Established', 'Strong', 'Very Strong'],
  communicationStyle: ['Brief Only', 'Concise', 'Balanced', 'Detailed', 'Comprehensive'],
};

const actionTipMaps = {
  decisionStyle: ['Lead with feelings & stories', 'Balance data with narrative', 'Mix analysis with intuition', 'Lead with data & charts', 'Provide detailed analysis'],
  riskTolerance: ['Emphasize capital preservation', 'Focus on stability first', 'Balance growth & safety', 'Highlight growth opportunities', 'Present aggressive strategies'],
  emotionalState: ['Acknowledge concerns first', 'Provide extra reassurance', 'Standard approach works', 'Can discuss challenges openly', 'Ready for complex discussions'],
  trustLevel: ['Build credibility gradually', 'Continue building rapport', 'Maintain consistent service', 'Can be direct & efficient', 'Trusted advisor status'],
  communicationStyle: ['Keep it brief', 'Short summaries preferred', 'Balanced communication', 'Include supporting details', 'Comprehensive documentation'],
};

export function generateRandomPsychologicalInsights(persona?: Persona): PsychologicalInsight[] {
  const selectedPersona = persona || randomFromArray(['youngProfessional', 'growingFamily', 'establishedProfessional', 'preRetiree'] as Persona[]);
  const config = psychologyConfig[selectedPersona];

  const getInsight = (aspect: string, range: [number, number], assessments: string[], tips: string[]): PsychologicalInsight => {
    const value = randomInRange(range[0], range[1]);
    return {
      aspect,
      sliderValue: value,
      assessment: assessments[value - 1],
      actionTip: tips[value - 1],
      evidence: `Based on client profile and interaction patterns`,
      confidence: randomInRange(65, 95),
    };
  };

  return [
    getInsight('Decision Style', config.decisionStyle, assessmentMaps.decisionStyle, actionTipMaps.decisionStyle),
    getInsight('Risk Tolerance', config.riskTolerance, assessmentMaps.riskTolerance, actionTipMaps.riskTolerance),
    getInsight('Emotional State', config.emotionalState, assessmentMaps.emotionalState, actionTipMaps.emotionalState),
    getInsight('Trust Level', config.trustLevel, assessmentMaps.trustLevel, actionTipMaps.trustLevel),
    getInsight('Communication Style', config.communicationStyle, assessmentMaps.communicationStyle, actionTipMaps.communicationStyle),
  ];
}

const firstNames = ['Sarah', 'James', 'Michelle', 'Robert', 'Emily', 'David', 'Jennifer', 'Michael', 'Amanda', 'Christopher', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Lauren', 'Priya', 'Marcus', 'Elena', 'Rafael', 'Yuki', 'Diane', 'Nadia', 'Charles', 'Peter', 'Sofia', 'Thomas', 'Rachel', 'Andre', 'Beatrice', 'Kenji', 'Olivia', 'Nathan', 'Camille', 'Julian', 'Isla', 'Vikram', 'Naomi', 'Grace', 'Ethan', 'Miriam'];
const lastNames = ['Mitchell', 'Patterson', 'Wong', 'Thompson', 'Garcia', 'Johnson', 'Williams', 'Chen', 'Anderson', 'Martinez', 'Taylor', 'Lee', 'Harris', 'Clark', 'Robinson', "O'Brien", 'Kim', 'Rossi', 'Vasquez', 'Nakamura', 'Freeman', 'Ito', 'Alvarez', 'Henderson', 'Nguyen', 'Okafor', 'Sorensen', 'Blackwood', 'Delgado', 'Petrov', 'Bhatia', 'Rivera', 'Whitman', 'Ross', 'Sato', 'Larsen', 'Gomez', 'Novak', 'Fischer', 'Ashford'];

const cities = [
  { city: 'San Francisco', state: 'CA', zip: '94102' },
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'Austin', state: 'TX', zip: '78701' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'Boston', state: 'MA', zip: '02101' },
  { city: 'Denver', state: 'CO', zip: '80202' },
  { city: 'Miami', state: 'FL', zip: '33101' },
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Legal',
  'Real Estate',
  'Manufacturing',
  'Education',
  'Consulting',
  'Retail',
  'Energy',
];

const profilePersonaConfig: Record<Persona, {
  ageRange: [number, number];
  familyStatuses: string[];
  occupations: string[];
  industries: string[];
  incomeLevels: string[];
  segments: ClientProfileData['segment'][];
  aumRange: [number, number];
  riskProfiles: ClientProfileData['compliance']['riskProfile'][];
  tenureRange: [number, number];
}> = {
  youngProfessional: {
    ageRange: [28, 35],
    familyStatuses: ['Single', 'Engaged', 'Married, no children'],
    occupations: ['Software Engineer', 'Product Manager', 'Marketing Director', 'Financial Analyst', 'UX Designer', 'Data Scientist'],
    industries: ['Technology', 'Finance', 'Consulting', 'Healthcare'],
    incomeLevels: ['$75K-$100K', '$100K-$150K', '$150K-$200K'],
    segments: ['Preferred'],
    aumRange: [300000, 800000],
    riskProfiles: ['Aggressive', 'Moderate'],
    tenureRange: [0.5, 4],
  },
  growingFamily: {
    ageRange: [32, 45],
    familyStatuses: ['Married, 1 dependent', 'Married, 2 dependents', 'Married, 3 dependents'],
    occupations: ['Senior Manager', 'Director of Operations', 'Physician', 'Attorney', 'Business Owner', 'VP of Sales'],
    industries: ['Healthcare', 'Legal', 'Finance', 'Technology', 'Real Estate'],
    incomeLevels: ['$150K-$250K', '$250K-$350K', '$350K-$500K'],
    segments: ['Preferred', 'Private'],
    aumRange: [800000, 2000000],
    riskProfiles: ['Moderate', 'Balanced'],
    tenureRange: [3, 8],
  },
  establishedProfessional: {
    ageRange: [40, 55],
    familyStatuses: ['Married, 2 dependents', 'Married, adult dependents', 'Divorced, dependents'],
    occupations: ['Chief Technology Officer', 'Managing Partner', 'Surgeon', 'Investment Banker', 'Entrepreneur', 'Corporate Executive'],
    industries: ['Finance', 'Technology', 'Healthcare', 'Legal', 'Consulting'],
    incomeLevels: ['$250K-$400K', '$400K-$600K', '$600K-$1M'],
    segments: ['Private', 'Premium'],
    aumRange: [1500000, 3500000],
    riskProfiles: ['Balanced', 'Moderate'],
    tenureRange: [5, 12],
  },
  preRetiree: {
    ageRange: [55, 65],
    familyStatuses: ['Married, adult dependents', 'Empty nester', 'Married, grandchildren'],
    occupations: ['Senior Vice President', 'Retired Executive', 'Business Owner', 'Partner Emeritus', 'Board Member', 'Consultant'],
    industries: ['Finance', 'Real Estate', 'Energy', 'Manufacturing', 'Consulting'],
    incomeLevels: ['$300K-$500K', '$500K-$750K', '$750K+'],
    segments: ['Premium'],
    aumRange: [2000000, 5000000],
    riskProfiles: ['Conservative', 'Balanced'],
    tenureRange: [8, 15],
  },
};

const milestoneEvents = [
  'Account Opening',
  'Added Investment Account',
  'Credit Card Upgrade',
  'Mortgage Refinance',
  'Annual Portfolio Review',
  'Added Joint Account',
  'Wealth Planning Session',
  'Trust Account Established',
  'IRA Rollover Completed',
  'Premium Status Achieved',
  'College Savings Plan Setup',
  'Estate Planning Review',
];

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function generateMilestones(tenure: number, segment: ClientProfileData['segment']): ClientProfileData['milestones'] {
  const numMilestones = randomInRange(3, 5);
  const milestones: ClientProfileData['milestones'] = [];
  const now = new Date();
  const tenureMonths = Math.floor(tenure * 12);
  
  // Always start with Account Opening
  const openingDate = new Date(now);
  openingDate.setMonth(openingDate.getMonth() - tenureMonths);
  milestones.push({ event: 'Account Opening', date: formatDate(openingDate) });
  
  // Add random milestones
  const availableEvents = milestoneEvents.filter(e => e !== 'Account Opening');
  const selectedEvents = new Set<string>();
  
  while (milestones.length < numMilestones && selectedEvents.size < availableEvents.length) {
    const event = randomFromArray(availableEvents);
    if (!selectedEvents.has(event)) {
      selectedEvents.add(event);
      const monthsAgo = randomInRange(1, tenureMonths - 1);
      const eventDate = new Date(now);
      eventDate.setMonth(eventDate.getMonth() - monthsAgo);
      milestones.push({ event, date: formatDate(eventDate) });
    }
  }
  
  // Sort by date (most recent first)
  return milestones.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

const spendingCategories = [
  { category: 'Housing', color: '#6366f1' },
  { category: 'Transportation', color: '#8b5cf6' },
  { category: 'Food & Dining', color: '#f59e0b' },
  { category: 'Healthcare', color: '#ef4444' },
  { category: 'Entertainment', color: '#ec4899' },
  { category: 'Shopping', color: '#14b8a6' },
  { category: 'Travel', color: '#3b82f6' },
  { category: 'Savings', color: '#22c55e' },
];

const personaSpendWeights: Record<Persona, Record<string, [number, number]>> = {
  youngProfessional: {
    'Housing': [1800, 2800], 'Transportation': [300, 600], 'Food & Dining': [600, 1200],
    'Healthcare': [100, 300], 'Entertainment': [300, 700], 'Shopping': [400, 900],
    'Travel': [200, 600], 'Savings': [500, 1500],
  },
  growingFamily: {
    'Housing': [2500, 4000], 'Transportation': [500, 1000], 'Food & Dining': [800, 1500],
    'Healthcare': [300, 800], 'Entertainment': [200, 500], 'Shopping': [500, 1200],
    'Travel': [300, 800], 'Savings': [1000, 3000],
  },
  establishedProfessional: {
    'Housing': [3000, 5000], 'Transportation': [600, 1200], 'Food & Dining': [1000, 2000],
    'Healthcare': [400, 1000], 'Entertainment': [400, 1000], 'Shopping': [800, 2000],
    'Travel': [500, 1500], 'Savings': [2000, 5000],
  },
  preRetiree: {
    'Housing': [2000, 3500], 'Transportation': [400, 800], 'Food & Dining': [600, 1200],
    'Healthcare': [800, 2000], 'Entertainment': [300, 700], 'Shopping': [400, 1000],
    'Travel': [600, 1500], 'Savings': [3000, 8000],
  },
};

function generateSpendingOverview(persona: Persona, _aum: number): ClientProfileData['spendingOverview'] {
  const weights = personaSpendWeights[persona];
  return spendingCategories.map(({ category, color }) => {
    const [min, max] = weights[category];
    const monthlySpend = randomInRange(min, max);
    // Budget is 80-120% of spend to create realistic over/under scenarios
    const budgetMultiplier = 0.8 + Math.random() * 0.4;
    const monthlyBudget = Math.round(monthlySpend * budgetMultiplier / 50) * 50;
    return { category, monthlySpend, monthlyBudget, color };
  });
}

export function generateRandomProfile(): ClientProfileData {
  // Pick a random persona
  const personas: Persona[] = ['youngProfessional', 'growingFamily', 'establishedProfessional', 'preRetiree'];
  const persona = randomFromArray(personas);
  const config = profilePersonaConfig[persona];
  
  // Generate basic info
  const firstName = randomFromArray(firstNames);
  const lastName = randomFromArray(lastNames);
  const name = `${firstName} ${lastName}`;
  
  const segment = randomFromArray(config.segments);
  const age = randomInRange(...config.ageRange);
  const tenure = parseFloat((Math.random() * (config.tenureRange[1] - config.tenureRange[0]) + config.tenureRange[0]).toFixed(1));
  const aum = randomInRange(...config.aumRange);
  
  // Generate contact info
  const location = randomFromArray(cities);
  const emailDomain = randomFromArray(['gmail.com', 'outlook.com', 'icloud.com', 'yahoo.com']);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
  const phone = `(${randomInRange(200, 999)}) ${randomInRange(200, 999)}-${randomInRange(1000, 9999)}`;
  const streetNum = randomInRange(100, 9999);
  const streets = ['Oak St', 'Main Ave', 'Park Blvd', 'Cedar Lane', 'Elm Drive', 'Highland Rd'];
  const address = `${streetNum} ${randomFromArray(streets)}, ${location.city}, ${location.state} ${location.zip}`;
  
  // Generate holdings proportional to AUM
  const investmentRatio = randomInRange(60, 80) / 100;
  const depositRatio = randomInRange(10, 25) / 100;
  const investments = Math.floor(aum * investmentRatio);
  const deposits = Math.floor(aum * depositRatio);
  const credit = randomInRange(5000, 100000);
  const hasMortgage = persona !== 'youngProfessional' || Math.random() > 0.5;
  const mortgage = hasMortgage ? randomInRange(200000, 1500000) : 0;
  
  // Generate compliance info
  const kycStatuses: ClientProfileData['compliance']['kycStatus'][] = ['Current', 'Current', 'Current', 'Under Review', 'Pending Update'];
  const kycStatus = randomFromArray(kycStatuses);
  const riskProfile = randomFromArray(config.riskProfiles);
  
  const now = new Date();
  const lastReviewMonths = randomInRange(1, 11);
  const lastReview = new Date(now);
  lastReview.setMonth(lastReview.getMonth() - lastReviewMonths);
  
  const nextReview = new Date(now);
  nextReview.setMonth(nextReview.getMonth() + randomInRange(1, 6));
  
  return {
    name,
    segment,
    aum: formatCurrency(aum),
    tenure: `${tenure} years`,
    contact: {
      email,
      phone,
      address,
    },
    demographics: {
      age: `${age}`,
      occupation: randomFromArray(config.occupations),
      familyStatus: randomFromArray(config.familyStatuses),
      incomeLevel: randomFromArray(config.incomeLevels),
      industry: randomFromArray(config.industries),
    },
    holdings: {
      deposit: formatCurrency(deposits),
      credit: formatCurrency(credit),
      mortgage: mortgage > 0 ? formatCurrency(mortgage) : '$0',
      investments: formatCurrency(investments),
    },
    holdingsChange: {
      deposit: { percent: randomInRange(1, 15), direction: Math.random() > 0.3 ? 'up' : 'down' },
      credit: { percent: randomInRange(5, 25), direction: Math.random() > 0.5 ? 'up' : 'down' },
      mortgage: { percent: randomInRange(1, 5), direction: 'down' as const },
      investments: { percent: randomInRange(2, 20), direction: Math.random() > 0.4 ? 'up' : 'down' },
    },
    compliance: {
      kycStatus,
      lastReview: formatDate(lastReview),
      nextReview: formatDate(nextReview),
      riskProfile,
    },
    milestones: generateMilestones(tenure, segment),
    spendingOverview: generateSpendingOverview(persona, aum),
  };
}

// ============ Dashboard Client Generation ============

import { DashboardClient, DetectedLifeEvent } from "@/types/dashboardClient";

const lifeEventTemplates: Record<DetectedLifeEvent['eventType'], {
  names: string[];
  evidenceOptions: string[][];
  timingOptions: string[];
}> = {
  retirement: {
    names: ['Early Retirement Planning', 'RMD Planning', 'Pension Rollover', 'Social Security Optimization'],
    evidenceOptions: [
      ['RMD due in 8 months', '401k balance review requested'],
      ['Pension inquiry detected', 'SSA office visit scheduled'],
      ['Early withdrawal discussions', 'Healthcare cost planning'],
      ['Retirement community research', 'Downsizing conversations'],
    ],
    timingOptions: ['Q2 2026', '6-12 months', 'Q3 2026', '1-2 years'],
  },
  education: {
    names: ['College Funding', '529 Plan Setup', 'Private School Planning', 'Graduate School Funding'],
    evidenceOptions: [
      ['College tour bookings detected', 'SAT prep purchases'],
      ['529 contribution increase', 'Financial aid research'],
      ['Private school applications', 'Tuition payment patterns'],
      ['Graduate program inquiries', 'Student loan research'],
    ],
    timingOptions: ['Fall 2026', '12-18 months', 'Q3 2026', '2-3 years'],
  },
  home_purchase: {
    names: ['First Home Purchase', 'Home Upgrade', 'Investment Property', 'Vacation Home'],
    evidenceOptions: [
      ['Mortgage pre-approval inquiry', 'Real estate agent meetings'],
      ['Home inspection bookings', 'Property listing saves'],
      ['Down payment accumulation', 'Home insurance quotes'],
      ['Realtor consultations', 'Moving company research'],
    ],
    timingOptions: ['Q1 2026', '3-6 months', 'Q2 2026', '6-9 months'],
  },
  wealth_transfer: {
    names: ['Estate Planning', 'Trust Setup', 'Gift Strategy', 'Inheritance Planning'],
    evidenceOptions: [
      ['Estate attorney visits', 'Trust document reviews'],
      ['Large gift transfers', 'Family financial discussions'],
      ['Will update inquiries', 'Beneficiary changes'],
      ['Generation-skipping trust interest', 'Charitable giving increase'],
    ],
    timingOptions: ['Q2 2026', '6-12 months', 'Ongoing', '1-2 years'],
  },
  business_liquidity: {
    names: ['Business Sale', 'Exit Strategy', 'IPO Preparation', 'Merger Consideration'],
    evidenceOptions: [
      ['M&A advisory meetings', 'Business valuation requests'],
      ['Investment banker consultations', 'Due diligence preparation'],
      ['Equity restructuring', 'Succession planning'],
      ['Private equity interest', 'Strategic buyer outreach'],
    ],
    timingOptions: ['Q3 2026', '12-18 months', 'Q4 2026', '1-2 years'],
  },
  family_formation: {
    names: ['New Baby Planning', 'Adoption Process', 'Family Expansion', 'Childcare Setup'],
    evidenceOptions: [
      ['Childcare expense research', 'Life insurance inquiry'],
      ['Baby product purchases', 'Hospital pre-registration'],
      ['Adoption agency payments', 'Home study preparation'],
      ['Fertility treatment costs', 'Parental leave planning'],
    ],
    timingOptions: ['Q1 2026', '3-6 months', 'Q2 2026', '6-9 months'],
  },
  elder_care: {
    names: ['Parent Care Planning', 'Long-term Care', 'Healthcare Transition', 'Assisted Living'],
    evidenceOptions: [
      ['Long-term care insurance research', 'Healthcare facility visits'],
      ['Medical expense increase', 'Family care discussions'],
      ['In-home care setup', 'Medicare supplement research'],
      ['Power of attorney setup', 'Healthcare proxy filing'],
    ],
    timingOptions: ['Q1 2026', '1-3 months', 'Immediate', '3-6 months'],
  },
};

// Persona to likely life events mapping
const personaEventProbabilities: Record<Persona, { type: DetectedLifeEvent['eventType']; weight: number }[]> = {
  youngProfessional: [
    { type: 'home_purchase', weight: 0.4 },
    { type: 'family_formation', weight: 0.3 },
    { type: 'education', weight: 0.15 },
  ],
  growingFamily: [
    { type: 'education', weight: 0.4 },
    { type: 'home_purchase', weight: 0.25 },
    { type: 'family_formation', weight: 0.2 },
    { type: 'elder_care', weight: 0.1 },
  ],
  establishedProfessional: [
    { type: 'education', weight: 0.3 },
    { type: 'wealth_transfer', weight: 0.25 },
    { type: 'business_liquidity', weight: 0.2 },
    { type: 'retirement', weight: 0.15 },
    { type: 'elder_care', weight: 0.1 },
  ],
  preRetiree: [
    { type: 'retirement', weight: 0.5 },
    { type: 'wealth_transfer', weight: 0.25 },
    { type: 'elder_care', weight: 0.2 },
    { type: 'home_purchase', weight: 0.05 },
  ],
};

function generateDetectedEvents(persona: Persona): DetectedLifeEvent[] {
  const events: DetectedLifeEvent[] = [];
  const probabilities = personaEventProbabilities[persona];
  
  // 40% of clients have events, some have multiple
  if (Math.random() > 0.4) return events;
  
  // Determine number of events (1-2, weighted toward 1)
  const numEvents = Math.random() > 0.7 ? 2 : 1;
  const usedTypes = new Set<DetectedLifeEvent['eventType']>();
  
  for (let i = 0; i < numEvents; i++) {
    // Weighted random selection
    const totalWeight = probabilities.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const prob of probabilities) {
      random -= prob.weight;
      if (random <= 0 && !usedTypes.has(prob.type)) {
        usedTypes.add(prob.type);
        
        const template = lifeEventTemplates[prob.type];
        const evidenceIdx = randomInRange(0, template.evidenceOptions.length - 1);
        
        events.push({
          eventType: prob.type,
          eventName: randomFromArray(template.names),
          confidence: randomInRange(65, 95),
          estimatedTiming: randomFromArray(template.timingOptions),
          keyEvidence: template.evidenceOptions[evidenceIdx],
          urgencyScore: randomInRange(1, 5),
        });
        break;
      }
    }
  }
  
  return events;
}

function getEngagementStatus(lastContactDate: Date): DashboardClient['engagementStatus'] {
  const daysSinceContact = Math.floor((Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceContact <= 14) return 'active';
  if (daysSinceContact <= 30) return 'due';
  return 'overdue';
}

export function generateDashboardClients(count: number = 60): DashboardClient[] {
  const clients: DashboardClient[] = [];
  const usedNames = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let profile: ClientProfileData;
    
    // Ensure unique names
    do {
      profile = generateRandomProfile();
    } while (usedNames.has(profile.name));
    usedNames.add(profile.name);
    
    // Determine persona based on age for event generation
    const age = parseInt(profile.demographics.age);
    let persona: Persona;
    if (age < 35) persona = 'youngProfessional';
    else if (age < 45) persona = 'growingFamily';
    else if (age < 55) persona = 'establishedProfessional';
    else persona = 'preRetiree';
    
    // Generate last contact date (0-60 days ago)
    const lastContactDate = new Date();
    lastContactDate.setDate(lastContactDate.getDate() - randomInRange(0, 60));
    
    // Maybe generate next meeting
    let nextScheduledMeeting: Date | undefined;
    if (Math.random() > 0.6) {
      nextScheduledMeeting = new Date();
      nextScheduledMeeting.setDate(nextScheduledMeeting.getDate() + randomInRange(1, 30));
    }
    
    clients.push({
      id: `client-${i}-${Date.now()}`,
      profile,
      detectedEvents: generateDetectedEvents(persona),
      lastContactDate,
      nextScheduledMeeting,
      engagementStatus: getEngagementStatus(lastContactDate),
    });
  }
  
  // Sort by number of events (most first), then by urgency
  return clients.sort((a, b) => {
    if (b.detectedEvents.length !== a.detectedEvents.length) {
      return b.detectedEvents.length - a.detectedEvents.length;
    }
    const maxUrgencyA = Math.max(...a.detectedEvents.map(e => e.urgencyScore), 0);
    const maxUrgencyB = Math.max(...b.detectedEvents.map(e => e.urgencyScore), 0);
    return maxUrgencyB - maxUrgencyA;
  });
}
