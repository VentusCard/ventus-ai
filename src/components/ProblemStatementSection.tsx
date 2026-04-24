import ScrollReveal from "@/components/ScrollReveal";

const ProblemStatementSection = () => {
  return (
    <section style={{ paddingTop: 64, paddingBottom: 64 }} className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 max-w-4xl mx-auto leading-tight">
            Behind every transaction is a person. The data just doesn't show it.
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-4xl mx-auto leading-relaxed">
            Fragmented rails, vague MCCs, and no behavioral layer — that's why banking personalization fails.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ProblemStatementSection;