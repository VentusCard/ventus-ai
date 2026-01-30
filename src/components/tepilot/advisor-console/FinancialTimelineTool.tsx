import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { FinancialProjection, CostCategory, FundingSource, ActionableTimelineItem, LifeEvent, SavedFinancialProjection } from "@/types/lifestyle-signals";
import { FundingSourcesTable } from "./FundingSourcesTable";
import { CashFlowChart } from "./CashFlowChart";
import { ActionableTimelineSection } from "./ActionableTimelineSection";
import { Save, FileDown, ListPlus, Lightbulb, Sparkles, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FinancialGoal, getTimeHorizon } from "@/types/financial-planning";
interface ActionItemFromTimeline {
  id: string;
  text: string;
  completed: boolean;
  source: 'timeline';
  timestamp: Date;
}

interface FinancialTimelineToolProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detectedEvent?: LifeEvent;
  onSaveProjection?: (projection: SavedFinancialProjection) => void;
  onAddActionItems?: (items: ActionItemFromTimeline[]) => void;
}
const projectTypes = {
  education: {
    label: "Education Planning",
    categories: ["Tuition", "Room & Board", "Books/Supplies"]
  },
  home: {
    label: "Home Purchase",
    categories: ["Down Payment", "Closing Costs", "Renovations"]
  },
  retirement: {
    label: "Retirement Planning",
    categories: ["Living Expenses", "Healthcare", "Travel"]
  },
  business: {
    label: "Business Succession",
    categories: ["Capital", "Equipment", "Operating Costs"]
  },
  wedding: {
    label: "Wedding Planning",
    categories: ["Venue", "Catering", "Other Expenses"]
  },
  wealth_transfer: {
    label: "Wealth Transfer & Estate",
    categories: ["Trust Funding", "Gifting Strategy", "Legal/Attorney Fees"]
  },
  liquidity_event: {
    label: "Liquidity Event",
    categories: ["Tax Reserves", "Reinvestment Capital", "Charitable Allocation"]
  },
  family_formation: {
    label: "Family Formation",
    categories: ["Insurance Updates", "Trust Establishment", "Education Funding Setup"]
  },
  charitable_giving: {
    label: "Philanthropic Planning",
    categories: ["DAF Funding", "Charitable Trust", "Foundation Setup"]
  },
  elder_care: {
    label: "Long-Term Care Planning",
    categories: ["Care Reserves", "Insurance Premiums", "Asset Protection"]
  },
  other: {
    label: "Custom Planning",
    categories: ["Category 1", "Category 2", "Category 3"]
  }
};
const projectDurations: Record<keyof typeof projectTypes, number> = {
  education: 4,
  home: 2,
  retirement: 25,
  business: 5,
  wedding: 1,
  wealth_transfer: 2,
  liquidity_event: 2,
  family_formation: 1,
  charitable_giving: 1,
  elder_care: 5,
  other: 3
};
// Reusable function to generate action items for any project type
function generateActionItemsForProjectType(
  type: keyof typeof projectTypes,
  startYear: number,
  duration: number
): ActionableTimelineItem[] {
  if (type === "education") {
    return [
      { id: "a1", timing: `Q4 ${startYear - 1}`, action: `Initiate annual gift of $50,000 (tax-free under exclusion)`, completed: false },
      { id: "a2", timing: `Jan ${startYear}`, action: `Begin 529 distributions - $50,000 for Year 1`, completed: false },
      { id: "a3", timing: `Q1 ${startYear}`, action: "File FAFSA for financial aid consideration", completed: false },
      { id: "a4", timing: `Jan ${startYear + 1}`, action: `Continue 529 withdrawals - $50,000 for Year 2`, completed: false },
      { id: "a5", timing: `Q4 ${startYear}`, action: "Coordinate second annual gift of $50,000", completed: false },
      { id: "a6", timing: `Year ${startYear + 2}-${startYear + duration - 1}`, action: "Transition to savings/income-based funding as 529 depletes", completed: false },
      { id: "a7", timing: "Ongoing", action: "Review qualified education expenses for 529 compliance", completed: false }
    ];
  } else if (type === "home") {
    return [
      { id: "a1", timing: `Q1 ${startYear - 1}`, action: "Get pre-approved for mortgage to determine budget", completed: false },
      { id: "a2", timing: `Q2 ${startYear - 1}`, action: "Research neighborhoods and review property listings", completed: false },
      { id: "a3", timing: `Q3 ${startYear - 1}`, action: "Engage real estate agent and begin house hunting", completed: false },
      { id: "a4", timing: `Q4 ${startYear - 1}`, action: "Make offer and schedule home inspection", completed: false },
      { id: "a5", timing: `Jan ${startYear}`, action: "Finalize mortgage terms and lock interest rate", completed: false },
      { id: "a6", timing: `Q1 ${startYear}`, action: "Transfer down payment funds and close on property", completed: false },
      { id: "a7", timing: `Q2 ${startYear}`, action: "Complete renovations and move in", completed: false }
    ];
  } else if (type === "retirement") {
    return [
      { id: "a1", timing: `Year ${startYear - 2}`, action: "Review retirement income sources and projections", completed: false },
      { id: "a2", timing: `Q3 ${startYear - 1}`, action: "Decide on Social Security claiming strategy", completed: false },
      { id: "a3", timing: `Q4 ${startYear - 1}`, action: "Review healthcare coverage options (Medicare, supplements)", completed: false },
      { id: "a4", timing: `Jan ${startYear}`, action: "Begin Roth IRA distributions and establish withdrawal schedule", completed: false },
      { id: "a5", timing: `Q1 ${startYear}`, action: "Set up automated monthly distributions to checking account", completed: false },
      { id: "a6", timing: "Annual", action: "Review Required Minimum Distributions (RMDs) at age 73+", completed: false },
      { id: "a7", timing: "Ongoing", action: "Monitor spending and adjust distribution strategy as needed", completed: false }
    ];
  } else if (type === "business") {
    return [
      { id: "a1", timing: `Q1 ${startYear - 1}`, action: "Finalize business plan and financial projections", completed: false },
      { id: "a2", timing: `Q2 ${startYear - 1}`, action: "Secure business loan or investor funding", completed: false },
      { id: "a3", timing: `Q3 ${startYear - 1}`, action: "Register business entity and obtain necessary licenses", completed: false },
      { id: "a4", timing: `Q4 ${startYear - 1}`, action: "Set up business bank accounts and accounting system", completed: false },
      { id: "a5", timing: `Jan ${startYear}`, action: "Purchase equipment and secure business location", completed: false },
      { id: "a6", timing: `Q1 ${startYear}`, action: "Launch operations and begin marketing campaign", completed: false },
      { id: "a7", timing: "Quarterly", action: "Review cash flow and adjust operating budget as needed", completed: false }
    ];
  } else if (type === "wedding") {
    return [
      { id: "a1", timing: `12 months before`, action: "Coordinate family contributions and establish joint account structure", completed: false },
      { id: "a2", timing: `10 months before`, action: "Review prenuptial agreement considerations with estate attorney", completed: false },
      { id: "a3", timing: `6 months before`, action: "Update beneficiary designations on all accounts", completed: false },
      { id: "a4", timing: `3 months before`, action: "Consolidate insurance policies and review coverage needs", completed: false },
      { id: "a5", timing: `1 month before`, action: "Finalize vendor payments and honeymoon funding", completed: false },
      { id: "a6", timing: "Post-wedding", action: "Execute title transfers and update estate documents", completed: false },
      { id: "a7", timing: "Within 60 days", action: "Complete name changes on financial accounts if applicable", completed: false }
    ];
  } else if (type === "wealth_transfer") {
    return [
      { id: "a1", timing: `Q1 ${startYear}`, action: "Coordinate with estate attorney to review trust structure", completed: false },
      { id: "a2", timing: `Q2 ${startYear}`, action: "Execute annual exclusion gifts ($18,000 per recipient)", completed: false },
      { id: "a3", timing: `Q3 ${startYear}`, action: "Fund irrevocable life insurance trust (ILIT) if applicable", completed: false },
      { id: "a4", timing: `Q4 ${startYear}`, action: "Review grantor retained annuity trust (GRAT) opportunities", completed: false },
      { id: "a5", timing: `Q1 ${startYear + 1}`, action: "Evaluate family limited partnership (FLP) structures", completed: false },
      { id: "a6", timing: `Q2 ${startYear + 1}`, action: "Coordinate with CPA on gift tax return filings", completed: false },
      { id: "a7", timing: "Annual", action: "Review estate tax exemption utilization and adjust strategy", completed: false }
    ];
  } else if (type === "liquidity_event") {
    return [
      { id: "a1", timing: `Pre-event`, action: "Engage tax advisor to model various sale/exercise scenarios", completed: false },
      { id: "a2", timing: `Pre-event`, action: "Review qualified small business stock (QSBS) exclusion eligibility", completed: false },
      { id: "a3", timing: `Event +30 days`, action: "Execute tax-loss harvesting to offset capital gains", completed: false },
      { id: "a4", timing: `Event +60 days`, action: "Establish donor-advised fund with appreciated shares", completed: false },
      { id: "a5", timing: `Q1 ${startYear}`, action: "Implement concentrated position diversification strategy", completed: false },
      { id: "a6", timing: `Q2 ${startYear}`, action: "Review 10b5-1 trading plan for remaining equity holdings", completed: false },
      { id: "a7", timing: "Quarterly", action: "Rebalance portfolio and monitor tax implications", completed: false }
    ];
  } else if (type === "family_formation") {
    return [
      { id: "a1", timing: `Immediate`, action: "Update estate documents: will, healthcare proxy, POA", completed: false },
      { id: "a2", timing: `Within 30 days`, action: "Add dependent to health insurance and update FSA/HSA elections", completed: false },
      { id: "a3", timing: `Within 60 days`, action: "Establish 529 education savings plan and set up automatic contributions", completed: false },
      { id: "a4", timing: `Q1 ${startYear}`, action: "Review life insurance coverage adequacy (10-12x income)", completed: false },
      { id: "a5", timing: `Q2 ${startYear}`, action: "Update beneficiary designations on all retirement accounts", completed: false },
      { id: "a6", timing: `Q3 ${startYear}`, action: "Establish UTMA/UGMA custodial account if appropriate", completed: false },
      { id: "a7", timing: "Annual", action: "Review guardian designations and trust provisions", completed: false }
    ];
  } else if (type === "charitable_giving") {
    return [
      { id: "a1", timing: `Q1 ${startYear}`, action: "Establish donor-advised fund (DAF) with initial contribution", completed: false },
      { id: "a2", timing: `Q2 ${startYear}`, action: "Identify appreciated securities for charitable contribution", completed: false },
      { id: "a3", timing: `Q3 ${startYear}`, action: "Evaluate charitable remainder trust (CRT) benefits", completed: false },
      { id: "a4", timing: `Q4 ${startYear}`, action: "Execute bunching strategy for itemized deduction optimization", completed: false },
      { id: "a5", timing: `Post-70½`, action: "Consider qualified charitable distribution (QCD) from IRA", completed: false },
      { id: "a6", timing: "Annual", action: "Review DAF grant recommendations and distribution schedule", completed: false },
      { id: "a7", timing: "Ongoing", action: "Document philanthropic legacy goals with family members", completed: false }
    ];
  } else if (type === "elder_care") {
    return [
      { id: "a1", timing: `Year 1`, action: "Complete comprehensive care needs assessment with family", completed: false },
      { id: "a2", timing: `Year 1`, action: "Review long-term care insurance options and premium funding", completed: false },
      { id: "a3", timing: `Year 1-2`, action: "Establish durable power of attorney and healthcare proxy", completed: false },
      { id: "a4", timing: `Year 2`, action: "Evaluate Medicaid planning strategies (5-year lookback)", completed: false },
      { id: "a5", timing: `Year 2-3`, action: "Research care facility options and associated costs", completed: false },
      { id: "a6", timing: `Year 3+`, action: "Implement asset protection strategies within legal guidelines", completed: false },
      { id: "a7", timing: "Ongoing", action: "Coordinate care decisions with siblings and family members", completed: false }
    ];
  } else {
    return [
      { id: "a1", timing: `Q1 ${startYear}`, action: "Define planning objectives and success metrics", completed: false },
      { id: "a2", timing: `Q2 ${startYear}`, action: "Establish funding strategy and capital allocation", completed: false },
      { id: "a3", timing: `Q3 ${startYear}`, action: "Implement plan and monitor key milestones", completed: false },
      { id: "a4", timing: "Quarterly", action: "Review progress and adjust strategy as needed", completed: false }
    ];
  }
}

export function FinancialTimelineTool({
  open,
  onOpenChange,
  detectedEvent,
  onSaveProjection,
  onAddActionItems
}: FinancialTimelineToolProps) {
  const {
    toast
  } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  const [projectName, setProjectName] = useState("College Education");
  const [projectType, setProjectType] = useState<keyof typeof projectTypes>("education");
  const [startYear, setStartYear] = useState(2026);
  const [duration, setDuration] = useState(4);
  const [currentSavings, setCurrentSavings] = useState(25000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [inflationRate, setInflationRate] = useState(3);
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [actionItems, setActionItems] = useState<ActionableTimelineItem[]>([]);
  const currentYear = new Date().getFullYear();

  // Project cost years (starts at project start)
  const projectYears = Array.from({
    length: duration
  }, (_, i) => startYear + i);

  // Funding years (starts from current year through project end)
  const yearsUntilProjectStart = Math.max(0, startYear - currentYear);
  const fundingYears = Array.from({
    length: duration + yearsUntilProjectStart
  }, (_, i) => currentYear + i);

  // Keep years for backward compatibility with cost tables and charts
  const years = projectYears;

  // Initialize with detected event or default template
  useEffect(() => {
    if (open) {
      if (detectedEvent?.financial_projection) {
        loadFromDetectedEvent(detectedEvent);
      } else {
        loadTemplate(projectType);
      }
    }
  }, [open, detectedEvent]);

  // Track previous values for re-keying amounts when startYear or duration changes
  const previousStartYearRef = useRef(startYear);
  const previousDurationRef = useRef(duration);

  // Re-key cost and funding amounts when startYear or duration changes
  useEffect(() => {
    const prevStart = previousStartYearRef.current;
    const prevDuration = previousDurationRef.current;

    // Skip if no actual change
    if (prevStart === startYear && prevDuration === duration) return;

    const yearShift = startYear - prevStart;

    // Re-key cost categories - shift amounts to new year keys
    setCostCategories(prev => prev.map(cat => {
      const newAmounts: { [year: number]: number } = {};
      const oldYears = Object.keys(cat.amounts).map(Number).sort((a, b) => a - b);
      
      // Map old years to new years by position
      oldYears.forEach((oldYear, idx) => {
        const newYear = startYear + idx;
        if (idx < duration) {
          newAmounts[newYear] = cat.amounts[oldYear] || 0;
        }
      });
      
      // Fill any new years with 0
      for (let i = oldYears.length; i < duration; i++) {
        newAmounts[startYear + i] = 0;
      }
      
      return { ...cat, amounts: newAmounts };
    }));

    // Re-key funding sources - start from current year through project end
    const newFundingYearsCount = duration + Math.max(0, startYear - currentYear);
    setFundingSources(prev => prev.map(source => {
      const newAmounts: { [year: number]: number } = {};
      const oldYears = Object.keys(source.amounts).map(Number).sort((a, b) => a - b);
      
      // Map old funding years to new funding years by position
      for (let i = 0; i < newFundingYearsCount; i++) {
        const newYear = currentYear + i;
        const correspondingOldYear = oldYears[i];
        newAmounts[newYear] = correspondingOldYear !== undefined 
          ? (source.amounts[correspondingOldYear] || 0)
          : 0;
      }
      
      return { ...source, amounts: newAmounts };
    }));

    // Update action item timings to reflect new years
    setActionItems(prev => prev.map(item => {
      let newTiming = item.timing;
      // Replace year references in timing strings
      for (let i = 0; i < Math.max(prevDuration, duration); i++) {
        const oldYear = prevStart + i;
        const newYear = startYear + i;
        if (oldYear !== newYear) {
          newTiming = newTiming.replace(new RegExp(oldYear.toString(), 'g'), newYear.toString());
        }
      }
      // Also handle year-1 references (e.g., Q4 2025 for 2026 start)
      const oldPrevYear = prevStart - 1;
      const newPrevYear = startYear - 1;
      if (oldPrevYear !== newPrevYear) {
        newTiming = newTiming.replace(new RegExp(oldPrevYear.toString(), 'g'), newPrevYear.toString());
      }
      return { ...item, timing: newTiming };
    }));

    // Update refs for next comparison
    previousStartYearRef.current = startYear;
    previousDurationRef.current = duration;
  }, [startYear, duration, currentYear]);
  const loadFromDetectedEvent = (event: LifeEvent) => {
    const projection = event.financial_projection!;

    // Set project info from AI
    setProjectName(event.event_name);
    setProjectType(projection.project_type as keyof typeof projectTypes);
    setStartYear(projection.estimated_start_year);
    setDuration(projection.duration_years);
    setCurrentSavings(projection.estimated_current_savings || 0);
    setMonthlyContribution(projection.recommended_monthly_contribution || 0);

    // Set cost categories from AI
    const newCategories: CostCategory[] = projection.cost_breakdown.map((item, idx) => ({
      id: `cat-${idx}`,
      label: item.category,
      amounts: item.yearly_amounts as {
        [year: number]: number;
      }
    }));
    setCostCategories(newCategories);

    // Set funding sources from AI recommendations (starting from current year)
    const fundingStartYear = Math.min(currentYear, projection.estimated_start_year);
    const fundingDuration = projection.estimated_start_year - fundingStartYear + projection.duration_years;
    const newFundingSources: FundingSource[] = projection.recommended_funding_sources.map((source, idx) => {
      const sourceYears = Array.from({
        length: fundingDuration
      }, (_, i) => fundingStartYear + i);
      const amounts: {
        [year: number]: number;
      } = {};
      sourceYears.forEach(year => {
        amounts[year] = source.suggested_annual_amount;
      });
      return {
        id: `source-${idx}`,
        type: source.type,
        label: `${source.type.toUpperCase()} - ${source.rationale}`,
        amounts
      };
    });
    setFundingSources(newFundingSources);

    // Generate action items using the shared function based on project type
    const projectTypeKey = projection.project_type as keyof typeof projectTypes;
    setActionItems(generateActionItemsForProjectType(
      projectTypeKey,
      projection.estimated_start_year,
      projection.duration_years
    ));
  };
  const loadTemplate = (type: keyof typeof projectTypes) => {
    const template = projectTypes[type];
    const newDuration = projectDurations[type];

    // Calculate years locally with the NEW duration
    const templateYears = Array.from({
      length: newDuration
    }, (_, i) => startYear + i);

    // Update duration state
    setDuration(newDuration);

    // Initialize cost categories
    const newCategories: CostCategory[] = template.categories.map((label, idx) => ({
      id: `cat-${idx}`,
      label,
      amounts: {}
    }));

    // Pre-populate with sample amounts based on type
    if (type === "education") {
      templateYears.forEach((year, idx) => {
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, idx);
        newCategories[0].amounts[year] = Math.round(15000 * inflationMultiplier); // Tuition
        newCategories[1].amounts[year] = Math.round(12000 * inflationMultiplier); // Room & Board
        newCategories[2].amounts[year] = Math.round(3000 * inflationMultiplier); // Books
      });

      // Sample funding sources for education (starting from current year)
      const sample529: FundingSource = {
        id: "529-1",
        type: "529",
        label: "529 Plan",
        amounts: Object.fromEntries(Array.from({
          length: Math.min(2, fundingYears.length)
        }, (_, i) => [currentYear + i, 50000]))
      };
      const sampleGifts: FundingSource = {
        id: "gifts-1",
        type: "gifts",
        label: "Annual Gifts",
        amounts: Object.fromEntries(Array.from({
          length: Math.min(2, fundingYears.length)
        }, (_, i) => [currentYear + i, 50000]))
      };
      setFundingSources([sample529, sampleGifts]);
      setActionItems(generateActionItemsForProjectType("education", startYear, newDuration));
    } else if (type === "home") {
      // Sample costs for home purchase
      templateYears.forEach((year, idx) => {
        if (idx === 0) {
          newCategories[0].amounts[year] = 80000; // Down Payment
          newCategories[1].amounts[year] = 15000; // Closing Costs
          newCategories[2].amounts[year] = 25000; // Renovations
        }
      });
      const homeSavings: FundingSource = {
        id: "savings-1",
        type: "savings",
        label: "Savings Account",
        amounts: {
          [currentYear]: 120000
        }
      };
      setFundingSources([homeSavings]);
      setActionItems(generateActionItemsForProjectType("home", startYear, newDuration));
    } else if (type === "retirement") {
      // Sample costs for retirement
      templateYears.forEach((year, idx) => {
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, idx);
        newCategories[0].amounts[year] = Math.round(60000 * inflationMultiplier); // Living Expenses
        newCategories[1].amounts[year] = Math.round(15000 * inflationMultiplier); // Healthcare
        newCategories[2].amounts[year] = Math.round(10000 * inflationMultiplier); // Travel
      });
      const rothIRA: FundingSource = {
        id: "roth-1",
        type: "roth_ira",
        label: "Roth IRA Distributions",
        amounts: Object.fromEntries(fundingYears.map(y => [y, 40000]))
      };
      const taxable: FundingSource = {
        id: "taxable-1",
        type: "taxable",
        label: "Taxable Investment Account",
        amounts: Object.fromEntries(fundingYears.map(y => [y, 45000]))
      };
      setFundingSources([rothIRA, taxable]);
      setActionItems(generateActionItemsForProjectType("retirement", startYear, newDuration));
    } else if (type === "business") {
      // Sample costs for business
      templateYears.forEach((year, idx) => {
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, idx);
        if (idx === 0) {
          newCategories[0].amounts[year] = 100000; // Capital
          newCategories[1].amounts[year] = 50000; // Equipment
        }
        newCategories[2].amounts[year] = Math.round(75000 * inflationMultiplier); // Operating Costs
      });
      const businessLoan: FundingSource = {
        id: "loan-1",
        type: "loan",
        label: "Business Loan",
        amounts: {
          [currentYear]: 150000
        }
      };
      const personalSavings: FundingSource = {
        id: "savings-1",
        type: "savings",
        label: "Personal Investment",
        amounts: {
          [currentYear]: 75000
        }
      };
      setFundingSources([businessLoan, personalSavings]);
      setActionItems(generateActionItemsForProjectType("business", startYear, newDuration));
    } else if (type === "wedding") {
      // Sample costs for wedding/family formation financial planning
      templateYears.forEach((year, idx) => {
        if (idx === 0) {
          newCategories[0].amounts[year] = 15000; // Venue
          newCategories[1].amounts[year] = 10000; // Catering
          newCategories[2].amounts[year] = 8000; // Other Expenses
        }
      });
      const weddingSavings: FundingSource = {
        id: "savings-1",
        type: "savings",
        label: "Joint Savings",
        amounts: { [currentYear]: 20000 }
      };
      const familyGifts: FundingSource = {
        id: "gifts-1",
        type: "gifts",
        label: "Family Contributions",
        amounts: { [currentYear]: 13000 }
      };
      setFundingSources([weddingSavings, familyGifts]);
      setActionItems(generateActionItemsForProjectType("wedding", startYear, newDuration));
    } else if (type === "wealth_transfer") {
      // Estate & Wealth Transfer Planning
      templateYears.forEach((year, idx) => {
        newCategories[0].amounts[year] = idx === 0 ? 500000 : 200000; // Trust Funding
        newCategories[1].amounts[year] = 36000; // Annual Gifting (2 recipients × $18k)
        newCategories[2].amounts[year] = idx === 0 ? 25000 : 5000; // Legal Fees
      });
      const taxableInvestments: FundingSource = {
        id: "taxable-1",
        type: "taxable",
        label: "Taxable Investment Portfolio",
        amounts: Object.fromEntries(fundingYears.map(y => [y, 400000]))
      };
      const appreciatedAssets: FundingSource = {
        id: "other-1",
        type: "other",
        label: "Appreciated Securities (Stepped-up Basis)",
        amounts: { [currentYear]: 300000 }
      };
      setFundingSources([taxableInvestments, appreciatedAssets]);
      setActionItems(generateActionItemsForProjectType("wealth_transfer", startYear, newDuration));
    } else if (type === "liquidity_event") {
      // Business Sale / Stock Options / Inheritance
      templateYears.forEach((year, idx) => {
        newCategories[0].amounts[year] = idx === 0 ? 800000 : 100000; // Tax Reserves
        newCategories[1].amounts[year] = idx === 0 ? 1500000 : 500000; // Reinvestment
        newCategories[2].amounts[year] = idx === 0 ? 200000 : 50000; // Charitable
      });
      const proceedsSource: FundingSource = {
        id: "other-1",
        type: "other",
        label: "Liquidity Event Proceeds",
        amounts: { [currentYear]: 3000000 }
      };
      const dafContribution: FundingSource = {
        id: "other-2",
        type: "other",
        label: "Donor-Advised Fund (Tax-Efficient)",
        amounts: { [currentYear]: 250000 }
      };
      setFundingSources([proceedsSource, dafContribution]);
      setActionItems(generateActionItemsForProjectType("liquidity_event", startYear, newDuration));
    } else if (type === "family_formation") {
      // Marriage / New Child Planning
      templateYears.forEach((year, idx) => {
        newCategories[0].amounts[year] = 5000; // Insurance Updates
        newCategories[1].amounts[year] = idx === 0 ? 15000 : 2000; // Trust Establishment
        newCategories[2].amounts[year] = 12000; // 529 Initial Funding
      });
      const savings529: FundingSource = {
        id: "529-1",
        type: "529",
        label: "529 Plan Contributions",
        amounts: Object.fromEntries(fundingYears.map(y => [y, 12000]))
      };
      const lifeInsurance: FundingSource = {
        id: "other-1",
        type: "other",
        label: "Life Insurance Premium Funding",
        amounts: Object.fromEntries(fundingYears.map(y => [y, 5000]))
      };
      setFundingSources([savings529, lifeInsurance]);
      setActionItems(generateActionItemsForProjectType("family_formation", startYear, newDuration));
    } else if (type === "charitable_giving") {
      // Major Philanthropic Planning
      templateYears.forEach((year, idx) => {
        newCategories[0].amounts[year] = 100000; // DAF Funding
        newCategories[1].amounts[year] = idx === 0 ? 250000 : 0; // Charitable Trust
        newCategories[2].amounts[year] = idx === 0 ? 50000 : 10000; // Foundation Setup
      });
      const appreciatedStock: FundingSource = {
        id: "other-1",
        type: "other",
        label: "Appreciated Securities Transfer",
        amounts: { [currentYear]: 300000 }
      };
      const cashContributions: FundingSource = {
        id: "savings-1",
        type: "savings",
        label: "Cash Contributions",
        amounts: { [currentYear]: 100000 }
      };
      setFundingSources([appreciatedStock, cashContributions]);
      setActionItems(generateActionItemsForProjectType("charitable_giving", startYear, newDuration));
    } else if (type === "elder_care") {
      // Long-Term Care Planning
      templateYears.forEach((year, idx) => {
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, idx);
        newCategories[0].amounts[year] = Math.round(80000 * inflationMultiplier); // Care Reserves
        newCategories[1].amounts[year] = 8000; // Insurance Premiums
        newCategories[2].amounts[year] = idx < 2 ? 25000 : 5000; // Asset Protection
      });
      const ltcInsurance: FundingSource = {
        id: "other-1",
        type: "other",
        label: "Long-Term Care Insurance Benefits",
        amounts: Object.fromEntries(fundingYears.slice(2).map(y => [y, 60000]))
      };
      const familyContributions: FundingSource = {
        id: "gifts-1",
        type: "gifts",
        label: "Family Member Contributions",
        amounts: Object.fromEntries(fundingYears.map(y => [y, 20000]))
      };
      const parentAssets: FundingSource = {
        id: "savings-1",
        type: "savings",
        label: "Parent's Liquid Assets",
        amounts: { [currentYear]: 150000 }
      };
      setFundingSources([ltcInsurance, familyContributions, parentAssets]);
      setActionItems(generateActionItemsForProjectType("elder_care", startYear, newDuration));
    } else {
      // Default empty for other types or custom projects
      setFundingSources([]);
      setActionItems(generateActionItemsForProjectType("other", startYear, newDuration));
    }
    setCostCategories(newCategories);
  };
  const handleSaveToNextSteps = async () => {
    // Capture the chart image before saving
    let chartImageDataUrl: string | undefined;
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        chartImageDataUrl = canvas.toDataURL('image/png');
      } catch (error) {
        console.error("Error capturing chart for save:", error);
      }
    }

    // Build the full projection object
    const savedProjection: SavedFinancialProjection = {
      projectName,
      projectType,
      startYear,
      duration,
      currentSavings,
      monthlyContribution,
      inflationRate,
      costCategories,
      fundingSources,
      actionItems,
      chartImageDataUrl,
      savedAt: new Date()
    };

    // Call the save callback if provided
    if (onSaveProjection) {
      onSaveProjection(savedProjection);
    }

    // Create single action item for timeline review
    if (onAddActionItems) {
      const reviewActionItem: ActionItemFromTimeline[] = [{
        id: `timeline-review-${Date.now()}`,
        text: `Review ${projectName} timeline with client`,
        completed: false,
        source: 'timeline' as const,
        timestamp: new Date()
      }];
      
      onAddActionItems(reviewActionItem);
    }

    toast({
      title: "✓ Saved to Next Steps",
      description: `Timeline review added to your task list`
    });
  };
  const handleExportPDF = async () => {
    toast({
      title: "Generating PDF...",
      description: "Please wait while we create your document"
    });
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(projectName, pageWidth / 2, yPos, {
      align: "center"
    });
    yPos += 10;

    // Project Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Project Type: ${projectTypes[projectType].label}`, 20, yPos);
    yPos += 6;
    doc.text(`Timeline: ${startYear} - ${startYear + duration - 1} (${duration} years)`, 20, yPos);
    yPos += 6;
    doc.text(`Current Savings: ${formatCurrency(currentSavings)}`, 20, yPos);
    yPos += 6;
    doc.text(`Monthly Contribution: ${formatCurrency(monthlyContribution)}`, 20, yPos);
    yPos += 10;

    // Capture and add Cash Flow Chart
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        // Add new page for chart if needed
        if (yPos + imgHeight > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Cash Flow Projection", 20, yPos);
        yPos += 10;
        doc.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;

        // Add new page after chart
        doc.addPage();
        yPos = 20;
      } catch (error) {
        console.error("Error capturing chart:", error);
      }
    }

    // Cost Breakdown
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Cost Breakdown by Year", 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    years.forEach(year => {
      const yearCost = costCategories.reduce((sum, cat) => sum + (cat.amounts[year] || 0), 0);
      doc.text(`${year}: ${formatCurrency(yearCost)}`, 25, yPos);
      yPos += 5;
      costCategories.forEach(cat => {
        if (cat.amounts[year]) {
          doc.text(`  - ${cat.label}: ${formatCurrency(cat.amounts[year])}`, 30, yPos);
          yPos += 5;
        }
      });
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    yPos += 5;

    // Funding Sources
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Funding Sources", 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    fundingSources.forEach(source => {
      doc.text(`${source.label}:`, 25, yPos);
      yPos += 5;
      years.forEach(year => {
        if (source.amounts[year]) {
          doc.text(`  ${year}: ${formatCurrency(source.amounts[year])}`, 30, yPos);
          yPos += 5;
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        }
      });
      yPos += 3;
    });
    yPos += 5;

    // Summary
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Summary", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const totalCost = totalCostsByYear.reduce((sum, cost) => sum + cost, 0);
    // Note: totalFunding already calculated above includes pre-funding years
    doc.text(`Total Projected Cost: ${formatCurrency(totalCost)}`, 25, yPos);
    yPos += 6;
    doc.text(`Total Funding: ${formatCurrency(totalFunding)}`, 25, yPos);
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Funding Gap: ${formatCurrency(fundingGap)}`, 25, yPos);
    yPos += 10;

    // Action Items
    if (actionItems.length > 0) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Action Items", 20, yPos);
      yPos += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      actionItems.forEach(item => {
        const checkbox = item.completed ? "[✓]" : "[ ]";
        doc.text(`${checkbox} ${item.timing}:`, 25, yPos);
        yPos += 5;
        const actionLines = doc.splitTextToSize(item.action, pageWidth - 50);
        actionLines.forEach((line: string) => {
          doc.text(line, 30, yPos);
          yPos += 5;
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
      });
    }

    // Save PDF
    doc.save(`${projectName.replace(/\s+/g, '_')}_Timeline.pdf`);
    toast({
      title: "✓ PDF Downloaded",
      description: "Life event plan exported successfully"
    });
  };
  const handleAddToPrep = () => {
    toast({
      title: "✓ Added to Meeting Prep",
      description: "Timeline included in talking points"
    });
  };
  // Per-year arrays for display purposes
  const totalCostsByYear = years.map(year => costCategories.reduce((sum, cat) => sum + (cat.amounts[year] || 0), 0));
  const totalFundingByYear = years.map(year => fundingSources.reduce((sum, source) => sum + (source.amounts[year] || 0), 0));
  
  // Total costs only occur during project years
  const totalCosts = totalCostsByYear.reduce((sum, val) => sum + val, 0);

  // Total funding includes ALL funding years (including pre-funding before project starts)
  const totalFunding = fundingSources.reduce((sum, source) => 
    sum + Object.values(source.amounts).reduce((srcSum, val) => srcSum + (val || 0), 0), 0);

  // Funding gap = what's still needed
  const fundingGap = totalCosts - totalFunding;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Life Event Planner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Pre-fill Banner */}
          {detectedEvent?.financial_projection && <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Pre-filled from AI-detected: "{detectedEvent.event_name}" (Confidence: {detectedEvent.confidence}%)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Review and adjust the projections below based on client conversation.
                </p>
              </CardContent>
            </Card>}

          {/* Project Info */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g., College Education" />
                </div>
                <div>
                  <Label>Project Type</Label>
                  <Select value={projectType} onValueChange={value => {
                  const newType = value as keyof typeof projectTypes;
                  setProjectType(newType);
                  loadTemplate(newType);
                }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(projectTypes).map(([key, {
                      label
                    }]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={`grid ${projectType === 'education' ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                <div>
                  <Label>Start Year</Label>
                  <Input type="number" value={startYear} onChange={e => setStartYear(parseInt(e.target.value) || 2026)} />
                </div>
                <div>
                  <Label>Duration: {duration} years</Label>
                  <Slider value={[duration]} onValueChange={([v]) => setDuration(v)} min={1} max={10} step={1} className="mt-2" />
                </div>
                {projectType !== 'education' && (
                  <div>
                    <Label>Inflation Rate: {inflationRate}%</Label>
                    <Slider value={[inflationRate]} onValueChange={([v]) => setInflationRate(v)} min={0} max={10} step={0.5} className="mt-2" />
                  </div>
                )}
              </div>

              {projectType !== 'education' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Savings</Label>
                    <Input type="number" value={currentSavings} onChange={e => setCurrentSavings(parseFloat(e.target.value) || 0)} placeholder="$0" />
                  </div>
                  <div>
                    <Label>Monthly Contribution</Label>
                    <Input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(parseFloat(e.target.value) || 0)} placeholder="$0" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Breakdown Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Cost Category</th>
                      {years.map(year => <th key={year} className="text-right p-2 font-medium">{year}</th>)}
                      <th className="text-right p-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costCategories.map(cat => <tr key={cat.id} className="border-b">
                        <td className="p-2 font-medium">{cat.label}</td>
                        {years.map(year => <td key={year} className="p-2">
                            <Input type="number" value={cat.amounts[year] || ''} onChange={e => {
                        const newCategories = costCategories.map(c => {
                          if (c.id === cat.id) {
                            return {
                              ...c,
                              amounts: {
                                ...c.amounts,
                                [year]: parseFloat(e.target.value) || 0
                              }
                            };
                          }
                          return c;
                        });
                        setCostCategories(newCategories);
                      }} className="h-8 text-right" placeholder="$0" />
                          </td>)}
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(Object.values(cat.amounts).reduce((sum, val) => sum + val, 0))}
                        </td>
                      </tr>)}
                    <tr className="font-semibold bg-muted/30">
                      <td className="p-2">Total Costs</td>
                      {years.map((year, idx) => <td key={year} className="p-2 text-right text-red-600">
                          {formatCurrency(totalCostsByYear[idx])}
                        </td>)}
                      <td className="p-2 text-right text-red-600">
                        {formatCurrency(totalCostsByYear.reduce((sum, val) => sum + val, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Funding Sources */}
          <FundingSourcesTable sources={fundingSources} years={fundingYears} projectType={projectType} onChange={setFundingSources} />

          {/* Funding Gap Indicator */}
          {fundingGap !== 0 && <Card className={fundingGap > 0 ? "border-red-600 bg-red-50 dark:bg-red-950/20" : "border-green-600 bg-green-50 dark:bg-green-950/20"}>
              <CardContent className="pt-4">
                <p className="text-sm font-medium">
                  {fundingGap > 0 ? "⚠️ Funding Gap:" : "✓ Funding Surplus:"} {formatCurrency(Math.abs(fundingGap))}
                </p>
              </CardContent>
            </Card>}

          {/* Cash Flow Chart */}
          <div ref={chartRef}>
            <CashFlowChart years={fundingYears} costCategories={costCategories} fundingSources={fundingSources} currentSavings={currentSavings} monthlyContribution={monthlyContribution} />
          </div>

          {/* Actionable Timeline */}
          <ActionableTimelineSection items={actionItems} />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleSaveToNextSteps}>
              <Save className="w-4 h-4 mr-2" />
              Save to Next Steps
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => {
              const totalCost = costCategories.reduce((sum, cat) => 
                sum + Object.values(cat.amounts).reduce((s, v) => s + v, 0), 0);
              
              const goal: FinancialGoal = {
                id: `goal-${Date.now()}`,
                name: projectName,
                type: projectType as FinancialGoal['type'],
                targetAmount: totalCost,
                currentAmount: currentSavings,
                targetDate: `${startYear}-01-01`,
                priority: 1,
                monthlyContribution: monthlyContribution,
                linkedEventId: detectedEvent?.event_name || projectName,
                timeHorizon: getTimeHorizon(`${startYear}-01-01`),
              };
              
              const existingGoals = JSON.parse(sessionStorage.getItem('pendingFinancialGoals') || '[]');
              sessionStorage.setItem('pendingFinancialGoals', JSON.stringify([...existingGoals, goal]));
              
              toast({
                title: "Added to Financial Plan",
                description: `"${projectName}" goal added. Open Financial Planning to view.`,
              });
            }}>
              <Target className="w-4 h-4 mr-2" />
              Add to Financial Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}