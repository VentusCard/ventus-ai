import { ClientProfileData } from "./clientProfile";

export interface DetectedLifeEvent {
  eventType: 'retirement' | 'education' | 'home_purchase' | 'wealth_transfer' | 'business_liquidity' | 'family_formation' | 'elder_care';
  eventName: string;
  confidence: number;
  estimatedTiming: string;
  keyEvidence: string[];
  urgencyScore: number; // 1-5
}

export interface DashboardClient {
  id: string;
  profile: ClientProfileData;
  detectedEvents: DetectedLifeEvent[];
  lastContactDate: Date;
  nextScheduledMeeting?: Date;
  engagementStatus: 'active' | 'due' | 'overdue';
}

export const LIFE_EVENT_CONFIG: Record<DetectedLifeEvent['eventType'], {
  label: string;
  icon: string;
  color: string;
}> = {
  retirement: { label: 'Retirement Planning', icon: 'Sunset', color: 'amber' },
  education: { label: 'Education Funding', icon: 'GraduationCap', color: 'blue' },
  home_purchase: { label: 'Home Purchase', icon: 'Home', color: 'green' },
  wealth_transfer: { label: 'Wealth Transfer', icon: 'Gift', color: 'purple' },
  business_liquidity: { label: 'Business Liquidity', icon: 'Briefcase', color: 'slate' },
  family_formation: { label: 'Family Formation', icon: 'Baby', color: 'pink' },
  elder_care: { label: 'Elder Care', icon: 'Heart', color: 'red' },
};
