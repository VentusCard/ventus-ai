import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, CreditCard } from "lucide-react";
import { useState } from "react";
import type { CardProduct } from "@/types/bankwide";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { CollapsibleCard } from "./CollapsibleCard";

// Extended pillar colors for all pillars used in bankwide data
const PILLAR_COLOR_MAP: Record<string, string> = {
  "Food & Dining": "#f59e0b",
  "Travel & Exploration": "#8b5cf6",
  "Style & Beauty": "#f43f5e",
  "Home & Living": "#ec4899",
  "Entertainment & Culture": "#6366f1",
  "Health & Wellness": "#10b981",
  "Learning & Growth": "#3b82f6",
  "Family & Relationships": "#14b8a6",
  "Professional & Career": "#a855f7",
  "Technology & Innovation": "#ef4444",
  "Transportation": "#06b6d4",
  "Miscellaneous & Unclassified": "#64748b",
  ...PILLAR_COLORS
};

interface CardProductMatrixProps {
  products: CardProduct[];
}

export function CardProductMatrix({ products }: CardProductMatrixProps) {
  const [sortKey, setSortKey] = useState<keyof CardProduct>('accountCount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: keyof CardProduct) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (aValue > bValue ? 1 : -1) * multiplier;
  });

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toLocaleString()}`;
  };

  // Calculate insights for preview
  const topProduct = [...products].sort((a, b) => b.avgSpendPerAccount - a.avgSpendPerAccount)[0];
  const lowestPenetration = [...products].sort((a, b) => a.penetrationRate - b.penetrationRate)[0];
  const avgPenetration = products.reduce((sum, p) => sum + p.penetrationRate, 0) / products.length;

  const previewContent = (
    <div className="text-sm">
      <span className="text-slate-900 font-medium">{topProduct?.name}</span>
      <span className="text-slate-500"> leads with </span>
      <span className="text-primary font-medium">{formatCurrency(topProduct?.avgSpendPerAccount || 0)}/account</span>
      <span className="text-slate-500">. </span>
      <span className="text-amber-600 font-medium">{lowestPenetration?.name}</span>
      <span className="text-slate-500"> has lowest penetration at </span>
      <span className="text-amber-600 font-medium">{lowestPenetration?.penetrationRate.toFixed(1)}%</span>
      <span className="text-slate-500"> — growth opportunity.</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="Card Product Performance Matrix"
      icon={<CreditCard className="h-5 w-5 text-primary" />}
      previewContent={previewContent}
    >
      <div className="rounded-md border border-slate-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-slate-900">Product Name</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50 font-semibold text-slate-900"
                onClick={() => handleSort('accountCount')}
              >
                <div className="flex items-center gap-1">
                  Accounts
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50 font-semibold text-slate-900"
                onClick={() => handleSort('uniqueUsers')}
              >
                <div className="flex items-center gap-1">
                  Unique Users
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50 font-semibold text-slate-900"
                onClick={() => handleSort('penetrationRate')}
              >
                <div className="flex items-center gap-1">
                  Penetration
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50 font-semibold text-slate-900"
                onClick={() => handleSort('avgSpendPerAccount')}
              >
                <div className="flex items-center gap-1">
                  Avg Spend/Account
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-900">Top Pillar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.name} className="hover:bg-slate-50 cursor-pointer">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{formatNumber(product.accountCount)}</TableCell>
                <TableCell>{formatNumber(product.uniqueUsers)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {product.penetrationRate.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(product.avgSpendPerAccount)}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: PILLAR_COLOR_MAP[product.topPillar] || "#64748b",
                      color: PILLAR_COLOR_MAP[product.topPillar] || "#64748b"
                    }}
                  >
                    {product.topPillar}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CollapsibleCard>
  );
}
