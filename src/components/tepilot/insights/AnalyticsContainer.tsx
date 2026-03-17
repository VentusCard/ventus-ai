import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankwideView } from "./BankwideView";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { WalletShareView } from "./WalletShareView";
import { WellnessAlertsDashboard } from "./WellnessAlertsDashboard";
import { GamificationManagement } from "./GamificationManagement";
import { BarChart3, Target, Wallet, Heart, Gamepad2 } from "lucide-react";

interface AnalyticsContainerProps {
  defaultTab?: 'dashboard' | 'targeting' | 'wallet-share' | 'customer-insights' | 'gamification';
}

export function AnalyticsContainer({ defaultTab = 'dashboard' }: AnalyticsContainerProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-6 bg-slate-100 p-1">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white">
          <BarChart3 className="w-4 h-4" />
          Analytics Dashboard
        </TabsTrigger>
        <TabsTrigger value="targeting" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Target className="w-4 h-4" />
          Segment Targeting
        </TabsTrigger>
        <TabsTrigger value="wallet-share" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Wallet className="w-4 h-4" />
          Wallet Share Intelligence
        </TabsTrigger>
        <TabsTrigger value="customer-insights" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Heart className="w-4 h-4" />
          Customer Insights
        </TabsTrigger>
        <TabsTrigger value="gamification" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Gamepad2 className="w-4 h-4" />
          Gamification
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-0">
        <BankwideView />
      </TabsContent>

      <TabsContent value="targeting" className="mt-0">
        <SegmentTargetingView />
      </TabsContent>

      <TabsContent value="wallet-share" className="mt-0">
        <WalletShareView />
      </TabsContent>

      <TabsContent value="customer-insights" className="mt-0">
        <WellnessAlertsDashboard />
      </TabsContent>

      <TabsContent value="gamification" className="mt-0">
        <GamificationManagement />
      </TabsContent>
    </Tabs>
  );
}
