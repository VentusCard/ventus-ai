import { useNavigate } from "react-router-dom";
import { AnalyticsContainer } from "@/components/tepilot/insights/AnalyticsContainer";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";

export default function BankAnalyticsDashboard() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate("/demo");
    }
  };

  return (
    <SimplePasswordGate>
      <div className="tepilot-theme h-screen bg-white flex flex-col overflow-hidden">
        <AnalyticsContainer onBack={handleBack} />
      </div>
    </SimplePasswordGate>
  );
}
