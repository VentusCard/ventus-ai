import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankwideView } from "./BankwideView";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { WalletShareView } from "./WalletShareView";
import { WellnessAlertsDashboard } from "./WellnessAlertsDashboard";
import { GamificationManagement } from "./GamificationManagement";
import { RewardsAnalyticsDashboard } from "./RewardsAnalyticsDashboard";
import { BankwideLifeEventsView } from "./BankwideLifeEventsView";
import { BankwideWMCopilotView } from "./BankwideWMCopilotView";
import { BarChart3, Route, Wallet, Heart, Gamepad2, Sparkles, CalendarHeart, Briefcase } from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights } from "@/types/lifestyle-signals";

interface AnalyticsContainerProps {
  defaultTab?: 'dashboard' | 'targeting' | 'wallet-share' | 'customer-insights' | 'gamification' | 'rewards-intelligence' | 'life-events' | 'wm-copilot';
  userDemographics?: ClientProfileData | null;
  lifestyleSignals?: AIInsights | null;
}

export function AnalyticsContainer({ defaultTab = 'dashboard', userDemographics, lifestyleSignals }: AnalyticsContainerProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-6 bg-slate-100 p-1 flex-wrap h-auto gap-1">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white">
          <BarChart3 className="w-4 h-4" />
          Analytics Dashboard
        </TabsTrigger>
        <TabsTrigger value="rewards-intelligence" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Sparkles className="w-4 h-4" />
          Rewards Intelligence
        </TabsTrigger>
        <TabsTrigger value="targeting" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Route className="w-4 h-4" />
          Financial Journey
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
        <TabsTrigger value="life-events" className="flex items-center gap-2 data-[state=active]:bg-white">
          <CalendarHeart className="w-4 h-4" />
          Life Events Intelligence
        </TabsTrigger>
        <TabsTrigger value="wm-copilot" className="flex items-center gap-2 data-[state=active]:bg-white">
          <Briefcase className="w-4 h-4" />
          WM Copilot
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-0">
        <BankwideView />
      </TabsContent>

      <TabsContent value="rewards-intelligence" className="mt-0">
        <RewardsAnalyticsDashboard />
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

      <TabsContent value="life-events" className="mt-0">
        <BankwideLifeEventsView userDemographics={userDemographics} lifestyleSignals={lifestyleSignals} />
      </TabsContent>

      <TabsContent value="wm-copilot" className="mt-0">
        <BankwideWMCopilotView />
      </TabsContent>
    </Tabs>
  );
}
