import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Package, Users, TrendingUp } from "lucide-react";
import { AvailableDealCard } from "./AvailableDealCard";
import { getAvailableDeals, getDealCategories, DEAL_CATEGORIES, type DealCategory } from "@/lib/availableDealsData";

const DEALS_PER_PAGE = 40;

export function AvailableDealsGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'popularity' | 'activations' | 'newest'>("popularity");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = getDealCategories();

  const filteredDeals = useMemo(() => {
    return getAvailableDeals({
      category: selectedCategory,
      search: searchQuery,
      sortBy,
    });
  }, [selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredDeals.length / DEALS_PER_PAGE);
  const paginatedDeals = useMemo(() => {
    const start = (currentPage - 1) * DEALS_PER_PAGE;
    return filteredDeals.slice(start, start + DEALS_PER_PAGE);
  }, [filteredDeals, currentPage]);

  const stats = useMemo(() => {
    const totalActivations = filteredDeals.reduce((sum, deal) => sum + deal.activationCount, 0);
    const avgRedemption = filteredDeals.length > 0
      ? Math.round(filteredDeals.reduce((sum, deal) => sum + deal.averageRedemption, 0) / filteredDeals.length)
      : 0;
    return { totalActivations, avgRedemption };
  }, [filteredDeals]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Deals Library</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filteredDeals.length} merchant deals across {Object.keys(DEAL_CATEGORIES).length} categories
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{filteredDeals.length} Deals</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {(stats.totalActivations / 1000000).toFixed(1)}M Activations
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{stats.avgRedemption}% Avg Rate</span>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search deals, merchants..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">By Popularity</SelectItem>
            <SelectItem value="activations">By Activations</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const categoryConfig = category !== 'All' ? DEAL_CATEGORIES[category as DealCategory] : null;
          
          return (
            <Button
              key={category}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category)}
              className={`rounded-full text-xs transition-all ${
                isSelected 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'hover:bg-slate-100'
              }`}
            >
              {categoryConfig && (
                <span className="mr-1">{categoryConfig.icon}</span>
              )}
              {category}
            </Button>
          );
        })}
      </div>

      {/* Deals Grid */}
      {paginatedDeals.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedDeals.map((deal) => (
            <AvailableDealCard
              key={deal.id}
              deal={deal}
              categoryConfig={DEAL_CATEGORIES[deal.category as DealCategory]}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">No deals found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              } else if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return <span key={page} className="px-1 text-slate-400">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
