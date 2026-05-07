import ScrollReveal from "@/components/ScrollReveal";
import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";
import salesforceLogo from "@/assets/salesforce-logo.png";

type Tile = {
  name: string;
  src?: string;
  monogram?: string;
  monoColor?: string;
};

const sources: Tile[] = [
  { name: "FIS", src: fisLogo },
  { name: "Fiserv", src: fiservLogo },
  { name: "Jack Henry SilverLake", src: jackHenryLogo },
  { name: "Databricks", src: databricksLogo },
  { name: "Snowflake", src: snowflakeLogo },
];

const destinations: Tile[] = [
  { name: "Salesforce Financial Cloud", src: salesforceLogo },
  { name: "Microsoft Dynamics", monogram: "M", monoColor: "#2563EB" },
  { name: "Rewards Engine", monogram: "R", monoColor: "#16A34A" },
  { name: "Advisor Console", monogram: "A", monoColor: "#7C3AED" },
];

const Tile = ({ tile }: { tile: Tile }) => (
  <div
    className="flex items-center gap-3 rounded-xl px-3.5 py-3 bg-white"
    style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
  >
    <div
      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
      style={{ background: "#F8FAFC", border: "1px solid #EEF2F7" }}
    >
      {tile.src ? (
        <img src={tile.src} alt={tile.name} className="max-h-6 max-w-7 w-auto object-contain" />
      ) : (
        <span className="text-[14px] font-black" style={{ color: tile.monoColor }}>
          {tile.monogram}
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
        {tile.name}
      </div>
    </div>
    <span
      className="shrink-0 w-1.5 h-1.5 rounded-full"
      style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
    />
  </div>
);

const FlowLines = ({ side }: { side: "left" | "right" }) => (
  <svg
    className="absolute top-0 h-full pointer-events-none hidden md:block"
    style={{
      [side]: "100%",
      width: "60px",
      zIndex: 1,
    } as React.CSSProperties}
    preserveAspectRatio="none"
    viewBox="0 0 60 400"
  >
    {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
      <g key={i}>
        <line
          x1={side === "left" ? "0" : "60"}
          y1={y * 400}
          x2={side === "left" ? "60" : "0"}
          y2={200}
          stroke="#3B82F6"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.35"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to={side === "left" ? "-14" : "14"}
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
      </g>
    ))}
  </svg>
);

const IntegrationSection = () => {
  return (
    <section
      id="integration"
      className="bg-white scroll-mt-20"
      style={{ paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Integration
            </p>
            <h2 className="font-bold text-gray-900 leading-tight" style={{ fontSize: 36 }}>
              Plugs into your existing stack.
            </h2>
            <p className="mt-2 text-gray-500 font-medium" style={{ fontSize: 20 }}>
              Without replacing it.
            </p>
            <p className="mt-5 text-gray-600 leading-relaxed text-[15px]">
              Connect Ventus to the cores, warehouses, and CRMs you already run. Hashed
              transactions in, behavioral intelligence out — through whatever pipe your bank
              prefers.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div
            className="mt-14 rounded-2xl p-6 md:p-8"
            style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-12 items-stretch">
              {/* SOURCES */}
              <div>
                <div className="mb-3 px-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                    Sources
                  </span>
                </div>
                <div className="flex flex-col gap-2 relative">
                  {sources.map((t) => (
                    <Tile key={t.name} tile={t} />
                  ))}
                  <FlowLines side="right" />
                </div>
              </div>

              {/* VENTUS ENGINE */}
              <div className="flex items-center justify-center md:w-[260px]">
                <div
                  className="rounded-2xl w-full overflow-hidden bg-white"
                  style={{
                    border: "1px solid #DBEAFE",
                    boxShadow:
                      "0 0 0 6px rgba(59,130,246,0.06), 0 20px 50px -12px rgba(59,130,246,0.25), 0 0 60px rgba(59,130,246,0.18)",
                  }}
                >
                  <div className="px-5 py-8 flex flex-col items-center justify-center gap-3">
                    <span
                      className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-[22px] leading-none shadow-md"
                      style={{ fontFamily: "'Horizon', 'Manrope', sans-serif" }}
                    >
                      V
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-gray-900 tracking-tight">
                        Ventus Engine
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DESTINATIONS */}
              <div>
                <div className="mb-3 px-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                    Destinations
                  </span>
                </div>
                <div className="flex flex-col gap-2 relative">
                  {destinations.map((t) => (
                    <Tile key={t.name} tile={t} />
                  ))}
                  <FlowLines side="left" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntegrationSection;
