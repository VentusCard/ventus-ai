import ScrollReveal from "@/components/ScrollReveal";
import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";
import salesforceLogo from "@/assets/salesforce-logo.png";
import dynamicsLogo from "@/assets/dynamics-logo.png";

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
  { name: "Microsoft Dynamics", src: dynamicsLogo },
  { name: "Rewards Engine", monogram: "R", monoColor: "#16A34A" },
  { name: "Advisor Console", monogram: "A", monoColor: "#7C3AED" },
];

const Tile = ({ tile }: { tile: Tile }) => (
  <div
    className="flex items-center justify-center rounded-xl bg-white relative z-10"
    style={{
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      height: 64,
    }}
  >
    {tile.src ? (
      <img
        src={tile.src}
        alt={tile.name}
        title={tile.name}
        className="max-h-9 max-w-[60%] w-auto object-contain"
      />
    ) : (
      <span
        className="text-[26px] font-black"
        style={{ color: tile.monoColor }}
        title={tile.name}
      >
        {tile.monogram}
      </span>
    )}
  </div>
);

/* Flow lines that originate from each tile row on one side
   and converge into the center of the Ventus engine card. */
const FlowLines = ({ side, count = 5 }: { side: "left" | "right"; count?: number }) => {
  // svg viewBox uses normalized 100x100; preserveAspectRatio="none" stretches it
  // to the absolute container that spans the full gap + half engine.
  const targetX = side === "left" ? 100 : 0; // engine center anchor
  const startX = side === "left" ? 0 : 100;
  return (
    <svg
      className="absolute pointer-events-none hidden md:block"
      style={{
        top: 0,
        bottom: 0,
        [side === "left" ? "right" : "left"]: "50%",
        [side === "left" ? "left" : "right"]: -48,
        zIndex: 1,
      } as React.CSSProperties}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {Array.from({ length: count }).map((_, i) => {
        const y = ((i + 0.5) / count) * 100;
        const cx = (startX + targetX) / 2;
        // smooth cubic curve from tile row into engine center (y=50)
        const d = `M ${startX} ${y} C ${cx} ${y}, ${cx} 50, ${targetX} 50`;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.4"
            opacity="0.55"
            vectorEffect="non-scaling-stroke"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to={side === "left" ? "-6" : "6"}
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        );
      })}
    </svg>
  );
};

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
                <div className="flex flex-col gap-2">
                  {sources.map((t) => (
                    <Tile key={t.name} tile={t} />
                  ))}
                </div>
              </div>

              {/* VENTUS ENGINE */}
              <div className="flex items-center justify-center md:w-[260px] relative">
                <FlowLines side="left" count={sources.length} />
                <FlowLines side="right" count={destinations.length} />
                <div
                  className="rounded-2xl w-full overflow-hidden bg-white relative z-10"
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
                <div className="flex flex-col gap-2">
                  {destinations.map((t) => (
                    <Tile key={t.name} tile={t} />
                  ))}
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
