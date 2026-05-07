import ScrollReveal from "@/components/ScrollReveal";
import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";
import salesforceLogo from "@/assets/salesforce-logo.png";

const sources = [
  { name: "FIS", src: fisLogo, height: "h-8" },
  { name: "Fiserv", src: fiservLogo, height: "h-9" },
  { name: "Jack Henry", src: jackHenryLogo, height: "h-8" },
  { name: "Databricks", src: databricksLogo, height: "h-8" },
  { name: "Snowflake", src: snowflakeLogo, height: "h-8" },
];

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      background: "#F3F4F6",
      color: "#374151",
      borderRadius: 20,
      padding: "6px 14px",
      fontSize: 13,
    }}
    className="inline-flex items-center font-medium whitespace-nowrap"
  >
    {children}
  </span>
);

const IntegrationSection = () => {
  return (
    <section
      id="integration"
      className="bg-white scroll-mt-20"
      style={{ paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8 text-center">
        <ScrollReveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Integration
          </p>
          <h2
            className="font-bold text-gray-900 leading-tight max-w-3xl mx-auto"
            style={{ fontSize: 36 }}
          >
            Plugs into your existing stack without replacing it.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div className="mt-12 flex flex-col items-center" style={{ gap: 40 }}>
            {/* Row 1 — Data Sources */}
            <div className="flex flex-col items-center gap-4">
              <p
                className="font-semibold uppercase tracking-widest text-gray-500"
                style={{ fontSize: 12 }}
              >
                Data Sources
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {sources.map(({ name, src, height }) => (
                  <img
                    key={name}
                    src={src}
                    alt={name}
                    className={`${height} w-auto grayscale opacity-60`}
                  />
                ))}
              </div>
            </div>

            {/* Row 2 — Destinations */}
            <div className="flex flex-col items-center gap-4">
              <p
                className="font-semibold uppercase tracking-widest text-gray-500"
                style={{ fontSize: 12 }}
              >
                Destinations
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <img
                  src={salesforceLogo}
                  alt="Salesforce"
                  className="h-9 w-auto grayscale opacity-60"
                />
                <Pill>Rewards Engine · API</Pill>
                <Pill>Advisor Tools · Webhook</Pill>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntegrationSection;
