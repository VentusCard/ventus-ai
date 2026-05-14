import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import ContactUs from "./pages/ContactUs";



import TePilot from "./pages/TePilot";
import NotFound from "./pages/NotFound";
import RecommendationsPage from "./pages/RecommendationsPage";
import AdvisorConsolePage from "./pages/AdvisorConsolePage";
import FinancialPlanningPage from "./pages/FinancialPlanningPage";
import RewardsPipelinePage from "./pages/RewardsPipelinePage";

import SmartRewards from "./pages/SmartRewards";
import Engagement from "./pages/Engagement";
import Wealth from "./pages/Wealth";
import TravelExperience from "./pages/TravelExperience";
import BankWideAnalytics from "./pages/BankWideAnalytics";
import Insights from "./pages/Insights";
import InsightPost from "./pages/InsightPost";
import DemoPage from "./pages/DemoPage";
import ExecDemoPage from "./pages/ExecDemoPage";
import Platform from "./pages/Platform";
import NextOfferPage from "./pages/solutions/NextOfferPage";
import NextProductPage from "./pages/solutions/NextProductPage";
import NextConversationPage from "./pages/solutions/NextConversationPage";
import PortfolioIntelligencePage from "./pages/solutions/PortfolioIntelligencePage";
import Pricing from "./pages/Pricing";
import BankAnalyticsDashboard from "./pages/BankAnalyticsDashboard";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isTepilot = location.pathname.startsWith("/tepilot");
  const isDemo = location.pathname === "/deckmo" || location.pathname === "/demo";
  const isPricing = location.pathname === "/pricing";
  const isBankAnalytics = location.pathname === "/bank-analytics";

  const showChrome = !isTepilot && !isDemo && !isPricing && !isBankAnalytics;

  const routes = (
    <Routes>
      <Route path="/" element={<Index />} />
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
      <Route path="/demo" element={<ExecDemoPage />} />
      <Route path="/deckmo" element={<DemoPage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/bank-analytics" element={<BankAnalyticsDashboard />} />
      <Route path="/solutions/offer-intelligence" element={<NextOfferPage />} />
      <Route path="/solutions/product-intelligence" element={<NextProductPage />} />
      <Route path="/solutions/conversation-intelligence" element={<NextConversationPage />} />
      <Route path="/solutions/portfolio-intelligence" element={<PortfolioIntelligencePage />} />
      {/* Legacy redirects */}
      <Route path="/solutions/next-offer" element={<NextOfferPage />} />
      <Route path="/solutions/next-product" element={<NextProductPage />} />
      <Route path="/solutions/next-conversation" element={<NextConversationPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
