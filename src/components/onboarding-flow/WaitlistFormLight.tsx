import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, CheckCircle2, Copy, Share2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LifestyleGoal, OnboardingFlowData } from "@/pages/OnboardingFlow";
import { z } from "zod";
import confetti from "canvas-confetti";

const generateReferralCode = (email: string): string => {
  const prefix = email.split("@")[0].slice(0, 4).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${randomSuffix}`;
};

const lifestyleCategories: {
  label: string;
  value: LifestyleGoal;
}[] = [
  { label: "Sports: 5x on everything sports with Ventus AI deal co-pilot", value: "sports" },
  { label: "Wellness: 5x on everything wellness with Ventus AI deal co-pilot", value: "wellness" },
  { label: "Pets: 5x on everything pets with Ventus AI deal co-pilot", value: "pets" },
  { label: "Gamers: 5x on everything gaming with Ventus AI deal co-pilot", value: "gamers" },
  { label: "Creatives: 5x on everything creative with Ventus AI deal co-pilot", value: "creatives" },
  { label: "Homeowners: 5x on everything home with Ventus AI deal co-pilot", value: "homeowners" },
];

interface WaitlistFormLightProps {
  onboardingData?: OnboardingFlowData;
}

const WaitlistFormLight = ({ onboardingData }: WaitlistFormLightProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedReferralCode, setGeneratedReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    referralCode: "",
    interest: onboardingData?.mainGoal || "",
  });
  const { toast } = useToast();

  const waitlistSchema = z.object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(50, "First name must be less than 50 characters"),
    lastName: z.string().trim().max(50, "Last name must be less than 50 characters").optional(),
    email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
    interest: z.string().min(1, "Please select a category"),
    referralCode: z.string().trim().max(50, "Referral code must be less than 50 characters").optional(),
  });

  const triggerConfetti = () => {
    // Fire confetti from both sides
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2, y: 0.7 },
    });
    fire(0.2, {
      spread: 60,
      origin: { x: 0.8, y: 0.7 },
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.5, y: 0.7 },
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.7 },
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "email" && emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = waitlistSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      interest: formData.interest,
      referralCode: formData.referralCode,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      setEmailError(firstError.path[0] === "email" ? firstError.message : "");
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const form = event.currentTarget;
    const submitFormData = new FormData(form);

    if (onboardingData) {
      submitFormData.append("mainGoal", onboardingData.mainGoal || "");
      submitFormData.append("subcategories", onboardingData.subcategories.join(", "));
      submitFormData.append("spendingFrequency", onboardingData.spendingFrequency);
      submitFormData.append("spendingAmount", onboardingData.spendingAmount.toString());
      submitFormData.append("estimatedAnnualSpend", onboardingData.estimatedAnnualSpend.toString());
      submitFormData.append("estimatedPoints", onboardingData.estimatedPoints.toString());
    }

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxi7ANbqg5kkeS-WCDE7MewaNl3rSI84d9Ql4BVqXzxCz75HttUogAQBAXMOUT1VLfQ/exec",
        {
          method: "POST",
          body: submitFormData,
        }
      );
      const responseText = await response.text();

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 302 ||
        (responseText && responseText.toLowerCase().includes("success"))
      ) {
        // Trigger confetti celebration
        triggerConfetti();
        
        // Generate referral code and show success modal
        const code = generateReferralCode(formData.email);
        setGeneratedReferralCode(code);
        setShowSuccessModal(true);

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          referralCode: "",
          interest: onboardingData?.mainGoal || "",
        });
        form.reset();
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Please try again later.";
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = `Submission failed: ${error.message}`;
      }
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedCategoryLabel = () => {
    if (!onboardingData?.mainGoal) return "";
    const category = lifestyleCategories.find((cat) => cat.value === onboardingData.mainGoal);
    return category ? category.label : "";
  };

  return (
    <>
    <Card className="overflow-hidden md:border md:border-border/60 shadow-lg bg-card">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/70"></div>
      <CardContent className="p-4 md:p-8">
        <h3 className="font-display text-lg md:text-2xl font-bold mb-4 flex items-center gap-3 text-foreground">
          <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
            <Sparkles className="text-primary" size={20} />
          </div>
          <span>Join the Waitlist Today!</span>
        </h3>
        <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed">
          Be the first to experience Ventus. We're launching soon—exclusively for eligible U.S. customers, starting with our waitlist.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-field">
            <label className="block text-sm md:text-base font-medium mb-2 text-foreground">
              First Name
            </label>
            <Input
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="h-12 text-base text-white placeholder:text-slate-400"
              minLength={2}
              maxLength={50}
              required
            />
          </div>

          <div className="form-field">
            <label className="block text-sm md:text-base font-medium mb-2 text-foreground">
              Last Name
            </label>
            <Input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="h-12 text-base text-white placeholder:text-slate-400"
              maxLength={50}
            />
          </div>

          <div className="form-field">
          <label className="block text-sm md:text-base font-medium mb-2 text-foreground">
              Smart Rewards Category
            </label>
            <Select
              name="interest"
              value={formData.interest}
              onValueChange={(value) => handleInputChange("interest", value)}
              required
            >
              <SelectTrigger className="h-12 text-base text-white">
                <SelectValue
                  placeholder={
                    onboardingData?.mainGoal ? getSelectedCategoryLabel() : "Select a category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {lifestyleCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              name="interest"
              value={
                lifestyleCategories.find((cat) => cat.value === formData.interest)?.label ||
                formData.interest
              }
            />
          </div>

          <div className="form-field">
            <label className="block text-sm md:text-base font-medium mb-2 text-foreground flex items-center gap-2">
              <Target size={16} className="text-muted-foreground" />
              Referral Code (Optional)
            </label>
            <Input
              name="referralCode"
              type="text"
              placeholder="Enter referral code if you have one"
              value={formData.referralCode}
              onChange={(e) => handleInputChange("referralCode", e.target.value)}
              className="h-12 text-base text-white placeholder:text-slate-400"
              maxLength={50}
            />
          </div>

          <div className="form-field">
            <label className="block text-sm md:text-base font-medium mb-2 text-foreground">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`h-12 text-base text-white placeholder:text-slate-400 ${emailError ? "border-destructive focus:border-destructive" : ""}`}
              maxLength={255}
              required
            />
            {emailError && <p className="text-destructive text-sm mt-2">{emailError}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold mt-2"
          >
            {isSubmitting ? "Joining Waitlist..." : "Join the Waitlist"}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-md lg:max-w-lg p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center pt-2 pb-4">
          {/* Success Icon */}
          <div className="mb-4 p-3 bg-green-500/10 rounded-full">
            <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
          </div>
          
          {/* Header */}
          <DialogHeader className="text-center space-y-2 mb-4">
            <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
              You're on the list!
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-muted-foreground px-2">
              We'll notify you when Ventus Card becomes available.
            </DialogDescription>
          </DialogHeader>

          {/* Referral Section */}
          <div className="w-full bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Share & Earn Rewards</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Invite friends with your code and earn bonus rewards when they join!
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-sm text-foreground">
                {generatedReferralCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedReferralCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Download Button */}
          <Button 
            asChild 
            size="lg" 
            className="w-full h-12 md:h-14 text-sm md:text-base font-semibold"
          >
            <Link to="/app">
              Download Free Deals App
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default WaitlistFormLight;
