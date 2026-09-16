import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  Gift,
  Home,
  Mail,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DECKMO } from "@/lib/deckmoScript";

type SceneProps = { step: number };

const FAMILY = {
  Behavioral: "border-blue-200 bg-blue-50 text-blue-700",
  "Life Event": "border-amber-200 bg-amber-50 text-amber-700",
  Financial: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Demographic: "border-violet-200 bg-violet-50 text-violet-700",
  Risk: "border-rose-200 bg-rose-50 text-rose-700",
} as const;

function Reveal({ show, delay = 0, children, className }: { show: boolean; delay?: number; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("transition-all duration-500 motion-reduce:transition-none", show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", className)}
      style={{ transitionDelay: show ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function SceneHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="max-w-[520px]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(34px,3.5vw,58px)] font-bold leading-[1.04] tracking-normal text-slate-950">{title}</h2>
      <p className="mt-4 text-[clamp(15px,1.2vw,19px)] leading-relaxed text-slate-600">{subtitle}</p>
    </header>
  );
}

function PhoneShell({ active, children }: { active: "Activity" | "Rewards" | "Membership" | "AI"; children: React.ReactNode }) {
  const nav = DECKMO.phoneNavigation;
  const icons = { Activity: CreditCard, Rewards: Gift, Membership: Users, AI: Bot } as const;
  return (
    <div className="mx-auto flex h-[610px] w-[344px] flex-col overflow-hidden rounded-[32px] border-[9px] border-slate-300 bg-white shadow-2xl">
      <div className="flex h-7 shrink-0 items-center justify-center bg-white"><span className="h-2 w-2 rounded-full bg-slate-300" /></div>
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2">
        <span className="text-[9px] font-semibold text-slate-400">{DECKMO.chrome.phoneTime}</span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{nav.bankLabel}</span>
        <span className="text-[9px] text-slate-400">{DECKMO.chrome.phoneMenu}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-white">{children}</div>
      <div className="grid shrink-0 grid-cols-4 border-t border-slate-200 bg-slate-50/80 px-1">
        {nav.tabs.map((tab) => {
          const Icon = icons[tab];
          const isActive = tab === active;
          return (
            <div key={tab} className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[8px] font-semibold", isActive ? "text-blue-600" : "text-slate-400")}>
              {isActive && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-blue-600" />}
              <Icon className="h-3.5 w-3.5" />
              <span>{tab}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalloutRail({ items, step }: { items: readonly string[] | readonly { title: string; body: string }[]; step: number }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const title = typeof item === "string" ? item : item.title;
        const body = typeof item === "string" ? null : item.body;
        return (
          <Reveal key={title} show={step >= index}>
            <div className={cn("rounded-xl border p-4", step === index ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white")}>
              <div className="flex gap-3">
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", step === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>{index + 1}</span>
                <div><p className="text-sm font-bold text-slate-900">{title}</p>{body && <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>}</div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

function ActivityPhone({ step }: SceneProps) {
  const d = DECKMO.immediate;
  return (
    <PhoneShell active="Activity">
      <div className="h-full overflow-hidden px-3 py-3">
        <div className="mb-3 flex items-end justify-between">
          <div><p className="text-[13px] font-bold text-slate-900">{d.phoneTitle}</p><p className="text-[9px] text-slate-400">{d.account}</p></div>
          <span className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500"><Search className="h-3 w-3" /></span>
        </div>
        <div className="space-y-2">
          {d.transactions.map((tx, index) => (
            <div key={tx.raw} className={cn("rounded-xl border p-3 transition-colors", step >= index ? "border-blue-200 bg-blue-50/60" : "border-slate-100 bg-white")}>
              <div className="flex items-start gap-2.5">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", step >= index ? "bg-white text-blue-600" : "bg-slate-100 text-slate-400")}>
                  {index === 2 ? <Plane className="h-4 w-4" /> : index === 3 ? <Home className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[8px] text-slate-400">{tx.raw}</p>
                  {step >= index && <><p className="mt-0.5 text-[11px] font-bold text-slate-800">{tx.clean}</p><p className="text-[8px] text-slate-500">{tx.meta}</p><span className="mt-1.5 inline-flex rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[7px] font-bold text-blue-700">{tx.badge}</span></>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {step >= 3 && (
          <Reveal show className="absolute inset-x-5 bottom-[84px]">
            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-600" /><p className="text-[11px] font-bold text-slate-900">{d.explainer.title}</p></div>
              <p className="mt-2 text-[9px] leading-relaxed text-slate-500">{d.explainer.body}</p>
              <div className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-center text-[9px] font-bold text-white">{d.explainer.action}</div>
            </div>
          </Reveal>
        )}
      </div>
    </PhoneShell>
  );
}

function RewardsPhone({ step }: SceneProps) {
  const d = DECKMO.midTerm;
  const mode = step < 3 ? "rewards" : step === 3 ? "product" : "delivery";
  return (
    <PhoneShell active={mode === "rewards" ? "Rewards" : "Membership"}>
      <div className="h-full overflow-hidden p-3">
        {mode === "rewards" && <>
          <div className="flex items-center justify-between"><div><p className="text-[13px] font-bold text-slate-900">{d.phoneTitle}</p><p className="text-[9px] text-slate-400">{d.rewardsIntro}</p></div><Gift className="h-5 w-5 text-emerald-500" /></div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
            <div className="h-20 bg-sky-100 p-3"><Plane className="h-7 w-7 text-blue-600" /></div>
            <div className="p-3"><p className="text-[8px] font-bold tracking-wider text-blue-700">{d.topPick.label}</p><p className="mt-1 text-[15px] font-bold text-slate-900">{d.topPick.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-600">{d.topPick.body}</p><p className="mt-2 text-[10px] font-bold text-blue-700">{d.topPick.benefit}</p></div>
          </div>
          {step >= 1 && <Reveal show><div className="mt-3 flex gap-1.5 overflow-hidden">{d.categories.map((category, index) => <span key={category} className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-semibold", index === 0 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500")}>{category}</span>)}</div></Reveal>}
          {step >= 2 && <Reveal show><div className="mt-3 grid grid-cols-2 gap-2">{d.deals.slice(0, 2).map((deal) => <div key={deal.title} className="rounded-xl border border-slate-200 bg-white p-2.5"><p className="text-[10px] font-bold text-slate-800">{deal.title}</p><p className="mt-1 text-[8px] leading-relaxed text-slate-500">{deal.detail}</p><span className="mt-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[7px] font-bold text-blue-700">{deal.family}</span></div>)}</div></Reveal>}
        </>}
        {mode === "product" && <Reveal show><div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /><p className="text-[11px] font-semibold text-slate-600">{d.product.personalized}</p></div><div className="mt-4 rounded-2xl border-t-[3px] border-amber-400 bg-amber-50 p-5 shadow-md"><Home className="h-8 w-8 text-amber-600" /><p className="mt-4 text-lg font-bold text-slate-900">{d.product.title}</p><p className="mt-2 text-[11px] leading-relaxed text-slate-600">{d.product.body}</p><div className="mt-4 space-y-2">{d.product.benefits.map((benefit) => <div key={benefit} className="flex items-center gap-2 text-[10px] font-semibold text-slate-700"><Check className="h-3.5 w-3.5 text-amber-600" />{benefit}</div>)}</div><p className="mt-5 text-sm font-bold text-amber-700">{d.product.benefit}</p><div className="mt-4 rounded-xl bg-amber-500 py-2.5 text-center text-[10px] font-bold text-white">{d.product.action}</div></div></div></Reveal>}
        {mode === "delivery" && <Reveal show><div><div className="flex items-center justify-between border-b border-slate-100 pb-2"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /><span className="text-[10px] font-bold text-slate-600">{d.delivery.inbox}</span></div><span className="text-[9px] text-slate-400">{d.delivery.time}</span></div><p className="mt-4 text-sm font-bold text-slate-900">{d.delivery.subject}</p><p className="mt-2 text-[10px] text-slate-500">{d.delivery.from}</p><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">{d.delivery.label}</p><p className="mt-2 text-base font-bold text-slate-900">{d.product.title}</p><p className="mt-2 text-[10px] leading-relaxed text-slate-600">{d.delivery.body}</p><div className="mt-4 rounded-lg bg-amber-500 py-2 text-center text-[9px] font-bold text-white">{d.product.action}</div></div><div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[9px] font-bold text-slate-700">{d.placement.title}</p><div className="mt-2 flex flex-wrap gap-1.5">{d.placement.channels.map((channel) => <span key={channel} className="rounded-md bg-white px-2 py-1 text-[8px] text-slate-500">{channel}</span>)}</div></div></div></Reveal>}
      </div>
    </PhoneShell>
  );
}

function RelationshipPhone({ step }: SceneProps) {
  const d = DECKMO.longTerm;
  return (
    <PhoneShell active={step === 2 ? "AI" : "Membership"}>
      <div className="h-full overflow-hidden p-3">
        <div><p className="text-[13px] font-bold text-slate-900">{d.welcome}</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-600">{d.memberStatus}</p></div>
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-blue-600" /><p className="text-[10px] font-bold text-slate-700">{d.snapshotTitle}</p></div><div className="mt-2 grid grid-cols-4 gap-1">{d.snapshot.map((item) => <div key={item.label} className="rounded-md border border-slate-100 bg-white px-1 py-2 text-center"><p className="text-[7px] text-slate-400">{item.label}</p><p className="mt-1 text-[9px] font-bold text-slate-800">{item.value}</p></div>)}</div></div>
        <Reveal show={step >= 0}><div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-[8px] font-bold tracking-wider text-amber-700">{d.event.label}</p><p className="mt-1 text-[12px] font-bold text-slate-900">{d.event.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-600">{d.event.body}</p></div></Reveal>
        {step >= 1 && <Reveal show><div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600"><UserRound className="h-4 w-4" /></span><div><p className="text-[8px] font-bold tracking-wider text-blue-700">{d.advisor.label}</p><p className="text-[11px] font-bold text-slate-900">{d.advisor.title}</p></div></div><p className="mt-2 text-[9px] leading-relaxed text-slate-600">{d.advisor.body}</p><div className="mt-2 flex gap-1.5">{d.advisor.actions.map((action) => <span key={action} className="rounded-md border border-blue-200 bg-white px-2 py-1 text-[8px] font-semibold text-blue-700">{action}</span>)}</div></div></Reveal>}
        {step >= 2 && <Reveal show><div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-emerald-600" /><p className="text-[8px] font-bold tracking-wider text-emerald-700">{d.outreach.label}</p></div><p className="mt-1 text-[11px] font-bold text-slate-900">{d.outreach.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-600">{d.outreach.body}</p><div className="mt-2 rounded-lg bg-emerald-600 py-2 text-center text-[9px] font-bold text-white">{d.outreach.action}</div></div></Reveal>}
      </div>
    </PhoneShell>
  );
}

export function BankdemoImmediate({ step }: SceneProps) {
  const d = DECKMO.immediate;
  return <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_380px_360px] items-center gap-10 px-12 py-12"><SceneHeader eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} /><ActivityPhone step={step} /><CalloutRail items={d.popups} step={step} /></div>;
}

export function BankdemoMidTerm({ step }: SceneProps) {
  const d = DECKMO.midTerm;
  return <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_380px_360px] items-center gap-10 px-12 py-12"><SceneHeader eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} /><RewardsPhone step={step} /><CalloutRail items={d.popups} step={step} /></div>;
}

export function BankdemoLongTerm({ step }: SceneProps) {
  const d = DECKMO.longTerm;
  return <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_380px_360px] items-center gap-10 px-12 py-12"><SceneHeader eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} /><RelationshipPhone step={step} /><CalloutRail items={d.popups} step={step} /></div>;
}

function AppWindow({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl"><div className="flex h-9 items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><div className="mx-auto h-5 w-1/2 rounded bg-white" /></div><div className="h-[510px]">{children}</div></div>;
}

function DatabaseScreen() {
  const d = DECKMO.bankTools.screens[0];
  return <div className="flex h-full flex-col bg-slate-50/50 p-4"><div className="flex gap-2">{d.sections.map((section, index) => <span key={section} className={cn("rounded-md px-3 py-1.5 text-[10px] font-semibold", index === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>{section}</span>)}</div><div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-indigo-600" /><div className="flex-1"><p className="text-[11px] font-bold text-slate-800">{d.priority.title}</p><p className="mt-0.5 text-[9px] text-slate-600">{d.priority.body}</p></div><span className="rounded-md bg-white px-3 py-1.5 text-[9px] font-bold text-indigo-700">{d.priority.action}</span></div></div><div className="mt-3 grid grid-cols-5 gap-2">{d.families.map((family) => <div key={family.label} className={cn("rounded-lg border bg-white p-3", FAMILY[family.label])}><span className="block h-1 w-7 rounded-full bg-current opacity-70" /><p className="mt-3 text-[10px] font-bold text-slate-800">{family.label}</p><p className="mt-1 text-2xl font-bold">{family.count}</p><p className="text-[8px] text-slate-400">{family.unit}</p></div>)}</div><div className="mt-3 grid min-h-0 flex-1 grid-cols-[1.5fr_1fr] gap-3"><div className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><p className="text-[11px] font-bold text-slate-800">{d.segment.title}</p><span className="text-[9px] font-bold text-blue-600">{d.segment.count}</span></div><div className="mt-2 space-y-2">{d.segment.rows.map((row) => <div key={row.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><span className={cn("h-2 w-2 rounded-full", row.dot)} /><span className="flex-1 text-[9px] font-semibold text-slate-700">{row.label}</span><span className="text-[8px] text-slate-400">{row.value}</span></div>)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[11px] font-bold text-slate-800">{d.accessTitle}</p><div className="mt-2 space-y-2">{d.actions.map((action, index) => <div key={action} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 text-[9px] font-semibold text-slate-600">{index === 0 ? <Users className="h-3.5 w-3.5 text-blue-600" /> : index === 1 ? <FileText className="h-3.5 w-3.5 text-blue-600" /> : <Bot className="h-3.5 w-3.5 text-blue-600" />}{action}</div>)}</div></div></div></div>;
}

function FlowsScreen() {
  const d = DECKMO.bankTools.screens[1];
  return <div className="flex h-full flex-col bg-slate-50/50 p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-900">{d.workspaceTitle}</p><p className="text-[9px] text-slate-500">{d.workspaceSubtitle}</p></div><span className="rounded-md bg-blue-600 px-3 py-2 text-[9px] font-bold text-white">{d.newFlow}</span></div><div className="mt-3 grid flex-1 grid-cols-[190px_1fr_230px] gap-3"><div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{d.productLabel}</p><div className="mt-2 space-y-2">{d.flows.map((flow, index) => <div key={flow.name} className={cn("rounded-lg border p-2.5", index === 0 ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white")}><div className="flex items-center gap-2"><Zap className={cn("h-3.5 w-3.5", index === 0 ? "text-blue-600" : "text-slate-400")} /><p className="text-[9px] font-bold text-slate-800">{flow.name}</p></div><p className="mt-1 text-[8px] text-slate-400">{flow.status}</p></div>)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{d.triggerLabel}</p><div className="mt-3 space-y-2">{d.flows[0].triggers.map((trigger, index) => <div key={trigger} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-[9px] font-bold text-amber-700">{index + 1}</span><div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[9px] font-semibold text-slate-700">{trigger}</div></div>)}</div><div className="my-3 flex items-center gap-2"><span className="h-px flex-1 bg-slate-200" /><ArrowRight className="h-4 w-4 text-blue-500" /><span className="h-px flex-1 bg-slate-200" /></div><div className="rounded-lg border border-blue-200 bg-blue-50 p-3"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-600" /><p className="text-[10px] font-bold text-slate-900">{d.outcome.title}</p></div><p className="mt-1 text-[8px] leading-relaxed text-slate-500">{d.outcome.body}</p></div></div><div className="space-y-3"><div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{d.controlsTitle}</p>{d.controls.map((control) => <div key={control} className="mt-2 flex items-center gap-2 text-[9px] font-semibold text-slate-600"><Check className="h-3.5 w-3.5 text-emerald-600" />{control}</div>)}</div><div className="rounded-xl border border-rose-200 bg-rose-50 p-3"><div className="flex gap-2"><ShieldCheck className="h-5 w-5 shrink-0 text-rose-600" /><div><p className="text-[8px] font-bold tracking-wider text-rose-700">{d.guardrail.label}</p><p className="mt-1 text-[10px] font-bold text-slate-900">{d.guardrail.title}</p><p className="mt-1 text-[8px] leading-relaxed text-slate-600">{d.guardrail.body}</p></div></div></div></div></div></div>;
}

function CoworkerScreen() {
  const d = DECKMO.bankTools.screens[2];
  return <div className="flex h-full flex-col bg-slate-50/50 p-4"><div className="flex gap-1 rounded-lg bg-slate-100 p-1 self-start">{d.sections.map((section, index) => <span key={section} className={cn("rounded-md px-3 py-1.5 text-[9px] font-semibold", index === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>{section}</span>)}</div><div className="mt-3 grid min-h-0 flex-1 grid-cols-[250px_1fr] overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-r border-slate-200"><div className="border-b border-slate-100 p-3"><p className="text-[11px] font-bold text-slate-900">{d.inboxTitle}</p><p className="text-[8px] text-slate-400">{d.inboxSubtitle}</p></div>{d.inbox.map((mail, index) => <div key={mail.role} className={cn("border-b border-slate-100 p-3", index === 0 && "bg-blue-50")}><div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-blue-600" /><p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{mail.role}</p></div><p className="mt-1 text-[10px] font-bold text-slate-900">{mail.subject}</p><p className="mt-1 line-clamp-2 text-[8px] leading-relaxed text-slate-500">{mail.preview}</p></div>)}</div><div className="flex min-h-0 flex-col p-4"><div className="flex items-start justify-between"><div><p className="text-[9px] font-bold text-blue-600">{d.message.from}</p><h3 className="mt-1 text-base font-bold text-slate-900">{d.message.subject}</h3></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700">{d.message.status}</span></div><p className="mt-3 text-[9px] leading-relaxed text-slate-600">{d.message.intro}</p><div className="mt-3 grid grid-cols-3 gap-2">{d.message.priorities.map((priority) => <div key={priority.title} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"><p className="text-[9px] font-bold text-slate-800">{priority.title}</p><p className="mt-1 text-[8px] leading-relaxed text-slate-500">{priority.body}</p></div>)}</div><div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-600" /><p className="text-[9px] font-bold text-slate-900">{d.message.readyTitle}</p></div><div className="mt-2 flex gap-2">{d.message.outputs.map((output) => <span key={output} className="rounded-md bg-white px-2 py-1.5 text-[8px] font-semibold text-slate-600">{output}</span>)}</div></div><div className="mt-auto flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><span className="flex-1 text-[9px] text-slate-400">{d.reply}</span><span className="rounded-md bg-blue-600 px-3 py-1.5 text-[8px] font-bold text-white">{d.send}</span></div></div></div></div>;
}

export function BankdemoBankTools({ step }: SceneProps) {
  const d = DECKMO.bankTools;
  const screen = d.screens[step];
  return <div className="mx-auto flex h-full max-w-[1380px] flex-col justify-center px-12 py-10"><div className="flex items-end justify-between"><SceneHeader eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} /><div className="mb-1 flex gap-2">{d.screens.map((item, index) => <span key={item.id} className={cn("rounded-full border px-4 py-2 text-[10px] font-bold", index === step ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400")}>{item.tab}</span>)}</div></div><div className="mt-5"><AppWindow>{screen.id === "database" ? <DatabaseScreen /> : screen.id === "flows" ? <FlowsScreen /> : <CoworkerScreen />}</AppWindow></div></div>;
}