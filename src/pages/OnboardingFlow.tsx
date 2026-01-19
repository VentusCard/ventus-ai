import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import StepOneMerged from "@/components/onboarding-flow/StepOneMerged";
import StepTwoMerged from "@/components/onboarding-flow/StepTwoMerged";
import StepFourSpendingInput from "@/components/onboarding-flow/StepFourSpendingInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export type LifestyleGoal = "sports" | "wellness" | "pets" | "gamers" | "creatives" | "homeowners";
export interface OnboardingFlowData {
  mainGoal: LifestyleGoal | null;
  subcategories: string[];
  spendingFrequency: "weekly" | "monthly" | "quarterly" | "annually";
  spendingAmount: number;
  estimatedAnnualSpend: number;
  estimatedPoints: number;
  minCashbackPercentage: number;
  maxCashbackPercentage: number;
}
const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingFlowData>({
    mainGoal: null,
    subcategories: [],
    spendingFrequency: "monthly",
    spendingAmount: 200,
    estimatedAnnualSpend: 2400,
    estimatedPoints: 12000,
    minCashbackPercentage: 5,
    maxCashbackPercentage: 15
  });
  const totalSteps = 2;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const goToNextStep = async () => {
    if (step === totalSteps) {
      navigate("/ventus-ai");
    } else {
      setStep(prev => prev + 1);
      document.getElementById('onboarding-content')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to continue",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          lifestyle_goal: onboardingData.mainGoal,
          selected_categories: onboardingData.subcategories,
          spending_frequency: onboardingData.spendingFrequency,
          spending_amount: onboardingData.spendingAmount,
          estimated_annual_spend: onboardingData.estimatedAnnualSpend,
          estimated_rewards: onboardingData.estimatedPoints,
          onboarding_completed: true,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your preferences have been saved.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const goToPreviousStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    document.getElementById('onboarding-content')?.scrollIntoView({ behavior: 'smooth' });
  };
  const updateOnboardingData = (data: Partial<OnboardingFlowData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...data
    }));
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepOneMerged selectedGoal={onboardingData.mainGoal} selectedSubcategories={onboardingData.subcategories} onSelectGoal={goal => updateOnboardingData({
          mainGoal: goal,
          subcategories: []
        })} onSelectSubcategories={subcategories => updateOnboardingData({
          subcategories
        })} />;
      case 2:
        return (
          <>
            <StepTwoMerged selectedGoal={onboardingData.mainGoal as LifestyleGoal} selectedSubcategories={onboardingData.subcategories} />
            <div className="text-center mt-12 pt-8 border-t border-border/40">
              <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ready to Experience Smart Rewards?
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-4xl mx-auto">
                Create your account to start earning personalized rewards tailored to your lifestyle.
              </p>
            </div>
          </>
        );
      default:
        return <StepOneMerged selectedGoal={onboardingData.mainGoal} selectedSubcategories={onboardingData.subcategories} onSelectGoal={goal => updateOnboardingData({
          mainGoal: goal,
          subcategories: []
        })} onSelectSubcategories={subcategories => updateOnboardingData({
          subcategories
        })} />;
    }
  };
  const isNextButtonDisabled = () => {
    if (step === 1 && (!onboardingData.mainGoal || onboardingData.subcategories.length === 0)) return true;
    return false;
  };
  const getStepTitle = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return 'Choose Your Reward Profile and Subcategories';
      case 2:
        return 'Understand Ventus Smart Rewards And Ventus AI Deals';
      default:
        return '';
    }
  };
  return <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section - Full Height */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-foreground">Discover Your</span>
            <br />
            <span className="italic font-light text-muted-foreground">Ventus Smart Rewards</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Most cards reward categories. Ventus rewards you. Set your goals and earn cross-category rewards with personalized deals.
          </p>
          
          {/* Get Started button */}
          <div className="flex justify-center mb-8">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg"
              onClick={() => document.getElementById('onboarding-content')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
            </Button>
          </div>
          
          <button 
            className="mt-4 p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => document.getElementById('onboarding-content')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </section>
      
      <div className="flex-grow" id="onboarding-content">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 pb-6">
          {/* Progress Section */}
          <div className="mb-8">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-center mb-8 overflow-x-auto pt-4 pb-4 px-4 md:px-8">
              {Array.from({
              length: totalSteps
            }, (_, i) => i + 1).map(stepNumber => <div key={stepNumber} className="flex items-center">
                  <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 flex-shrink-0 ${step > stepNumber ? 'bg-primary text-white' : step === stepNumber ? 'bg-primary text-white ring-4 ring-primary/30' : 'bg-muted text-muted-foreground border-2 border-border'}`}>
                    {step > stepNumber ? <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /> : stepNumber}
                  </div>
                  {stepNumber < totalSteps && <div className={`h-1 w-16 md:w-24 lg:w-32 transition-all duration-300 flex-shrink-0 ${step > stepNumber ? 'bg-primary' : 'bg-border'}`}></div>}
                </div>)}
            </div>
          </div>
          
          {/* Step Content */}
          <div className="bg-card/80 border border-border/60 rounded-xl backdrop-blur-sm p-6 md:p-8 mb-8 transition-all duration-300" id="onboarding-step-content" style={{
          touchAction: 'manipulation',
          pointerEvents: 'auto',
          WebkitTapHighlightColor: 'transparent'
        }}>
            {renderStep()}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {step > 1 ? <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex items-center gap-2 px-6 py-3 text-base font-medium min-h-[48px] min-w-[120px] touch-manipulation" style={{
            touchAction: 'manipulation'
          }}>
                <ArrowLeft size={18} /> Back
              </Button> : <div></div>}
            
            {step === totalSteps ? (
              <Link to="/app/signup">
                <Button 
                  type="button" 
                  className="flex items-center gap-2 px-8 py-3 text-base font-semibold min-h-[48px] min-w-[120px] touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                >
                  Download Free Deals App Today <ArrowRight size={18} />
                </Button>
              </Link>
            ) : (
              <Button 
                type="button" 
                onClick={goToNextStep} 
                disabled={isNextButtonDisabled() || loading} 
                className={`flex items-center gap-2 px-8 py-3 text-base font-semibold min-h-[48px] min-w-[120px] touch-manipulation ${isNextButtonDisabled() || loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                style={{ touchAction: 'manipulation' }}
              >
                Next <ArrowRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default OnboardingFlow;