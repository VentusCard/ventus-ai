
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const GolfDemo = () => {
  useEffect(() => {
    // Automatically redirect to the external Lovable project
    window.open("https://ventus-golf-dashboard.lovable.app/", "_blank");
  }, []);

  const handleManualRedirect = () => {
    window.open("https://ventus-golf-dashboard.lovable.app/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-900">Redirecting to Golf Demo</h1>
          <p className="text-slate-600 mb-6">You should be automatically redirected to the Golf demo project. If the redirect doesn't work, click the button below.</p>
          <Button onClick={handleManualRedirect} className="w-full" size="lg">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Golf Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GolfDemo;
