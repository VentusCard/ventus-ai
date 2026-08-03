import { Sparkles, type LucideIcon } from "lucide-react";
import type { TabValue } from "../AnalyticsContainer";

export type InteractiveReportId = "priority-opportunity";

export interface InteractiveReportMeta {
  id: InteractiveReportId;
  tab: TabValue;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  eyebrow: string;
}

export const INTERACTIVE_REPORTS: InteractiveReportMeta[] = [
  {
    id: "priority-opportunity",
    tab: "report-priority-opportunity",
    title: "Priority Opportunity Briefing",
    description:
      "The bank's top revenue-gap in narrative form: what's happening, the numbers, and the recommended next steps.",
    category: "Opportunities",
    icon: Sparkles,
    eyebrow: "Executive briefing",
  },
];
