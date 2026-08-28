import ScrollReveal from "@/components/ScrollReveal";
import HueField from "@/components/HueField";
import { Star } from "lucide-react";
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
  icon?: "star" | "iphone";
};

const IphoneGlyph = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect
      x="6.25"
      y="2.75"
      width="11.5"
      height="18.5"
      rx="2.75"
      stroke="currentColor"
      strokeWidth="1.35"
    />
    <rect x="9.4" y="4.35" width="5.2" height="1.85" rx="0.95" fill="currentColor" opacity={0.38} />
    <line
      x1="9.25"
      y1="19.35"
      x2="14.75"
      y2="19.35"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      opacity={0.45}
    />
  </svg>
);

const sources: Tile[] = [
  { name: "FIS", src: fisLogo },
  { name: "Fiserv", src: fiservLogo },
  { name: "Jack Henry SilverLake", src: jackHenryLogo },
  { name: "Databricks", src: databricksLogo },
  { name: "Snowflake", src: snowflakeLogo },
];

const destinations: Tile[] = [
  { name: "Salesforce Financial Cloud", src: salesforceLogo },
  { name: "Rewards Engine", label: "Rewards Engine", icon: "star" },
  { name: "Digital Banking App", label: "Digital Banking App", icon: "iphone" },
];

const iconAccentClass = "text-blue-600";

const TileBox = ({ tile }: { tile: Tile }) => (
  <div
    className="ventus-glass flex items-center justify-center rounded-xl relative z-10 w-full"
    style={{ height: 72 }}
  >
    {tile.src ? (
      <img
        src={tile.src}
        alt={tile.name}
        title={tile.name}
        className="max-h-10 max-w-[65%] w-auto object-contain"
      />
    ) : (
      <span className="flex items-center justify-center gap-2 text-[15px] font-semibold text-gray-500 tracking-tight px-2 text-center">
        {tile.icon === "star" ? (
          <Star className={`h-4 w-4 shrink-0 ${iconAccentClass}`} strokeWidth={2} aria-hidden />
        ) : null}
        {tile.icon === "iphone" ? <IphoneGlyph className={`h-4 w-4 shrink-0 ${iconAccentClass}`} /> : null}
        {tile.label}
      </span>
    )}
  </div>
);

const IntegrationSection = () => {
  const srcYs = sources.map((_, i) => ((i + 0.5) / sources.length) * 100);
  const dstYs = destinations.map((_, i) => ((i + 0.5) / destinations.length) * 100);

  const SRC_X = 33;
  const DST_X = 67;
  const ENGINE_X = 50;

  return (
    <section
      id="integration"
      className="bg-white scroll-mt-20 relative overflow-hidden"
      style={{ paddingTop: 80, paddingBottom: 80 }}
    >
      <HueField
        blobs={[
          { hue: "sky", size: 700, top: "-20%", left: "50%" },
          { hue: "violet", size: 520, bottom: "-14%", left: "-6%", opacity: 0.45 },
        ]}
      />
      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
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
              Connect Ventus to the cores, warehouses, and CRMs you already run.
              Transactions in, behavioral intelligence out — through whatever pipe your bank
              prefers.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div
            className="ventus-glass ventus-glass-soft mt-14 rounded-2xl p-6 md:p-8 min-w-0"
          >
            <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] gap-12 mb-3">
              <div className="px-1">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                  Sources
                </span>
              </div>
              <div className="lg:w-[260px]" />
              <div className="px-1 text-right">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                  Destinations
                </span>
              </div>
            </div>

            <div className="relative min-w-0">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
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

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-12 items-stretch min-w-0">
                <div className="lg:hidden mb-1 px-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                    Sources
                  </span>
                </div>
                <div className="h-full flex flex-col justify-around gap-2 min-w-0">
                  {sources.map((t) => (
                    <TileBox key={t.name} tile={t} />
                  ))}
                </div>

                <div className="hidden lg:flex items-center justify-center lg:w-[260px] shrink-0">
                  <style>{`
                    @keyframes glowPulse {
                      0%, 100% { box-shadow: 0 0 0 6px rgba(59,130,246,0.06), 0 20px 50px -12px rgba(59,130,246,0.25), 0 0 60px rgba(59,130,246,0.18); }
                      50% { box-shadow: 0 0 0 8px rgba(59,130,246,0.10), 0 24px 60px -10px rgba(59,130,246,0.35), 0 0 80px rgba(59,130,246,0.28); }
                    }
                  `}</style>
                  <div
                    className="rounded-2xl w-full overflow-hidden bg-white relative z-10"
                    style={{
                      border: "1px solid #DBEAFE",
                      animation: "glowPulse 3s ease-in-out infinite",
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
                          Ventus
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:hidden mb-1 px-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-700">
                    Destinations
                  </span>
                </div>
                <div className="h-full flex flex-col justify-around gap-2 min-w-0">
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