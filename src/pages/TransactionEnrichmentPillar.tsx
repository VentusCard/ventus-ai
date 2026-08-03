import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import AnswerBlock from "@/components/AnswerBlock";
import { Button } from "@/components/ui/button";
import {
  breadcrumbSchema,
  faqSchema,
  softwareApplicationSchema,
  type QA,
} from "@/lib/seoSchema";

const layers = [
  {
    name: "Spending habits",
    desc: "Recurring lifestyle behavior rolled up from enriched merchants — tropical travel, pet care routine, home goods — with transaction counts and annualized spend.",
  },
  {
    name: "Life events",
    desc: "Moments that change a customer's financial needs: home purchase, new child, college preparation for a dependent, relocation, career change.",
  },
  {
    name: "Financial signals",
    desc: "Loans, mortgages, leases, and investment behavior read from payment patterns — including maturity windows that predict a refinance or renewal.",
  },
  {
    name: "Demographics",
    desc: "Inferred household context — dependents, life stage, household composition — derived from behavior rather than from stale onboarding forms.",
  },
  {
    name: "Risk",
    desc: "Behavioral indicators of financial strain, fraud exposure, and vulnerability, kept separate from marketing activation.",
  },
];

const steps = [
  {
    step: "1. Ingest",
    desc: "Card and account transactions arrive through a simple API. No core banking change, no PII required — anonymized transaction signals only.",
  },
  {
    step: "2. Enrich",
    desc: "Each raw descriptor is resolved to a clean merchant, MCC, category, and subcategory — then semantically interpreted for intent, not just labeled.",
  },
  {
    step: "3. Interpret",
    desc: "Enriched transactions roll up into the five behavioral signal layers, each grounded in the exact transactions that produced it.",
  },
  {
    step: "4. Activate",
    desc: "Signals become next-best offers, next-best products, segment-of-one campaigns, personalized rewards, and advisor conversations — with value math attached.",
  },
];

const faqs: QA[] = [
  {
    q: "What is transaction data enrichment?",
    a: "Transaction data enrichment converts raw bank transaction descriptors into structured data: a clean merchant name, logo, location, MCC, and spending category. It makes statements readable for customers and analyzable for the institution, and it is the foundation layer under any personalization program.",
  },
  {
    q: "What is behavioral intelligence in banking?",
    a: "Behavioral intelligence is the layer above enrichment. Instead of labeling one transaction, it interprets patterns across a customer's history — and across externally observed signals from national data partnerships — to extract spending behavior, financial behavior, and major life events: the signals that determine which product, offer, or conversation is actually relevant right now.",
  },
  {
    q: "How is Ventus AI different from a transaction enrichment API?",
    a: "A transaction enrichment API answers 'what was this purchase?'. Ventus answers 'what does this customer need next, and why?'. Ventus applies proprietary behavioral enrichment across multi-rail internal data, combines it with externally observed signals from national data partnerships, and produces spending, financial, and life-event signals plus activation — offers, products, campaigns, and conversations — each traceable back to the transactions that justify it.",
  },
  {
    q: "How does life event detection work?",
    a: "Ventus reads combinations of enriched transactions over time — such as inspection fees, moving services, and title payments — scores them against life-event patterns, and corroborates them against externally observed signals where available. Each detected event carries a confidence level and the underlying transaction evidence, so a banker can see exactly why it fired.",
  },
  {
    q: "What is a next-best offer for a bank?",
    a: "A next-best offer is the single most relevant product, reward, or message for a specific customer at a specific moment. Ventus selects it from behavioral signals and attaches personalized value math — for example, the estimated annual cash back a customer's own dining and grocery spending would earn.",
  },
  {
    q: "Do banks need to change their core systems to use Ventus?",
    a: "No. Ventus requires no changes to core banking infrastructure. Institutions send transaction data securely and receive signals and activations back through a simple API, which orchestrates into the systems already in production: digital banking, CRM, campaign tools, rewards platforms, and advisor workflows.",
  },
  {
    q: "Is customer data secure?",
    a: "Ventus runs on enterprise-grade cloud infrastructure with end-to-end encryption and complete data isolation between institutions. Ventus does not store PII — only anonymized behavioral signals. SOC 2 certification is in progress.",
  },
  {
    q: "Who uses behavioral intelligence inside a bank?",
    a: "Digital banking teams use it for in-app personalization, rewards and loyalty teams for card-linked offers and redemption lift, marketing teams for segment-of-one campaigns, wealth advisors for timely client conversations, and executives for portfolio-level behavioral and life-event analytics. Across those teams, institutions target higher interchange, stronger deal redemption, product growth, and retention.",
  },
];

const TransactionEnrichmentPillar = () => (
  <main className="bg-white min-h-screen">
    <SEO
      title="Transaction Data Enrichment & Behavioral Intelligence for Banks"
      description="How transaction data enrichment works, how behavioral intelligence goes beyond it, and how banks turn enriched transactions into life events, personalized rewards, and next-best offers."
      path="/transaction-enrichment"
      keywords="transaction data enrichment, transaction categorization API, merchant name cleansing, behavioral intelligence banking, life event detection, next best offer banking"
      jsonLd={[
        softwareApplicationSchema,
        faqSchema(faqs),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Transaction Enrichment", path: "/transaction-enrichment" },
        ]),
      ]}
    />

    {/* Hero */}
    <section className="pt-40 pb-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
          Transaction Enrichment
        </p>
        <h1 className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[52px]">
          Transaction data enrichment is the floor. Behavioral intelligence is the product.
        </h1>
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8">
          Cleaning a merchant string tells you what a customer bought. Ventus AI tells you what it
          means — the life event forming, the obligation maturing, the offer that would actually be
          worth money to them — for every customer in the portfolio.
        </p>
        <Link to="/contact">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
        </Link>
      </div>
    </section>

    {/* Definition block — quotable */}
    <section className="px-6" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Definition: AI behavioral intelligence and personalization engine
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          An AI behavioral intelligence and personalization engine for financial institutions
          ingests transaction data, enriches it into structured merchant and category detail, then
          interprets it into behavioral signals — spending habits, life events, financial signals,
          demographics, and risk — and activates those signals as personalized offers, product
          recommendations, rewards, campaigns, and employee conversations, with the source
          transactions attached as evidence.
        </p>
      </div>
    </section>

    {/* Five layers */}
    <section className="px-6" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          Five signal layers from one transaction feed
        </h2>
        <p className="text-gray-500 mb-10 text-base leading-relaxed">
          Every signal is grounded in the exact transactions that produced it, so it can be
          explained to a banker, a compliance reviewer, or the customer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {layers.map((layer) => (
            <div key={layer.name} className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">{layer.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="px-6" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 leading-tight">
          How transaction enrichment becomes activation
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <li key={s.step} className="rounded-xl border border-slate-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
                {s.step}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <AnswerBlock heading="Transaction enrichment and behavioral intelligence, answered" items={faqs} />

    {/* Internal links */}
    <section className="px-6 pb-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Explore what the signals activate</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          {[
            { to: "/platform", label: "The Ventus platform" },
            { to: "/solutions/offer-intelligence", label: "Next-best offer" },
            { to: "/solutions/product-intelligence", label: "Next-best product" },
            { to: "/solutions/conversation-intelligence", label: "Next-best conversation" },
            { to: "/solutions/campaign-intelligence", label: "Segment-of-one campaigns" },
            { to: "/smartrewards", label: "Personalized rewards" },
            { to: "/wealth", label: "Wealth management signals" },
            { to: "/analytics", label: "Portfolio analytics" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full border border-slate-200 px-4 py-2 text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default TransactionEnrichmentPillar;
