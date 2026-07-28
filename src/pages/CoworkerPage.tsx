import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle } from "@/hooks/useSectionReveal";
import CoworkerEmailReel from "@/components/coworker/CoworkerEmailReel";

const flowSteps = [
  { label: "Detect", desc: "Match each reader's scope to behavioral + external signals." },
  { label: "Digest", desc: "Assemble what changed into a short morning email." },
  { label: "Converse", desc: "Reply in plain English — scope-aware answers 24/7." },
];

const audiences = [
  {
    title: "Wealth advisors & RMs",
    body: "A daily client-book digest: which relationships had a meaningful change and are worth a call, a note, or a moment of attention today.",
  },
  {
    title: "Retail & branch leaders",
    body: "Patterns across a portfolio: new-mover inflows, segments gaining or losing momentum, households crossing meaningful thresholds.",
  },
  {
    title: "Product, marketing & segmentation",
    body: "A pulse on the base — where behavioral and life-event signals are concentrating, so campaigns and offers land at real moments.",
  },
  {
    title: "Executives & LOB heads",
    body: "A running read on the institution's book — whole-customer context that usually takes several reports, delivered as one short email.",
  },
];

const CoworkerPage = () => {
  const hero = useSectionReveal();
  const what = useSectionReveal();
  const demo = useSectionReveal();
  const how = useSectionReveal();
  const who = useSectionReveal();
  const why = useSectionReveal();

  const clients = useMemo(() => generateDashboardClients(60), []);

  return (
    <main className="bg-white min-h-screen">
      <SEO
        title="Ventus AI Coworker — Daily intelligence for banking teams"
        description="An email-based AI agent that delivers a daily digest of what changed across the book, the portfolio, or the institution — and lets anyone reply to collaborate 24/7."
        path="/coworker"
      />

      {/* Hero */}
      <section ref={hero.ref} className="pt-40 pb-16 px-6 min-h-[80vh] flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-4">
            Ventus AI Coworker
          </p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Daily intelligence and collaboration for every banking team, 24/7.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            One short email each morning tells the right person what deserves attention today.
            Reply in plain English to pull the households, explain a shift, or draft the outreach —
            scoped to your role, no dashboard to log into.
          </p>
          <div style={revealStyle(hero.visible, 300)} className="flex items-center justify-center gap-3">
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
            <Link to="/insights/meet-ventus-ai-coworker">
              <Button variant="outline">Read the announcement</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section ref={what.ref} className="px-6 py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 style={revealStyle(what.visible, 0)} className="font-bold text-gray-900 mb-6 text-3xl md:text-4xl">
            What it is
          </h2>
          <div style={revealStyle(what.visible, 100)} className="space-y-5 text-gray-600 leading-relaxed text-base sm:text-lg">
            <p>
              Ventus AI Coworker is an email-based AI agent that delivers a daily digest of what changed across
              the book, the portfolio, or the institution. Every morning, the right person receives one email
              that surfaces what moved overnight and what deserves attention today: emerging life events,
              wealth signals, household changes, and shifts across segments. There is no new dashboard to log
              into and no workflow to learn.
            </p>
            <p>
              It's built by Ventus AI — a behavioral intelligence and personalization engine for banks and
              credit unions. Ventus enriches an institution's own transaction data and fuses it with early
              external life-event and wealth signals. The Coworker is how that intelligence reaches the people
              who act on it.
            </p>
          </div>
        </div>
      </section>

      {/* Live conversation demo */}
      <section ref={demo.ref} className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p style={revealStyle(demo.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-3">
              See it in action
            </p>
            <h2 style={revealStyle(demo.visible, 100)} className="font-bold text-gray-900 mb-3 text-3xl md:text-4xl">
              A real morning exchange.
            </h2>
            <p style={revealStyle(demo.visible, 200)} className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
              Click any thread to read the back-and-forth between an advisor or leader and the Coworker.
            </p>
          </div>

          <div
            style={{
              ...revealStyle(demo.visible, 300),
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 40px rgba(15, 23, 42, 0.08)",
              height: 720,
            }}
            className="rounded-2xl bg-white overflow-hidden flex flex-col"
          >
            <div className="shrink-0 px-4 py-2.5 border-b border-purple-200 bg-purple-50 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-purple-700">
                AI Coworker ↔ Advisor
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <AdvisorConversationThread clients={clients} density="full" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={how.ref} className="px-6 py-20 bg-slate-50">
        <div style={revealStyle(how.visible, 0)}>
          <StepFlow steps={flowSteps} title="How it works" />
        </div>
      </section>

      {/* Who it's for */}
      <section ref={who.ref} className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 style={revealStyle(who.visible, 0)} className="font-bold text-gray-900 mb-3 text-center text-3xl md:text-4xl">
            Who it's for
          </h2>
          <p style={revealStyle(who.visible, 100)} className="text-gray-500 text-center mb-12 max-w-2xl mx-auto text-base sm:text-lg">
            Same engine, different lens. The digest is tuned to whoever is reading.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {audiences.map((a, i) => (
              <div
                key={a.title}
                style={{
                  ...revealStyle(who.visible, 200 + i * 80),
                  border: "1px solid #E5E7EB",
                  borderTop: "3px solid #7C3AED",
                }}
                className="rounded-xl bg-white p-6"
              >
                <p className="text-base font-bold text-gray-900 mb-2">{a.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section ref={why.ref} className="px-6 py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div style={revealStyle(why.visible, 0)}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Meets people where they already work</h3>
            <p className="text-gray-600 leading-relaxed">
              Every banking role manages more than any person can actively watch — and the moments worth acting
              on are the easiest to miss. Nothing to log into, nothing to provision, nothing to roll out.
              Intelligence reaches the whole team, not just the few who adopt another tool.
            </p>
          </div>
          <div style={revealStyle(why.visible, 150)}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Respects what the bank already has</h3>
            <p className="text-gray-600 leading-relaxed">
              The Coworker works inside the systems institutions already run. The institution governs the data
              and the boundaries; Ventus executes within them. The result is timely, whole-customer context at
              the level each person works — without giving up control.
            </p>
          </div>
        </div>
      </section>

      <SolutionsCTA />
    </main>
  );
};

export default CoworkerPage;
