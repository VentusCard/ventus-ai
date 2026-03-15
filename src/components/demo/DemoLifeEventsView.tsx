import type { DemoCustomer } from "@/lib/demoData";
import type { DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import { CreditCard, Sparkles, CheckCircle2, MessageSquare, Download, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  detectedEventA: DetectedLifeEventResult[];
  detectedEventB: DetectedLifeEventResult[];
}

export default function DemoLifeEventsView({ customerA, customerB, detectedEventA, detectedEventB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <CustomerEventsColumn events={detectedEventA} customer={customerA} />
      <CustomerEventsColumn events={detectedEventB} customer={customerB} />
    </div>
  );
}

function CustomerEventsColumn({ events, customer }: { events: DetectedLifeEventResult[]; customer: DemoCustomer }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 flex items-center justify-center">
        <p className="text-sm text-slate-400">No life event detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, idx) => (
        <LifeEventCard key={idx} event={event} customer={customer} />
      ))}
    </div>
  );
}

function LifeEventCard({ event, customer }: { event: DetectedLifeEventResult; customer: DemoCustomer }) {
  const sortedEvidence = [...event.evidence].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const talkingPoints = event.talking_points ?? [];

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
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
      </div>

      {/* Supporting Transactions */}
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

      {/* AI Talking Points as Insights + Next Steps */}
      {talkingPoints.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-1 gap-3">
          {/* Ventus AI Insights — first talking point as narrative */}
          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Ventus AI Insights
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">{talkingPoints[0]}</p>
          </div>

          {/* Recommended Next Steps — remaining talking points */}
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

      {/* Action Buttons */}
      <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[11px] h-8"
          onClick={() => toast.success("Opening Ventus WM Co-Pilot...", { description: "AI context pre-loaded with event details" })}
        >
          <MessageSquare className="h-3 w-3" />
          Prepare with Ventus
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[11px] h-8"
          onClick={() => toast.success("PDF downloaded", { description: `Event preparation summary for ${customer.profile.name}` })}
        >
          <Download className="h-3 w-3" />
          Download PDF
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-[11px] h-8"
          onClick={() => toast.success("Email sent", { description: `Summary emailed for ${event.event_name}` })}
        >
          <Mail className="h-3 w-3" />
          Email Me Summary
        </Button>
      </div>
    </div>
  );
}
