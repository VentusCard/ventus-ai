import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Download, 
  Edit,
  Trash2,
  Bookmark,
  Users,
  FileSpreadsheet,
  FileJson,
  Sparkles,
  Target,
} from "lucide-react";
import { SAVED_SEGMENTS } from "@/lib/segmentData";
import { exportSegment } from "@/lib/segmentExportUtils";
import { toast } from "sonner";
import type { SavedSegment, TargetingMode } from "@/types/segment";

const MODE_STYLES: Record<TargetingMode, { bg: string; text: string; label: string }> = {
  life_event: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Life Event' },
  lifestyle: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Lifestyle' },
  product: { bg: 'bg-green-100', text: 'text-green-700', label: 'Product' },
};

interface SavedSegmentsTableProps {
  onEditSegment: (segment: SavedSegment) => void;
}

export function SavedSegmentsTable({ onEditSegment }: SavedSegmentsTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCriteriaSummary = (segment: SavedSegment) => {
    switch (segment.targetingMode) {
      case 'life_event':
        return segment.lifeEventCriteria?.eventTypes.join(', ') || '—';
      case 'lifestyle':
        return segment.lifestyleCriteria?.pillars.join(', ') || '—';
      case 'product':
        return segment.productCriteria?.hasProducts.join(', ') || '—';
      default:
        return '—';
    }
  };

  const handleExport = (segment: SavedSegment, format: 'csv_standard' | 'csv_mailchimp' | 'csv_sendgrid' | 'json') => {
    exportSegment(
      {
        targetingMode: segment.targetingMode,
        estimatedSize: segment.estimatedSize,
        lifeEventCriteria: segment.lifeEventCriteria,
        lifestyleCriteria: segment.lifestyleCriteria,
        productCriteria: segment.productCriteria,
      },
      format,
      5000
    );
    toast.success(`Exported "${segment.name}"`, {
      description: `Downloaded as ${format.replace('_', ' ').toUpperCase()}`,
    });
  };

  const handleDelete = (segment: SavedSegment) => {
    toast.success(`Deleted "${segment.name}"`);
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Saved Segments</CardTitle>
          </div>
          <Badge variant="outline" className="font-normal">
            {SAVED_SEGMENTS.length} segments
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Previously built segments ready for export
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Segment</TableHead>
                <TableHead className="font-semibold text-slate-700">Mode</TableHead>
                <TableHead className="font-semibold text-slate-700">Criteria</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Est. Size</TableHead>
                <TableHead className="font-semibold text-slate-700">Created</TableHead>
                <TableHead className="font-semibold text-slate-700">Last Export</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Exports</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAVED_SEGMENTS.map((segment) => {
                const modeStyle = MODE_STYLES[segment.targetingMode];
                
                return (
                  <TableRow key={segment.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {segment.targetingMode === 'life_event' ? (
                          <Sparkles className="w-4 h-4 text-purple-500" />
                        ) : segment.targetingMode === 'lifestyle' ? (
                          <Users className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Target className="w-4 h-4 text-green-500" />
                        )}
                        <span className="font-medium text-slate-900 text-sm">{segment.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${modeStyle.bg} ${modeStyle.text}`}>
                        {modeStyle.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 truncate max-w-[200px] block">
                        {getCriteriaSummary(segment)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium text-slate-700">
                        {formatNumber(segment.estimatedSize)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">
                        {formatDate(segment.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">
                        {formatDate(segment.lastExportedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-slate-700">{segment.exportCount}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onEditSegment(segment)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Segment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleExport(segment, 'csv_standard')}>
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Export CSV (Standard)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(segment, 'csv_mailchimp')}>
                            <Download className="w-4 h-4 mr-2" />
                            Export for Mailchimp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(segment, 'csv_sendgrid')}>
                            <Download className="w-4 h-4 mr-2" />
                            Export for SendGrid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(segment, 'json')}>
                            <FileJson className="w-4 h-4 mr-2" />
                            Export JSON
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(segment)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
