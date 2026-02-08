import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankwideView } from "./BankwideView";
import { CampaignPlannerView } from "../campaigns/CampaignPlannerView";
import { BarChart3, Target } from "lucide-react";

export function AnalyticsContainer() {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="mb-6 bg-slate-100 p-1">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white">
          <BarChart3 className="w-4 h-4" />
          Analytics Dashboard
        </TabsTrigger>
        <TabsTrigger value="planner" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Target className="w-4 h-4" />
          Campaign Planner
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-0">
        <BankwideView />
      </TabsContent>

      <TabsContent value="planner" className="mt-0">
        <CampaignPlannerView />
      </TabsContent>
    </Tabs>
  );
}
