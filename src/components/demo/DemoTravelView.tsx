import type { DemoCustomer } from "@/lib/demoData";
import type { LocalExperienceDeal } from "@/hooks/useDemoEnrichment";
import { Plane, MapPin, DollarSign, Sparkles } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  localExperiencesA?: { destination: string; deals: LocalExperienceDeal[] }[];
  localExperiencesB?: { destination: string; deals: LocalExperienceDeal[] }[];
}

export default function DemoTravelView({ customerA, customerB, localExperiencesA, localExperiencesB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CustomerTravel customer={customerA} color="#3b82f6" localExperiences={localExperiencesA} />
      <CustomerTravel customer={customerB} color="#10b981" localExperiences={localExperiencesB} />
    </div>
  );
}

function CustomerTravel({ customer, color, localExperiences }: { customer: DemoCustomer; color: string; localExperiences?: { destination: string; deals: LocalExperienceDeal[] }[] }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>Detected Trips</p>

      {customer.trips.map((trip) => (
        <div
          key={trip.destination}
          className="rounded-lg border border-slate-200 overflow-hidden bg-white"
        >
          <div className="px-4 py-3 border-b border-slate-100" style={{ background: `${color}04` }}>
            <div className="flex items-center gap-2 mb-1">
              <Plane className="w-3.5 h-3.5" style={{ color }} />
              <p className="text-sm font-semibold text-slate-900">{trip.destination}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {trip.dates}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> {trip.spend}
              </span>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-2">Trip Highlights</p>
            <div className="flex flex-wrap gap-1.5">
              {trip.highlights.map((h) => (
                <span key={h} className="text-[10px] text-slate-600 bg-slate-100 rounded-full px-2.5 py-1 border border-slate-200">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* AI-generated Local Experiences */}
      {localExperiences && localExperiences.length > 0 && (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: `${color}30` }}>
          <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ background: `${color}08`, borderColor: `${color}20` }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color }} />
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
              Local Experiences — {localExperiences[0].destination}
            </p>
          </div>
          <div className="px-4 py-3 space-y-2 bg-white">
            {localExperiences[0].deals.slice(0, 6).map((deal, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-900">{deal.type}</p>
                  <p className="text-[10px] text-slate-500">{deal.merchantExample}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customer.topPillars.find((p) => p.name === "Travel") && (
        <div className="rounded-lg p-3 border" style={{ background: `${color}04`, borderColor: `${color}20` }}>
          <p className="text-[10px] font-semibold" style={{ color }}>Travel Affinity</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {customer.topPillars.find((p) => p.name === "Travel")?.spend ?? "N/A"} this quarter
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {customer.topPillars.find((p) => p.name === "Travel")?.pct ?? 0}% of total spending
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        {customer.deals
          .filter((d) => ["Travel", "Outdoor"].includes(d.tag))
          .slice(0, 2)
          .map((deal) => (
            <div key={deal.brand} className="rounded-lg p-2.5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-900">{deal.brand}</p>
                <span className="text-[9px] font-semibold" style={{ color }}>{deal.match}% match</span>
              </div>
              <p className="text-[10px] text-slate-500">{deal.offer}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
