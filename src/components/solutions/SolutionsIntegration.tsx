import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";
import salesforceLogo from "@/assets/salesforce-logo.png";

const logos = [
  { name: "Salesforce", src: salesforceLogo, h: "h-8" },
  { name: "FIS", src: fisLogo, h: "h-6" },
  { name: "Fiserv", src: fiservLogo, h: "h-7" },
  { name: "Jack Henry", src: jackHenryLogo, h: "h-6" },
  { name: "Databricks", src: databricksLogo, h: "h-6" },
  { name: "Snowflake", src: snowflakeLogo, h: "h-6" },
];

const SolutionsIntegration = () => (
  <section className="bg-white py-16">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Works with your stack</p>
      <p className="text-base text-gray-500 max-w-xl mx-auto mb-10">
        Offers surface through Salesforce, your existing rewards engine, or directly via API.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-10">
        {logos.map(({ name, src, h }) => (
          <img key={name} src={src} alt={name} className={`${h} w-auto grayscale opacity-60`} />
        ))}
      </div>
    </div>
  </section>
);

export default SolutionsIntegration;
