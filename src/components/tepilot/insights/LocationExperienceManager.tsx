import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Plus, Search, Pencil, Trash2, Star, Ticket,
  UtensilsCrossed, Music, Landmark, ShoppingBag, Dumbbell, Plane
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationPerk {
  id: string;
  city: string;
  state: string;
  title: string;
  description: string;
  category: PerkCategory;
  tier: "All Members" | "Preferred" | "Private" | "Premium";
  partner: string;
  value: string;
  active: boolean;
}

type PerkCategory = "Sports" | "Dining" | "Entertainment" | "Culture" | "Shopping" | "Fitness" | "Travel";

const CATEGORY_CONFIG: Record<PerkCategory, { icon: React.ElementType; color: string }> = {
  Sports: { icon: Ticket, color: "text-green-600 bg-green-50 border-green-200" },
  Dining: { icon: UtensilsCrossed, color: "text-orange-600 bg-orange-50 border-orange-200" },
  Entertainment: { icon: Music, color: "text-purple-600 bg-purple-50 border-purple-200" },
  Culture: { icon: Landmark, color: "text-blue-600 bg-blue-50 border-blue-200" },
  Shopping: { icon: ShoppingBag, color: "text-pink-600 bg-pink-50 border-pink-200" },
  Fitness: { icon: Dumbbell, color: "text-red-600 bg-red-50 border-red-200" },
  Travel: { icon: Plane, color: "text-sky-600 bg-sky-50 border-sky-200" },
};

const TIER_COLORS: Record<string, string> = {
  "All Members": "bg-slate-100 text-slate-700",
  Preferred: "bg-blue-100 text-blue-700",
  Private: "bg-amber-100 text-amber-800",
  Premium: "bg-purple-100 text-purple-700",
};

const INITIAL_PERKS: LocationPerk[] = [
  {
    id: "1", city: "New York", state: "NY", title: "Mets Home Game Access",
    description: "Complimentary tickets to any regular season Mets home game at Citi Field, including access to the Delta Sky360° Club.",
    category: "Sports", tier: "Premium", partner: "New York Mets", value: "$250/game", active: true,
  },
  {
    id: "2", city: "New York", state: "NY", title: "Le Bernardin Priority Reservations",
    description: "Skip the waitlist with guaranteed same-week reservations at Le Bernardin, plus complimentary amuse-bouche.",
    category: "Dining", tier: "Private", partner: "Le Bernardin", value: "$75 credit", active: true,
  },
  {
    id: "3", city: "New York", state: "NY", title: "Broadway Show Pre-Sale",
    description: "48-hour pre-sale access to top Broadway shows with up to 30% off premium seating.",
    category: "Entertainment", tier: "Preferred", partner: "Telecharge", value: "30% off", active: true,
  },
  {
    id: "4", city: "Los Angeles", state: "CA", title: "Lakers Courtside Lounge",
    description: "Access to the exclusive courtside lounge during all Lakers home games with complimentary food and beverage.",
    category: "Sports", tier: "Premium", partner: "LA Lakers", value: "$500/game", active: true,
  },
  {
    id: "5", city: "Los Angeles", state: "CA", title: "Nobu Malibu VIP Table",
    description: "Priority seating at Nobu Malibu with a complimentary dessert tasting for the table.",
    category: "Dining", tier: "Private", partner: "Nobu", value: "$100 credit", active: true,
  },
  {
    id: "6", city: "Chicago", state: "IL", title: "Art Institute After-Hours",
    description: "Exclusive after-hours access to the Art Institute of Chicago with guided curator tours.",
    category: "Culture", tier: "Preferred", partner: "Art Institute of Chicago", value: "Free entry", active: true,
  },
  {
    id: "7", city: "Chicago", state: "IL", title: "Cubs Wrigley Field Suite",
    description: "Private suite access for Cubs home games at Wrigley Field, including catering for up to 8 guests.",
    category: "Sports", tier: "Premium", partner: "Chicago Cubs", value: "$1,200/game", active: true,
  },
  {
    id: "8", city: "Miami", state: "FL", title: "Equinox Premium Membership",
    description: "Complimentary 3-month Equinox membership at any Miami location with personal training sessions.",
    category: "Fitness", tier: "Private", partner: "Equinox", value: "$900 value", active: true,
  },
  {
    id: "9", city: "Miami", state: "FL", title: "South Beach Food Tour",
    description: "Guided culinary experience through South Beach's top restaurants with exclusive tasting menus.",
    category: "Dining", tier: "All Members", partner: "Miami Culinary Tours", value: "50% off", active: true,
  },
  {
    id: "10", city: "San Francisco", state: "CA", title: "Giants Oracle Park Experience",
    description: "VIP pre-game batting practice viewing and exclusive clubhouse-level seating.",
    category: "Sports", tier: "Preferred", partner: "SF Giants", value: "$175/game", active: true,
  },
  {
    id: "11", city: "San Francisco", state: "CA", title: "Ferry Building Tasting Pass",
    description: "All-access tasting pass at Ferry Building Marketplace artisan vendors, refreshed monthly.",
    category: "Shopping", tier: "All Members", partner: "Ferry Building Marketplace", value: "$50 credit", active: true,
  },
  {
    id: "12", city: "Austin", state: "TX", title: "ACL Festival VIP Pass",
    description: "VIP weekend passes to Austin City Limits Music Festival with backstage meet-and-greets.",
    category: "Entertainment", tier: "Premium", partner: "ACL Festival", value: "$800 value", active: false,
  },
];

const CITIES = [...new Set(INITIAL_PERKS.map(p => p.city))].sort();

const EMPTY_PERK: Omit<LocationPerk, "id"> = {
  city: "", state: "", title: "", description: "",
  category: "Sports", tier: "All Members", partner: "", value: "", active: true,
};

export function LocationExperienceManager() {
  const [perks, setPerks] = useState<LocationPerk[]>(INITIAL_PERKS);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editDialog, setEditDialog] = useState<{ open: boolean; perk: LocationPerk | null }>({ open: false, perk: null });
  const [formData, setFormData] = useState<Omit<LocationPerk, "id">>(EMPTY_PERK);

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

  const handleDelete = (id: string) => {
    setPerks(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = (id: string) => {
    setPerks(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const cityCount = (city: string) => perks.filter(p => p.city === city).length;
  const activeCount = perks.filter(p => p.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Location Experiences</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage city-specific perks and experiences for bank members across {CITIES.length} cities · {activeCount} active perks
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
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experiences, partners..."
            className="pl-9 h-9 text-sm bg-white border-slate-200"
          />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-slate-200">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITIES.map(c => (
              <SelectItem key={c} value={c}>{c} ({cityCount(c)})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-slate-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(CATEGORY_CONFIG) as PerkCategory[]).map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
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
                const catConfig = CATEGORY_CONFIG[perk.category];
                const CatIcon = catConfig.icon;
                return (
                  <Card
                    key={perk.id}
                    className={cn(
                      "p-4 border transition-all hover:shadow-sm",
                      perk.active ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border", catConfig.color)}>
                          <CatIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-slate-900 truncate">{perk.title}</p>
                            {!perk.active && <Badge variant="outline" className="text-[10px] h-4 border-slate-300 text-slate-400">Inactive</Badge>}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-2">{perk.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] h-5 border-slate-200">
                              {perk.partner}
                            </Badge>
                            <Badge className={cn("text-[10px] h-5 border-0", TIER_COLORS[perk.tier])}>
                              {perk.tier}
                            </Badge>
                            <span className="text-[11px] font-medium text-green-700 flex items-center gap-0.5">
                              <Star className="h-3 w-3" />
                              {perk.value}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(perk)}>
                          <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(perk.id)}>
                          <div className={cn("h-3 w-3 rounded-full border-2", perk.active ? "bg-green-500 border-green-500" : "border-slate-300")} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(perk.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                        </Button>
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

      {/* Create / Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(v) => !v && setEditDialog({ open: false, perk: null })}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{editDialog.perk ? "Edit Experience" : "Add Experience"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">City</Label>
                <Input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} placeholder="e.g. New York" className="h-9 text-sm bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">State</Label>
                <Input value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} placeholder="e.g. NY" className="h-9 text-sm bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Experience Title</Label>
              <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mets Home Game Access" className="h-9 text-sm bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the experience..." className="text-sm bg-white min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v as PerkCategory }))}>
                  <SelectTrigger className="h-9 text-sm bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_CONFIG) as PerkCategory[]).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Member Tier</Label>
                <Select value={formData.tier} onValueChange={v => setFormData(p => ({ ...p, tier: v as LocationPerk["tier"] }))}>
                  <SelectTrigger className="h-9 text-sm bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Members">All Members</SelectItem>
                    <SelectItem value="Preferred">Preferred</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Partner</Label>
                <Input value={formData.partner} onChange={e => setFormData(p => ({ ...p, partner: e.target.value }))} placeholder="e.g. New York Mets" className="h-9 text-sm bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Value</Label>
                <Input value={formData.value} onChange={e => setFormData(p => ({ ...p, value: e.target.value }))} placeholder="e.g. $250/game" className="h-9 text-sm bg-white" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, perk: null })}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.city} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editDialog.perk ? "Save Changes" : "Add Experience"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
