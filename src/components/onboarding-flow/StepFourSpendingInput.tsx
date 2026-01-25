import { OnboardingFlowData } from "@/pages/OnboardingFlow";

interface StepFourSpendingInputProps {
  onboardingData: OnboardingFlowData;
  updateOnboardingData: (data: Partial<OnboardingFlowData>) => void;
}

const StepFourSpendingInput = ({
  onboardingData,
  updateOnboardingData
}: StepFourSpendingInputProps) => {
  return (
    <div>
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to Experience Smart Rewards?
        </h2>
        <p className="text-base md:text-xl text-white/80 max-w-4xl mx-auto">
          You're all set! Create your account to start earning personalized rewards tailored to your lifestyle.
        </p>
      </div>
    </div>
  );
};

export default StepFourSpendingInput;