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
  CreditCard, Mail, MessageSquare, CheckCircle2, Sparkles,
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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
  retirement: "Based on recent transaction patterns, this client appears to be actively preparing for retirement. Increased contributions to investment accounts and retirement planning services suggest a deliberate transition strategy. Travel bookings for leisure destinations and AARP membership indicate lifestyle planning. Estate planning activity shows comprehensive wealth preservation awareness.",
  education: "This client is entering a significant education funding phase. SAT preparation and college application fees indicate a child approaching higher education. Campus visit travel and early tuition deposits suggest proactive planning. The pattern shows a family prioritizing educational investment with 529 plan activity supporting long-term savings goals.",
  home_purchase: "Transaction patterns reveal active home purchasing behavior. Home improvement store purchases and moving services indicate imminent relocation. Earnest money deposits and closing cost payments confirm a property transaction in progress. This represents a major liquidity event with implications for cash flow and asset allocation.",
  wealth_transfer: "This client is engaging in deliberate wealth transfer planning. Legal service payments for estate documentation and trust setup indicate formal succession planning. The pattern suggests intergenerational wealth considerations and potential tax optimization strategies.",
  business_liquidity: "Business sale indicators are present in recent transactions. M&A advisory fees and business valuation services suggest active deal exploration. Escrow deposits indicate transaction momentum. This represents a significant liquidity event requiring comprehensive investment and tax planning.",
  family_formation: "Transaction patterns indicate family expansion. Baby product purchases and nursery preparation spending suggest an expected addition. Education savings account setup shows forward-thinking financial planning. Life insurance and beneficiary updates would be timely considerations.",
  elder_care: "Increased healthcare and care facility transactions suggest elder care responsibilities. Pharmacy spending patterns and senior living deposits indicate active caregiving. Long-term care planning and Medicaid considerations may be relevant topics for discussion.",
};

export function PrepareEventDialog({ open, onOpenChange, data, onPrepareWithVentus }: PrepareEventDialogProps) {

  if (!data) return null;

  const { client, event, transactions, recommendedSteps } = data;
  const config = LIFE_EVENT_CONFIG[event.eventType];
  const IconComponent = iconMap[config?.icon] || AlertTriangle;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleEmailMe = () => {
    toast({
      title: "Summary sent!",
      description: `Event preparation summary for ${client.profile.name} has been sent to your email.`,
    });
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
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col bg-white text-slate-900">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', `bg-${config?.color || 'slate'}-100`)}>
              <IconComponent className={cn('h-5 w-5', `text-${config?.color || 'slate'}-600`)} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">Prepare: {event.eventName}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-600">{client.profile.name}</span>
                <Badge variant="secondary" className="text-xs">{client.profile.segment}</Badge>
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

        <ScrollArea className="flex-1 pr-4">
          <div className="py-4 space-y-6">
            {/* Evidence Transactions Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
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

            {/* Two-column layout for Insights and Steps */}
            <div className="grid grid-cols-2 gap-6">
              {/* Ventus Insights - Left */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Ventus Insights
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {mockInsightsByEventType[event.eventType]}
                </p>
              </div>

              {/* Recommended Next Steps - Right */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Recommended Next Steps
                </h3>
                <ol className="space-y-2">
                  {recommendedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4 flex items-center gap-2">
          <Button variant="outline" onClick={handleAskVentus} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Prepare with Ventus WM Co-Pilot
          </Button>
          <Button onClick={handleEmailMe} className="gap-2">
            <Mail className="h-4 w-4" />
            Email Me Summary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Mock data generator for event transactions
export function generateEventPreparationData(
  client: EventPreparationData['client'],
  event: DetectedLifeEvent
): EventPreparationData {
  const transactionsByEventType: Record<DetectedLifeEvent['eventType'], CardTransaction[]> = {
    retirement: [
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Fidelity Investments', amount: 6500, date: 'Jan 15, 2026', relevance: '401k contribution increase' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'AARP Membership', amount: 16, date: 'Dec 28, 2025', relevance: 'Retirement association membership' },
      { cardType: 'Travel Elite', cardLast4: '2234', merchant: 'Viking Cruises', amount: 8500, date: 'Jan 20, 2026', relevance: 'Retirement travel planning' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1042 - Estate Planning Attorney', amount: 2500, date: 'Jan 18, 2026', relevance: 'Estate planning legal fees' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Trust Account Setup', amount: 5000, date: 'Jan 12, 2026', relevance: 'Trust account funding' },
    ],
    education: [
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'College Board', amount: 98, date: 'Jan 12, 2026', relevance: 'SAT registration fees' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Princeton Review', amount: 1299, date: 'Dec 15, 2025', relevance: 'Test prep course' },
      { cardType: 'Travel Elite', cardLast4: '2234', merchant: 'Southwest Airlines', amount: 450, date: 'Jan 18, 2026', relevance: 'Campus visit travel' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #2156 - University of Michigan', amount: 5000, date: 'Jan 8, 2026', relevance: 'Tuition deposit' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - 529 Plan Contribution', amount: 2500, date: 'Jan 5, 2026', relevance: 'Education savings transfer' },
    ],
    home_purchase: [
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Home Depot', amount: 2340, date: 'Feb 1, 2026', relevance: 'Home improvement supplies' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: "Lowe's", amount: 567, date: 'Feb 3, 2026', relevance: 'Renovation materials' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'U-Haul', amount: 890, date: 'Feb 5, 2026', relevance: 'Moving rental' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #3201 - Earnest Money Deposit', amount: 15000, date: 'Jan 20, 2026', relevance: 'Home purchase deposit' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Closing Costs', amount: 8500, date: 'Jan 28, 2026', relevance: 'Title and closing fees' },
    ],
    wealth_transfer: [
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Goldman Sachs Private Wealth', amount: 15000, date: 'Jan 8, 2026', relevance: 'Wealth advisory retainer' },
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Northern Trust', amount: 2500, date: 'Jan 12, 2026', relevance: 'Trust administration setup' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1587 - Estate Planning Attorney', amount: 5500, date: 'Jan 18, 2026', relevance: 'Comprehensive estate plan drafting' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Sotheby\'s Appraisals', amount: 1200, date: 'Jan 20, 2026', relevance: 'Art and collectibles valuation' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - Community Foundation', amount: 10000, date: 'Jan 25, 2026', relevance: 'Donor-advised fund contribution' },
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
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - 529 Plan Setup', amount: 1000, date: 'Feb 1, 2026', relevance: 'Education savings account opened' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1892 - Memorial Hospital', amount: 2500, date: 'Jan 30, 2026', relevance: 'Hospital pre-registration deposit' },
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

  const recommendedStepsByEventType: Record<DetectedLifeEvent['eventType'], string[]> = {
    retirement: [
      'Review current retirement account balances and projections',
      'Discuss Social Security timing optimization strategies',
      'Propose Roth conversion ladder before retirement date',
      'Schedule healthcare coverage transition planning',
      'Review estate planning documents for updates',
    ],
    education: [
      'Review 529 plan balance and contribution strategy',
      'Discuss financial aid implications of asset allocation',
      'Evaluate student loan vs. cash payment scenarios',
      'Consider grandparent 529 contributions for tax benefits',
      'Schedule meeting to discuss post-education investment strategy',
    ],
    home_purchase: [
      'Review liquid assets available for down payment',
      'Discuss mortgage rate lock timing strategies',
      'Evaluate impact on overall asset allocation',
      'Review home equity line of credit options',
      'Plan for increased monthly expenses post-purchase',
    ],
    wealth_transfer: [
      'Review current estate plan and beneficiary designations',
      'Discuss annual gift tax exclusion utilization',
      'Evaluate trust structures for tax efficiency',
      'Consider charitable giving strategies',
      'Schedule family meeting to discuss wealth transfer intentions',
    ],
    business_liquidity: [
      'Review business valuation and market conditions',
      'Discuss tax-efficient sale structures',
      'Plan for proceeds reinvestment strategy',
      'Evaluate installment sale vs. lump sum options',
      'Consider wealth preservation strategies post-sale',
    ],
    family_formation: [
      'Review life insurance coverage adequacy',
      'Discuss education savings account setup',
      'Update beneficiary designations across accounts',
      'Evaluate disability insurance coverage',
      'Plan for increased emergency fund needs',
    ],
    elder_care: [
      'Review long-term care insurance coverage',
      'Discuss Medicaid planning strategies if applicable',
      'Evaluate caregiver tax benefits and deductions',
      'Review power of attorney and healthcare proxy documents',
      'Plan for potential real estate disposition needs',
    ],
  };

  return {
    client,
    event,
    transactions: transactionsByEventType[event.eventType] || [],
    recommendedSteps: recommendedStepsByEventType[event.eventType] || [],
  };
}
