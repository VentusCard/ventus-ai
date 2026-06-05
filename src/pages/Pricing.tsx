import SEO from "@/components/SEO";
import { useMemo, useState } from "react";
import { Settings, Check, Mail, Zap } from "lucide-react";
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
  const { catalog, updateModule, resetToDefaults, pilot, updatePilot } = usePricingCatalog();
  const [bankName, setBankName] = useState("");
  const [customers, setCustomers] = useState<number>(1_000_000);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pilotMode, setPilotMode] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const enabledCatalog = useMemo(() => catalog.filter((m) => m.enabled), [catalog]);
  const pilotPerModule = enabledCatalog.length > 0 ? pilot.flatFee / enabledCatalog.length : 0;

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
    if (pilotMode) {
      lines.push("");
      lines.push(
        `6-month pilot: ${formatNumber(pilot.customers)} customers · all modules · ${formatCurrency(
          pilot.flatFee
        )} flat (6 months)`
      );
    }
    if (contactPhone.trim()) {
      lines.push("");
      lines.push(`Contact phone: ${contactPhone.trim()}`);
    }
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
    <div
      className="h-screen overflow-hidden bg-slate-50 flex flex-col"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-[1480px] mx-auto px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ventusLogo} alt="Ventus AI" className="h-6 w-auto" />
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">Pricing Builder</span>
          </div>
          <button
            onClick={() => setAdminOpen(true)}
            className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs bg-white"
            title="Edit module pricing"
          >
            <Settings className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-[1480px] w-full mx-auto px-8 py-3 flex flex-col gap-3">
        {/* Section 1: Prospect basics */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-3 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Step 1 · Prospect
            </span>
            
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide w-20 shrink-0">
                Bank
              </label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. First National Bank"
                className={`h-10 text-base ${LIGHT_INPUT}`}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide w-20 shrink-0">
                Customers
              </label>
              <Input
                type="text"
                inputMode="numeric"
                value={customers ? customers.toLocaleString("en-US") : ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^\d]/g, "");
                  setCustomers(digits ? Number(digits) : 0);
                }}
                className={`h-10 text-base ${LIGHT_INPUT}`}
              />
              <button
                type="button"
                onClick={() => setPilotMode((v) => !v)}
                title={`6-month pilot: ${formatNumber(pilot.customers)} customers · ${formatCurrency(pilot.flatFee)} flat for 6 months`}
                className={`shrink-0 inline-flex items-center gap-1.5 h-10 px-3 rounded-md text-sm font-semibold border transition-colors ${
                  pilotMode
                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-4 h-4" /> 6-Month Pilot
              </button>
              {pilotMode && (
                <div className="shrink-0 inline-flex items-center gap-2 h-10 px-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600">
                    6-month pilot
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {formatNumber(pilot.customers)}
                  </span>
                  <span className="text-[11px] text-emerald-700/70">customers</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: A la carte modules — flex-1, internal scroll */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="px-5 pt-3 pb-2 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Step 2 · Modules
              </span>
              
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedModules.length} of {enabledCatalog.length} selected
            </p>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-12 gap-3 px-5 py-2 border-y border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold shrink-0">
            <div className={pilotMode ? "col-span-3" : "col-span-3"}>Function</div>
            <div className={pilotMode ? "col-span-3" : "col-span-4"}>Description</div>
            {pilotMode && (
              <div className="col-span-1 text-right">
                Pilot (6mo)
                <div className="text-[9px] normal-case tracking-normal text-slate-400 font-normal">
                  Flat fee
                </div>
              </div>
            )}
            <div className="col-span-1 text-right">Fixed/yr</div>
            <div className="col-span-2 text-right">Per user/yr</div>
            <div className="col-span-1 text-right">Line/yr</div>
            <div className="col-span-1 text-right">Add</div>
          </div>

          <div className="relative flex-1 min-h-0">
            <ul className="divide-y divide-slate-100 h-full overflow-y-auto">
              {enabledCatalog.map((m) => {
                const isSel = selected.has(m.id);
                const lineTotal = m.fixedFee + m.perUserFee * customers;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`w-full text-left px-5 py-2.5 grid grid-cols-12 gap-3 items-center transition-colors ${
                        isSel ? "bg-blue-50/40" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="col-span-3">
                        <p className="text-[14px] font-semibold text-slate-900 leading-tight truncate">
                          {m.name}
                        </p>
                      </div>
                      <div className={`${pilotMode ? "col-span-3" : "col-span-4"} text-[14px] text-slate-500 leading-snug truncate`}>
                        {m.description}
                      </div>
                      {pilotMode && <div className="col-span-1" />}
                      <div className="col-span-1 text-right text-[14px] font-semibold text-slate-800">
                        {formatCurrency(m.fixedFee)}
                      </div>
                      <div className="col-span-2 text-right text-[14px] font-semibold text-slate-800">
                        ${m.perUserFee.toFixed(2)}
                      </div>
                      <div className="col-span-1 text-right">
                        <span
                          className={`text-[14px] font-bold ${
                            isSel ? "text-blue-700" : "text-slate-500"
                          }`}
                        >
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSel
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSel && <Check className="w-3 h-3" strokeWidth={3} />}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {pilotMode && (
              <div
                className="pointer-events-none absolute inset-0 px-5 py-2.5 grid grid-cols-12 gap-3"
                aria-hidden="true"
              >
                <div className="col-span-3" />
                <div className="col-span-3" />
                <div className="col-span-1 -my-2.5 flex flex-col items-center justify-center text-center border-x border-emerald-200 bg-emerald-50/70">
                  <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={3} />
                  <span className="text-[14px] font-bold text-emerald-700 leading-tight tabular-nums mt-0.5">
                    {formatCurrency(pilot.flatFee)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-600/80 font-semibold mt-0.5">
                    Flat · 6 months · all modules
                  </span>
                </div>
                <div className="col-span-1" />
                <div className="col-span-2" />
                <div className="col-span-1" />
                <div className="col-span-1" />
              </div>
            )}
          </div>

          {/* Totals strip */}
          <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-6 shrink-0">
            <div className="flex items-center gap-6 text-[14px]">
              {pilotMode && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold">
                    Pilot (6mo)
                  </span>
                  <span className="text-emerald-700 font-semibold">{formatCurrency(pilot.flatFee)}</span>
                </div>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Fixed
                </span>
                <span className="text-slate-900 font-semibold">{formatCurrency(totalFixed)}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Per-user
                </span>
                <span className="text-slate-900 font-semibold">{formatCurrency(totalVariable)}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  $/cust
                </span>
                <span className="text-slate-900 font-semibold">${perCustomer.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total / year
              </span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </section>

        {/* Section 3: Contact + send */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-3 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Step 3 · Send draft
            </span>
            
            
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Contact name
              </label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className={`h-10 text-base ${LIGHT_INPUT}`}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Contact email
              </label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sarah@bank.com"
                className={`h-10 text-base ${LIGHT_INPUT}`}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Contact phone
              </label>
              <Input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`h-10 text-base ${LIGHT_INPUT}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Procurement notes, scope caveats, timing…"
                className={`min-h-[40px] h-10 py-2 text-base resize-none ${LIGHT_INPUT}`}
              />
            </div>
            <button
              onClick={handleEmail}
              className="inline-flex items-center justify-center gap-2 h-10 w-full rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" /> Email proposal
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
        pilot={pilot}
        updatePilot={updatePilot}
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
      <SEO title="Pricing — Ventus AI" description="Build a custom Ventus AI pricing estimate by selecting modules and your institution's scale." path="/pricing" />
      <PricingInner />
    </SimplePasswordGate>
  );
}
