import { useNavigate } from "react-router-dom";
import { AnalyticsContainer } from "@/components/tepilot/insights/AnalyticsContainer";

export default function BankAnalyticsDashboard() {
  const navigate = useNavigate();

  const handleBack = () => {
    // If opened in a new tab from /demo, close it; otherwise navigate.
    if (window.opener) {
      window.close();
    } else {
      navigate("/demo");
    }
  };

  return (
    <div className="tepilot-theme min-h-screen bg-white flex flex-col">
      <AnalyticsContainer onBack={handleBack} />
    </div>
  );
}
