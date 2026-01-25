
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import OnboardingFlow from "./pages/OnboardingFlow";
import JoinWaitlist from "./pages/JoinWaitlist";
import Partners from "./pages/Partners";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import BenefitsPage from "./pages/BenefitsPage";
import GolfDemo from "./pages/GolfDemo";
import Gallery from "./pages/Gallery";
import Privacy from "./pages/Privacy";
import TermsOfService from "./pages/TermsOfService";
import VentusAI from "./pages/VentusAI";
import TePilot from "./pages/TePilot";
import NotFound from "./pages/NotFound";
import AppDownload from "./pages/AppDownload";
import Archive from "./pages/Archive";
import RecommendationsPage from "./pages/RecommendationsPage";
import AdvisorConsolePage from "./pages/AdvisorConsolePage";
import FinancialPlanningPage from "./pages/FinancialPlanningPage";
import RewardsPipelinePage from "./pages/RewardsPipelinePage";

// Ventus Web App imports
import { VentusAuthProvider } from "./contexts/VentusAuthContext";
import { ProtectedRoute } from "./components/ventus-app/ProtectedRoute";
import VentusLanding from "./pages/ventus-app/VentusLanding";
import VentusAuth from "./pages/ventus-app/VentusAuth";
import VentusSignupLifestyle from "./pages/ventus-app/VentusSignupLifestyle";
import VentusSignupSports from "./pages/ventus-app/VentusSignupSports";
import VentusSignupLocation from "./pages/ventus-app/VentusSignupLocation";
import VentusHome from "./pages/ventus-app/VentusHome";
import VentusSearch from "./pages/ventus-app/VentusSearch";
import VentusProfile from "./pages/ventus-app/VentusProfile";
import VentusForgotPassword from "./pages/ventus-app/VentusForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/smartrewards" element={<OnboardingFlow />} />
          <Route path="/smartreward" element={<Navigate to="/smartrewards" replace />} />
          <Route path="/join-waitlist" element={<JoinWaitlist />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partner" element={<Navigate to="/partners" replace />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/benefits" element={<BenefitsPage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/demo/golf" element={<GolfDemo />} />
          <Route path="/ventus-ai" element={<VentusAI />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/tepilot" element={<TePilot />} />
          <Route path="/tepilot/recommendations" element={<RecommendationsPage />} />
          <Route path="/tepilot/advisor-console" element={<AdvisorConsolePage />} />
          <Route path="/tepilot/financial-planning" element={<FinancialPlanningPage />} />
          <Route path="/tepilot/rewards-pipeline" element={<RewardsPipelinePage />} />
          <Route path="/download" element={<AppDownload />} />
          <Route path="/archive" element={<Archive />} />

          {/* Ventus Web App Routes - All wrapped in VentusAuthProvider */}
          <Route path="/app/*" element={
            <VentusAuthProvider>
              <Routes>
                <Route index element={<VentusLanding />} />
                <Route path="signup" element={<VentusAuth />} />
                <Route path="signup/lifestyle" element={<VentusSignupLifestyle />} />
                <Route path="signup/sports" element={<VentusSignupSports />} />
                <Route path="signup/location" element={<VentusSignupLocation />} />
                <Route path="login" element={<VentusAuth />} />
                <Route path="forgot-password" element={<VentusForgotPassword />} />
                <Route path="home" element={<ProtectedRoute><VentusHome /></ProtectedRoute>} />
                <Route path="search" element={<ProtectedRoute><VentusSearch /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><VentusProfile /></ProtectedRoute>} />
              </Routes>
            </VentusAuthProvider>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
