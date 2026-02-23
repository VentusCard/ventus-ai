import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Landmark, CreditCard, Home, TrendingUp, Plane, Users, Heart, UtensilsCrossed, Activity, AlertCircle, ShoppingBag, Sparkles, MessageSquare, RefreshCw, DollarSign } from "lucide-react";
import { AdvisorContext } from "@/lib/advisorContextBuilder";
import { cn } from "@/lib/utils";
import { AIInsights, LifeEvent } from "@/types/lifestyle-signals";
import { formatCurrency } from "@/lib/formatHelper";
import { ClientProfileData } from "@/types/clientProfile";
import { getSegmentColorClasses } from "@/lib/segmentColors";
import { LifeEventDetailsDialog } from "./LifeEventDetailsDialog";
import { DetectedLifeEvent } from "@/types/dashboardClient";
import { getEventTransactions } from "./PrepareEventDialog";

interface ClientSnapshotPanelProps {
  onAskVentus?: (context: string) => void;
  onPlanEvent?: (event: LifeEvent) => void;
  advisorContext?: AdvisorContext;
  aiInsights?: AIInsights | null;
  isLoadingInsights?: boolean;
  clientData?: ClientProfileData | null;
  onGenerateProfile?: () => void;
  dashboardEvents?: DetectedLifeEvent[] | null;
}

const pillarIconMap: Record<string, any> = {
  "Travel": Plane,
  "Dining": UtensilsCrossed,
  "Health & Wellness": Activity,
  "Shopping": ShoppingBag,
  "Entertainment": Activity,
  "Family": Users,
  "Philanthropy": Heart,
  "Home": Home,
  "Transportation": TrendingUp,
};

const placeholderClientData: ClientProfileData = {
  name: "Firstname Lastname",
  segment: "Preferred",
  aum: "$X,XXX,XXX",
  tenure: "X.X years",
  contact: {
    email: "email@example.com",
    phone: "(XXX) XXX-XXXX",
    address: "City, State ZIP"
  },
  demographics: {
    age: "XX",
    occupation: "Occupation Title",
    familyStatus: "Family Status",
    incomeLevel: "$XXX,XXX",
    industry: "Industry"
  },
  holdings: {
    deposit: "$XXX,XXX",
    credit: "$XX,XXX",
    mortgage: "$XXX,XXX",
    investments: "$X,XXX,XXX"
  },
  compliance: {
    kycStatus: "Current",
    lastReview: "Month DD, YYYY",
    nextReview: "Month DD, YYYY",
    riskProfile: "Moderate"
  },
  milestones: [
    { event: "Milestone Event", date: "Month YYYY" },
    { event: "Milestone Event", date: "Month YYYY" },
    { event: "Milestone Event", date: "Month YYYY" },
  ]
};

export function ClientSnapshotPanel({
  onAskVentus,
  onPlanEvent,
  advisorContext,
  aiInsights,
  isLoadingInsights = false,
  clientData,
  onGenerateProfile,
  dashboardEvents
}: ClientSnapshotPanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  // Use clientData if provided, otherwise use placeholder
  const displayData = clientData || placeholderClientData;

  // Derive lifestyle signals from advisorContext
  const lifestyleSignals = advisorContext?.topPillars?.slice(0, 5).map(pillar => ({
    category: pillar.pillar,
    spend: pillar.totalSpend,
    transactions: pillar.transactionCount,
    icon: pillarIconMap[pillar.pillar] || Activity
  })) || [];

  // Prioritize dashboard events if available, otherwise use AI insights
  const lifeEvents: LifeEvent[] = dashboardEvents?.length 
    ? dashboardEvents.map(e => {
        // Use rich transaction data from the event preparation mock data
        const richTransactions = getEventTransactions(e.eventType);
        return {
          event_name: e.eventName,
          confidence: e.confidence,
          evidence: richTransactions.length > 0
            ? richTransactions.map(t => ({ 
                merchant: t.merchant, 
                amount: t.amount, 
                date: t.date, 
                relevance: t.relevance 
              }))
            : e.keyEvidence.map(k => ({ merchant: "", amount: 0, date: "", relevance: k })),
          talking_points: []
        };
      })
    : (aiInsights?.detected_events || []);

  // Calculate overview stats
  const hasRealData = advisorContext && advisorContext.overview.totalTransactions > 0;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 advisor-console-panel">
        {/* Client Header Card - Always Visible */}
        <Card className="bg-white">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    {displayData.name}
                  </h2>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={onGenerateProfile}
                    className="text-xs h-6 px-3"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    New Client
                  </Button>
                </div>
                <Badge className={cn('mt-1', getSegmentColorClasses(displayData.segment))}>
                  {displayData.segment}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <div className="text-slate-600">AUM</div>
                <div className="font-semibold text-slate-900">
                  {displayData.aum}
                </div>
              </div>
              <div>
                <div className="text-slate-600">Tenure</div>
                <div className="font-semibold text-slate-900">
                  {displayData.tenure}
                </div>
              </div>
            </div>

            <div className="text-xs space-y-1 pt-3 border-t">
              <div className="text-slate-600">Contact</div>
              <div className="text-slate-900">{displayData.contact.email}</div>
              <div className="text-slate-900">{displayData.contact.phone}</div>
              <div className="text-slate-900">{displayData.contact.address}</div>
            </div>

            <div className="text-xs space-y-1 pt-3 border-t mt-3">
              <div className="text-slate-600">Demographics</div>
              <div className="text-slate-900">Age: {displayData.demographics.age}</div>
              <div className="text-slate-900">{displayData.demographics.occupation}</div>
              <div className="text-slate-900">{displayData.demographics.familyStatus}</div>
            </div>
          </div>
        </Card>

        {/* Accordion Sections - All Collapsed by Default */}
        <Accordion type="multiple" className="space-y-2">
          {/* Spending Overview - Uses real data when available, falls back to mock */}
          {(() => {
            const useRealData = lifestyleSignals.length > 0;
            const spendingItems = useRealData
              ? lifestyleSignals.map((signal, i) => {
                  const seed = signal.category.length + i;
                  const multiplier = 1.1 + ((seed % 20) / 100);
                  const budget = Math.round(signal.spend * multiplier);
                  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];
                  return { category: signal.category, monthlySpend: signal.spend, monthlyBudget: budget, color: colors[i % colors.length] };
                })
              : (displayData.spendingOverview || []);

            if (spendingItems.length === 0) return null;

            const totalSpend = spendingItems.reduce((s, c) => s + c.monthlySpend, 0);
            const totalBudget = spendingItems.reduce((s, c) => s + c.monthlyBudget, 0);
            const overallRatio = totalBudget > 0 ? totalSpend / totalBudget : 0;
            const overallStatus = overallRatio > 1 ? 'over' : overallRatio >= 0.85 ? 'near' : 'under';
            const statusColors = { over: 'bg-red-100 text-red-700 border-red-200', near: 'bg-yellow-100 text-yellow-700 border-yellow-200', under: 'bg-green-100 text-green-700 border-green-200' };
            const statusLabels = { over: 'Over Budget', near: 'Near Limit', under: 'On Track' };
            return (
              <AccordionItem value="spending" className="bg-white rounded-lg border">
                <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Spending Overview</span>
                    {useRealData && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">Live</Badge>}
                    <Badge variant="outline" className={`ml-auto text-xs ${statusColors[overallStatus]}`}>
                      {statusLabels[overallStatus]}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between py-2 border-b mb-2">
                      <span className="text-xs font-semibold text-slate-700">Monthly Total</span>
                      <span className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">{formatCurrency(totalSpend)}</span>
                        {' / '}{formatCurrency(totalBudget)}
                      </span>
                    </div>
                    {spendingItems.map((cat, idx) => {
                      const ratio = cat.monthlyBudget > 0 ? cat.monthlySpend / cat.monthlyBudget : 0;
                      const barPct = Math.min(ratio * 100, 100);
                      const barColor = ratio > 1 ? '#ef4444' : ratio >= 0.85 ? '#f59e0b' : '#22c55e';
                      return (
                        <div
                          key={idx}
                          className={cn("py-1.5", useRealData && "cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded")}
                          onClick={useRealData ? () => onAskVentus?.(`Analyze ${cat.category} spending patterns in detail`) : undefined}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-slate-700">{cat.category}</span>
                            </div>
                            <span className="text-slate-500">
                              <span className="font-medium text-slate-800">{formatCurrency(cat.monthlySpend)}</span>
                              {' / '}{formatCurrency(cat.monthlyBudget)}
                              {ratio > 1 && <span className="text-red-500 ml-1 font-medium">+{Math.round((ratio - 1) * 100)}%</span>}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })()}

          {/* Detected Life Events - Moved to second position */}
          <AccordionItem value="events" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 text-blue-600 ${isLoadingInsights ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-semibold text-blue-900">Detected Life Events</span>
                {isLoadingInsights ? (
                  <Badge variant="secondary" className="ml-auto text-xs animate-pulse bg-blue-50 text-blue-700 border-blue-200">
                    Analyzing...
                  </Badge>
                ) : lifeEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">{lifeEvents.length}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="space-y-3">
                {isLoadingInsights ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="border-l-2 border-primary/30 pl-3 animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      >
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-primary pt-2">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>Analyzing lifestyle signals...</span>
                    </div>
                  </div>
                ) : lifeEvents.length > 0 ? lifeEvents.map((event, idx) => (
                  <div 
                    key={idx} 
                    className="text-xs border-l-2 border-primary pl-3 cursor-pointer hover:bg-slate-50 -ml-3 pl-6 py-1 rounded-r animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      {event.event_name}
                      <Badge variant="outline" className={`text-xs ${
                        event.confidence >= 80 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : event.confidence >= 60 
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                            : 'bg-orange-100 text-orange-700 border-orange-200'
                      }`}>{event.confidence}%</Badge>
                    </div>
                    <div className="text-slate-500 mt-1">{event.evidence.length} supporting transactions</div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 py-2">No life events detected yet</p>
                )}
                {!isLoadingInsights && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-primary hover:text-primary/80 mt-2"
                    onClick={() => {
                      const existingEvents = lifeEvents.map(e => e.event_name).join(", ");
                      const prompt = existingEvents 
                        ? `I've already detected these life events: ${existingEvents}. What OTHER signals might I be missing? Look for subtle patterns, spending anomalies, or lifestyle changes NOT already listed. Do not repeat any of the events I mentioned.`
                        : `Based on this client's transaction patterns, what life events or lifestyle signals might I be missing? Look for subtle patterns that could indicate upcoming needs.`;
                      onAskVentus?.(prompt);
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Explore other possible signals
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Holdings Overview */}
          <AccordionItem value="holdings" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Holdings Overview</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center text-slate-600">
                    <Landmark className="w-3 h-3 mr-2" />
                    Deposits
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {displayData.holdings.deposit}
                    </span>
                    {displayData.holdingsChange?.deposit && (
                      <Badge 
                        variant="outline" 
                        className={displayData.holdingsChange.deposit.direction === 'up' 
                          ? 'text-green-600 border-green-200 bg-green-50 text-[10px] px-1.5' 
                          : 'text-red-600 border-red-200 bg-red-50 text-[10px] px-1.5'
                        }
                      >
                        {displayData.holdingsChange.deposit.direction === 'up' ? '↑' : '↓'}
                        {displayData.holdingsChange.deposit.percent}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center text-slate-600">
                    <CreditCard className="w-3 h-3 mr-2" />
                    Credit
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {displayData.holdings.credit}
                    </span>
                    {displayData.holdingsChange?.credit && (
                      <Badge 
                        variant="outline" 
                        className={displayData.holdingsChange.credit.direction === 'down' 
                          ? 'text-green-600 border-green-200 bg-green-50 text-[10px] px-1.5' 
                          : 'text-red-600 border-red-200 bg-red-50 text-[10px] px-1.5'
                        }
                      >
                        {displayData.holdingsChange.credit.direction === 'up' ? '↑' : '↓'}
                        {displayData.holdingsChange.credit.percent}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center text-slate-600">
                    <Home className="w-3 h-3 mr-2" />
                    Mortgage
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {displayData.holdings.mortgage}
                    </span>
                    {displayData.holdingsChange?.mortgage && (
                      <Badge 
                        variant="outline" 
                        className="text-green-600 border-green-200 bg-green-50 text-[10px] px-1.5"
                      >
                        ↓{displayData.holdingsChange.mortgage.percent}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-slate-600">
                    <TrendingUp className="w-3 h-3 mr-2" />
                    Investments
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {displayData.holdings.investments}
                    </span>
                    {displayData.holdingsChange?.investments && (
                      <Badge 
                        variant="outline" 
                        className={displayData.holdingsChange.investments.direction === 'up' 
                          ? 'text-green-600 border-green-200 bg-green-50 text-[10px] px-1.5' 
                          : 'text-red-600 border-red-200 bg-red-50 text-[10px] px-1.5'
                        }
                      >
                        {displayData.holdingsChange.investments.direction === 'up' ? '↑' : '↓'}
                        {displayData.holdingsChange.investments.percent}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Compliance & Risk */}
          <AccordionItem value="compliance" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Compliance & Risk</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">KYC Status</span>
                  <Badge variant="outline">{displayData.compliance.kycStatus}</Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Last Review</span>
                  <span className="text-slate-700">{displayData.compliance.lastReview}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Next Review</span>
                  <span className="text-slate-700">{displayData.compliance.nextReview}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Risk Profile</span>
                  <span className="text-slate-700">{displayData.compliance.riskProfile}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Relationship Milestones */}
          <AccordionItem value="milestones" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Relationship Milestones</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="space-y-3">
                {displayData.milestones.map((milestone, idx) => (
                  <div key={idx} className="text-xs border-l-2 border-primary pl-3">
                    <div className="font-semibold text-slate-700">{milestone.event}</div>
                    <div className="text-slate-500 mt-1">{milestone.date}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Helper Text at Bottom - Always Visible */}
        <Card className="bg-blue-50 border-blue-200">
          
        </Card>
      </div>

      {/* Life Event Details Dialog */}
      <LifeEventDetailsDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onAskVentus={onAskVentus}
        onPlanEvent={onPlanEvent}
      />
    </div>
  );
}
