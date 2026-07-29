import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Target, Calendar, Mail, MousePointerClick } from "lucide-react";
import { LIFESTYLE_PILLARS, estimateStudioAudienceSize } from "@/lib/campaignStudioData";
import { LIFE_EVENTS } from "@/types/segment";

const FINANCIAL_SIGNALS = [
  "Auto Loan Renewal",
  "Home Purchase / Transition",
  "HELOC Opportunity",
  "Mortgage Refi Window",
  "Investment Account Migration",
];

const DEMOGRAPHIC_SIGNALS = [
  "College Preparation",
  "New Parent / Family Formation",
  "Pre-Retiree",
  "High-Income Professional",
  "Small Business Owner",
];

const AGE_RANGES = ["25-34", "35-44", "45-54", "55-64", "65+"];
const INCOME_BANDS = ["<$75k", "$75k-$150k", "$150k-$250k", ">$250k"];

const formatAudience = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString();
};

type Draft = {
  id: string;
  requires: string; // spending habit pillar that gates this draft
  segment: string;
  reach: number;
  subject: string;
  body: string;
  valueMath: string;
};

const EMAIL_DRAFTS: Draft[] = [
  {
    id: "dining",
    requires: "Dining & Nightlife",
    segment: "Dining-led households",
    reach: 18420,
    subject: "Your dining habit could earn you $237 more this year",
    body: "You spend most nights out — pick Dining as your 3% category and keep 2% on groceries and wholesale clubs. Everything else earns 1%.",
    valueMath: "~$280/mo dining + ~$650/mo grocery ≈ $237/yr vs a flat 1% card.",
  },
  {
    id: "grocery",
    requires: "Grocery & Household",
    segment: "Grocery-led families",
    reach: 24310,
    subject: "3% back on the aisle you visit every week",
    body: "Groceries are your #1 spend. Set 3% on Grocery, keep 2% on Gas & Fuel for the commute, and 1% on the rest. $0 annual fee.",
    valueMath: "~$850/mo grocery + ~$220/mo gas ≈ $359/yr vs a flat 1% card.",
  },
  {
    id: "gas",
    requires: "Gas & Fuel",
    segment: "Commuter households",
    reach: 12180,
    subject: "3% at the pump, 2% on dinners out",
    body: "You're on the road daily. Choose Gas as your 3% category, keep Dining at 2%, and 1% everywhere else. Plus a $200 welcome bonus after $1,000 in 90 days.",
    valueMath: "~$320/mo gas + ~$180/mo dining ≈ $158/yr vs a flat 1% card.",
  },
];

const CampaignStudioPreview = () => {
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([
    "Dining & Nightlife",
    "Grocery & Household",
    "Gas & Fuel",
  ]);
  const [selectedLifeEvents, setSelectedLifeEvents] = useState<string[]>(["family"]);
  const [selectedFinancial, setSelectedFinancial] = useState<string[]>([]);
  const [selectedDemographic, setSelectedDemographic] = useState<string[]>(["New Parent / Family Formation"]);
  const [ageRanges, setAgeRanges] = useState<string[]>(["35-44"]);
  const [incomeBands, setIncomeBands] = useState<string[]>(["$75k-$150k", "$150k-$250k"]);
  const [generating, setGenerating] = useState(false);
  const [briefVisible, setBriefVisible] = useState(true);

  const audience = useMemo(() => {
    return estimateStudioAudienceSize({
      selectedPillars: selectedLifestyles,
      lifeEventTypes: selectedLifeEvents,
      selectedProducts: {},
      selectedRegions: [],
      selectedMetros: [],
      areaType: "All",
      crossSellStrategies: [],
      upsellStrategies: [],
      demographicAgeRanges: ageRanges,
      demographicIncomeBands: incomeBands,
      demographicAccountTenure: "all",
    });
  }, [selectedLifestyles, selectedLifeEvents, ageRanges, incomeBands]);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setBriefVisible(false);
    setTimeout(() => {
      setGenerating(false);
      setBriefVisible(true);
    }, 900);
  };

  const activeDrafts = useMemo(() => {
    const matched = EMAIL_DRAFTS.filter((d) => selectedLifestyles.includes(d.requires));
    return matched.length ? matched.slice(0, 3) : [EMAIL_DRAFTS[0]];
  }, [selectedLifestyles]);

  return (
    <div
      className="rounded-2xl bg-white"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
        padding: 24,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <p className="text-[11px] font-mono text-gray-500">Campaign Studio · Powered by Ventus</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
          <Users className="w-3.5 h-3.5" />
          <span>Estimated audience: {formatAudience(audience)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Left: Signal builder */}
        <div className="space-y-5">
          {/* Life Events */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900">Life Events</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {LIFE_EVENTS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => toggle(selectedLifeEvents, e.id, setSelectedLifeEvents)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedLifeEvents.includes(e.id)
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900">Spending Habits</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE_PILLARS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggle(selectedLifestyles, p, setSelectedLifestyles)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedLifestyles.includes(p)
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Financial Signals */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900">Financial Signals</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {FINANCIAL_SIGNALS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(selectedFinancial, s, setSelectedFinancial)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedFinancial.includes(s)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-900">Demographics</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEMOGRAPHIC_SIGNALS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(selectedDemographic, s, setSelectedDemographic)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedDemographic.includes(s)
                      ? "bg-purple-50 border-purple-200 text-purple-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Age</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggle(ageRanges, a, setAgeRanges)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                        ageRanges.includes(a)
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Income</p>
                <div className="flex flex-wrap gap-2">
                  {INCOME_BANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => toggle(incomeBands, b, setIncomeBands)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                        incomeBands.includes(b)
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product + segmented email drafts */}
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-[11px] uppercase tracking-wide text-blue-600 mb-1">The Product</p>
            <p className="text-base font-semibold text-gray-900">Cash Rewards Card</p>
            <p className="text-xs text-gray-700 mt-1 leading-relaxed">
              <span className="font-medium">3%</span> on your top spending category ·{" "}
              <span className="font-medium">2%</span> on your second · <span className="font-medium">1%</span>{" "}
              everything else.
            </p>
            <p className="text-[11px] text-gray-500 mt-2">
              $0 annual fee · $200 online cash rewards after $1,000 in the first 90 days.
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Drafting emails...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Segmented Emails
              </span>
            )}
          </Button>

          {briefVisible && !generating && (
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">Email drafts</h4>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">
                  {activeDrafts.length} segment{activeDrafts.length === 1 ? "" : "s"}
                </Badge>
              </div>

              {activeDrafts.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-white border border-gray-200"
                  style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.03)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                      {d.segment}
                    </span>
                    <span className="text-[11px] text-gray-500">{formatAudience(d.reach)} reachable</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{d.subject}</p>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">{d.body}</p>
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1 inline-block">
                    {d.valueMath}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1.5">
                      {["Email", "Mobile Push", "In-App"].map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignStudioPreview;
