import { useMemo, useRef, useState } from "react";
import { PRODUCT_CATALOG, PRODUCT_CATEGORY_LABELS } from "@/lib/campaignStudioData";
import type { CatalogProduct, ProductCategory } from "@/types/campaign-studio";
import { adaptCatalogProduct } from "@/lib/catalogProductAdapter";
import { getProductMechanics } from "@/lib/productCatalogExtras";
import { getProductVariants, CATALOG_GRAND_TOTAL } from "@/lib/campaignCatalogVariants";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeftRight, Users, Tag, Plus, X, Link as LinkIcon, Sparkles, AlertTriangle } from "lucide-react";
import {
  scoreProductFit,
  recommendedProducts,
  fitTone,
  suggestOffers,
  checkCannibalization,
} from "@/lib/campaignAiEngine";

const OFFER_MAX_LEN = 80;
const OFFER_MAX_COUNT = 5;




const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

const CATEGORY_ORDER: ProductCategory[] = [
  "credit_cards",
  "deposit_accounts",
  "loans",
  "investments",
  "insurance",
  "digital_services",
];

interface Props {
  selectedName: string;
  onSelect: (name: string) => void;
  offers: string[];
  onOffersChange: (offers: string[]) => void;
  campaignLink: string;
  onCampaignLinkChange: (link: string) => void;
}

export function ProductPickerSection({
  selectedName,
  onSelect,
  offers,
  onOffersChange,
  campaignLink,
  onCampaignLinkChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [offerDraft, setOfferDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addOfferValue = (raw: string) => {
    const trimmed = raw.trim().slice(0, OFFER_MAX_LEN);
    if (!trimmed) return;
    if (offers.includes(trimmed)) return;
    if (offers.length >= OFFER_MAX_COUNT) return;
    onOffersChange([...offers, trimmed]);
  };

  const addOffer = () => {
    addOfferValue(offerDraft);
    setOfferDraft("");
  };


  const removeOffer = (idx: number) => {
    onOffersChange(offers.filter((_, i) => i !== idx));
  };


  const selected = PRODUCT_CATALOG.find((p) => p.name === selectedName);
  const selectedFlow = selected ? adaptCatalogProduct(selected) : null;
  const mechanics = selectedFlow
    ? getProductMechanics(selectedFlow.id, selectedFlow.category)
    : null;
  const variants = selected ? getProductVariants(selected) : null;

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? PRODUCT_CATALOG.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            PRODUCT_CATEGORY_LABELS[p.category].toLowerCase().includes(q),
        )
      : PRODUCT_CATALOG;
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: filtered.filter((p) => p.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
        <p className="text-sm font-semibold text-slate-900">Select a Product and Campaign Offer</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">
          {PRODUCT_CATALOG.length} products · {CATALOG_GRAND_TOTAL.toLocaleString()} campaigns total
        </Badge>
      </div>

      {selected && selectedFlow && mechanics && variants ? (
        <div className="flex gap-3">
          <div className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 shrink-0">
                <selectedFlow.icon className="w-3.5 h-3.5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{selected.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    {PRODUCT_CATEGORY_LABELS[selected.category]}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelect("");
                  setQuery("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="shrink-0 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3" />
                Change product
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug mb-2">{selectedFlow.positioning}</p>
            <div className="rounded-md bg-white border border-slate-200 px-2.5 py-1.5">
              <p className="text-xs font-medium text-slate-900 leading-snug">{mechanics.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{mechanics.fee}</p>
            </div>
            {(() => {
              const fit = scoreProductFit(selected);
              const tone = fitTone(fit.score);
              const cann = checkCannibalization(selected.name);
              return (
                <>
                  <div className="mt-2 flex items-start gap-1.5">
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold tabular-nums ${tone.cls}`}>
                      {tone.label} · {fit.score}/100
                    </span>
                    <p className="text-[10px] text-slate-500 leading-snug">{fit.why}</p>
                  </div>
                  {cann && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-amber-800 leading-snug">{cann.note}</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>


          <div className="w-1/4 rounded-lg border border-slate-200 bg-white p-3 flex flex-col">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-[11px] font-semibold text-slate-700">Offers</p>
              <span className="text-[10px] text-slate-400">optional</span>
              <span className="ml-auto text-[10px] text-slate-400 tabular-nums">
                {offers.length}/{OFFER_MAX_COUNT}
              </span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="w-2.5 h-2.5 text-blue-600" />
              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">Ventus-suggested</p>
            </div>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {suggestOffers(selected, 3).map((preset) => {
                const already = offers.includes(preset);
                const capped = offers.length >= OFFER_MAX_COUNT;
                const disabled = already || capped;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addOfferValue(preset)}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[10px] text-blue-800 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
                    title={already ? "Already added" : `Add "${preset}"`}
                  >
                    <Plus className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate max-w-[150px]">{preset}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-1">
              <Input
                value={offerDraft}
                onChange={(e) => setOfferDraft(e.target.value.slice(0, OFFER_MAX_LEN))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOffer();
                  }
                }}
                placeholder="e.g. Limited-edition metal card"
                disabled={offers.length >= OFFER_MAX_COUNT}
                className="h-7 text-xs bg-white border-slate-200"
                maxLength={OFFER_MAX_LEN}
              />
              <button
                type="button"
                onClick={addOffer}
                disabled={!offerDraft.trim() || offers.length >= OFFER_MAX_COUNT}
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Add offer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {offers.length === 0 ? (
                <p className="text-[10px] text-slate-400 leading-snug">
                  Add timely promos — e.g. "Waived first-year fee".
                </p>
              ) : (
                offers.map((o, i) => (
                  <span
                    key={`${o}-${i}`}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-700 max-w-full"
                  >
                    <span className="truncate max-w-[140px]" title={o}>{o}</span>
                    <button
                      type="button"
                      onClick={() => removeOffer(i)}
                      className="text-slate-400 hover:text-slate-700 shrink-0"
                      aria-label={`Remove ${o}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                <LinkIcon className="w-3 h-3 text-slate-500" />
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Campaign link</p>
              </div>
              <Input
                value={campaignLink}
                onChange={(e) => onCampaignLinkChange(e.target.value)}
                placeholder="https://www.ventusai.com/campaign"
                className="h-7 text-xs bg-white border-slate-200 font-mono"
                spellCheck={false}
              />
            </div>
          </div>


          <div className="w-1/4 rounded-lg border border-slate-200 bg-white p-3 flex flex-col items-center justify-center gap-2 text-center">

            <span className="flex items-center justify-center w-9 h-9 rounded-md bg-slate-900 shrink-0">
              <Users className="w-4 h-4 text-white" />
            </span>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Addressable population</p>
              <p className="text-[11px] text-slate-500 leading-snug">
                {selected.penetrationRate}% catalog penetration
              </p>
            </div>
            <span className="text-2xl font-semibold text-slate-900 tabular-nums">
              {fmt(selectedFlow.estimatedAudience)}
            </span>
          </div>
        </div>
      ) : (
        <div>

          <div className="mb-2.5 rounded-lg border border-blue-200 bg-blue-50/50 p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-800">
                Recommended for you now
              </p>
              <span className="text-[10px] text-blue-500">strongest live signal support this period</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {recommendedProducts(3).map((f) => (
                <button
                  key={f.product.name}
                  type="button"
                  onClick={() => {
                    onSelect(f.product.name);
                    setQuery("");
                  }}
                  className="text-left rounded-md border border-blue-200 bg-white hover:border-blue-400 transition-colors px-2.5 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-900 truncate">{f.product.name}</span>
                    <span className="ml-auto text-[10px] font-semibold text-blue-700 tabular-nums shrink-0">
                      {f.score}/100
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{f.why}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 44 products — cards, deposits, loans, investments, insurance, digital…"
              className="h-8 pl-8 text-xs bg-white border-slate-200"
            />
          </div>

          <div className="mt-2 max-h-[360px] overflow-y-auto rounded-md border border-slate-200 bg-white">

            {grouped.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">No products match "{query}".</div>
            ) : (
              grouped.map((g) => (
                <div key={g.category}>
                  <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-2.5 py-1 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {PRODUCT_CATEGORY_LABELS[g.category]}
                    </p>
                    <p className="text-[10px] text-slate-400 tabular-nums">{g.items.length}</p>
                  </div>
                  {g.items.map((p) => (
                    <ProductRow
                      key={p.name}
                      product={p}
                      onClick={() => {
                        onSelect(p.name);
                        setQuery("");
                      }}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onClick }: { product: CatalogProduct; onClick: () => void }) {
  const flow = adaptCatalogProduct(product);
  const variants = getProductVariants(product);
  const fit = scoreProductFit(product);
  const tone = fitTone(fit.score);
  const Icon = flow.icon;
  return (
    <button
      onClick={onClick}
      title={fit.why}
      className="w-full flex items-center gap-2 px-2.5 h-8 text-left border-l-2 border-transparent bg-white hover:bg-slate-50 hover:border-slate-900 transition-colors"
    >
      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
      <span className="text-xs truncate flex-1 text-slate-700">{product.name}</span>
      <span className={`shrink-0 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold tabular-nums ${tone.cls}`}>
        fit {fit.score}
      </span>
      <span className="text-[10px] font-mono text-slate-500 shrink-0 tabular-nums">
        {variants.total.toLocaleString()} campaigns
      </span>

      <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
        {fmt(flow.estimatedAudience)}
      </span>
    </button>
  );
}
