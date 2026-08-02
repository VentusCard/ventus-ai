// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://ventusai.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/platform", changefreq: "monthly", priority: "0.9" },
  { path: "/transaction-enrichment", changefreq: "monthly", priority: "0.9" },
  { path: "/solutions/offer-intelligence", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions/product-intelligence", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions/conversation-intelligence", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions/portfolio-intelligence", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions/campaign-intelligence", changefreq: "monthly", priority: "0.8" },
  { path: "/coworker", changefreq: "monthly", priority: "0.8" },
  { path: "/smartrewards", changefreq: "monthly", priority: "0.7" },
  { path: "/engagement", changefreq: "monthly", priority: "0.7" },
  { path: "/wealth", changefreq: "monthly", priority: "0.7" },
  { path: "/travel", changefreq: "monthly", priority: "0.6" },
  { path: "/analytics", changefreq: "monthly", priority: "0.7" },
  { path: "/insights", changefreq: "weekly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "yearly", priority: "0.6" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
];

async function loadInsightEntries(): Promise<SitemapEntry[]> {
  const mod = await import("../src/lib/insightsData");
  return mod.insightsPosts.map((post: { slug: string }) => ({
    path: `/insights/${post.slug}`,
    changefreq: "monthly" as const,
    priority: "0.6",
  }));
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const entries = [...staticEntries, ...(await loadInsightEntries())];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
