import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DemoCustomer } from "@/lib/demoData";
import type { DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import { CreditCard, Sparkles, CheckCircle2, MessageSquare, Download, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportEventPreparationPDF } from "@/lib/eventPreparationPdfExport";
import { EventSummaryEmailDialog } from "@/components/tepilot/advisor-console/EventSummaryEmailDialog";
import type { EventPreparationData, DetectedLifeEvent, DashboardClient, CardTransaction } from "@/types/dashboardClient";

interface Props {
  customer: DemoCustomer;
  detectedEvents: DetectedLifeEventResult[];
}

const EVENT_NAME_TO_TYPE: Record<string, DetectedLifeEvent['eventType']> = {
  "retirement planning": "retirement",
  "retirement": "retirement",
  "education funding": "education",
  "education": "education",
  "college planning": "education",
  "home purchase": "home_purchase",
  "home buying": "home_purchase",
  "wealth transfer": "wealth_transfer",
  "estate planning": "wealth_transfer",
  "business liquidity": "business_liquidity",
  "business exit": "business_liquidity",
  "family formation": "family_formation",
  "new baby": "family_formation",
  "elder care": "elder_care",
  "eldercare": "elder_care",
};

function deriveEventType(eventName: string): DetectedLifeEvent['eventType'] {
  const lower = eventName.toLowerCase();
  for (const [key, type] of Object.entries(EVENT_NAME_TO_TYPE)) {
    if (lower.includes(key)) return type;
  }
  return "retirement";
}

function buildEventPreparationData(
  customer: DemoCustomer,
  event: DetectedLifeEventResult
): EventPreparationData {
  const eventType = deriveEventType(event.event_name);

  const detectedEvent: DetectedLifeEvent = {
    eventType,
    eventName: event.event_name,
    confidence: event.confidence,
    estimatedTiming: "Next 6-12 months",
    keyEvidence: event.evidence.map(e => `${e.merchant}: ${e.relevance}`),
    urgencyScore: event.confidence >= 85 ? 4 : event.confidence >= 70 ? 3 : 2,
  };

  const transactions: CardTransaction[] = event.evidence.map(e => ({
    cardType: "Premium Card",
    cardLast4: "4821",
    merchant: e.merchant,
    amount: e.amount,
    date: e.date,
    relevance: e.relevance,
  }));

  const dashboardClient: DashboardClient = {
    id: customer.id,
    profile: customer.profile,
    detectedEvents: [detectedEvent],
    lastContactDate: new Date(),
    engagementStatus: "active",
  };

  return {
    client: dashboardClient,
    event: detectedEvent,
    transactions,
    recommendedSteps: event.talking_points.slice(1),
  };
}

export default function DemoLifeEventsView({ customer, detectedEvents }: Props) {
  const navigate = useNavigate();

  if (!detectedEvents || detectedEvents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 flex items-center justify-center">
        <p className="text-sm text-slate-400">No life event detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {detectedEvents.map((event, idx) => (
        <LifeEventCard key={idx} event={event} customer={customer} navigate={navigate} />
      ))}
    </div>
  );
}

function LifeEventCard({ event, customer, navigate }: {
  event: DetectedLifeEventResult;
  customer: DemoCustomer;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailDialogData, setEmailDialogData] = useState<EventPreparationData | null>(null);

  const sortedEvidence = [...event.evidence].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const talkingPoints = event.talking_points ?? [];

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const handleDownloadPDF = () => {
    const data = buildEventPreparationData(customer, event);
    exportEventPreparationPDF(data);
    toast.success("PDF downloaded", { description: `Event preparation summary for ${customer.profile.name}` });
  };

  const handleEmailSummary = () => {
    const data = buildEventPreparationData(customer, event);
    setEmailDialogData(data);
    setEmailDialogOpen(true);
  };

  const handlePrepareWithVentus = () => {
    sessionStorage.setItem("tepilot_client_profile", JSON.stringify(customer.profile));
    sessionStorage.setItem("tepilot_detected_events", JSON.stringify(
      [buildEventPreparationData(customer, event).event]
    ));

    navigate("/tepilot/advisor-console", {
      state: {
        initialView: "client" as const,
        demoCustomerA: customer,
        demoCustomerB: null,
        activeCustomerId: customer.id,
      },
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-sm font-bold text-slate-900">{event.event_name}</h4>
          <Badge
            className={`text-[10px] ${
              event.confidence >= 85
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : event.confidence >= 70
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
            variant="outline"
          >
            {event.confidence}% confidence
          </Badge>
        </div>
        <p className="text-[10px] text-slate-400">
          {customer.profile.name} · {customer.profile.segment}
        </p>
        {customer.profile.demographics && (
          <p className="text-[10px] text-slate-400">
            Age {customer.profile.demographics.age} · {customer.profile.demographics.occupation} · {customer.profile.demographics.familyStatus}
          </p>
        )}
      </div>

      <div className="px-5 py-3 border-b border-slate-100">
        <h5 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
          Supporting Transactions ({sortedEvidence.length})
        </h5>
        <div className="space-y-0">
          {sortedEvidence.map((txn, idx) => (
            <div key={idx} className="py-1.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">{txn.merchant}</span>
                <div className="text-right text-xs">
                  <span className="font-medium text-slate-900">{formatAmount(txn.amount)}</span>
                  <span className="text-slate-400 ml-1.5">{txn.date}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{txn.relevance}</p>
            </div>
          ))}
        </div>
      </div>

      {talkingPoints.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-1 gap-3">
          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Ventus AI Insights
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">{talkingPoints[0]}</p>
          </div>

          {talkingPoints.length > 1 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Recommended Next Steps
              </h5>
              <ol className="space-y-1">
                {talkingPoints.slice(1).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 text-blue-600 text-[9px] font-semibold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-600">{point}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[11px] h-8"
          onClick={handlePrepareWithVentus}
        >
          <MessageSquare className="h-3 w-3" />
          Prepare with Ventus
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[11px] h-8"
          onClick={handleDownloadPDF}
        >
          <Download className="h-3 w-3" />
          Download PDF
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-[11px] h-8"
          onClick={handleEmailSummary}
        >
          <Mail className="h-3 w-3" />
          Email Me Summary
        </Button>
      </div>

      {emailDialogData && (
        <EventSummaryEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          data={emailDialogData}
        />
      )}
    </div>
  );
}
