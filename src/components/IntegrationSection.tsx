import ScrollReveal from "@/components/ScrollReveal";
import HueField from "@/components/HueField";
import { Link } from "react-router-dom";
import {
  Star,
  Database,
  Megaphone,
  Bot,
  Globe,
  Cloud,
} from "lucide-react";
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
  icon?: "star" | "iphone" | "database" | "megaphone" | "bot" | "globe" | "cloud";
  href?: string;
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

const coreProviders: Tile[] = [
  { name: "FIS", src: fisLogo },
  { name: "Fiserv", src: fiservLogo },
  { name: "Jack Henry SilverLake", src: jackHenryLogo },
];

const dataWarehouses: Tile[] = [
  { name: "Databricks", src: databricksLogo },
  { name: "Snowflake", src: snowflakeLogo },
];

const sources: Tile[] = [
  { name: "Core Service Providers", label: "Core Service Providers", icon: "cloud" },
  { name: "Data Warehouse", label: "Data Warehouse", icon: "database" },
  { name: "External Intelligence", label: "External Intelligence", icon: "globe" },
];

const destinations: Tile[] = [
  { name: "Ventus AI Database", label: "Ventus AI Database", icon: "database" },
  { name: "Marketing Automation", label: "Marketing Automation", icon: "megaphone" },
  { name: "AI Coworker", label: "AI Coworker", icon: "bot", href: "/coworker" },
  { name: "Salesforce Financial Cloud", src: salesforceLogo },
  { name: "Rewards Engine", label: "Rewards Engine", icon: "star" },
  { name: "Digital Banking App", label: "Digital Banking App", icon: "iphone" },
];

const iconAccentClass = "text-blue-600";

const IconFor = ({ icon }: { icon: Tile["icon"] }) => {
  switch (icon) {
    case "star":
      return <Star className={`h-4 w-4 shrink-0 ${iconAccentClass}`} strokeWidth={2} aria-hidden />;
    case "iphone":
      return <IphoneGlyph className={`h-4 w-4 shrink-0 ${iconAccentClass}`} />;
    case "database":
      return <Database className={`h-4 w-4 shrink-0 ${iconAccentClass}`} strokeWidth={2} aria-hidden />;
    case "megaphone":
      return <Megaphone className={`h-4 w-4 shrink-0 ${iconAccentClass}`} strokeWidth={2} aria-hidden />;
    case "bot":
      return <Bot className={`h-4 w-4 shrink-0 ${iconAccentClass}`} strokeWidth={2} aria-hidden />;
    case "globe":
      return <Globe className={`h-4 w-4 shrink-0 ${iconAccentClass}`} strokeWidth={2} aria-hidden />;
    case "cloud":
      return <Cloud className={`h-4 w-4 shrink-0 ${iconAccentClass}`} strokeWidth={2} aria-hidden />;
    default:
      return null;
  }
};

const TileBox = ({ tile }: { tile: Tile }) => {
  const content = (
    <div
      className={`ventus-glass flex items-center justify-center rounded-xl relative z-10 w-full ${
        tile.href ? "group" : ""
      }`}
      style={{ height: 60 }}
    >
      {tile.src ? (
        <img
          src={tile.src}
          alt={tile.name}
          title={tile.name}
          className="max-h-9 max-w-[60%] w-auto object-contain"
        />
      ) : (
        <span className="flex items-center justify-center gap-2 text-[14px] font-semibold text-gray-500 tracking-tight px-2 text-center">
          {tile.icon ? <IconFor icon={tile.icon} /> : null}
          {tile.label}
        </span>
      )}
      {tile.href ? (
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-blue-600/0 transition-all group-hover:ring-blue-600/30 group-hover:bg-blue-50/20" />
      ) : null}
    </div>
  );

  if (tile.href) {
    return (
      <Link to={tile.href} aria-label={tile.name} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

const CoreProviderCard = () => (
  <div
    className="ventus-glass relative z-10 grid w-full grid-cols-3 items-center gap-3 rounded-xl px-4"
    style={{ height: 60 }}
  >
    {coreProviders.map((t) => (
      <div key={t.name} className="flex items-center justify-center">
        <img
          src={t.src}
          alt={t.name}
          title={t.name}
          className="max-h-7 w-auto max-w-full object-contain"
        />
      </div>
    ))}
  </div>
);


const DataWarehouseCard = () => (
  <div
    className="ventus-glass flex items-center justify-center rounded-xl relative z-10 w-full gap-4 px-4"
    style={{ height: 60 }}
  >
    {dataWarehouses.map((t) => (
      <img
        key={t.name}
        src={t.src}
        alt={t.name}
        title={t.name}
        className="max-h-7 w-auto object-contain"
        style={{ maxWidth: "42%" }}
      />
    ))}
  </div>
);

const SourceTile = ({ tile }: { tile: Tile }) => {
  if (tile.name === "Core Service Providers") return <CoreProviderCard />;
  if (tile.name === "Data Warehouse") return <DataWarehouseCard />;
  return <TileBox tile={tile} />;
};

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
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Integration
            </p>
            <h2 className="font-bold text-gray-900 leading-tight" style={{ fontSize: 36 }}>
              Plugs into your existing stack.
            </h2>
            <p className="mt-2 text-gray-600 font-medium" style={{ fontSize: 20 }}>
              Without replacing it.
            </p>
            <p className="mt-5 text-base leading-[1.65] text-gray-700">
              Connect Ventus to the cores, warehouses, and CRMs you already run.
              Transactions in, behavioral intelligence out, through whatever pipe your bank
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
                    <SourceTile key={t.name} tile={t} />
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
