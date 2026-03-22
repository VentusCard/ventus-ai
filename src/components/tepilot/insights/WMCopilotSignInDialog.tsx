import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, User, DollarSign, ArrowRight } from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";

interface WMCopilotSignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDemographics: ClientProfileData | null;
}

export function WMCopilotSignInDialog({ open, onOpenChange, userDemographics }: WMCopilotSignInDialogProps) {
  const [step, setStep] = useState<"login" | "loading" | "confirm">("login");
  const [email, setEmail] = useState("advisor@bankofventus.com");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    setStep("loading");
    setTimeout(() => setStep("confirm"), 1500);
  };

  const handleLaunch = () => {
    if (!userDemographics) return;
    sessionStorage.setItem("wm_copilot_launch_client", JSON.stringify(userDemographics));
    window.open("/tepilot/advisor-console", "_blank");
    onOpenChange(false);
    // Reset for next open
    setTimeout(() => setStep("login"), 300);
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) setTimeout(() => setStep("login"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden max-w-md border-0 gap-0">
        {/* Header */}
        <div className="bg-[#0f172a] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#d4a843]/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#d4a843]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold tracking-tight">Bank of Ventus</h2>
              <p className="text-xs text-slate-400 tracking-wide uppercase">Wealth Management Portal</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === "login" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Advisor Sign In</h3>
                <p className="text-xs text-slate-500">Enter your credentials to access the Wealth Management Copilot.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="wm-email" className="text-xs text-slate-600">Email</Label>
                  <Input
                    id="wm-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-sm border-slate-200"
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
                    className="h-9 text-sm border-slate-200"
                  />
                </div>
              </div>
              <Button
                onClick={handleSignIn}
                className="w-full h-10 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium"
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
              <p className="text-sm text-slate-600">Authenticating...</p>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              {userDemographics ? (
                <>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Active client profile loaded</p>
                    <h3 className="text-sm font-semibold text-slate-900">Signing in as advisor for:</h3>
                  </div>
                  <div className="border border-[#d4a843]/30 rounded-lg bg-[#fefbf3] p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#0f172a] flex items-center justify-center">
                        <User className="h-5 w-5 text-[#d4a843]" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{userDemographics.name}</p>
                        <p className="text-xs text-slate-500">{userDemographics.segment} Client</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded-md p-2 border border-slate-100">
                        <p className="text-slate-400">AUM</p>
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {userDemographics.aum}
                        </p>
                      </div>
                      <div className="bg-white rounded-md p-2 border border-slate-100">
                        <p className="text-slate-400">Tenure</p>
                        <p className="font-semibold text-slate-800">{userDemographics.tenure}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 border border-slate-100">
                        <p className="text-slate-400">Risk Profile</p>
                        <p className="font-semibold text-slate-800">{userDemographics.compliance.riskProfile}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 border border-slate-100">
                        <p className="text-slate-400">Occupation</p>
                        <p className="font-semibold text-slate-800 truncate">{userDemographics.demographics.occupation}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleLaunch}
                    className="w-full h-10 bg-[#d4a843] hover:bg-[#c49a3a] text-[#0f172a] text-sm font-semibold"
                  >
                    Launch Copilot
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-600 font-medium">No active client profile</p>
                  <p className="text-xs text-slate-400 mt-1">Run the enrichment flow first to load a client profile.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClose(false)}
                    className="mt-4"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
