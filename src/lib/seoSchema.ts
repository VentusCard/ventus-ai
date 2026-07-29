/**
 * Structured-data builders. These power both classic rich results and
 * answer-engine (GEO) extraction on ChatGPT / Perplexity / AI Overviews.
 */

export const SITE_URL = "https://ventusai.dev";
export const ORG_NAME = "Ventus AI";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: ORG_NAME,
  legalName: "Ventus Financial Technologies Inc.",
  url: SITE_URL,
  description:
    "Ventus AI is an AI behavioral intelligence and personalization engine for financial institutions. It enriches transaction data into lifestyle pillars, life events, financial signals, and demographics, then activates personalized offers, products, rewards, and conversations.",
  slogan: "AI Behavioral Intelligence and Personalization Engine for Financial Institutions",
  knowsAbout: [
    "Transaction data enrichment",
    "Behavioral intelligence for banking",
    "Life event detection",
    "Personalized rewards and card-linked offers",
    "Next best offer for banks",
    "Customer intelligence for banks and credit unions",
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
    "An AI behavioral intelligence and personalization engine for banks and credit unions. Ventus enriches raw transaction data into five signal layers — spending habits, life events, financial signals, demographics, and risk — and activates them as personalized offers, product recommendations, rewards, and advisor conversations.",
  featureList: [
    "Semantic transaction enrichment beyond MCC codes",
    "Life event detection from transaction behavior",
    "Personalized rewards and merchant offers",
    "Next-best-offer and next-best-product recommendations",
    "Segment-of-one campaign generation",
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
