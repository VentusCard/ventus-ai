import { useMemo } from "react";
import { Plane } from "lucide-react";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { seededRand } from "../../dashboard/useDashboardRange";

const TRIPS = [
  { origin: "NYC", dest: "Paris", airline: "Delta", hotel: "Le Bristol", nights: 6, cabin: "Business" },
  { origin: "SF", dest: "Tokyo", airline: "ANA", hotel: "Park Hyatt", nights: 8, cabin: "Premium Economy" },
  { origin: "Chicago", dest: "Cancún", airline: "United", hotel: "Rosewood Mayakoba", nights: 5, cabin: "First" },
  { origin: "Boston", dest: "London", airline: "British Airways", hotel: "The Connaught", nights: 4, cabin: "Business" },
  { origin: "Miami", dest: "Madrid", airline: "Iberia", hotel: "Mandarin Oriental Ritz", nights: 7, cabin: "Business" },
  { origin: "LA", dest: "Maui", airline: "Hawaiian", hotel: "Four Seasons Wailea", nights: 6, cabin: "First" },
  { origin: "Dallas", dest: "Mexico City", airline: "American", hotel: "Las Alcobas", nights: 3, cabin: "Economy" },
  { origin: "Seattle", dest: "Vancouver", airline: "Alaska", hotel: "Fairmont Pacific Rim", nights: 3, cabin: "Economy" },
  { origin: "NYC", dest: "St. Barths", airline: "JetBlue → Tradewind", hotel: "Eden Rock", nights: 7, cabin: "First" },
  { origin: "DC", dest: "Rome", airline: "ITA Airways", hotel: "Hotel de Russie", nights: 6, cabin: "Business" },
];

function fmt(n: number) {
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function dateLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TravelTripsReport({ onBack }: { onBack: () => void }) {
  return (
    <ReportPageShell
      title="Travel trip reconstruction"
      category="Lifestyle"
      description="Raw transactions grouped into labeled trips — origin, destination, dates, fare class, and total spend. Lets the bank time travel rewards, FX, and trip insurance offers precisely."
      onBack={onBack}
      defaultPreset="90d"
    >
      {({ range }) => {
        const trips = useMemo(() => {
          const totalDays = Math.max(1, Math.round((+range.end - +range.start) / 86_400_000));
          return TRIPS.map((t, i) => {
            const fareBase = t.cabin === "First" ? 8500 : t.cabin === "Business" ? 5200 : t.cabin === "Premium Economy" ? 2800 : 950;
            const air = Math.round(fareBase * (0.85 + seededRand(range.seed + i * 13, i) * 0.35));
            const hotel = Math.round(t.nights * (550 + seededRand(range.seed, i * 5) * 1200));
            const dining = Math.round(t.nights * (180 + seededRand(range.seed, i * 7) * 320));
            const other = Math.round(seededRand(range.seed, i * 11) * 1400);
            const total = air + hotel + dining + other;
            const offset = Math.floor(seededRand(range.seed, i * 17) * Math.max(1, totalDays - t.nights));
            const start = new Date(range.start);
            start.setDate(start.getDate() + offset);
            const end = new Date(start);
            end.setDate(start.getDate() + t.nights);
            const customers = 80 + Math.floor(seededRand(range.seed, i * 19) * 220);
            return { ...t, air, hotel, dining, other, total, start, end, customers };
          }).sort((a, b) => +b.start - +a.start);
        }, [range.seed, range.start, range.end]);

        const totalSpend = trips.reduce((a, b) => a + b.total, 0);
        const totalCustomers = trips.reduce((a, b) => a + b.customers, 0);
        const premiumTrips = trips.filter((t) => t.cabin === "Business" || t.cabin === "First").length;

        return (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Trips reconstructed</div>
                <div className="text-[20px] font-semibold text-slate-900 tabular-nums">{trips.length}</div>
                <div className="text-[11px] text-slate-400">From card + ACH evidence</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Customers traveling</div>
                <div className="text-[20px] font-semibold text-slate-900 tabular-nums">{totalCustomers.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400">Targetable for FX + insurance</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Premium cabin trips</div>
                <div className="text-[20px] font-semibold text-blue-600 tabular-nums">{premiumTrips}</div>
                <div className="text-[11px] text-slate-400">Business or First class</div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="text-[12px] font-medium text-slate-700 mb-3">Trip timeline — recent reconstructions</div>
              <div className="space-y-2">
                {trips.slice(0, 6).map((t, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
                      <Plane className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-slate-900">
                        {t.origin} → {t.dest}
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400 font-normal">{t.cabin}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {dateLabel(t.start)} – {dateLabel(t.end)} · {t.airline} · {t.hotel} · {t.nights} nights
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-semibold text-slate-900 tabular-nums">{fmt(t.total)}</div>
                      <div className="text-[10px] text-slate-400">{t.customers} customers</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ReportDataTable
              caption={`Trip breakdown — total spend ${fmt(totalSpend)}`}
              rows={trips}
              rowKey={(_, i) => `t-${i}`}
              columns={[
                { key: "route", header: "Route", render: (r) => `${r.origin} → ${r.dest}` },
                { key: "dates", header: "Dates", render: (r) => `${dateLabel(r.start)}–${dateLabel(r.end)}` },
                { key: "cabin", header: "Cabin", render: (r) => r.cabin },
                { key: "air", header: "Airfare", align: "right", render: (r) => fmt(r.air) },
                { key: "hotel", header: "Hotel", align: "right", render: (r) => fmt(r.hotel) },
                { key: "dining", header: "Dining", align: "right", render: (r) => fmt(r.dining) },
                { key: "total", header: "Total", align: "right", render: (r) => <span className="font-medium text-slate-900">{fmt(r.total)}</span> },
              ]}
            />
          </>
        );
      }}
    </ReportPageShell>
  );
}
