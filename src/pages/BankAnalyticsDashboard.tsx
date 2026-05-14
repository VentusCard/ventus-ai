import { useNavigate } from "react-router-dom";
import { AnalyticsContainer } from "@/components/tepilot/insights/AnalyticsContainer";

export default function BankAnalyticsDashboard() {
  const navigate = useNavigate();
  return (
    <div className="tepilot-theme min-h-screen bg-white flex flex-col">
      <AnalyticsContainer onBack={() => navigate("/demo")} />
    </div>
  );
}
