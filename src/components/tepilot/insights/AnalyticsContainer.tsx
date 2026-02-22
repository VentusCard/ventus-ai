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
      <TabsList className="mb-6 bg-transparent p-0 h-auto border-b border-slate-200 rounded-none gap-6">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 px-1 pb-3 pt-0 rounded-none bg-transparent text-slate-500 font-medium data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:font-semibold data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary -mb-px">
          <BarChart3 className="w-4 h-4" />
          Analytics Dashboard
        </TabsTrigger>
        <TabsTrigger value="targeting" className="flex items-center gap-2 px-1 pb-3 pt-0 rounded-none bg-transparent text-slate-500 font-medium data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:font-semibold data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary -mb-px">
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
