import type { DemoCustomer } from "@/lib/demoData";
import type { DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import { CreditCard, Sparkles, CheckCircle2, MessageSquare, Download, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DetectedLifeEvent } from "@/types/dashboardClient";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  detectedEventA: DetectedLifeEventResult | null;
  detectedEventB: DetectedLifeEventResult | null;
}

// Map free-text event names to known event types for insights/steps lookup
function mapEventNameToType(name: string): DetectedLifeEvent["eventType"] {
  const lower = name.toLowerCase();
  if (/retirement|401k|pension|social security|rmd/.test(lower)) return "retirement";
  if (/college|education|school|university|tuition|529|sat|campus/.test(lower)) return "education";
  if (/home|house|mortgage|closing|move-in|down payment/.test(lower)) return "home_purchase";
  if (/baby|family|child|nursery|maternity|pregnan|newborn/.test(lower)) return "family_formation";
  if (/elder|aging|senior|caregiver|assisted living|medicare/.test(lower)) return "elder_care";
  if (/business|exit|liquidity|m&a|acquisition|ipo/.test(lower)) return "business_liquidity";
  if (/estate|wealth transfer|trust|inheritance|legacy/.test(lower)) return "wealth_transfer";
  if (/wedding|engagement|bridal/.test(lower)) return "family_formation";
  return "retirement";
}

const INSIGHTS_BY_TYPE: Record<string, string> = {
  retirement: "This client is in the early exploration phase of retirement planning—a critical window for proactive engagement. Increased contributions and lifestyle research signal they're mentally preparing for this transition. This is your opportunity to guide them on income strategies, Roth conversions, and trust structures before they go elsewhere.",
  education: "This parent is deep in the college planning research phase—the ideal moment for advisor involvement. Test prep, campus visits, and admissions consulting indicate serious commitment. This is your window to introduce 529 optimization, financial aid positioning, and funding comparisons before uninformed decisions are made.",
  home_purchase: "This client is in active home acquisition mode. Earnest money deposits, closing costs, and moving preparations confirm an imminent transaction. Expect questions about mortgage optimization, down payment sourcing, and how this purchase fits their broader wealth picture.",
  wealth_transfer: "A sophisticated wealth holder beginning to think intergenerationally. Private wealth engagement and estate planning consultations indicate they're educating themselves on governance and transfer strategies—the perfect time to position yourself as their trusted guide.",
  business_liquidity: "An entrepreneur approaching a transformational exit. Data room subscriptions, advisory retainers, and IP valuations indicate a structured M&A process. This client needs holistic guidance on life after exit—investment of proceeds, tax minimization, and finding purpose post-business.",
  family_formation: "A growing family preparing for a new arrival—a pivotal moment for relationship deepening. They haven't yet established education savings or updated estate documents—your opportunity to proactively introduce 529 plans, life insurance benchmarking, and guardianship planning.",
  elder_care: "This client is stepping into a caregiver role. Medical alert systems, accessibility modifications, and assisted living deposits suggest active care management. Approach with empathy while addressing Medicaid planning, long-term care costs, and potential real estate decisions.",
};

const STEPS_BY_TYPE: Record<string, string[]> = {
  retirement: [
    "Open conversation about retirement vision—what does their ideal day look like?",
    "Introduce retirement income modeling using current 401k trajectory and Social Security timing",
    "Propose establishing a trust structure now while they're in planning mode",
    "Discuss Roth conversion strategy during remaining working years before RMDs begin",
    "Review healthcare bridge options between employer coverage and Medicare eligibility",
  ],
  education: [
    "Initiate 529 plan discussion—they're researching schools but haven't established funding",
    "Calculate projected costs for likely target schools to frame the planning conversation",
    "Review financial aid implications—discuss FAFSA timing and asset positioning strategies",
    "Explore grandparent superfunding strategy if extended family wants to contribute",
    "Model parent loan vs. student loan scenarios so they understand trade-offs early",
  ],
  home_purchase: [
    "Analyze liquid asset positioning for optimal down payment without disrupting investments",
    "Compare mortgage scenarios: 15 vs. 30-year, ARM vs. fixed, points vs. no points",
    "Model post-purchase cash flow including PITI, maintenance reserves, and reduced savings rate",
    "Discuss home equity as part of overall net worth and retirement planning",
    "Review homeowners insurance options and umbrella liability coverage needs",
  ],
  wealth_transfer: [
    "Schedule discovery meeting to understand wealth transfer intentions and family dynamics",
    "Map current estate structure and identify gaps in beneficiary designations",
    "Introduce trust options: revocable vs. irrevocable, generation-skipping considerations",
    "Discuss charitable giving vehicles: donor-advised funds, CRTs for appreciated assets",
    "Offer to facilitate a family governance conversation before structures are formalized",
  ],
  business_liquidity: [
    "Model after-tax proceeds under different deal structures: asset vs. stock sale, earnout scenarios",
    "Develop 12-month post-close investment plan for sudden liquidity",
    "Discuss identity and purpose planning—many founders struggle after exit",
    "Review non-compete terms and implications for future entrepreneurial activity",
    "Coordinate with CPA on installment sale, QSBS exclusion, and opportunity zone deferrals",
  ],
  family_formation: [
    "Proactively introduce 529 plan options—they're preparing for baby but haven't set up education savings",
    "Benchmark life insurance needs: 10-12x income replacement plus future education costs",
    "Discuss updating wills to include guardianship designations before the birth",
    "Review disability insurance coverage—critical protection often overlooked by new parents",
    "Model childcare costs and parental leave cash flow into their financial plan",
  ],
  elder_care: [
    "Assess long-term care insurance options or Medicaid planning if coverage is lacking",
    "Review the care recipient's assets for Medicaid look-back period implications",
    "Discuss caregiver tax benefits: dependent care FSA, medical expense deductions",
    "Confirm power of attorney and healthcare proxy documents are in place and accessible",
    "Model scenarios for assisted living vs. in-home care cost trajectories",
  ],
};

export default function DemoLifeEventsView({ customerA, customerB, detectedEventA, detectedEventB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <LifeEventCard event={detectedEventA} customer={customerA} color="#3b82f6" />
      <LifeEventCard event={detectedEventB} customer={customerB} color="#10b981" />
    </div>
  );
}

function LifeEventCard({ event, customer, color }: { event: DetectedLifeEventResult | null; customer: DemoCustomer; color: string }) {
  if (!event) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 flex items-center justify-center">
        <p className="text-sm text-slate-400">No life event detected</p>
      </div>
    );
  }

  const eventType = mapEventNameToType(event.event_name);
  const insights = INSIGHTS_BY_TYPE[eventType] || INSIGHTS_BY_TYPE.retirement;
  const steps = STEPS_BY_TYPE[eventType] || STEPS_BY_TYPE.retirement;
  const sortedEvidence = [...event.evidence].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

      {/* Insights + Next Steps grid */}
      <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-1 gap-3">
        {/* Ventus AI Insights */}
        <div>
          <h5 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Ventus AI Insights
          </h5>
          <p className="text-[11px] text-slate-600 leading-relaxed">{insights}</p>
        </div>

        {/* Recommended Next Steps */}
        <div>
          <h5 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Recommended Next Steps
          </h5>
          <ol className="space-y-1">
            {steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[11px]">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 text-blue-600 text-[9px] font-semibold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-600">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

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
