import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnalyticsContainer } from "@/components/tepilot/insights/AnalyticsContainer";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";

export default function BankAnalyticsDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("light-app");
    return () => document.documentElement.classList.remove("light-app");
  }, []);

  const handleBack = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate("/demo");
    }
  };

  return (
    <SimplePasswordGate tagline="Customer intelligence and personalization system for banks">
      <div className="tepilot-theme h-screen bg-white flex flex-col overflow-hidden">
        <AnalyticsContainer />
      </div>
    </SimplePasswordGate>
  );
}
