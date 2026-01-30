import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ContactUs from "./pages/ContactUs";
import TePilot from "./pages/TePilot";
import NotFound from "./pages/NotFound";
import RecommendationsPage from "./pages/RecommendationsPage";
import AdvisorConsolePage from "./pages/AdvisorConsolePage";
import FinancialPlanningPage from "./pages/FinancialPlanningPage";
import RewardsPipelinePage from "./pages/RewardsPipelinePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/tepilot" replace />} />
          <Route path="/tepilot" element={<TePilot />} />
          <Route path="/tepilot/recommendations" element={<RecommendationsPage />} />
          <Route path="/tepilot/advisor-console" element={<AdvisorConsolePage />} />
          <Route path="/tepilot/financial-planning" element={<FinancialPlanningPage />} />
          <Route path="/tepilot/rewards-pipeline" element={<RewardsPipelinePage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
