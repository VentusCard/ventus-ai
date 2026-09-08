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
  label?: string;
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
  { name: "Rewards Engine", label: "Rewards Engine" },
  { name: "Digital Banking App", label: "Digital Banking App" },
];

const TileBox = ({ tile }: { tile: Tile }) => (
  <div
    className="flex items-center justify-center rounded-lg bg-white relative z-10"
    style={{
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      height: 60,
    }}
  >
    {tile.src ? (
      <img
        src={tile.src}
        alt={tile.name}
        title={tile.name}
        className="max-h-8 max-w-[60%] w-auto object-contain"
      />
    ) : (
      <span className="text-sm font-semibold text-gray-500 tracking-tight">
        {tile.label}
      </span>
    )}
  </div>
);

const IntegrationSection = () => {
  // Source column has 5 tiles, dest has 4 — both stretch to same height.
  // Compute tile-center y as % of the grid track.
  const srcYs = sources.map((_, i) => ((i + 0.5) / sources.length) * 100);
  const dstYs = destinations.map((_, i) => ((i + 0.5) / destinations.length) * 100);

  // X anchors (% of grid container width). Roughly: source col 0-33%, engine
  // 33-67%, dest 67-100%. We exit source tiles at their right edge (~33%),
  // converge to engine center (50%), and continue to dest left edge (~67%).
  const SRC_X = 33;
  const DST_X = 67;
  const ENGINE_X = 50;

  return (
    <section
      id="integration"
      className="bg-white scroll-mt-20"
      style={{ paddingTop: 56, paddingBottom: 56 }}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-blue-600">
              Integration
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              Plugs into your existing stack.
            </h2>
            <p className="mt-1 text-gray-500 font-medium text-base">
              Without replacing it.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed text-sm">
              Connect Ventus to the cores, warehouses, and CRMs you already run.
              Transactions in, behavioral intelligence out — through whatever pipe your bank
              prefers.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div
            className="mt-10 rounded-xl p-5 md:p-6"
            style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
          >
            {/* Column headers, outside the tile grid so flow lines line up cleanly */}
            <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-10 mb-2">
              <div className="px-1">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                  Sources
                </span>
              </div>
              <div className="md:w-[220px]" />
              <div className="px-1 text-right">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                  Destinations
                </span>
              </div>
            </div>

            <div className="relative">
              {/* Flow lines overlay — covers the entire tile grid */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                style={{ zIndex: 1 }}
              >
                {srcYs.map((y, i) => (
                  <path
                    key={`s-${i}`}
                    d={`M ${SRC_X} ${y} C ${(SRC_X + ENGINE_X) / 2} ${y}, ${
                      (SRC_X + ENGINE_X) / 2
                    } 50, ${ENGINE_X} 50`}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="0.7"
                    strokeDasharray="1.4 1.4"
                    opacity="0.9"
                    vectorEffect="non-scaling-stroke"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>
                ))}
                {dstYs.map((y, i) => (
                  <path
                    key={`d-${i}`}
                    d={`M ${ENGINE_X} 50 C ${(DST_X + ENGINE_X) / 2} 50, ${
                      (DST_X + ENGINE_X) / 2
                    } ${y}, ${DST_X} ${y}`}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="0.7"
                    strokeDasharray="1.4 1.4"
                    opacity="0.9"
                    vectorEffect="non-scaling-stroke"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>
                ))}
              </svg>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-5 md:gap-10 items-stretch">
                {/* SOURCES */}
                <div className="md:hidden mb-1 px-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                    Sources
                  </span>
                </div>
                <div className="h-full flex flex-col justify-around gap-2">
                  {sources.map((t) => (
                    <TileBox key={t.name} tile={t} />
                  ))}
                </div>

                {/* VENTUS ENGINE */}
                <div className="hidden md:flex items-center justify-center md:w-[220px]">
                  <style>{`
                    @keyframes glowPulse {
                      0%, 100% { box-shadow: 0 0 0 6px rgba(59,130,246,0.06), 0 20px 50px -12px rgba(59,130,246,0.25), 0 0 60px rgba(59,130,246,0.18); }
                      50% { box-shadow: 0 0 0 8px rgba(59,130,246,0.10), 0 24px 60px -10px rgba(59,130,246,0.35), 0 0 80px rgba(59,130,246,0.28); }
                    }
                  `}</style>
                  <div
                    className="rounded-xl w-full overflow-hidden bg-white relative z-10"
                    style={{
                      border: "1px solid #DBEAFE",
                      animation: "glowPulse 3s ease-in-out infinite",
                    }}
                  >
                    <div className="px-4 py-6 flex flex-col items-center justify-center gap-2">
                      <span
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-black text-lg leading-none shadow-md"
                        style={{ fontFamily: "'Horizon', 'Manrope', sans-serif" }}
                      >
                        V
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 tracking-tight">
                          Ventus
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DESTINATIONS */}
                <div className="md:hidden mb-1 px-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                    Destinations
                  </span>
                </div>
                <div className="h-full flex flex-col justify-around gap-2">
                  {destinations.map((t) => (
                    <TileBox key={t.name} tile={t} />
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
