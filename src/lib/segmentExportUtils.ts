import Papa from "papaparse";
import type { 
  TargetingMode, 
  LifeEventCriteria, 
  LifestyleCriteria, 
  ProductCriteria,
  AudienceSegment,
  LIFE_EVENTS
} from "@/types/campaign";

export interface SegmentContact {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  segment_name: string;
  targeting_type: TargetingMode;
  targeting_criteria: string;
  confidence_score?: number;
  top_pillar?: string;
  estimated_savings?: number;
  current_products?: string;
  region: string;
  age_range: string;
}

export type ExportFormat = "csv_standard" | "csv_mailchimp" | "csv_sendgrid" | "json";
export type ExportSize = 1000 | 5000 | 10000 | 100000;

// Sample data for realistic mock generation
const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker"
];

const EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
  "aol.com", "protonmail.com", "mail.com"
];

const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West", "Northwest"];

const AGE_RANGES = ["25-34", "35-44", "45-54", "55-64", "65+"];

const LIFESTYLE_PILLARS = [
  "Travel & Experiences", "Dining & Culinary", "Health & Wellness",
  "Entertainment", "Shopping & Retail", "Home & Family", "Sports & Fitness"
];

const PRODUCTS = [
  "Checking Account", "Savings Account", "Credit Card", "Mortgage",
  "Auto Loan", "Investment Account", "Wealth Management", "Business Account"
];

// Helper to generate random phone in E.164 format
function generatePhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const subscriber = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${exchange}${subscriber}`;
}

// Helper to generate email from name
function generateEmail(firstName: string, lastName: string): string {
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  const separator = Math.random() > 0.5 ? "." : "";
  const suffix = Math.random() > 0.7 ? Math.floor(Math.random() * 99) : "";
  return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${suffix}@${domain}`;
}

// Get targeting criteria description
function getTargetingCriteria(
  mode: TargetingMode,
  lifeEventCriteria?: LifeEventCriteria,
  lifestyleCriteria?: LifestyleCriteria,
  productCriteria?: ProductCriteria
): string {
  switch (mode) {
    case "life_event":
      return lifeEventCriteria?.eventTypes.join(", ") || "Life Event";
    case "lifestyle":
      return lifestyleCriteria?.pillars.join(", ") || "Lifestyle";
    case "product":
      const has = productCriteria?.hasProducts.join(", ") || "";
      const lacks = productCriteria?.lacksProducts.map(p => `No ${p}`).join(", ") || "";
      return [has, lacks].filter(Boolean).join("; ") || "Product Holdings";
    default:
      return "Custom Segment";
  }
}

// Generate segment name from criteria
function generateSegmentName(
  mode: TargetingMode,
  lifeEventCriteria?: LifeEventCriteria,
  lifestyleCriteria?: LifestyleCriteria,
  productCriteria?: ProductCriteria
): string {
  switch (mode) {
    case "life_event":
      const events = lifeEventCriteria?.eventTypes || [];
      if (events.length === 1) {
        return `${events[0].charAt(0).toUpperCase() + events[0].slice(1).replace("_", " ")} Segment`;
      }
      return "Life Event Segment";
    case "lifestyle":
      const pillars = lifestyleCriteria?.pillars || [];
      if (pillars.length === 1) {
        return `${pillars[0]} Enthusiasts`;
      }
      return "Lifestyle Segment";
    case "product":
      if (productCriteria?.lacksProducts.length) {
        return `${productCriteria.lacksProducts[0]} Prospects`;
      }
      return "Product Segment";
    default:
      return "Custom Segment";
  }
}

// Generate mock contacts based on segment criteria
export function generateSegmentContacts(
  segment: Partial<AudienceSegment>,
  count: number = 1000
): SegmentContact[] {
  const contacts: SegmentContact[] = [];
  const mode = segment.targetingMode || "life_event";
  const segmentName = generateSegmentName(
    mode,
    segment.lifeEventCriteria,
    segment.lifestyleCriteria,
    segment.productCriteria
  );
  const targetingCriteria = getTargetingCriteria(
    mode,
    segment.lifeEventCriteria,
    segment.lifestyleCriteria,
    segment.productCriteria
  );

  // Determine age distribution based on targeting
  const getAgeWeights = (): number[] => {
    if (mode === "life_event") {
      const events = segment.lifeEventCriteria?.eventTypes || [];
      if (events.includes("retirement") || events.includes("wealth_transfer")) {
        return [0.05, 0.15, 0.25, 0.35, 0.20]; // Skew older
      }
      if (events.includes("family") || events.includes("home")) {
        return [0.25, 0.35, 0.25, 0.10, 0.05]; // Skew younger
      }
    }
    return [0.15, 0.25, 0.25, 0.20, 0.15]; // Balanced
  };

  const ageWeights = getAgeWeights();

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    
    // Weighted age selection
    const ageRand = Math.random();
    let cumulative = 0;
    let ageRange = AGE_RANGES[0];
    for (let j = 0; j < ageWeights.length; j++) {
      cumulative += ageWeights[j];
      if (ageRand <= cumulative) {
        ageRange = AGE_RANGES[j];
        break;
      }
    }

    const contact: SegmentContact = {
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      first_name: firstName,
      last_name: lastName,
      segment_name: segmentName,
      targeting_type: mode,
      targeting_criteria: targetingCriteria,
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      age_range: ageRange,
    };

    // Add mode-specific fields
    if (mode === "life_event") {
      contact.confidence_score = segment.lifeEventCriteria?.minConfidence 
        ? segment.lifeEventCriteria.minConfidence + (Math.random() * (1 - segment.lifeEventCriteria.minConfidence))
        : 0.65 + (Math.random() * 0.35);
      contact.estimated_savings = Math.floor(Math.random() * 5000) + 500;
    }

    if (mode === "lifestyle") {
      const pillars = segment.lifestyleCriteria?.pillars || [];
      contact.top_pillar = pillars.length > 0 
        ? pillars[Math.floor(Math.random() * pillars.length)]
        : LIFESTYLE_PILLARS[Math.floor(Math.random() * LIFESTYLE_PILLARS.length)];
    }

    if (mode === "product") {
      const hasProducts = segment.productCriteria?.hasProducts || [];
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const products = hasProducts.length > 0 
        ? hasProducts.slice(0, numProducts)
        : PRODUCTS.slice(0, numProducts);
      contact.current_products = products.join(", ");
    }

    contacts.push(contact);
  }

  return contacts;
}

// Export as standard CSV
export function exportAsCSV(contacts: SegmentContact[], filename: string): void {
  const csv = Papa.unparse(contacts);
  downloadFile(csv, `${filename}.csv`, "text/csv");
}

// Export as Mailchimp-formatted CSV
export function exportAsMailchimpCSV(contacts: SegmentContact[], filename: string): void {
  const mailchimpData = contacts.map(c => ({
    "Email Address": c.email,
    "Phone Number": c.phone,
    "First Name": c.first_name,
    "Last Name": c.last_name,
    "SEGMENT": c.segment_name,
    "TARGETING_TYPE": c.targeting_type,
    "TARGETING_CRITERIA": c.targeting_criteria,
    "REGION": c.region,
    "AGE_RANGE": c.age_range,
    "CONFIDENCE_SCORE": c.confidence_score?.toFixed(2) || "",
    "TOP_PILLAR": c.top_pillar || "",
    "ESTIMATED_SAVINGS": c.estimated_savings || "",
    "CURRENT_PRODUCTS": c.current_products || "",
  }));
  
  const csv = Papa.unparse(mailchimpData);
  downloadFile(csv, `${filename}_mailchimp.csv`, "text/csv");
}

// Export as SendGrid-formatted CSV
export function exportAsSendGridCSV(contacts: SegmentContact[], filename: string): void {
  const sendgridData = contacts.map(c => ({
    email: c.email,
    phone_number: c.phone,
    first_name: c.first_name,
    last_name: c.last_name,
    segment_name: c.segment_name,
    targeting_type: c.targeting_type,
    targeting_criteria: c.targeting_criteria,
    region: c.region,
    age_range: c.age_range,
    confidence_score: c.confidence_score?.toFixed(2) || "",
    top_pillar: c.top_pillar || "",
    estimated_savings: c.estimated_savings || "",
    current_products: c.current_products || "",
  }));
  
  const csv = Papa.unparse(sendgridData);
  downloadFile(csv, `${filename}_sendgrid.csv`, "text/csv");
}

// Export as JSON
export function exportAsJSON(
  contacts: SegmentContact[], 
  segment: Partial<AudienceSegment>,
  filename: string
): void {
  const jsonData = {
    segment_name: contacts[0]?.segment_name || "Custom Segment",
    exported_at: new Date().toISOString(),
    total_contacts: contacts.length,
    targeting: {
      mode: segment.targetingMode,
      criteria: segment.lifeEventCriteria || segment.lifestyleCriteria || segment.productCriteria,
    },
    contacts: contacts,
  };
  
  const json = JSON.stringify(jsonData, null, 2);
  downloadFile(json, `${filename}.json`, "application/json");
}

// Helper to trigger file download
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Main export function that handles all formats
export function exportSegment(
  segment: Partial<AudienceSegment>,
  format: ExportFormat,
  size: ExportSize = 1000
): void {
  const contacts = generateSegmentContacts(segment, size);
  const timestamp = new Date().toISOString().split("T")[0];
  const baseFilename = `ventus_segment_export_${timestamp}`;

  switch (format) {
    case "csv_standard":
      exportAsCSV(contacts, baseFilename);
      break;
    case "csv_mailchimp":
      exportAsMailchimpCSV(contacts, baseFilename);
      break;
    case "csv_sendgrid":
      exportAsSendGridCSV(contacts, baseFilename);
      break;
    case "json":
      exportAsJSON(contacts, segment, baseFilename);
      break;
  }
}
