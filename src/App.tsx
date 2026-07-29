import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import IndexV2 from "./pages/IndexV2";
import ConsoleLayout, { ConsoleAuthBoundary } from "./console/ConsoleLayout";
import {
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
  SignupPage,
} from "./console/AuthPages";
import {
  AccessPendingPage,
  AppEntryPage,
  ProtectedDemoPage,
} from "./console/AccessPages";
import MomentsPage from "./console/MomentsPage";
import { LedgerPage, OutcomesPage, SettingsPage } from "./console/OpsPages";

const Index = lazy(() => import("./pages/Index"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const TePilot = lazy(() => import("./pages/TePilot"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const AdvisorConsolePage = lazy(() => import("./pages/AdvisorConsolePage"));
const FinancialPlanningPage = lazy(() => import("./pages/FinancialPlanningPage"));
const RewardsPipelinePage = lazy(() => import("./pages/RewardsPipelinePage"));
const SmartRewards = lazy(() => import("./pages/SmartRewards"));
const Engagement = lazy(() => import("./pages/Engagement"));
const Wealth = lazy(() => import("./pages/Wealth"));
const TravelExperience = lazy(() => import("./pages/TravelExperience"));
const BankWideAnalytics = lazy(() => import("./pages/BankWideAnalytics"));
const Insights = lazy(() => import("./pages/Insights"));
const InsightPost = lazy(() => import("./pages/InsightPost"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const ExecDemoPage = lazy(() => import("./pages/ExecDemoPage"));
const Platform = lazy(() => import("./pages/Platform"));
const NextOfferPage = lazy(() => import("./pages/solutions/NextOfferPage"));
const NextProductPage = lazy(() => import("./pages/solutions/NextProductPage"));
const NextConversationPage = lazy(() => import("./pages/solutions/NextConversationPage"));
const PortfolioIntelligencePage = lazy(() => import("./pages/solutions/PortfolioIntelligencePage"));
const CampaignIntelligencePage = lazy(() => import("./pages/solutions/CampaignIntelligencePage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const BankAnalyticsDashboard = lazy(() => import("./pages/BankAnalyticsDashboard"));
const CoworkerPage = lazy(() => import("./pages/CoworkerPage"));
const EnterpriseGrowthDemoPage = lazy(() => import("./pages/EnterpriseGrowthDemoPage"));
const InternalCapabilitiesPage = lazy(() => import("./pages/InternalCapabilitiesPage"));
const InternalGrowthDeskPage = lazy(() => import("./pages/InternalGrowthDeskPage"));
const LivePipelineLab = lazy(() => import("./pages/LivePipelineLab"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-[50vh] bg-white" aria-busy="true" aria-label="Loading page" />
);

const AppLayout = () => {
  const location = useLocation();
  const isTepilot = location.pathname.startsWith("/tepilot");
  const isDemo = location.pathname === "/deckmo"
    || location.pathname === "/demo"
    || location.pathname === "/demo/enterprise";
  const isPricing = location.pathname === "/pricing";
  const isBankAnalytics = location.pathname === "/bankdemo" || location.pathname === "/bank-analytics";
  const isHomeV2 = location.pathname === "/v2";
  const isConsole = location.pathname.startsWith("/app");
  const isInternalCapabilities = location.pathname.startsWith("/internal/");

  const showChrome = !isTepilot && !isDemo && !isPricing && !isBankAnalytics && !isHomeV2 && !isConsole && !isInternalCapabilities;

  const routes = (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* Growth Console — the authenticated white-label product. */}
        <Route path="/app" element={<ConsoleAuthBoundary />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route index element={<AppEntryPage />} />
          <Route path="access-pending" element={<AccessPendingPage />} />
          <Route path="demo" element={<ProtectedDemoPage />} />
          <Route element={<ConsoleLayout />}>
            <Route path="moments" element={<MomentsPage />} />
            <Route path="ledger" element={<LedgerPage />} />
            <Route path="outcomes" element={<OutcomesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="/classic" element={<Index noindex />} />
        <Route path="/v2" element={<IndexV2 />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/smartrewards" element={<SmartRewards />} />
        <Route path="/engagement" element={<Engagement />} />
        <Route path="/wealth" element={<Wealth />} />
        <Route path="/travel" element={<TravelExperience />} />
        <Route path="/analytics" element={<BankWideAnalytics />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:slug" element={<InsightPost />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/tepilot" element={<TePilot />} />
        <Route path="/tepilot/recommendations" element={<RecommendationsPage />} />
        <Route path="/tepilot/advisor-console" element={<AdvisorConsolePage />} />
        <Route path="/tepilot/financial-planning" element={<FinancialPlanningPage />} />
        <Route path="/tepilot/rewards-pipeline" element={<RewardsPipelinePage />} />
        <Route path="/demo" element={<div className="h-screen"><ExecDemoPage /></div>} />
        <Route path="/demo/enterprise" element={<div className="h-screen"><EnterpriseGrowthDemoPage /></div>} />
        <Route path="/deckmo" element={<DemoPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/bankdemo" element={<BankAnalyticsDashboard />} />
        <Route path="/bank-analytics" element={<BankAnalyticsDashboard />} />
        <Route path="/coworker" element={<CoworkerPage />} />
        <Route path="/internal/capabilities" element={<InternalCapabilitiesPage />} />
        <Route path="/internal/growth-desk" element={<InternalGrowthDeskPage />} />
        <Route path="/internal/live-lab" element={<LivePipelineLab />} />
        <Route path="/solutions/offer-intelligence" element={<NextOfferPage />} />
        <Route path="/solutions/product-intelligence" element={<NextProductPage />} />
        <Route path="/solutions/conversation-intelligence" element={<NextConversationPage />} />
        <Route path="/solutions/portfolio-intelligence" element={<PortfolioIntelligencePage />} />
        <Route path="/solutions/campaign-intelligence" element={<CampaignIntelligencePage />} />
        {/* Legacy redirects */}
        <Route path="/solutions/next-offer" element={<NextOfferPage />} />
        <Route path="/solutions/next-product" element={<NextProductPage />} />
        <Route path="/solutions/next-conversation" element={<NextConversationPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );

  if (!showChrome) {
    return <div className="min-h-screen bg-white flex flex-col">{routes}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      {/* Page content sits above the footer with a solid white bg, revealing the footer as you scroll */}
      <div className="relative z-10 bg-white">
        {routes}
      </div>
      {/* Sticky footer reveals from below as the page scrolls past */}
      <div className="sticky bottom-0 z-0">
        <Footer />
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
