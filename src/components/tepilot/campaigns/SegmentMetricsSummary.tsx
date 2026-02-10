import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Users, Download, Target } from "lucide-react";
import { getSegmentMetricsSummary } from "@/lib/segmentData";

export function SegmentMetricsSummary() {
  const metrics = getSegmentMetricsSummary();

  const cards = [
    {
      label: "Saved Segments",
      value: metrics.savedSegments.toString(),
      icon: Bookmark,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Contacts",
      value: `${(metrics.totalContacts / 1_000_000).toFixed(1)}M`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Exports",
      value: metrics.totalExports.toString(),
      icon: Download,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Targeting Modes",
      value: `${Object.values(metrics.modeBreakdown).filter(v => v > 0).length} Active`,
      icon: Target,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
