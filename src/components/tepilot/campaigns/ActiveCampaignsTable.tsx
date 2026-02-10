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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Copy, 
  Trash2, 
  Edit,
  ListChecks,
  TrendingUp,
  DollarSign,
  Users
} from "lucide-react";
import { SAMPLE_CAMPAIGNS } from "@/lib/campaignData";
import type { Campaign } from "@/types/campaign";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export function ActiveCampaignsTable() {
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `$${(amount / 1_000).toFixed(0)}K`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Active Campaigns</CardTitle>
          </div>
          <Badge variant="outline" className="font-normal">
            {SAMPLE_CAMPAIGNS.length} campaigns
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Campaign</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Reach</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Activation</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Revenue</TableHead>
                <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Budget</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_CAMPAIGNS.map((campaign) => {
                const statusStyle = STATUS_STYLES[campaign.status];
                
                return (
                  <TableRow key={campaign.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{campaign.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{campaign.objective}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusStyle.bg} ${statusStyle.text} capitalize`}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {formatNumber(campaign.audience.estimatedSize)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.metrics ? (
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium text-slate-700">
                            {campaign.metrics.activationRate.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.metrics ? (
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium text-green-700">
                            {formatCurrency(campaign.metrics.revenueGenerated)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">
                        {formatDate(campaign.schedule.startDate)} – {formatDate(campaign.schedule.endDate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-slate-700">{formatCurrency(campaign.budget)}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {campaign.status === 'active' ? (
                            <DropdownMenuItem>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          ) : campaign.status === 'paused' ? (
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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
