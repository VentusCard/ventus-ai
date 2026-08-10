import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  generateMockCustomerInsights,
  generateMockAlerts,
  getWellnessKPIs,
  CustomerInsightLog,
  WellnessSignal,
} from "@/lib/wellnessIntelligenceEngine";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  ChevronDown,
  Filter,
  Heart,
  MessageSquare,
  Search,
  Settings,
  TrendingUp,
  Users,
  Heart as HeartIcon,
  Zap,
  RefreshCw,
} from "lucide-react";
import { TabHeader } from "./TabHeader";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<number, string> = {
  1: "bg-slate-100 text-slate-600 border-slate-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
  3: "bg-amber-100 text-amber-700 border-amber-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
  5: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-red-100 text-red-700 border-red-200",
  acknowledged: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function WellnessAlertsDashboard({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const kpis = useMemo(() => getWellnessKPIs(), []);
  const allInsights = useMemo(() => generateMockCustomerInsights(), []);
  const allAlerts = useMemo(() => generateMockAlerts(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [insightFilter, setInsightFilter] = useState<string>("all");
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [severityCutoff, setSeverityCutoff] = useState([2]);
  const [autoCoaching, setAutoCoaching] = useState(true);
  const [alerts, setAlerts] = useState<WellnessSignal[]>(allAlerts);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (a.severity < severityCutoff[0]) return false;
      if (searchQuery && !a.customerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.severity - a.severity);
  }, [alerts, typeFilter, statusFilter, severityCutoff, searchQuery]);

  const filteredInsights = useMemo(() => {
    return allInsights.filter(i => {
      if (insightFilter === "needs_help" && i.response !== "needs_help") return false;
      if (insightFilter === "acknowledged" && i.response !== "acknowledged") return false;
      if (searchQuery && !i.customerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allInsights, insightFilter, searchQuery]);

  const updateAlertStatus = (id: string, status: WellnessSignal["status"]) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <TabHeader
          icon={<HeartIcon className="w-4 h-4" />}
          title="Customer Insights"
          subtitle="Behavioral wellness scores and proactive intervention signals"
          howItWorks="Ventus generates behavioral wellness scores from spending patterns, detecting financial stress, lifestyle changes, and intervention opportunities."
          whyItMatters="Enables proactive customer care, reducing attrition and building trust through timely, personalized outreach."
        />
      )}

      {/* Loop diagram removed */}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Tips Delivered</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{(kpis.tipsDelivered / 1000).toFixed(1)}K</p>
            <p className="text-[10px] text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Response Rate</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpis.responseRate}%</p>
            <p className="text-[10px] text-emerald-600 mt-1">↑ 4.2% vs last month</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">"Need Help" Signals</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{(kpis.needsHelpSignals / 1000).toFixed(1)}K</p>
            <p className="text-[10px] text-muted-foreground mt-1">Requires banker attention</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-xs text-muted-foreground">Engagement Score</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpis.engagementScore}</p>
            <p className="text-[10px] text-emerald-600 mt-1">↑ 7 pts this quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={insightFilter} onValueChange={setInsightFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Insight filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Responses</SelectItem>
            <SelectItem value="needs_help">Needs Help</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Signal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Signals</SelectItem>
            <SelectItem value="stress">Stress</SelectItem>
            <SelectItem value="opportunity">Opportunity</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Insights Log */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Customer Tip Responses
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 ml-2">
              {filteredInsights.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Tip Delivered</TableHead>
                  <TableHead className="text-xs">Response</TableHead>
                  <TableHead className="text-xs">Sentiment</TableHead>
                  <TableHead className="text-xs">Key Takeaway</TableHead>
                  <TableHead className="text-xs">Banker Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsights.map((insight) => (
                  <TableRow key={insight.id} className={cn(insight.response === "needs_help" && "bg-amber-50/40")}>
                    <TableCell className="text-sm font-medium">{insight.customerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{insight.tipDelivered}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          insight.response === "needs_help"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        )}
                      >
                        {insight.response === "needs_help" ? "Needs Help" : "Acknowledged"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          insight.sentiment === "positive" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          insight.sentiment === "concerned" ? "bg-red-50 text-red-600 border-red-200" :
                          "bg-slate-50 text-slate-600 border-slate-200"
                        )}
                      >
                        {insight.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[250px]">{insight.keyTakeaway}</TableCell>
                    <TableCell>
                      {insight.bankerAction ? (
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                          <ArrowUpRight className="h-2.5 w-2.5" />
                          {insight.bankerAction}
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">No action needed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stress & Opportunity Alerts */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Bell className="h-4 w-4 text-amber-500" />
            Financial Wellness Signals
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 ml-2">
              {filteredAlerts.filter(a => a.status === "new").length} new
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Signal</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Severity</TableHead>
                  <TableHead className="text-xs">Summary</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id} className={cn(alert.status === "new" && alert.type === "stress" && "bg-red-50/30")}>
                    <TableCell className="text-sm font-medium">{alert.customerName}</TableCell>
                    <TableCell className="text-xs font-medium">{alert.signalName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          alert.type === "stress"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        )}
                      >
                        {alert.type === "stress" ? "⚠ Stress" : "✦ Opportunity"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", SEVERITY_STYLES[alert.severity])}>
                        {alert.severity}/5
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[280px]">{alert.bankerSummary}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                        <ArrowUpRight className="h-2.5 w-2.5" />
                        {alert.recommendedAction}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={alert.status}
                        onValueChange={(v) => updateAlertStatus(alert.id, v as WellnessSignal["status"])}
                      >
                        <SelectTrigger className={cn("h-7 w-[110px] text-[10px] border", STATUS_STYLES[alert.status])}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Configurable Thresholds */}
      <Collapsible open={thresholdsOpen} onOpenChange={setThresholdsOpen}>
        <Card className="border-slate-200">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Settings className="h-4 w-4 text-slate-500" />
                Alert Configuration
                <ChevronDown className={cn("h-4 w-4 text-slate-400 ml-auto transition-transform", thresholdsOpen && "rotate-180")} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Minimum Severity Threshold</label>
                  <Slider
                    value={severityCutoff}
                    onValueChange={setSeverityCutoff}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-[10px] text-muted-foreground">Only show alerts with severity ≥ {severityCutoff[0]}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Auto-Coaching</label>
                  <div className="flex items-center gap-2">
                    <Switch checked={autoCoaching} onCheckedChange={setAutoCoaching} />
                    <span className="text-xs text-muted-foreground">
                      {autoCoaching ? "Automatically send coaching tips for medium-severity signals" : "Manual coaching only"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Min Customer Deposit</label>
                  <Input placeholder="e.g. $50,000" className="h-9 text-sm" defaultValue="$10,000" />
                  <p className="text-[10px] text-muted-foreground">Only alert for customers above this threshold</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
