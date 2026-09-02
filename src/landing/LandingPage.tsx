import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import "./tokens.css";
import "./landing.css";
import { LANDING_COPY } from "./copy";
import { RequestAccessProvider } from "./request/context";
import { GlassHeader } from "./header/GlassHeader";
import { Hero } from "./hero/Hero";
import { Intelligence } from "./intelligence/Intelligence";
import { Governance } from "./governance/Governance";
import { Activation } from "./activation/Activation";
import { Footer } from "./footer/Footer";
import { RequestAccessModal } from "./request/RequestAccessModal";

// The only font stylesheet the landing route requests. See src/App.tsx's
// LegacyFonts for why every other route has its own equivalent instead of a
// global <link> in index.html.
const LANDING_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,500&family=Manrope:wght@400;500;600;700&display=swap";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://ventusai.com/#organization",
  name: "Ventus AI",
  legalName: "Ventus Financial Technologies Inc.",
  url: "https://ventusai.com",
  slogan: LANDING_COPY.seo.description,
};

/**
 * The single public landing page (Direction C — "the decision record").
 * Chapter order is fixed: Hero -> Intelligence -> Governance -> Activation ->
 * Footer. Do not add sections here; new content belongs inside one of the
 * four chapters, per docs/finnovate-landing-goal.md.
 */
interface LandingPageProps {
  /** Route the page is served from — "/" in production, "/next" while the
   *  team reviews it on dev. Feeds the canonical URL. */
  path?: string;
  /** Review deployments are never indexed. */
  noindex?: boolean;
}

export default function LandingPage({ path = "/", noindex = false }: LandingPageProps) {
  return (
    <RequestAccessProvider>
      <div className="landing" id="top">
        <Helmet>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={LANDING_FONTS_HREF} rel="stylesheet" />
        </Helmet>
        <SEO
          title={LANDING_COPY.seo.title}
          description={LANDING_COPY.seo.description}
          path={path}
          noindex={noindex}
          keywords={LANDING_COPY.seo.keywords}
          jsonLd={orgSchema}
        />
        <GlassHeader />
        <main>
          <Hero />
          <Intelligence />
          <Governance />
          <Activation />
        </main>
        <Footer />
        <RequestAccessModal />
      </div>
    </RequestAccessProvider>
  );
}
