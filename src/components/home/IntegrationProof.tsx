import ScrollReveal from "@/components/ScrollReveal";
import salesforceLogo from "@/assets/salesforce-logo.png";
import dynamicsLogo from "@/assets/dynamics-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import fisLogo from "@/assets/fis-logo.svg";

const ecosystemGroups = [
  {
    label: "CRM & activation",
    partners: [
      { name: "Salesforce", logo: salesforceLogo, className: "h-9" },
      { name: "Microsoft Dynamics 365", logo: dynamicsLogo, className: "h-8" },
    ],
  },
  {
    label: "Data platforms",
    partners: [
      { name: "Snowflake", logo: snowflakeLogo, className: "h-7" },
      { name: "Databricks", logo: databricksLogo, className: "h-7" },
    ],
  },
  {
    label: "Core systems",
    partners: [
      { name: "FIS", logo: fisLogo, className: "h-7" },
      { name: "Fiserv", logo: fiservLogo, className: "h-8" },
      { name: "Jack Henry", logo: jackHenryLogo, className: "h-7" },
    ],
  },
];

const IntegrationProof = () => {
  return (
    <section id="integration" className="v2-rule-t bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-10 max-w-4xl">
            <h2 className="v2-display text-3xl md:text-[56px]">
              Designed for the systems banks already run.
            </h2>
            <p className="v2-body mt-5 max-w-2xl text-base md:text-lg">
              Sanctioned data in. Governed actions out. No core replacement.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div
            className="grid overflow-hidden rounded-lg border bg-white lg:grid-cols-[2fr_2fr_3fr]"
            style={{ borderColor: "var(--v2-rule)" }}
          >
            {ecosystemGroups.map((group, groupIndex) => (
              <div
                key={group.label}
                className={groupIndex > 0 ? "border-t lg:border-l lg:border-t-0" : ""}
                style={{ borderColor: "var(--v2-rule)" }}
              >
                <p
                  className="v2-mono border-b px-4 py-3 text-[10px] font-semibold uppercase"
                  style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-faint)" }}
                >
                  {group.label}
                </p>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: `repeat(${group.partners.length}, minmax(0, 1fr))` }}
                >
                  {group.partners.map((partner, partnerIndex) => (
                    <div
                      key={partner.name}
                      className={`flex min-h-24 items-center justify-center px-4 py-6 ${
                        partnerIndex > 0 ? "border-l" : ""
                      }`}
                      style={{ borderColor: "var(--v2-rule)" }}
                    >
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className={`${partner.className} max-w-full object-contain opacity-75 grayscale contrast-125 transition duration-300 hover:opacity-100 hover:grayscale-0 hover:contrast-100`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntegrationProof;
