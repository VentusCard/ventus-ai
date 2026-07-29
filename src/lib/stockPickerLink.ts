import type { ImageryBrief } from "./segmentImageryBrief";

export type StockProvider = "unsplash" | "pexels" | "getty";

export const DEFAULT_PROVIDER: StockProvider = "unsplash";

export const STOCK_PROVIDERS: { id: StockProvider; label: string }[] = [
  { id: "unsplash", label: "Unsplash" },
  { id: "pexels", label: "Pexels" },
  { id: "getty", label: "Getty" },
];

const STOPWORDS = new Set(["no", "people", "and", "with", "the", "a", "an"]);

function searchPhrase(brief: ImageryBrief, opts: { stripStopwords?: boolean } = {}): string {
  // Prefer first 3 keywords + mood; ignore the "no people" tail for slug-style URLs.
  const parts = [...brief.keywords.slice(0, 3), brief.mood.toLowerCase()];
  let phrase = parts.join(" ");
  if (opts.stripStopwords) {
    phrase = phrase
      .split(/\s+/)
      .filter((w) => !STOPWORDS.has(w.toLowerCase()))
      .join(" ");
  }
  // Normalize commas/extra spaces, cap length
  phrase = phrase.replace(/,/g, " ").replace(/\s+/g, " ").trim();
  return phrase.slice(0, 80);
}

function slugify(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function buildStockPickerUrl(provider: StockProvider, brief: ImageryBrief): string {
  const phrase = searchPhrase(brief, { stripStopwords: true });
  const slug = slugify(phrase);

  switch (provider) {
    case "unsplash":
      return `https://unsplash.com/s/photos/${encodeURIComponent(slug)}?orientation=landscape`;
    case "pexels":
      return `https://www.pexels.com/search/${encodeURIComponent(slug)}/?orientation=landscape`;
    case "getty":
      return `https://www.gettyimages.com/photos/${encodeURIComponent(slug)}?phrase=${encodeURIComponent(phrase)}&assettype=image&orientations=horizontal`;
  }
}

export function providerLabel(provider: StockProvider): string {
  return STOCK_PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
}
