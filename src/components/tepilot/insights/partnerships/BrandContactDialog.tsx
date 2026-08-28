import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Loader2, Mail, MapPin, Phone, Search, Sparkles, User } from "lucide-react";
import { resolveBrandContact, buildOutreachDraft } from "@/lib/merchantPartnershipData";
import { cn } from "@/lib/utils";

export interface ContactTarget {
  brand: string;
  scope: "national" | "local";
  metroId?: string;
  cardholders: number;
  annualSpend: number;
  estimatedValue: number;
  dealConstruct: string;
  reason: string;
}

const STAGES = [
  "Scanning corporate directory",
  "Matching partnerships org chart",
  "Cross-checking public filings",
  "Verifying role and contact route",
];

interface Props {
  target: ContactTarget | null;
  onClose: () => void;
}

export function BrandContactDialog({ target, onClose }: Props) {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    setStage(0);
    setDone(false);
    setCopied(null);
    const timers = STAGES.map((_, i) => window.setTimeout(() => setStage(i + 1), 420 * (i + 1)));
    const finish = window.setTimeout(() => setDone(true), 420 * STAGES.length + 260);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [target]);

  if (!target) return null;

  const contact = resolveBrandContact(target.brand, target.scope, target.metroId);
  const draft = buildOutreachDraft({
    brand: target.brand,
    contactFirstName: contact.name.split(" ")[0],
    cardholders: target.cardholders,
    annualSpend: target.annualSpend,
    estimatedValue: target.estimatedValue,
    dealConstruct: target.dealConstruct,
    reason: target.reason,
  });

  const copy = (value: string, key: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto tepilot-popup bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-1.5 rounded-md bg-blue-50 border border-blue-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            Contact finder · {target.brand}
          </DialogTitle>
        </DialogHeader>

        {!done ? (
          <div className="space-y-2.5 py-4">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-2.5 text-sm">
                {i < stage ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : i === stage ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-slate-300" />
                )}
                <span className={cn(i <= stage ? "text-slate-700" : "text-slate-400")}>{s}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                    <p className="text-xs text-slate-500">{contact.title}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                  {contact.confidence}% match
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                <button onClick={() => copy(contact.email, "email")} className="flex items-center gap-2 hover:text-slate-900 text-left">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {contact.email}
                  {copied === "email" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-300" />}
                </button>
                <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {contact.phone}</span>
                <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {contact.location}</span>
                <span className="flex items-center gap-2 text-slate-400">{contact.linkedin}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Matched from</p>
                <ul className="mt-1 space-y-0.5">
                  {contact.sources.map((s) => (
                    <li key={s} className="text-[11px] text-slate-500">· {s}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-400 mt-2">Last verified {contact.lastVerified}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/60">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Backup contact</p>
              <p className="text-xs text-slate-700 font-medium">{contact.alternate.name} · <span className="font-normal text-slate-500">{contact.alternate.title}</span></p>
              <p className="text-[11px] text-slate-500">{contact.alternate.email}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Suggested outreach</p>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => copy(draft, "draft")}>
                  {copied === "draft" ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied === "draft" ? "Copied" : "Copy draft"}
                </Button>
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap rounded-lg border border-slate-200 p-3 bg-white font-sans">
                {draft}
              </pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
