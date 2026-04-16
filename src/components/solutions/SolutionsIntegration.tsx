import salesforceLogo from "@/assets/salesforce-logo.png";

interface Props {
  extraLabels?: string[];
}

const SolutionsIntegration = ({ extraLabels = [] }: Props) => (
  <section className="bg-white py-16">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Works with your stack</p>
      <p className="text-base text-gray-500 max-w-xl mx-auto mb-10">
        Intelligence flows into the tools your team already uses — no new software required.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-10">
        <img src={salesforceLogo} alt="Salesforce" className="h-8 w-auto" />
        {extraLabels.map((label) => (
          <span key={label} className="text-sm font-semibold text-gray-400 tracking-wide">{label}</span>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionsIntegration;
