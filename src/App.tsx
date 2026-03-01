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

import Technology from "./pages/Technology";

import TePilot from "./pages/TePilot";
import NotFound from "./pages/NotFound";
import RecommendationsPage from "./pages/RecommendationsPage";
import AdvisorConsolePage from "./pages/AdvisorConsolePage";
import FinancialPlanningPage from "./pages/FinancialPlanningPage";
import RewardsPipelinePage from "./pages/RewardsPipelinePage";
import Enrichment from "./pages/Enrichment";
import SmartRewards from "./pages/SmartRewards";
import Engagement from "./pages/Engagement";
import Wealth from "./pages/Wealth";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isTepilot = location.pathname.startsWith("/tepilot");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isTepilot && <Navbar />}
      <div className={`flex-1 ${!isTepilot ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          
          <Route path="/technology" element={<Technology />} />
          <Route path="/enrichment" element={<Enrichment />} />
          <Route path="/smartrewards" element={<SmartRewards />} />
          <Route path="/engagement" element={<Engagement />} />
          <Route path="/wealth" element={<Wealth />} />
          
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/tepilot" element={<TePilot />} />
          <Route path="/tepilot/recommendations" element={<RecommendationsPage />} />
          <Route path="/tepilot/advisor-console" element={<AdvisorConsolePage />} />
          <Route path="/tepilot/financial-planning" element={<FinancialPlanningPage />} />
          <Route path="/tepilot/rewards-pipeline" element={<RewardsPipelinePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isTepilot && <Footer />}
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
