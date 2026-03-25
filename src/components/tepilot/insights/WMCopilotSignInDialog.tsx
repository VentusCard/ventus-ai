import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, ArrowRight } from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";

interface WMCopilotSignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDemographics: ClientProfileData | null;
}

export function WMCopilotSignInDialog({ open, onOpenChange, userDemographics }: WMCopilotSignInDialogProps) {
  const [step, setStep] = useState<"login" | "loading">("login");
  const [email, setEmail] = useState("advisor@bankofventus.com");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    if (!userDemographics) return;
    setStep("loading");
    setTimeout(() => {
      sessionStorage.setItem("wm_copilot_launch_client", JSON.stringify(userDemographics));
      window.open("/tepilot/advisor-console", "_blank");
      onOpenChange(false);
      setTimeout(() => setStep("login"), 300);
    }, 1500);
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) setTimeout(() => setStep("login"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden max-w-md border border-slate-200 gap-0 bg-white">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
              <Shield className="h-5 w-5 text-[#d4a843]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold tracking-tight text-slate-900">Bank of Ventus</h2>
              <p className="text-xs text-slate-400 tracking-wide uppercase">Wealth Management Portal</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          {step === "login" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Advisor Sign In</h3>
                <p className="text-xs text-slate-500">Enter your credentials to access the Wealth Management Copilot.</p>
              </div>
              {!userDemographics && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <p className="text-xs text-amber-700">No active client profile. Run the enrichment flow first.</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="wm-email" className="text-xs text-slate-600">Email</Label>
                  <Input
                    id="wm-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-sm !text-slate-900 border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wm-password" className="text-xs text-slate-600">Password</Label>
                  <Input
                    id="wm-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 text-sm text-slate-900 border-slate-200 bg-white"
                  />
                </div>
              </div>
              <Button
                onClick={handleSignIn}
                disabled={!userDemographics}
                className="w-full h-10 bg-[#d4a843] hover:bg-[#c49a3a] text-white text-sm font-medium"
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-[10px] text-slate-400 text-center">
                Secured by Bank of Ventus enterprise authentication
              </p>
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#d4a843]" />
              <p className="text-sm text-slate-600">Signing in & loading client profile...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
