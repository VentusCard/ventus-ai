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

const firstNames = ['Sarah', 'James', 'Michelle', 'Robert', 'Emily', 'David', 'Jennifer', 'Michael', 'Amanda', 'Christopher', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Lauren'];
const lastNames = ['Mitchell', 'Patterson', 'Wong', 'Thompson', 'Garcia', 'Johnson', 'Williams', 'Chen', 'Anderson', 'Martinez', 'Taylor', 'Lee', 'Harris', 'Clark', 'Robinson'];

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
    familyStatuses: ['Married, 1 child', 'Married, 2 children', 'Married, 3 children'],
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
    familyStatuses: ['Married, 2 children', 'Married, adult children', 'Divorced, children'],
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
    familyStatuses: ['Married, adult children', 'Empty nester', 'Married, grandchildren'],
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
  };
}
