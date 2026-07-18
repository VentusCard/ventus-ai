import ScrollReveal from "@/components/ScrollReveal";
import salesforceLogo from "@/assets/salesforce-logo.png";
import dynamicsLogo from "@/assets/dynamics-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import fisLogo from "@/assets/fis-logo.svg";

const ecosystem = [
  { name: "Salesforce", logo: salesforceLogo, className: "h-9" },
  { name: "Microsoft Dynamics 365", logo: dynamicsLogo, className: "h-8" },
  { name: "Snowflake", logo: snowflakeLogo, className: "h-7" },
  { name: "Databricks", logo: databricksLogo, className: "h-7" },
  { name: "FIS", logo: fisLogo, className: "h-7" },
  { name: "Fiserv", logo: fiservLogo, className: "h-8" },
  { name: "Jack Henry", logo: jackHenryLogo, className: "h-7" },
];

const IntegrationProof = () => {
  return (
    <section id="integration" className="v2-rule-t bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-10 max-w-4xl">
            <h2 className="v2-display text-3xl md:text-[56px]">Built for the systems banks already run.</h2>
            <p className="v2-body mt-5 max-w-xl text-base md:text-lg">
              Sanctioned data in. One task out. No core changes.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-gray-200 sm:grid-cols-4 lg:grid-cols-7" style={{ borderColor: "var(--v2-rule)" }}>
            {ecosystem.map((partner, index) => (
              <div
                key={partner.name}
                className={`flex min-h-24 items-center justify-center bg-white px-5 py-6 ${
                  index === ecosystem.length - 1 ? "col-span-2 sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className={`${partner.className} max-w-full object-contain grayscale opacity-60 transition duration-300 hover:opacity-100 hover:grayscale-0`}
                />
              </div>
            ))}
          </div>

        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntegrationProof;
