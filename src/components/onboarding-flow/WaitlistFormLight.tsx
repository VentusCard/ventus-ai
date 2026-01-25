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
            <div className="flex gap-2 mb-3">
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
            
            {/* Social Share Buttons */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Share via:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-[#1DA1F2]/10 border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20"
                onClick={() => {
                  const text = encodeURIComponent(`Join me on Ventus and get exclusive deals! Use my referral code: ${generatedReferralCode}`);
                  const url = encodeURIComponent("https://ventus.lovable.app/smartrewards");
                  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
                }}
                aria-label="Share on Twitter"
              >
                <svg className="w-4 h-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366]/20"
                onClick={() => {
                  const text = encodeURIComponent(`Join me on Ventus and get exclusive deals! Use my referral code: ${generatedReferralCode} https://ventus.lovable.app/smartrewards`);
                  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
                }}
                aria-label="Share on WhatsApp"
              >
                <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-[#1877F2]/10 border-[#1877F2]/30 hover:bg-[#1877F2]/20"
                onClick={() => {
                  const url = encodeURIComponent("https://ventus.lovable.app/smartrewards");
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(`Use my referral code: ${generatedReferralCode}`)}`, "_blank", "noopener,noreferrer");
                }}
                aria-label="Share on Facebook"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
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
