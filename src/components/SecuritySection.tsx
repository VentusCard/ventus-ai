import ScrollReveal from "@/components/ScrollReveal";
import { Lock, Shield, Building2, Check } from "lucide-react";

const items = [
  { icon: Lock, title: "Encrypted at every layer", desc: "AES-256 at rest, TLS in transit" },
  { icon: Shield, title: "Private infrastructure", desc: "VPC isolated, no public endpoints" },
  { icon: Building2, title: "Multi-tenant isolation", desc: "Each bank's data completely separated" },
  { icon: Check, title: "Zero PII stored", desc: "Transaction signals only" },
];

const SecuritySection = () => (
  <section style={{ backgroundColor: "#F9FAFB", paddingTop: 56, paddingBottom: 56 }}>
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <ScrollReveal>
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">Security</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 max-w-2xl">
          Built for the security requirements of financial institutions.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-8">
          SOC 2 controls in place · Formal certification in progress · Enterprise-grade cloud infrastructure
        </p>
      </ScrollReveal>
    </div>
  </section>
);

export default SecuritySection;
