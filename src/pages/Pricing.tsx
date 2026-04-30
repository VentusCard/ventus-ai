import { useMemo, useState } from "react";
import { Settings, Check, Mail, Copy } from "lucide-react";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePricingCatalog } from "@/lib/pricingCatalog";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import AdminFeeEditorDialog from "@/components/pricing/AdminFeeEditorDialog";
import EmailDraftDialog from "@/components/pricing/EmailDraftDialog";
import { toast } from "sonner";

const LIGHT_INPUT = "bg-white text-slate-900 border-slate-200 placeholder:text-slate-400";

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
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ventusLogo} alt="Ventus AI" className="h-7 w-auto" />
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">Pricing Builder</span>
          </div>
          <button
            onClick={() => setAdminOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm bg-white"
            title="Edit module pricing"
          >
            <Settings className="w-4 h-4" />
            Admin
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Section 1: Prospect basics */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Step 1 · Prospect
          </p>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Who are we pricing for?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Bank name
              </label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. First National Bank"
                className={`mt-2 h-12 text-base ${LIGHT_INPUT}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Number of customers
              </label>
              <Input
                type="number"
                min={0}
                value={customers}
                onChange={(e) => setCustomers(Number(e.target.value) || 0)}
                className={`mt-2 h-12 text-base ${LIGHT_INPUT}`}
              />
              <p className="text-sm text-slate-500 mt-2">{formatNumber(customers)} customers</p>
            </div>
          </div>
        </section>

        {/* Section 2: A la carte modules */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-8 pt-8 pb-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Step 2 · Modules
            </p>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">À la carte menu</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Click a row to include it in the proposal.
                </p>
              </div>
              <p className="text-xs text-slate-400 shrink-0">
                {selectedModules.length} of {enabledCatalog.length} selected
              </p>
            </div>
          </div>

          {/* Header row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 border-y border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <div className="col-span-4">Function</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-1 text-right">Fixed / yr</div>
            <div className="col-span-2 text-right">Per user / yr</div>
            <div className="col-span-1 text-right">Line / yr</div>
            <div className="col-span-1 text-right">Add</div>
          </div>

          <ul className="divide-y divide-slate-100">
            {enabledCatalog.map((m) => {
              const isSel = selected.has(m.id);
              const lineTotal = m.fixedFee + m.perUserFee * customers;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    className={`w-full text-left px-8 py-4 grid grid-cols-12 gap-4 items-center transition-colors ${
                      isSel ? "bg-blue-50/40" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="col-span-12 md:col-span-4">
                      <p className="text-[15px] font-semibold text-slate-900 leading-tight">
                        {m.name}
                      </p>
                      <p className="md:hidden text-xs text-slate-500 mt-1">{m.description}</p>
                    </div>
                    <div className="hidden md:block col-span-3 text-[13px] text-slate-500 leading-snug">
                      {m.description}
                    </div>
                    <div className="col-span-4 md:col-span-1 text-right">
                      <span className="md:hidden text-[10px] uppercase tracking-wider text-slate-400 mr-1">
                        Fixed
                      </span>
                      <span className="text-[13px] font-semibold text-slate-800">
                        {formatCurrency(m.fixedFee)}
                      </span>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-right">
                      <span className="md:hidden text-[10px] uppercase tracking-wider text-slate-400 mr-1">
                        Per user
                      </span>
                      <span className="text-[13px] font-semibold text-slate-800">
                        ${m.perUserFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-4 md:col-span-1 text-right">
                      <span className="md:hidden text-[10px] uppercase tracking-wider text-slate-400 mr-1">
                        Line
                      </span>
                      <span
                        className={`text-[14px] font-bold ${
                          isSel ? "text-blue-700" : "text-slate-500"
                        }`}
                      >
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex md:justify-end">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSel
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSel && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Totals footer */}
          <div className="px-8 py-5 border-t border-slate-200 bg-slate-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Fixed fees
                </p>
                <p className="text-slate-900 font-semibold mt-1">{formatCurrency(totalFixed)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Per-user fees
                </p>
                <p className="text-slate-900 font-semibold mt-1">{formatCurrency(totalVariable)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  $/customer/yr
                </p>
                <p className="text-slate-900 font-semibold mt-1">${perCustomer.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Total / year
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Contact + send */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Step 3 · Send draft
          </p>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Email this proposal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Contact name
              </label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className={`mt-2 h-11 ${LIGHT_INPUT}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Contact email
              </label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sarah@bank.com"
                className={`mt-2 h-11 ${LIGHT_INPUT}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Procurement notes, scope caveats, timing…"
                className={`mt-2 min-h-[100px] text-sm ${LIGHT_INPUT}`}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              <Copy className="w-4 h-4" /> Copy summary
            </button>
            <button
              onClick={handleEmail}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" /> Email draft to prospect
            </button>
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
