import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankwideView } from "./BankwideView";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { BarChart3, Target } from "lucide-react";

interface AnalyticsContainerProps {
  defaultTab?: 'dashboard' | 'targeting';
}

export function AnalyticsContainer({ defaultTab = 'dashboard' }: AnalyticsContainerProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-6 bg-slate-100/80 p-1.5 rounded-lg border border-slate-200">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
          <BarChart3 className="w-4 h-4" />
          Analytics Dashboard
        </TabsTrigger>
        <TabsTrigger value="targeting" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
          <Target className="w-4 h-4" />
          Segment Targeting
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-0">
        <BankwideView />
      </TabsContent>

      <TabsContent value="targeting" className="mt-0">
        <SegmentTargetingView />
      </TabsContent>
    </Tabs>
  );
}
