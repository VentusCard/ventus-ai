import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { z } from "zod";
interface ContactInformationSectionProps {
  selectedCategory: string;
  selectedSubcategories: string[];
  selectedTargeting: string[];
  isExpanded: boolean;
  onToggle: () => void;
}
const ContactInformationSection = ({
  selectedCategory,
  selectedSubcategories,
  selectedTargeting,
  isExpanded,
  onToggle
}: ContactInformationSectionProps) => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [websiteValue, setWebsiteValue] = useState("");
  const [shouldOpenScheduler, setShouldOpenScheduler] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const schedulerUrl = "https://calendar.app.google/tv5tbSTnpJAT9YPg7";

  // Input validation schema
  const contactFormSchema = z.object({
    companyName: z.string().trim().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
    companyWebsite: z.string().trim().url("Please enter a valid URL").max(500, "Website URL must be less than 500 characters"),
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
    roleTitle: z.string().trim().max(100, "Role must be less than 100 characters").optional(),
    emailAddress: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
    referralCode: z.string().trim().max(50, "Referral code must be less than 50 characters").optional(),
  });
  // Format the company industry field to include subcategories
  const formatCompanyIndustry = () => {
    if (!selectedCategory) return "";
    if (selectedSubcategories.length === 0) return selectedCategory;
    return `${selectedCategory} - ${selectedSubcategories.join(", ")}`;
  };

  // Format the Ventus tools interested field
  const formatVentusToolsInterested = () => {
    if (selectedTargeting.length === 0) return "";

    // Filter out "geographic" tool and only include the advanced tools
    const advancedTools = selectedTargeting.filter(tool => tool !== "geographic");
    if (advancedTools.length === 0) return "";
    const toolNames = {
      "goal-based": "Goal-Based Targeting",
      "behavioral": "Behavioral Segmentation",
      "persona": "Persona-Led Segments",
      "seasonal": "Seasonal Targeting",
      "lifecycle": "Lifecycle Targeting",
      "request-demo": "Request Demo"
    };

    // Check if demo is requested
    const isDemoRequested = advancedTools.includes("request-demo");
    const otherTools = advancedTools.filter(tool => tool !== "request-demo");
    if (isDemoRequested) {
      if (otherTools.length === 0) {
        return "Demo requested";
      } else {
        const otherToolNames = otherTools.map(tool => toolNames[tool as keyof typeof toolNames] || tool);
        return `Demo requested: ${otherToolNames.join(", ")}`;
      }
    } else {
      return advancedTools.map(tool => toolNames[tool as keyof typeof toolNames] || tool).join(", ");
    }
  };

  // Handle website input changes
  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteValue(e.target.value);
  };

  // Auto-format website URL when user finishes typing
  const handleWebsiteBlur = () => {
    if (websiteValue && !websiteValue.startsWith('http://') && !websiteValue.startsWith('https://')) {
      const formattedUrl = `https://${websiteValue}`;
      setWebsiteValue(formattedUrl);
    }
  };
  const handleScheduleDemo = () => {
    handleWebsiteBlur();
    setShouldOpenScheduler(true);
    formRef.current?.requestSubmit();
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);

      // Validate input data
      const validationData = {
        companyName: formData.get('companyName') as string,
        companyWebsite: websiteValue,
        fullName: formData.get('fullName') as string,
        roleTitle: formData.get('roleTitle') as string || '',
        emailAddress: formData.get('emailAddress') as string,
        referralCode: formData.get('referralCode') as string || '',
      };

      const validationResult = contactFormSchema.safeParse(validationData);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
        return;
      }

      // Create the data object using validated values
      const submitData = {
        companyName: validationResult.data.companyName,
        companyIndustry: formatCompanyIndustry(),
        companyWebsite: validationResult.data.companyWebsite,
        fullName: validationResult.data.fullName,
        roleTitle: validationResult.data.roleTitle || '',
        emailAddress: validationResult.data.emailAddress,
        referralCode: validationResult.data.referralCode || '',
        ventusToolsInterested: formatVentusToolsInterested()
      };

      // Submit the form
      const response = await fetch('https://script.google.com/macros/s/AKfycbxi7ANbqg5kkeS-WCDE7MewaNl3rSI84d9Ql4BVqXzxCz75HttUogAQBAXMOUT1VLfQ/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(submitData as any).toString()
      });
      toast({
        title: "Submission Recorded!",
        description: "Your submission has been recorded successfully. Thank you for you interest in partnering with Ventus! We will notify you when Ventus is ready to launch."
      });

      // Open scheduler if requested, then reset
      if (shouldOpenScheduler) {
        window.open(schedulerUrl, "_blank", "noopener,noreferrer");
        setShouldOpenScheduler(false);
      }
      // Reset the form and website state
      (e.target as HTMLFormElement).reset();
      setWebsiteValue("");
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was an error submitting your application. Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Card className="overflow-hidden border-0 shadow-premium bg-white/95 backdrop-blur-sm">
      <CardHeader className="cursor-pointer p-4 md:p-6" onClick={onToggle}>
        <CardTitle className="flex items-center justify-between text-xl md:text-2xl font-bold">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative p-1.5 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/5 rounded-lg"></div>
              <div className="absolute inset-0.5 border border-white/40 rounded-md"></div>
              <User size={16} className="text-white relative z-10 md:w-[18px] md:h-[18px]" strokeWidth={2} />
            </div>
            <span className="text-base md:text-2xl">Primary Contact Information</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </CardTitle>
        <p className="text-slate-600 mt-2 text-sm md:text-base">
          Who should we reach out to with campaign approvals and support?
        </p>
      </CardHeader>

      {isExpanded && <CardContent className="px-4 md:px-8 pb-4 md:pb-6 space-y-4 md:space-y-5 animate-accordion-down">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Company Name</label>
                <Input name="companyName" placeholder="Enter company name" className="h-11 md:h-12 text-sm md:text-base" maxLength={100} required />
              </div>
              <div>
                <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Company Industry</label>
                <Input name="companyIndustry" value={formatCompanyIndustry()} readOnly className="h-11 md:h-12 bg-slate-50 text-sm md:text-base" placeholder="Select business category above" />
              </div>
              <div className="md:col-span-2">
                <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Company Website</label>
                <Input name="companyWebsite" type="url" value={websiteValue} onChange={handleWebsiteChange} onBlur={handleWebsiteBlur} placeholder="www.example.com (https:// will be added automatically)" className="h-11 md:h-12 text-sm md:text-base" maxLength={500} required />
                <p className="text-xs text-slate-500 mt-1">https:// will be automatically added if not provided</p>
              </div>
              <div>
                <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Full Name</label>
                <Input name="fullName" placeholder="Enter full name" className="h-11 md:h-12 text-sm md:text-base" minLength={2} maxLength={100} required />
              </div>
              <div>
                <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Role/Title</label>
                <Input name="roleTitle" placeholder="Enter role or title" className="h-11 md:h-12 text-sm md:text-base" maxLength={100} />
              </div>
              <div>
                <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Business Email Address</label>
                <Input name="emailAddress" type="email" placeholder="name@company.com" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address (e.g., name@company.com)" className="h-11 md:h-12 text-sm md:text-base" maxLength={255} required />
                <p className="text-xs text-slate-500 mt-1">Please enter a valid email address</p>
              </div>
              <div>
                <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Referral Code <span className="text-slate-500 font-normal">(Optional)</span></label>
                <Input name="referralCode" placeholder="Enter referral code" className="h-11 md:h-12 text-sm md:text-base" maxLength={50} />
                <p className="text-xs text-slate-500 mt-1">If someone referred you to Ventus</p>
              </div>
            </div>
            
            <div>
              <label className="text-slate-700 font-medium mb-2 block text-sm md:text-base">Ventus Tools Interested</label>
              <Input name="ventusToolsInterested" value={formatVentusToolsInterested()} readOnly className="h-11 md:h-12 bg-slate-50 text-sm md:text-base" placeholder="Select targeting tools above" />
            </div>

            <div className="pt-3 space-y-3">
              <Button type="button" onClick={handleScheduleDemo} disabled={isSubmitting} className="w-full h-12 md:h-12 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                <Calendar className="h-4 w-4 mr-2" />
                Join Waitlist + Schedule Demo
              </Button>
              
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 md:h-12 bg-blue-600 text-white hover:bg-blue-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Submitting..." : "Join Merchant Waitlist Only"}
              </Button>
            </div>

            <div className="text-center pt-3">
              
            </div>
          </form>
        </CardContent>}
    </Card>;
};
export default ContactInformationSection;