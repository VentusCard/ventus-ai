import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, Star, Sparkles, Zap, Users, Percent } from "lucide-react";
import type { AvailableDeal, DealCategory, DEAL_CATEGORIES } from "@/lib/availableDealsData";

interface AvailableDealCardProps {
  deal: AvailableDeal;
  categoryConfig: typeof DEAL_CATEGORIES[DealCategory];
}

const popularityConfig = {
  trending: { label: 'Trending', icon: TrendingUp, className: 'bg-orange-100 text-orange-700 border-orange-200' },
  popular: { label: 'Popular', icon: Star, className: 'bg-blue-100 text-blue-700 border-blue-200' },
  new: { label: 'New', icon: Sparkles, className: 'bg-green-100 text-green-700 border-green-200' },
  featured: { label: 'Featured', icon: Zap, className: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const rewardTypeConfig = {
  cashback: { className: 'bg-emerald-500 text-white' },
  points: { className: 'bg-indigo-500 text-white' },
  discount: { className: 'bg-amber-500 text-white' },
};

export function AvailableDealCard({ deal, categoryConfig }: AvailableDealCardProps) {
  const popularity = popularityConfig[deal.popularity];
  const PopularityIcon = popularity.icon;
  const rewardStyle = rewardTypeConfig[deal.rewardType];

  const formatActivations = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card className="group flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-slate-300">
      {/* Header */}
      <div className="p-3 pb-2 flex items-start justify-between gap-2 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 bg-slate-100">
            {categoryConfig.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm truncate">
              {deal.merchantName}
            </h3>
            <p className="text-xs text-slate-500 truncate">{deal.subcategory}</p>
          </div>
        </div>
        <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0.5 ${categoryConfig.color}`}>
          {deal.category.split(' ')[0]}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div>
          <h4 className="font-medium text-slate-800 text-sm leading-tight line-clamp-1">
            {deal.dealTitle}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {deal.dealDescription}
          </p>
        </div>

        {/* Reward Badge */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <Badge className={`text-xs font-semibold px-2 py-0.5 ${rewardStyle.className}`}>
            {deal.rewardValue}
          </Badge>
          {deal.minPurchase && (
            <span className="text-[10px] text-slate-400">
              Min ${deal.minPurchase}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {formatActivations(deal.activationCount)}
          </span>
          <span className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {deal.averageRedemption}%
          </span>
        </div>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex items-center gap-0.5 ${popularity.className}`}>
          <PopularityIcon className="w-2.5 h-2.5" />
          {popularity.label}
        </Badge>
      </div>
    </Card>
  );
}
