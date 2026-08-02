import { Helmet } from "react-helmet-async";

type JsonLd = Record<string, unknown>;

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noindex?: boolean; // review/preview pages that should never be crawled
  keywords?: string;
  /** One or more JSON-LD graph objects rendered into the head. */
  jsonLd?: JsonLd | JsonLd[];
}

export const SITE_URL = "https://ventusai.com";

export const SEO = ({
  title,
  description,
  path,
  type = "website",
  noindex = false,
  keywords,
  jsonLd,
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Ventus AI" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {graphs.map((graph, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(graph)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
