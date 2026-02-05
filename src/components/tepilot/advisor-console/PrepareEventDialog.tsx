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
  CreditCard, Mail, MessageSquare, CheckCircle2,
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
                Evidence Transactions ({transactions.length} total)
              </h3>
              <div className="space-y-0">
                {sortedTransactions.map((txn, idx) => (
                  <div key={idx} className="py-2 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{txn.merchant}</span>
                        <Badge variant="outline" className="text-xs">{txn.cardType} ...{txn.cardLast4}</Badge>
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

            {/* Recommended Next Steps Section */}
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
      { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Trust & Will', amount: 199, date: 'Jan 15, 2026', relevance: 'Online estate planning' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'LegalZoom', amount: 299, date: 'Dec 30, 2025', relevance: 'Trust documentation' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1587 - Estate Planning Attorney', amount: 3500, date: 'Jan 20, 2026', relevance: 'Legal consultation fees' },
    ],
    business_liquidity: [
      { cardType: 'Business Platinum', cardLast4: '5678', merchant: 'BizBuySell Premium', amount: 299, date: 'Jan 10, 2026', relevance: 'Business listing service' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #4023 - M&A Advisory LLC', amount: 10000, date: 'Jan 22, 2026', relevance: 'Business valuation fees' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Escrow Deposit', amount: 25000, date: 'Jan 18, 2026', relevance: 'Transaction escrow funding' },
    ],
    family_formation: [
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Buy Buy Baby', amount: 1250, date: 'Feb 2, 2026', relevance: 'Baby supplies purchase' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Pottery Barn Kids', amount: 890, date: 'Jan 28, 2026', relevance: 'Nursery furniture' },
      { cardType: 'Travel Elite', cardLast4: '2234', merchant: 'Delta Airlines', amount: 650, date: 'Jan 20, 2026', relevance: 'Family visit travel' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - 529 Plan Setup', amount: 1000, date: 'Jan 25, 2026', relevance: 'Education savings account setup' },
    ],
    elder_care: [
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'CVS Pharmacy', amount: 380, date: 'Feb 1, 2026', relevance: 'Medical supplies increase' },
      { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'A Place for Mom', amount: 0, date: 'Jan 25, 2026', relevance: 'Care placement service' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #2341 - Sunrise Senior Living', amount: 8500, date: 'Jan 30, 2026', relevance: 'Care facility deposit' },
      { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - Home Instead Services', amount: 2400, date: 'Jan 28, 2026', relevance: 'In-home care service payment' },
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
