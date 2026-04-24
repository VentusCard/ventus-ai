import { GitBranch, ScanSearch, UserRound } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const problemColumns = [
  {
    title: "Fragmented across rails",
    description: "Card networks, checks, wires, and Zelle each speak a different language.",
    icon: GitBranch,
  },
  {
    title: "MCCs are too vague",
    description: "Rigid category codes miss the nuance of how people actually spend.",
    icon: ScanSearch,
  },
  {
    title: "No behavioral layer",
    description: "Raw transactions tell you what was spent — not who the customer is.",
    icon: UserRound,
  },
];

const ProblemStatementSection = () => {
  return (
    <section style={{ paddingTop: 80, paddingBottom: 80 }} className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">THE PROBLEM</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 max-w-4xl mx-auto leading-tight">
            Banks are sitting on petabytes of behavioral data they can't use.
          </h2>

          <div className="grid gap-6 md:grid-cols-3 mt-12 text-left">
            {problemColumns.map((column) => {
              const Icon = column.icon;

              return (
                <div
                  key={column.title}
                  className="rounded-[12px] border p-6"
                  style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}
                >
                  <Icon className="w-5 h-5 text-blue-600 mb-4" />
                  <p className="text-base font-semibold text-gray-900 mb-2">{column.title}</p>
                  <p className="text-sm leading-relaxed text-gray-500">{column.description}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-base text-gray-500 italic">
            Ventus is the intelligence layer that bridges the gap.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ProblemStatementSection;