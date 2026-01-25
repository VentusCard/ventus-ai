import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvailableDealsGrid } from "@/components/tepilot/rewards-pipeline/AvailableDealsGrid";

export default function RewardsPipelinePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100">
            <Link to="/tepilot?view=bankwide">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bank-wide Analytics
            </Link>
          </Button>
        </div>
        
        <AvailableDealsGrid />
      </div>
    </div>
  );
}
