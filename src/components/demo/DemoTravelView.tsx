import type { DemoCustomer } from "@/lib/demoData";
import { Plane, MapPin, DollarSign } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
}

export default function DemoTravelView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CustomerTravel customer={customerA} color="#3b82f6" />
      <CustomerTravel customer={customerB} color="#10b981" />
    </div>
  );
}

function CustomerTravel({ customer, color }: { customer: DemoCustomer; color: string }) {
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
