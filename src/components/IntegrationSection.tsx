import ScrollReveal from "@/components/ScrollReveal";
import HueField from "@/components/HueField";
import { Database, KeyRound, Server, Smartphone, Star } from "lucide-react";
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
  Icon?: typeof Star;
};

const LIVE_TODAY: Tile[] = [
  { name: "Salesforce Financial Services Cloud", src: salesforceLogo },
  { name: "Plaid", label: "Plaid", Icon: Database },
  { name: "REST API with per-institution keys", label: "REST API with per-institution keys", Icon: KeyRound },
];

const SUPPORTED: Tile[] = [
  { name: "Core processor feeds", label: "Core processor feeds", Icon: Server },
  { name: "FIS", src: fisLogo },
  { name: "Fiserv", src: fiservLogo },
  { name: "Jack Henry SilverLake", src: jackHenryLogo },
  { name: "Data warehouse exports", label: "Data warehouse exports", Icon: Database },
  { name: "Databricks", src: databricksLogo },
  { name: "Snowflake", src: snowflakeLogo },
  { name: "Rewards engines", label: "Rewards engines", Icon: Star },
  { name: "Digital banking apps", label: "Digital banking apps", Icon: Smartphone },
];

const TileBox = ({ tile, dim }: { tile: Tile; dim?: boolean }) => (
  <div
    className={`ventus-glass flex w-full items-center justify-center rounded-xl px-3 ${
      dim ? "opacity-60" : ""
    }`}
    style={{ height: 72 }}
  >
    {tile.src ? (
      <img
        src={tile.src}
        alt={tile.name}
        title={tile.name}
        className="max-h-9 max-w-[70%] w-auto object-contain"
      />
    ) : (
      <span
        className={`flex items-center justify-center gap-2 text-center text-[14px] font-semibold tracking-tight ${
          dim ? "text-gray-500" : "text-gray-700"
        }`}
      >
        {tile.Icon ? (
          <tile.Icon
            className={`h-4 w-4 shrink-0 ${dim ? "text-blue-500" : "text-blue-600"}`}
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
        {tile.label}
      </span>
    )}
  </div>
);

const IntegrationSection = () => (
  <section
    id="integration"
    className="relative scroll-mt-24 overflow-hidden bg-white py-24 md:py-28"
  >
    <HueField
      blobs={[
        { hue: "sky", size: 700, top: "-20%", left: "50%" },
        { hue: "violet", size: 520, bottom: "-14%", left: "-6%", opacity: 0.45 },
      ]}
    />
    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
      <ScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Integration
          </p>
          <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            Plugs into your existing stack.
          </h2>
          <p className="mt-2 text-xl font-medium text-gray-500">Without replacing it.</p>
          <p className="mt-5 text-[15px] leading-relaxed text-gray-600">
            Data in, customer signals out, through whatever pipe your bank prefers. No core
            migration, no rip and replace.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.12}>
        <div className="ventus-glass ventus-glass-soft mt-14 rounded-2xl p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-800">
                Live today
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {LIVE_TODAY.map((t) => (
                <TileBox key={t.name} tile={t} />
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Supported
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SUPPORTED.map((t) => (
                <TileBox key={t.name} tile={t} dim />
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default IntegrationSection;
