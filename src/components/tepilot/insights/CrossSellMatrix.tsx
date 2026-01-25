import { TrendingUp } from "lucide-react";
import type { CrossSellMatrixCell } from "@/types/bankwide";
import { CollapsibleCard } from "./CollapsibleCard";

interface CrossSellMatrixProps {
  matrixData: CrossSellMatrixCell[][];
}

export function CrossSellMatrix({ matrixData }: CrossSellMatrixProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(1)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  const getColorClass = (level: string): string => {
    switch (level) {
      case 'high':
        return 'bg-red-100 border-red-200 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200';
      case 'low':
        return 'bg-gray-100 border-gray-200 hover:bg-gray-200';
      default: // none
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Extract row headers from first cell of each row
  const rowHeaders = matrixData.map(row => row[0].fromCard);

  // Extract column headers from all cells in the first row
  const columnHeaders = matrixData.length > 0 
    ? matrixData[0].map(cell => cell.toCard)
    : [];

  const totalOpportunity = matrixData.flat().reduce((sum, cell) => sum + cell.annualOpportunity, 0);
  const highOpportunities = matrixData.flat().filter(c => c.opportunityLevel === 'high');
  const topOpportunity = [...matrixData.flat()].sort((a, b) => b.annualOpportunity - a.annualOpportunity)[0];

  const previewContent = (
    <div className="text-sm">
      <span className="text-primary font-medium">{formatCurrency(totalOpportunity)}</span>
      <span className="text-slate-500"> in cross-sell potential. Top opportunity: </span>
      <span className="text-slate-900 font-medium">{topOpportunity?.fromCard} → {topOpportunity?.toCard}</span>
      <span className="text-slate-500"> worth </span>
      <span className="text-primary font-medium">{formatCurrency(topOpportunity?.annualOpportunity || 0)}</span>
      <span className="text-slate-500"> with </span>
      <span className="text-slate-900 font-medium">{formatNumber(topOpportunity?.potentialUsers || 0)} users</span>
      <span className="text-slate-500">.</span>
    </div>
  );

  const headerRight = (
    <div className="text-right">
      <div className="text-xl font-bold text-primary">{formatCurrency(totalOpportunity)}</div>
      <div className="text-xs text-slate-500">Total Opportunity</div>
    </div>
  );

  return (
    <CollapsibleCard
      title="Cross-Sell Opportunity Matrix"
      description="Annual opportunity and potential users for cross-selling from current card (rows) to target card (columns)"
      icon={<TrendingUp className="h-5 w-5 text-primary" />}
      headerRight={headerRight}
      previewContent={previewContent}
    >
      <div className="overflow-x-auto">
        <div className="grid gap-0 border border-slate-200 rounded-lg overflow-hidden min-w-[900px]" style={{ gridTemplateColumns: `auto repeat(${columnHeaders.length}, 1fr)` }}>
          {/* Top-left empty corner */}
          <div className="bg-slate-100 p-4 border-r border-b border-slate-200 font-semibold text-sm text-slate-900">
            From / To
          </div>
          
          {/* Column headers (target cards) */}
          {columnHeaders.map((product) => (
            <div 
              key={`col-${product}`}
              className="bg-slate-100 p-3 border-r border-b border-slate-200 font-semibold text-xs text-center text-slate-900"
            >
              {product}
            </div>
          ))}
          
          {/* Matrix rows */}
          {matrixData.map((row, rowIndex) => (
            <>
              {/* Row header (source card) */}
              <div 
                key={`row-${rowIndex}`}
                className="bg-slate-100 p-3 border-r border-b border-slate-200 font-semibold text-xs flex items-center text-slate-900"
              >
                {rowHeaders[rowIndex]}
              </div>
              
              {/* Matrix cells */}
              {row.map((cell, colIndex) => (
                <div 
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`p-3 border-r border-b border-slate-200 transition-colors ${getColorClass(cell.opportunityLevel)}`}
                >
                  {cell.opportunityLevel === 'none' ? (
                    <div className="text-slate-500 text-center text-sm">N/A</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-900">
                        {formatCurrency(cell.annualOpportunity)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatNumber(cell.potentialUsers)} users
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="text-sm text-slate-500">
            <strong className="text-slate-700">Color Legend:</strong>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
            <span className="text-xs text-slate-500">$2B and above</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded" />
            <span className="text-xs text-slate-500">$1-2B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded" />
            <span className="text-xs text-slate-500">Below $1B</span>
          </div>
        </div>
      </div>
    </CollapsibleCard>
  );
}
