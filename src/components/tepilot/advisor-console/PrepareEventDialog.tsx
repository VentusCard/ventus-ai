import { useState } from "react";
import { EventPreparationData, CardTransaction, LIFE_EVENT_CONFIG, DetectedLifeEvent } from "@/types/dashboardClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CreditCard, Mail, MessageSquare, CheckCircle2, Sparkles, Download,
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSegmentColorClasses } from "@/lib/segmentColors";
import { toast } from "@/hooks/use-toast";
import { exportEventPreparationPDF } from "@/lib/eventPreparationPdfExport";
import { EventSummaryEmailDialog } from "./EventSummaryEmailDialog";

interface PrepareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: EventPreparationData | null;
  onPrepareWithVentus?: (data: EventPreparationData) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunset,
  GraduationCap,
  Home,
  Gift,
  Briefcase,
  Baby,
  Heart,
};

const cardColorMap: Record<string, string> = {
  'Platinum Rewards': 'bg-violet-100 text-violet-700 border-violet-200',
  'Cashback Plus': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Travel Elite': 'bg-sky-100 text-sky-700 border-sky-200',
  'Business Platinum': 'bg-amber-100 text-amber-700 border-amber-200',
  'Primary Checking': 'bg-slate-100 text-slate-700 border-slate-200',
};

const getCardBadgeColor = (cardType: string): string => {
  return cardColorMap[cardType] || 'bg-slate-100 text-slate-600 border-slate-200';
};

const mockInsightsByEventType: Record<DetectedLifeEvent['eventType'], string> = {
  retirement: "This client is in the early exploration phase of retirement planning—a critical window for proactive engagement. The increased 401k contributions and AARP enrollment signal they're mentally preparing for this transition. Viking Cruises booking reveals aspirations for an active, travel-rich retirement. Estate planning consultations show they're thinking about legacy. Crucially, they haven't yet established dedicated retirement income vehicles—this is your opportunity to guide them on Roth conversions, income strategies, and trust structures before they go elsewhere.",
  education: "This parent is deep in the college planning research phase—the ideal moment for advisor involvement. SAT prep, Princeton Review enrollment, and campus visits indicate serious commitment. Admissions consulting and research subscriptions show they're gathering intelligence but haven't yet committed to funding strategies. This is your window to introduce 529 optimization, financial aid positioning, and parent-student loan comparisons before they make uninformed funding decisions.",
  home_purchase: "This client is in active home acquisition mode. The pattern of home improvement purchases before closing suggests they're preparing a new property for move-in, indicating deal momentum. Earnest money and closing cost payments confirm an imminent transaction. The moving rental booking shows a firm timeline. Expect questions about mortgage optimization, down payment sourcing, and how this purchase fits their broader wealth picture.",
  wealth_transfer: "A sophisticated wealth holder beginning to think intergenerationally. Goldman Sachs Private Wealth engagement shows they're seeking institutional-grade advice. Sotheby's appraisals reveal significant art or collectibles requiring specialized valuation. Family Wealth Alliance and Purposeful Planning seminars indicate they're educating themselves on governance and transfer strategies. They're in learning mode—not execution mode—making this the perfect time to position yourself as their trusted guide before they formalize structures elsewhere.",
  business_liquidity: "An entrepreneur approaching a transformational exit. The Merrill DataSite subscription and Deloitte advisory engagement indicate a sophisticated seller running a structured M&A process. IP valuation activity suggests they understand their business's intangible assets. The significant escrow deposit signals deal progression past LOI stage. This client needs holistic guidance on life after exit—investment of proceeds, tax minimization, and finding purpose post-business.",
  family_formation: "A growing family in the early stages of preparing for a new arrival—a pivotal moment for relationship deepening. Baby registry activity, nursery purchases, and maternity clothing signal nesting behavior. Hospital pre-registration and pregnancy tracking app subscriptions confirm timeline clarity. Notably, they haven't yet established education savings or updated estate documents—this is your opportunity to proactively introduce 529 plans, life insurance benchmarking, and guardianship planning before they're overwhelmed post-birth.",
  elder_care: "This client is stepping into a caregiver role for an aging family member. Medical alert system purchases and home accessibility modifications suggest a parent or in-law is transitioning to needing daily support. The assisted living deposit indicates they're exploring residential care options. Medicare supplement payments show active healthcare management. This is often emotionally complex—approach with empathy while addressing Medicaid planning, long-term care costs, and potential real estate decisions.",
};

export function PrepareEventDialog({ open, onOpenChange, data, onPrepareWithVentus }: PrepareEventDialogProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  if (!data) return null;

  const { client, event, transactions, recommendedSteps } = data;
  const config = LIFE_EVENT_CONFIG[event.eventType];
  const IconComponent = iconMap[config?.icon] || AlertTriangle;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleEmailMe = () => {
    setEmailDialogOpen(true);
  };

  const handleDownloadPDF = async () => {
    try {
      await exportEventPreparationPDF(data);
      toast({
        title: "PDF Downloaded",
        description: `Event preparation summary for ${client.profile.name} has been saved.`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAskVentus = () => {
    if (onPrepareWithVentus && data) {
      onPrepareWithVentus(data);
      onOpenChange(false);
    } else {
      toast({
        title: "Opening Ventus Chat",
        description: "Ventus AI is ready to help you prepare for this conversation.",
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tepilot-popup max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white text-slate-900">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', `bg-${config?.color || 'slate'}-100`)}>
              <IconComponent className={cn('h-5 w-5', `text-${config?.color || 'slate'}-600`)} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">Prepare: {event.eventName}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-600">{client.profile.name}</span>
                <Badge className={cn('text-xs', getSegmentColorClasses(client.profile.segment))}>{client.profile.segment}</Badge>
                <Badge className={cn(
                  'text-xs',
                  event.confidence >= 85 ? 'bg-green-100 text-green-700' :
                  event.confidence >= 70 ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                )}>
                  {event.confidence}% confidence
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-4">
          <div className="py-3 space-y-4">
            {/* Evidence Transactions Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" />
                Detected Supporting Transactions ({transactions.length} total)
              </h3>
              <div className="space-y-0">
                {sortedTransactions.map((txn, idx) => (
                  <div key={idx} className="py-2 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{txn.merchant}</span>
                        <Badge variant="outline" className={cn("text-xs", getCardBadgeColor(txn.cardType))}>
                          {txn.cardType} ...{txn.cardLast4}
                        </Badge>
                      </div>
                      <div className="text-right text-sm">
                        <span className="font-medium">{formatAmount(txn.amount)}</span>
                        <span className="text-slate-400 ml-2">{txn.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{txn.relevance}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Ventus Insights - Left */}
              <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Ventus AI Insights
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {mockInsightsByEventType[event.eventType]}
                </p>
              </div>

              <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Ventus AI Recommended Next Steps
                </h3>
                <ol className="space-y-1.5">
                  {recommendedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-3 flex items-center gap-2">
          <Button variant="outline" onClick={handleAskVentus} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Prepare with Ventus WM Co-Pilot
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handleEmailMe} className="gap-2">
            <Mail className="h-4 w-4" />
            Email Me Summary
          </Button>
        </DialogFooter>
      </DialogContent>

      {data && (
        <EventSummaryEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          data={data}
        />
      )}
    </Dialog>
  );
}

// Shared transaction data by event type
export function getEventTransactions(eventType: DetectedLifeEvent['eventType']): CardTransaction[] {
  const transactionsByEventType: Record<DetectedLifeEvent['eventType'], CardTransaction[]> = {
    retirement: [
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Fidelity Investments', amount: 6500, date: 'Jan 15, 2026', relevance: '401k contribution increase' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'AARP Membership', amount: 16, date: 'Dec 28, 2025', relevance: 'Retirement association membership' },
      { cardType: 'Travel Elite', cardLast4: '2234', merchant: 'Viking Cruises', amount: 8500, date: 'Jan 20, 2026', relevance: 'Retirement travel planning' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1042 - Estate Planning Attorney', amount: 2500, date: 'Jan 18, 2026', relevance: 'Estate planning consultation' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Kiplinger Retirement Guide', amount: 29, date: 'Jan 8, 2026', relevance: 'Retirement planning research' },
    ],
    education: [
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'College Board', amount: 98, date: 'Jan 12, 2026', relevance: 'SAT registration fees' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Princeton Review', amount: 1299, date: 'Dec 15, 2025', relevance: 'Test prep course' },
      { cardType: 'Travel Elite', cardLast4: '2234', merchant: 'Southwest Airlines', amount: 450, date: 'Jan 18, 2026', relevance: 'Campus visit travel' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Ivy Coach Admissions', amount: 3500, date: 'Jan 5, 2026', relevance: 'College admissions consulting' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Niche.com Premium', amount: 49, date: 'Dec 20, 2025', relevance: 'College research subscription' },
    ],
    home_purchase: [
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Home Depot', amount: 2340, date: 'Feb 1, 2026', relevance: 'Home improvement supplies' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: "Lowe's", amount: 567, date: 'Feb 3, 2026', relevance: 'Renovation materials' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'U-Haul', amount: 890, date: 'Feb 5, 2026', relevance: 'Moving rental' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #3201 - Earnest Money Deposit', amount: 15000, date: 'Jan 20, 2026', relevance: 'Home purchase deposit' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Closing Costs', amount: 8500, date: 'Jan 28, 2026', relevance: 'Title and closing fees' },
    ],
    wealth_transfer: [
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Goldman Sachs Private Wealth', amount: 15000, date: 'Jan 8, 2026', relevance: 'Wealth advisory consultation' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1587 - Estate Planning Attorney', amount: 5500, date: 'Jan 18, 2026', relevance: 'Estate plan review meeting' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Sotheby\'s Appraisals', amount: 1200, date: 'Jan 20, 2026', relevance: 'Art and collectibles valuation' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Family Wealth Alliance', amount: 850, date: 'Jan 12, 2026', relevance: 'Family governance workshop' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Purposeful Planning Institute', amount: 395, date: 'Jan 15, 2026', relevance: 'Wealth transfer education seminar' },
    ],
    business_liquidity: [
      { cardType: 'Business Platinum', cardLast4: '5678', merchant: 'Merrill DataSite', amount: 2400, date: 'Jan 5, 2026', relevance: 'Virtual data room for due diligence' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #4023 - Deloitte M&A Advisory', amount: 25000, date: 'Jan 12, 2026', relevance: 'Sell-side advisory retainer' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Business Valuation Services', amount: 8500, date: 'Jan 15, 2026', relevance: 'Certified business appraisal' },
      { cardType: 'Business Platinum', cardLast4: '5678', merchant: 'IP Valuation Partners', amount: 3500, date: 'Jan 18, 2026', relevance: 'Intellectual property assessment' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #4089 - Jackson Walker LLP', amount: 7500, date: 'Jan 22, 2026', relevance: 'Transaction legal counsel' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Escrow Deposit', amount: 50000, date: 'Jan 28, 2026', relevance: 'Transaction escrow funding' },
    ],
    family_formation: [
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Amazon Baby Registry', amount: 1850, date: 'Jan 15, 2026', relevance: 'Baby registry purchases' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Buy Buy Baby', amount: 1250, date: 'Jan 22, 2026', relevance: 'Nursery essentials and furniture' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Motherhood Maternity', amount: 340, date: 'Jan 10, 2026', relevance: 'Maternity clothing purchase' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Graco Baby', amount: 450, date: 'Jan 28, 2026', relevance: 'Infant car seat and stroller' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1892 - Memorial Hospital', amount: 2500, date: 'Jan 30, 2026', relevance: 'Hospital pre-registration deposit' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'The Bump Premium', amount: 79, date: 'Dec 18, 2025', relevance: 'Pregnancy tracking app subscription' },
    ],
    elder_care: [
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Medical Guardian', amount: 350, date: 'Jan 10, 2026', relevance: 'Medical alert system subscription' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Home Depot - Mobility', amount: 890, date: 'Jan 15, 2026', relevance: 'Grab bars and accessibility modifications' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Aging Life Care Association', amount: 450, date: 'Jan 18, 2026', relevance: 'Geriatric care manager consultation' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - AARP Medicare Supplement', amount: 280, date: 'Jan 20, 2026', relevance: 'Medicare supplemental insurance premium' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #2341 - Sunrise Senior Living', amount: 12000, date: 'Jan 25, 2026', relevance: 'Assisted living community deposit' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - Home Instead Services', amount: 3200, date: 'Jan 28, 2026', relevance: 'In-home caregiver weekly payment' },
    ],
  };
  return transactionsByEventType[eventType] || [];
}

// Mock data generator for event transactions
export function generateEventPreparationData(
  client: EventPreparationData['client'],
  event: DetectedLifeEvent
): EventPreparationData {

  const recommendedStepsByEventType: Record<DetectedLifeEvent['eventType'], string[]> = {
    retirement: [
      'Open conversation about retirement vision—what does their ideal day look like?',
      'Introduce retirement income modeling using current 401k trajectory and Social Security timing',
      'Propose establishing a trust structure now while they\'re in planning mode',
      'Discuss Roth conversion strategy during remaining working years before RMDs begin',
      'Review healthcare bridge options between employer coverage and Medicare eligibility',
    ],
    education: [
      'Initiate 529 plan discussion—they\'re researching schools but haven\'t established funding',
      'Calculate projected costs for likely target schools to frame the planning conversation',
      'Review financial aid implications—discuss FAFSA timing and asset positioning strategies',
      'Explore grandparent superfunding strategy if extended family wants to contribute',
      'Model parent loan vs. student loan scenarios so they understand trade-offs early',
    ],
    home_purchase: [
      'Analyze liquid asset positioning for optimal down payment without disrupting investments',
      'Compare mortgage scenarios: 15 vs. 30-year, ARM vs. fixed, points vs. no points',
      'Model post-purchase cash flow including PITI, maintenance reserves, and reduced savings rate',
      'Discuss home equity as part of overall net worth and retirement planning',
      'Review homeowners insurance options and umbrella liability coverage needs',
    ],
    wealth_transfer: [
      'Schedule discovery meeting to understand their wealth transfer intentions and family dynamics',
      'Map current estate structure and identify gaps in beneficiary designations',
      'Introduce trust options: revocable vs. irrevocable, generation-skipping considerations',
      'Discuss charitable giving vehicles: donor-advised funds, CRTs for appreciated assets',
      'Offer to facilitate a family governance conversation before structures are formalized',
    ],
    business_liquidity: [
      'Model after-tax proceeds under different deal structures: asset vs. stock sale, earnout scenarios',
      'Develop 12-month post-close investment plan for sudden liquidity',
      'Discuss identity and purpose planning—many founders struggle after exit',
      'Review non-compete terms and implications for future entrepreneurial activity',
      'Coordinate with CPA on installment sale, QSBS exclusion, and opportunity zone deferrals',
    ],
    family_formation: [
      'Proactively introduce 529 plan options—they\'re preparing for baby but haven\'t set up education savings',
      'Benchmark life insurance needs: 10-12x income replacement plus future education costs',
      'Discuss updating wills to include guardianship designations before the birth',
      'Review disability insurance coverage—critical protection often overlooked by new parents',
      'Model childcare costs and parental leave cash flow into their financial plan',
    ],
    elder_care: [
      'Assess long-term care insurance options or Medicaid planning if coverage is lacking',
      'Review the care recipient\'s assets for Medicaid look-back period implications',
      'Discuss caregiver tax benefits: dependent care FSA, medical expense deductions',
      'Confirm power of attorney and healthcare proxy documents are in place and accessible',
      'Model scenarios for assisted living vs. in-home care cost trajectories',
    ],
  };

  return {
    client,
    event,
    transactions: getEventTransactions(event.eventType),
    recommendedSteps: recommendedStepsByEventType[event.eventType] || [],
  };
}
