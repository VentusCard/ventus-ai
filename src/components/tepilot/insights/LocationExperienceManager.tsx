import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Plus, Search, Pencil, Trash2, Star,
  ExternalLink, Calendar, Check, Users, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INITIAL_PERKS, CATEGORY_CONFIG, TIER_COLORS,
  type LocationPerk, type PerkCategory, type Eligibility,
} from "@/lib/locationPerksData";

const WEALTH_TIERS = ["All Clients", "Mass Market", "Affluent", "HNW", "UHNW"] as const;
const AGE_RESTRICTIONS = ["No Restriction", "18+", "21+", "55+", "65+"] as const;

const DEFAULT_ELIGIBILITY: Eligibility = { wealthTiers: ["All Clients"], ageRestriction: "No Restriction", customRules: "" };

const INITIAL_PERKS: LocationPerk[] = [
  {
    id: "1", city: "New York", state: "NY", title: "Mets Home Game Access",
    tagline: "Front-row seats to every home game",
    description: "Complimentary tickets to any regular season Mets home game at Citi Field, including access to the Delta Sky360° Club.",
    category: "Sports", tier: "Premium", partner: "New York Mets", value: "$250/game",
    startDate: "2025-04-01", endDate: "2025-09-30", link: "https://www.mlb.com/mets",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "2", city: "New York", state: "NY", title: "Le Bernardin Priority Reservations",
    tagline: "Skip the waitlist at NYC's finest",
    description: "Skip the waitlist with guaranteed same-week reservations at Le Bernardin, plus complimentary amuse-bouche.",
    category: "Dining", tier: "Private", partner: "Le Bernardin", value: "$75 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://le-bernardin.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: true,
  },
  {
    id: "3", city: "New York", state: "NY", title: "Broadway Show Pre-Sale",
    tagline: "See the best shows before anyone else",
    description: "48-hour pre-sale access to top Broadway shows with up to 30% off premium seating.",
    category: "Entertainment", tier: "Preferred", partner: "Telecharge", value: "30% off",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.telecharge.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "4", city: "Los Angeles", state: "CA", title: "Lakers Courtside Lounge",
    tagline: "The ultimate courtside experience",
    description: "Access to the exclusive courtside lounge during all Lakers home games with complimentary food and beverage.",
    category: "Sports", tier: "Premium", partner: "LA Lakers", value: "$500/game",
    startDate: "2025-10-01", endDate: "2026-04-15", link: "https://www.nba.com/lakers",
    eligibility: { wealthTiers: ["UHNW"], ageRestriction: "No Restriction", customRules: "Minimum $5M AUM" }, active: true,
  },
  {
    id: "5", city: "Los Angeles", state: "CA", title: "LACMA After-Hours Tour",
    tagline: "Exclusive curator-led art experiences",
    description: "Private after-hours access to LACMA exhibitions with guided tours by senior curators.",
    category: "Art", tier: "Private", partner: "LACMA", value: "Free entry",
    startDate: "2025-03-01", endDate: "2025-11-30", link: "https://www.lacma.org",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "6", city: "Chicago", state: "IL", title: "Art Institute After-Hours",
    tagline: "Chicago's art treasures, all to yourself",
    description: "Exclusive after-hours access to the Art Institute of Chicago with guided curator tours.",
    category: "Culture", tier: "Preferred", partner: "Art Institute of Chicago", value: "Free entry",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.artic.edu",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "7", city: "Chicago", state: "IL", title: "Cubs Wrigley Field Suite",
    tagline: "Private suite with legendary Wrigley views",
    description: "Private suite access for Cubs home games at Wrigley Field, including catering for up to 8 guests.",
    category: "Sports", tier: "Premium", partner: "Chicago Cubs", value: "$1,200/game",
    startDate: "2025-04-01", endDate: "2025-09-30", link: "https://www.mlb.com/cubs",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "No Restriction", customRules: "" }, active: true,
  },
  {
    id: "8", city: "Miami", state: "FL", title: "Equinox Premium Membership",
    tagline: "Elevate your fitness in paradise",
    description: "Complimentary 3-month Equinox membership at any Miami location with personal training sessions.",
    category: "Fitness", tier: "Private", partner: "Equinox", value: "$900 value",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.equinox.com",
    eligibility: { wealthTiers: ["Affluent", "HNW", "UHNW"], ageRestriction: "18+", customRules: "" }, active: true,
  },
  {
    id: "9", city: "Miami", state: "FL", title: "South Beach Food Tour",
    tagline: "Taste the best of South Beach",
    description: "Guided culinary experience through South Beach's top restaurants with exclusive tasting menus.",
    category: "Dining", tier: "All Members", partner: "Miami Culinary Tours", value: "50% off",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "10", city: "San Francisco", state: "CA", title: "Giants Oracle Park Experience",
    tagline: "VIP treatment at the ballpark",
    description: "VIP pre-game batting practice viewing and exclusive clubhouse-level seating.",
    category: "Sports", tier: "Preferred", partner: "SF Giants", value: "$175/game",
    startDate: "2025-04-01", endDate: "2025-09-30", link: "https://www.mlb.com/giants",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "11", city: "San Francisco", state: "CA", title: "Ferry Building Tasting Pass",
    tagline: "Artisan flavors by the bay",
    description: "All-access tasting pass at Ferry Building Marketplace artisan vendors, refreshed monthly.",
    category: "Shopping", tier: "All Members", partner: "Ferry Building Marketplace", value: "$50 credit",
    startDate: "2025-01-01", endDate: "2025-12-31", link: "https://www.ferrybuildingmarketplace.com",
    eligibility: { ...DEFAULT_ELIGIBILITY }, active: true,
  },
  {
    id: "12", city: "Austin", state: "TX", title: "ACL Festival VIP Pass",
    tagline: "Backstage at Austin's biggest festival",
    description: "VIP weekend passes to Austin City Limits Music Festival with backstage meet-and-greets.",
    category: "Entertainment", tier: "Premium", partner: "ACL Festival", value: "$800 value",
    startDate: "2025-10-03", endDate: "2025-10-12", link: "https://www.aclfestival.com",
    eligibility: { wealthTiers: ["HNW", "UHNW"], ageRestriction: "21+", customRules: "" }, active: false,
  },
];

const CITIES = [...new Set(INITIAL_PERKS.map(p => p.city))].sort();

type FormData = Omit<LocationPerk, "id">;

const EMPTY_PERK: FormData = {
  city: "", state: "", title: "", tagline: "", description: "",
  category: "Sports", tier: "All Members", partner: "", value: "",
  startDate: "", endDate: "", link: "",
  eligibility: { ...DEFAULT_ELIGIBILITY },
  active: true,
};

export function LocationExperienceManager() {
  const [perks, setPerks] = useState<LocationPerk[]>(INITIAL_PERKS);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editDialog, setEditDialog] = useState<{ open: boolean; perk: LocationPerk | null }>({ open: false, perk: null });
  const [formData, setFormData] = useState<FormData>(EMPTY_PERK);

  const filteredPerks = perks.filter(p => {
    if (cityFilter !== "all" && p.city !== cityFilter) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.partner.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
    }
    return true;
  });

  const groupedByCity = filteredPerks.reduce<Record<string, LocationPerk[]>>((acc, p) => {
    const key = `${p.city}, ${p.state}`;
    (acc[key] ||= []).push(p);
    return acc;
  }, {});

  const openCreate = () => {
    setFormData(EMPTY_PERK);
    setEditDialog({ open: true, perk: null });
  };

  const openEdit = (perk: LocationPerk) => {
    const { id, ...rest } = perk;
    setFormData(rest);
    setEditDialog({ open: true, perk });
  };

  const handleSave = () => {
    if (editDialog.perk) {
      setPerks(prev => prev.map(p => p.id === editDialog.perk!.id ? { ...formData, id: p.id } : p));
    } else {
      setPerks(prev => [...prev, { ...formData, id: crypto.randomUUID() }]);
    }
    setEditDialog({ open: false, perk: null });
  };

  const handleDelete = (id: string) => setPerks(prev => prev.filter(p => p.id !== id));
  const toggleActive = (id: string) => setPerks(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const cityCount = (city: string) => perks.filter(p => p.city === city).length;
  const activeCount = perks.filter(p => p.active).length;

  const toggleWealthTier = (tier: string) => {
    setFormData(p => {
      const current = p.eligibility.wealthTiers;
      if (tier === "All Clients") {
        return { ...p, eligibility: { ...p.eligibility, wealthTiers: ["All Clients"] } };
      }
      const without = current.filter(t => t !== "All Clients" && t !== tier);
      const next = current.includes(tier) ? without : [...without, tier];
      return { ...p, eligibility: { ...p.eligibility, wealthTiers: next.length === 0 ? ["All Clients"] : next } };
    });
  };

  const eligibilityLabel = (perk: LocationPerk) => {
    const tiers = perk.eligibility.wealthTiers;
    const showTiers = tiers.length > 0 && !tiers.includes("All Clients");
    const showAge = perk.eligibility.ageRestriction && perk.eligibility.ageRestriction !== "No Restriction";
    return { showTiers, showAge, tiers, age: perk.eligibility.ageRestriction };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Location Experiences</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage city-specific perks and experiences across {CITIES.length} cities · {activeCount} active perks
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Experience
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search experiences, partners..." className="pl-9 h-9 text-sm bg-white border-slate-200 !text-slate-900" />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-slate-200 !text-slate-900"><SelectValue placeholder="All Cities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITIES.map(c => <SelectItem key={c} value={c}>{c} ({cityCount(c)})</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-slate-200 !text-slate-900"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(CATEGORY_CONFIG) as PerkCategory[]).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* City Groups */}
      <div className="space-y-6">
        {Object.entries(groupedByCity).sort(([a], [b]) => a.localeCompare(b)).map(([cityLabel, cityPerks]) => (
          <div key={cityLabel}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">{cityLabel}</h3>
              <Badge variant="secondary" className="text-[10px] h-5">{cityPerks.length} experiences</Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {cityPerks.map(perk => {
                const cc = CATEGORY_CONFIG[perk.category];
                const CatIcon = cc.icon;
                const elig = eligibilityLabel(perk);
                return (
                  <Card key={perk.id} className={cn("p-4 border transition-all hover:shadow-sm", perk.active ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-60")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border", cc.color)}>
                          <CatIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-slate-900 truncate">{perk.title}</p>
                            {!perk.active && <Badge variant="outline" className="text-[10px] h-4 border-slate-300 text-slate-400">Inactive</Badge>}
                          </div>
                          {perk.tagline && <p className="text-xs italic text-slate-500 mb-1">{perk.tagline}</p>}
                          <p className="text-xs text-slate-500 line-clamp-2 mb-2">{perk.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] h-5 border-slate-200">{perk.partner}</Badge>
                            <Badge className={cn("text-[10px] h-5 border-0", TIER_COLORS[perk.tier])}>{perk.tier}</Badge>
                            <span className="text-[11px] font-medium text-green-700 flex items-center gap-0.5">
                              <Star className="h-3 w-3" />{perk.value}
                            </span>
                            {perk.startDate && perk.endDate && (
                              <Badge variant="outline" className="text-[10px] h-5 border-slate-200 text-slate-500">
                                <Calendar className="h-2.5 w-2.5 mr-1" />
                                {perk.startDate} — {perk.endDate}
                              </Badge>
                            )}
                            {elig.showTiers && (
                              <Badge variant="outline" className="text-[10px] h-5 border-amber-200 text-amber-700 bg-amber-50">
                                <Users className="h-2.5 w-2.5 mr-1" />{elig.tiers.join(", ")}
                              </Badge>
                            )}
                            {elig.showAge && (
                              <Badge variant="outline" className="text-[10px] h-5 border-rose-200 text-rose-700 bg-rose-50">
                                <ShieldCheck className="h-2.5 w-2.5 mr-1" />{elig.age}
                              </Badge>
                            )}
                            {perk.link && (
                              <a href={perk.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" onClick={e => e.stopPropagation()}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(perk)}><Pencil className="h-3.5 w-3.5 text-slate-400" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(perk.id)}>
                          <div className={cn("h-3 w-3 rounded-full border-2", perk.active ? "bg-green-500 border-green-500" : "border-slate-300")} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(perk.id)}><Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" /></Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(groupedByCity).length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No experiences match your filters</p>
          </div>
        )}
      </div>

      {/* Single-page Create/Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(v) => { if (!v) setEditDialog({ open: false, perk: null }); }}>
        <DialogContent className="max-w-2xl bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{editDialog.perk ? "Edit Experience" : "Create Experience"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Section 1: Location & Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Location & Type</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">City</Label>
                  <Input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} placeholder="e.g. New York" className="h-9 text-sm bg-white !text-slate-900" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">State</Label>
                  <Input value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} placeholder="e.g. NY" className="h-9 text-sm bg-white !text-slate-900" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Experience Category</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(CATEGORY_CONFIG) as [PerkCategory, typeof CATEGORY_CONFIG[PerkCategory]][]).map(([cat, cfg]) => {
                    const Icon = cfg.icon;
                    const selected = formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, category: cat }))}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center cursor-pointer",
                          selected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border", cfg.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={cn("text-[11px] font-medium", selected ? "text-blue-700" : "text-slate-600")}>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Section 2: Experience Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Experience Details</h3>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Experience Title</Label>
                <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mets Home Game Access" className="h-9 text-sm bg-white !text-slate-900" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Tagline</Label>
                <Input value={formData.tagline} onChange={e => setFormData(p => ({ ...p, tagline: e.target.value }))} placeholder="e.g. Front-row seats to every home game" className="h-9 text-sm bg-white !text-slate-900" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the experience..." className="text-sm bg-white min-h-[80px] !text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Partner</Label>
                  <Input value={formData.partner} onChange={e => setFormData(p => ({ ...p, partner: e.target.value }))} placeholder="e.g. New York Mets" className="h-9 text-sm bg-white !text-slate-900" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Value</Label>
                  <Input value={formData.value} onChange={e => setFormData(p => ({ ...p, value: e.target.value }))} placeholder="e.g. $250/game" className="h-9 text-sm bg-white !text-slate-900" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Member Tier</Label>
                <Select value={formData.tier} onValueChange={v => setFormData(p => ({ ...p, tier: v as LocationPerk["tier"] }))}>
                  <SelectTrigger className="h-9 text-sm bg-white !text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Members">All Members</SelectItem>
                    <SelectItem value="Preferred">Preferred</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Start Date</Label>
                  <Input type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="h-9 text-sm bg-white !text-slate-900" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">End Date</Label>
                  <Input type="date" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} className="h-9 text-sm bg-white !text-slate-900" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Link (URL)</Label>
                <Input value={formData.link} onChange={e => setFormData(p => ({ ...p, link: e.target.value }))} placeholder="https://..." className="h-9 text-sm bg-white !text-slate-900" />
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Section 3: Eligibility & Restrictions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Eligibility & Restrictions</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Client Wealth Tiers</Label>
                <div className="flex flex-wrap gap-2">
                  {WEALTH_TIERS.map(tier => {
                    const selected = formData.eligibility.wealthTiers.includes(tier);
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => toggleWealthTier(tier)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all cursor-pointer",
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {selected && <Check className="h-3 w-3 inline mr-1" />}
                        {tier}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Age Restriction</Label>
                <Select value={formData.eligibility.ageRestriction} onValueChange={v => setFormData(p => ({ ...p, eligibility: { ...p.eligibility, ageRestriction: v } }))}>
                  <SelectTrigger className="h-9 text-sm bg-white !text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AGE_RESTRICTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Custom Rules / Notes</Label>
                <Textarea
                  value={formData.eligibility.customRules}
                  onChange={e => setFormData(p => ({ ...p, eligibility: { ...p.eligibility, customRules: e.target.value } }))}
                  placeholder="e.g. Minimum $5M AUM, Wealth Management clients only..."
                  className="text-sm bg-white min-h-[60px] !text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditDialog({ open: false, perk: null })}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.city || !formData.title} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Check className="h-4 w-4 mr-1.5" />{editDialog.perk ? "Save Changes" : "Create Experience"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}