import { useMemo, useState } from "react";
import { Settings } from "lucide-react";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePricingCatalog } from "@/lib/pricingCatalog";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import ModuleCard from "@/components/pricing/ModuleCard";
import PricingSummary from "@/components/pricing/PricingSummary";
import AdminFeeEditorDialog from "@/components/pricing/AdminFeeEditorDialog";
import EmailDraftDialog from "@/components/pricing/EmailDraftDialog";
import { toast } from "sonner";

function PricingInner() {
  const { catalog, updateModule, resetToDefaults } = usePricingCatalog();
  const [bankName, setBankName] = useState("");
  const [customers, setCustomers] = useState<number>(1_000_000);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adminOpen, setAdminOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const enabledCatalog = useMemo(() => catalog.filter((m) => m.enabled), [catalog]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedModules = enabledCatalog.filter((m) => selected.has(m.id));
  const totalFixed = selectedModules.reduce((s, m) => s + m.fixedFee, 0);
  const totalVariable = selectedModules.reduce((s, m) => s + m.perUserFee * customers, 0);
  const grandTotal = totalFixed + totalVariable;
  const perCustomer = customers > 0 ? grandTotal / customers : 0;

  const buildSummaryText = () => {
    const lines: string[] = [];
    lines.push(`Ventus AI — Indicative Proposal`);
    if (bankName) lines.push(`Prepared for: ${bankName}`);
    lines.push(`Customer base: ${formatNumber(customers)}`);
    lines.push("");
    lines.push("Selected modules:");
    selectedModules.forEach((m) => {
      const line = m.fixedFee + m.perUserFee * customers;
      lines.push(
        `  • ${m.name} — Fixed ${formatCurrency(m.fixedFee)} + ${formatNumber(customers)} × $${m.perUserFee.toFixed(
          2
        )} = ${formatCurrency(line)} / yr`
      );
    });
    lines.push("");
    lines.push(`Fixed platform fees:  ${formatCurrency(totalFixed)}`);
    lines.push(`Per-user fees:        ${formatCurrency(totalVariable)}`);
    lines.push(`Total / year:         ${formatCurrency(grandTotal)}`);
    lines.push(`Effective $/customer: $${perCustomer.toFixed(2)}`);
    if (notes.trim()) {
      lines.push("");
      lines.push("Notes:");
      lines.push(notes.trim());
    }
    return lines.join("\n");
  };

  const buildEmailBody = () => {
    const greeting = contactName ? `Hi ${contactName},` : "Hi,";
    const intro = bankName
      ? `Following up on our conversation — here is an indicative pricing draft for ${bankName} based on a customer base of ${formatNumber(
          customers
        )}.`
      : `Following up on our conversation — here is an indicative pricing draft based on a customer base of ${formatNumber(
          customers
        )}.`;
    return [
      greeting,
      "",
      intro,
      "",
      buildSummaryText(),
      "",
      "Happy to walk through any of these line items, adjust scope, or tailor the structure to your procurement preferences.",
      "",
      "Best,",
      "The Ventus AI Team",
    ].join("\n");
  };

  const handleCopy = async () => {
    if (selectedModules.length === 0) {
      toast.error("Select at least one module");
      return;
    }
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      toast.success("Summary copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleEmail = () => {
    if (selectedModules.length === 0) {
      toast.error("Select at least one module");
      return;
    }
    if (!contactEmail || !contactEmail.includes("@")) {
      toast.error("Add a prospect email first");
      return;
    }
    setEmailOpen(true);
  };

  const subject = bankName
    ? `Ventus AI — Indicative pricing for ${bankName}`
    : "Ventus AI — Indicative pricing draft";

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ventusLogo} alt="Ventus AI" className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-7 w-auto" />
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">Pricing Builder</span>
          </div>
          <button
            onClick={() => setAdminOpen(true)}
            className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
            title="Edit module pricing"
          >
            <Settings className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 w-4 h-4" />
            Admin
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        {/* Left: inputs */}
        <section className="col-span-12 lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Prospect</p>
            <div>
              <label className="text-xs font-medium text-slate-600">Bank name</label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. First National Bank"
                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Number of customers</label>
              <Input
                type="number"
                min={0}
                value={customers}
                onChange={(e) => setCustomers(Number(e.target.value) || 0)}
                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1"
              />
              <p className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-[11px] text-slate-400 mt-1">{formatNumber(customers)} customers</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Contact name</label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Contact email</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="sarah@bank.com"
                  className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Procurement notes, scope caveats, timing…"
                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1 min-h-[80px] text-sm"
              />
            </div>
          </div>

          <PricingSummary
            totalFixed={totalFixed}
            totalVariable={totalVariable}
            grandTotal={grandTotal}
            customers={customers}
            selectedCount={selectedModules.length}
            onCopy={handleCopy}
            onEmail={handleEmail}
          />
        </section>

        {/* Right: modules */}
        <section className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">À la carte modules</p>
              <p className="text-sm text-slate-600">Click each module to include it in the proposal.</p>
            </div>
            <p className="text-xs text-slate-400">
              {selectedModules.length} of {enabledCatalog.length} selected
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enabledCatalog.map((m) => (
              <ModuleCard
                key={m.id}
                module={m}
                selected={selected.has(m.id)}
                customers={customers}
                onToggle={() => toggle(m.id)}
              />
            ))}
          </div>
        </section>
      </main>

      <AdminFeeEditorDialog
        open={adminOpen}
        onOpenChange={setAdminOpen}
        catalog={catalog}
        updateModule={updateModule}
        resetToDefaults={resetToDefaults}
      />
      <EmailDraftDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        defaultTo={contactEmail}
        defaultSubject={subject}
        defaultBody={buildEmailBody()}
      />
    </div>
  );
}

export default function Pricing() {
  return (
    <SimplePasswordGate tagline="Pricing Builder">
      <PricingInner />
    </SimplePasswordGate>
  );
}
