import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, User, Target, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { value: "Sports", label: "Sports" },
  { value: "Wellness", label: "Wellness" },
  { value: "Pet Owners", label: "Pet Owners" },
  { value: "Gamers", label: "Gamers" },
  { value: "Creatives", label: "Creatives" },
  { value: "Homeowners", label: "Homeowners" },
];

const JoinWaitlist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Map form fields to match script parameter names
    const mappedData: Record<string, string> = {
      'firstName': formData.get('firstName') as string || '',
      'lastName': formData.get('lastName') as string || '',
      'interest': formData.get('interest') as string || '',
      'email': formData.get('email') as string || '',
      'referralCode': formData.get('referralCode') as string || ''
    };

    // Create URL-encoded data
    const urlEncodedData = new URLSearchParams(mappedData).toString();

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxi7ANbqg5kkeS-WCDE7MewaNl3rSI84d9Ql4BVqXzxCz75HttUogAQBAXMOUT1VLfQ/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncodedData
      });

      const responseText = await response.text();

      if (response.status === 200 || response.status === 201 || response.status === 302 || 
          (responseText && responseText.toLowerCase().includes('success'))) {
        toast({
          title: "Successfully joined the waitlist!",
          description: "We'll notify you when Ventus Card becomes available."
        });

        form.reset();
        setHasAttemptedSubmit(false);
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Please try again later.";
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = `Submission failed: ${error.message}`;
      }

      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 w-full relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            Be Among the <span className="italic font-light text-muted-foreground">First</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of others waiting for the personalized credit card that adapts to your lifestyle.
          </p>
          
          {/* Scroll indicator */}
          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="mt-8 animate-fade-in"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
          </button>
        </div>
        
        {/* Subtle bottom line separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
      </section>

      <section className="pt-24 pb-12 md:pb-20 px-3 md:px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border overflow-hidden mx-2 md:mx-0 rounded-xl">
            <CardHeader className="text-center pb-4 md:pb-6 px-4 md:px-8 pt-6 md:pt-8">
              <CardTitle className="flex items-center justify-center gap-3 text-xl md:text-2xl font-bold text-foreground">
                Join the Waitlist
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 md:px-8 pb-6 md:pb-8">
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="form-field">
                    <label htmlFor="firstName" className="text-muted-foreground font-medium flex items-center gap-3 mb-3 text-sm md:text-base cursor-pointer">
                      <span className="relative p-2 bg-muted rounded-lg flex-shrink-0 pointer-events-none">
                        <User size={16} className="text-foreground relative z-10" strokeWidth={2} />
                      </span>
                      First Name
                    </label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      type="text" 
                      placeholder="Enter your first name" 
                      className={`h-12 text-base transition-all duration-200 bg-secondary border-border text-foreground placeholder:text-muted-foreground ${hasAttemptedSubmit ? "invalid:border-destructive invalid:focus:border-destructive" : ""}`}
                      minLength={2}
                      required 
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="lastName" className="text-muted-foreground font-medium flex items-center gap-3 mb-3 text-sm md:text-base cursor-pointer">
                      <span className="relative p-2 bg-muted rounded-lg flex-shrink-0 pointer-events-none">
                        <User size={16} className="text-foreground relative z-10" strokeWidth={2} />
                      </span>
                      Last Name
                    </label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      type="text" 
                      placeholder="Enter your last name" 
                      className={`h-12 text-base transition-all duration-200 bg-secondary border-border text-foreground placeholder:text-muted-foreground ${hasAttemptedSubmit ? "invalid:border-destructive invalid:focus:border-destructive" : ""}`}
                      minLength={2}
                      required 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="interest" className="text-muted-foreground font-medium flex items-center gap-3 mb-3 text-sm md:text-base cursor-pointer">
                    <span className="relative p-2 bg-muted rounded-lg flex-shrink-0 pointer-events-none">
                      <Target size={16} className="text-foreground relative z-10" strokeWidth={2} />
                    </span>
                    Main Interest Category
                  </label>
                  <select 
                    id="interest" 
                    name="interest" 
                    className={`flex h-12 w-full rounded-md border bg-secondary border-border px-3 py-2 text-base text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${hasAttemptedSubmit ? "invalid:border-destructive invalid:focus-visible:border-destructive" : ""}`}
                    required
                    defaultValue=""
                  >
                    <option value="" disabled className="text-muted-foreground">Select your main interest category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="referralCode" className="text-muted-foreground font-medium flex items-center gap-3 mb-3 text-sm md:text-base cursor-pointer">
                    <span className="relative p-2 bg-muted rounded-lg flex-shrink-0 pointer-events-none">
                      <Target size={16} className="text-foreground relative z-10" strokeWidth={2} />
                    </span>
                    Referral Code (Optional)
                  </label>
                  <Input 
                    id="referralCode" 
                    name="referralCode" 
                    type="text" 
                    placeholder="Enter referral code if you have one" 
                    className="h-12 text-base transition-all duration-200 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email" className="text-muted-foreground font-medium flex items-center gap-3 mb-3 text-sm md:text-base cursor-pointer">
                    <span className="relative p-2 bg-muted rounded-lg flex-shrink-0 pointer-events-none">
                      <Mail size={16} className="text-foreground relative z-10" strokeWidth={2} />
                    </span>
                    Email Address
                  </label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    className={`h-12 text-base transition-all duration-200 bg-secondary border-border text-foreground placeholder:text-muted-foreground ${hasAttemptedSubmit ? "invalid:border-destructive invalid:focus:border-destructive" : ""}`}
                    required 
                  />
                </div>

                <div className="pt-2 md:pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-base active:scale-95"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining Waitlist..." : "Join the Waitlist"}
                  </Button>
                </div>

                <div className="text-center pt-3 md:pt-4">
                  <p className="text-xs md:text-sm text-muted-foreground px-2 leading-relaxed">
                    By joining, you agree to receive updates about Ventus Card availability.
                    <br />
                    Available only in the USA for eligible customers.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinWaitlist;
