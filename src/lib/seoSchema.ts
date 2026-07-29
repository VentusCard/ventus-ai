/**
 * Structured-data builders. These power both classic rich results and
 * answer-engine (GEO) extraction on ChatGPT / Perplexity / AI Overviews.
 */

export const SITE_URL = "https://ventusai.com";
export const ORG_NAME = "Ventus AI";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: ORG_NAME,
  legalName: "Ventus Financial Technologies Inc.",
  url: SITE_URL,
  description:
    "Ventus AI is a behavioral intelligence and personalization engine for financial institutions. It extracts signals in spending behavior, financial behavior, and major life events by combining proprietary behavioral enrichment on multi-rail internal data with externally observed signals from national data partnerships, then orchestrates those signals into the systems banks already run — driving higher interchange, stronger deal redemption, product growth, and retention.",
  slogan: "Behavioral Intelligence and Personalization Engine for Financial Institutions",
  knowsAbout: [
    "Behavioral intelligence for financial institutions",
    "Proprietary behavioral enrichment of multi-rail transaction data",
    "Externally observed signals from national data partnerships",
    "Spending behavior and financial behavior signals",
    "Life event detection for banks",
    "Personalized rewards and card-linked offer redemption",
    "Next best offer and next best product for banks",
    "Interchange growth and customer retention for banks and credit unions",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: ORG_NAME,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Ventus AI Behavioral Intelligence & Personalization Engine",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Financial Services Personalization Software",
  operatingSystem: "Cloud / API",
  description:
    "A behavioral intelligence and personalization engine for banks and credit unions. Ventus extracts spending behavior, financial behavior, and major life event signals from multi-rail internal data and externally observed national data partnerships, then orchestrates them into existing banking systems so every customer gets an individually personalized experience across rewards, products, and relationships.",
  featureList: [
    "Proprietary behavioral enrichment beyond MCC-level categorization",
    "Multi-rail internal data combined with externally observed signals",
    "Spending behavior, financial behavior, and life event signal extraction",
    "Personalized rewards and card-linked offers that lift redemption",
    "Next-best-offer and next-best-product recommendations",
    "Segment-of-one campaign generation with personalized value math",
    "Orchestration into digital banking, CRM, campaign, rewards, and advisor systems",
    "Portfolio and customer intelligence analytics",
  ],
  provider: { "@id": `${SITE_URL}/#organization` },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "0",
    description: "Custom enterprise pricing — schedule a demo.",
  },
};

export interface QA {
  q: string;
  a: string;
}

export const faqSchema = (items: QA[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});

export const breadcrumbSchema = (crumbs: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: `${SITE_URL}${crumb.path}`,
  })),
});

export const articleSchema = ({
  headline,
  description,
  path,
  datePublished,
  section,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  section?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline,
  description,
  articleSection: section,
  datePublished,
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
  author: { "@type": "Organization", name: ORG_NAME, url: SITE_URL },
  publisher: { "@id": `${SITE_URL}/#organization` },
});
