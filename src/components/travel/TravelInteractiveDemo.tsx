import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

const transactions = [
  { merchant: "DELTA AIR LINES 00624", amount: "$450.00", date: "Mar 12" },
  { merchant: "UBER *MIAMI AIRPORT", amount: "$34.50", date: "Mar 12" },
  { merchant: "ZUMA MIAMI BEACH", amount: "$187.00", date: "Mar 13" },
  { merchant: "PEREZ ART MUSEUM", amount: "$28.00", date: "Mar 13" },
  { merchant: "MIAMI MARRIOTT", amount: "$892.00", date: "Mar 13" },
  { merchant: "WHOLE FOODS MKT #2847", amount: "$42.00", date: "Mar 14" },
];

const deals = [
  { name: "Perez Art Museum", deal: "15% off admission", category: "Arts", bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
  { name: "Zuma Miami", deal: "$50 dining credit", category: "Dining", bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
  { name: "Bayside Marketplace", deal: "10% back on purchases", category: "Shopping", bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
];

const TRIGGER_INDEX = 3; // Trip fires after 4th transaction (index 3)
const TX_INTERVAL = 1500;

const TravelInteractiveDemo = () => {
  const [visibleTxCount, setVisibleTxCount] = useState(0);
  const [tripDetected, setTripDetected] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setVisibleTxCount(0);
    setTripDetected(false);
    setRightVisible(false);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    if (visibleTxCount < transactions.length) {
      intervalRef.current = setTimeout(() => {
        const next = visibleTxCount + 1;
        setVisibleTxCount(next);

        if (next > TRIGGER_INDEX && !tripDetected) {
          setTripDetected(true);
          setTimeout(() => setRightVisible(true), 300);
        }

        // Auto-scroll feed
        if (feedRef.current) {
          feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
      }, TX_INTERVAL);
    } else {
      // All transactions shown — wait then loop
      intervalRef.current = setTimeout(() => reset(), 4000);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [visibleTxCount, isRunning, tripDetected, reset]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg" style={{ maxWidth: '100%' }}>
      <div className="flex items-center justify-between px-6 md:px-8 pt-5 pb-3 border-b border-gray-200">
        <h3 className="text-gray-900 text-lg font-bold">Travel Intelligence</h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden lg:inline-block" style={{ animation: "liveDotPulse 2s ease-in-out infinite" }} />
          Live Demo
        </span>
      </div>
      <div className="grid md:grid-cols-2 min-h-[480px]">
        {/* LEFT — Transaction Feed */}
        <div className="p-6 md:p-8 flex flex-col md:border-r border-b md:border-b-0 border-gray-200">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase">Transaction Feed</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </div>

          <div ref={feedRef} className="flex-1 overflow-y-auto space-y-0 pr-1" style={{ maxHeight: 320 }}>
            {transactions.slice(0, visibleTxCount).map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-md transition-all duration-500 animate-fade-in"
                style={{
                  background: i === visibleTxCount - 1 ? "rgba(59,130,246,0.06)" : "transparent",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span className="text-[11px] md:text-[13px] text-gray-700 font-mono truncate mr-2 md:mr-4">{tx.merchant}</span>
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <span className="text-[12px] md:text-[13px] text-gray-900 font-mono font-semibold">{tx.amount}</span>
                  <span className="text-[10px] md:text-[11px] text-gray-400 font-mono w-10 md:w-14 text-right">{tx.date}</span>
                </div>
              </div>
            ))}

            {visibleTxCount === 0 && (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Waiting for transactions…
              </div>
            )}
          </div>

          {/* Trip Detected Popup */}
          <div
            className="mt-4 rounded-lg px-4 py-3 transition-all duration-700"
            style={{
              border: tripDetected ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
              background: tripDetected ? "rgba(16,185,129,0.06)" : "transparent",
              opacity: tripDetected ? 1 : 0,
              transform: tripDetected ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Plane className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">Trip Detected — Miami, FL</span>
            </div>
            <p className="text-[11px] text-gray-500">Inferred from spending patterns · No location tracking</p>
          </div>
        </div>

        {/* RIGHT — Trip Intelligence */}
        <div
          className="p-6 md:p-8 flex flex-col transition-all duration-700"
          style={{
            opacity: rightVisible ? 1 : 0,
            visibility: rightVisible ? "visible" : "hidden",
          }}
        >
          <span className="text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase mb-5">Trip Intelligence</span>

          {/* Summary Card */}
          <div className="rounded-xl p-5 mb-5 bg-gray-50 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Destination</p>
                <p className="text-sm font-bold text-gray-900">Miami, FL</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dates</p>
                <p className="text-sm font-bold text-gray-900">Mar 12 – Mar 17</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Transactions</p>
                <p className="text-sm font-bold text-gray-900">14</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Spend</p>
                <p className="text-sm font-bold text-gray-900">$4,280</p>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Inferred from spending patterns
            </span>
          </div>

          {/* Divider */}
          <div className="h-px mb-5 bg-gray-200" />

          {/* Deals */}
          <p className="text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-3">Curated For This Trip</p>
          <div className="space-y-2.5 flex-1">
            {deals.map((deal, i) => (
              <div
                key={deal.name}
                className="flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-500"
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  opacity: rightVisible ? 1 : 0,
                  transform: rightVisible ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: `${i * 150 + 200}ms`,
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{deal.name}</p>
                  <p className="text-[11px] text-gray-500">{deal.deal}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: deal.bg, color: deal.color }}
                >
                  {deal.category}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-4">Deals update in real time as new transactions are detected</p>
        </div>
      </div>

      {/* Replay Button */}
      <div className="flex justify-center py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-50"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Replay
        </Button>
      </div>
    </div>
  );
};

export default TravelInteractiveDemo;
