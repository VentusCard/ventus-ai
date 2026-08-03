import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { organizationSchema, breadcrumbSchema } from "@/lib/seoSchema";
import {
  COMPANY_FULL,
  OUTCOMES,
  SIGNAL_FAMILIES,
  DATA_SOURCES,
} from "@/lib/companyCopy";
import { Building2, Handshake, Sparkles, Layers, Database, TrendingUp } from "lucide-react";

const cardClass =
  "group p-8 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 hover:shadow-lg transition-all duration-500";
const iconWrapClass =
  "w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:bg-blue-100";
const headingClass =
  "text-2xl font-semibold text-gray-900 mb-4 transition-colors duration-300 group-hover:text-blue-600";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About Ventus AI — Behavioral Intelligence & Personalization Engine"
        description="Ventus AI combines multi-rail bank data with national data partnerships to extract spending, financial, and life-event signals for bank personalization."
        path="/about"
        keywords="about Ventus AI, behavioral intelligence engine for banks, personalization engine financial institutions, national data partnerships, multi-rail transaction data"
        jsonLd={[
          organizationSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            About Ventus AI
          </h1>

          <div className="space-y-12 text-gray-600">
            <section className={cardClass}>
              <div className="flex items-start gap-4 mb-4">
                <div className={iconWrapClass}>
                  <Sparkles className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h2 className={headingClass}>What is Ventus AI?</h2>
                  <p className="text-lg leading-relaxed">{COMPANY_FULL}</p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start gap-4 mb-4">
                <div className={iconWrapClass}>
                  <Layers className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h2 className={headingClass}>The Signals We Extract</h2>
                  <ul className="space-y-4 text-lg">
                    {SIGNAL_FAMILIES.map((family) => (
                      <li key={family.name}>
                        <span className="text-blue-600 font-semibold">{family.name}:</span>{" "}
                        <span className="leading-relaxed">{family.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start gap-4 mb-4">
                <div className={iconWrapClass}>
                  <Database className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h2 className={headingClass}>Where the Signal Comes From</h2>
                  <ul className="space-y-4 text-lg">
                    {DATA_SOURCES.map((source) => (
                      <li key={source.name}>
                        <span className="text-blue-600 font-semibold">{source.name}:</span>{" "}
                        <span className="leading-relaxed">{source.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start gap-4 mb-4">
                <div className={iconWrapClass}>
                  <TrendingUp className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h2 className={headingClass}>What Institutions Can Expect</h2>
                  <ul className="space-y-4 text-lg">
                    {OUTCOMES.map((outcome) => (
                      <li key={outcome.label}>
                        <span className="text-blue-600 font-semibold">{outcome.label}:</span>{" "}
                        <span className="leading-relaxed">{outcome.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start gap-4 mb-4">
                <div className={iconWrapClass}>
                  <Building2 className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h2 className={headingClass}>Bank-First Collaboration</h2>
                  <p className="text-lg leading-relaxed">
                    We work directly with financial institutions as technology partners, not
                    competitors. Ventus orchestrates into the systems banks already run — digital
                    banking, marketing and campaign tools, CRM, rewards platforms, and advisor
                    workflows — enhancing customer engagement without disrupting established
                    infrastructure or requiring core changes.
                  </p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start gap-4 mb-4">
                <div className={iconWrapClass}>
                  <Handshake className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h2 className={headingClass}>How We Work</h2>
                  <p className="text-lg leading-relaxed mb-4">
                    Ventus AI offers flexible integration options to meet your institution where you are:
                  </p>
                  <ul className="space-y-3 text-lg">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-semibold whitespace-nowrap">API Integration:</span>
                      <span>Route signals and activations directly into your existing applications and workflows.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-semibold whitespace-nowrap">In-App Experience:</span>
                      <span>Deploy our consumer-facing personalization surfaces within your mobile or web banking platforms.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
