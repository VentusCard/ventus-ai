import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const ContactUs = () => {
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const isMobile = useIsMobile();

  const handleMailTo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const form = e.currentTarget.closest('form') as HTMLFormElement;
    if (!form) return;
    
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    const emailSubject = `Contact Form: ${subject}`;
    const emailBody = `
Hello Ventus Card Team,

I'm reaching out through your contact form with the following information:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Best regards,
${name}
    `.trim();

    const mailtoLink = `mailto:hello@ventuscard.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowSuccessOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowSuccessOverlay(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 w-full relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            Contact <span className="italic font-light text-muted-foreground">Us</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions about Ventus Card? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
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

      {/* Contact Form */}
      <div className="px-4 md:px-8 pt-12 md:pt-16 pb-12 md:pb-16">
        <div className={`mx-auto relative ${isMobile ? 'max-w-full' : 'max-w-2xl'}`}>
          <Card className="bg-card border-border">
            <CardHeader className="text-center p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground">Send us a Message</CardTitle>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Fill out the form below to contact us at hello@ventuscard.com and we'll get back to you within one business day!
              </p>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-foreground font-medium mb-2 block text-sm md:text-base">Full Name</label>
                    <Input 
                      name="name" 
                      placeholder="Enter your full name" 
                      className="h-12 text-base bg-secondary border-border" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-foreground font-medium mb-2 block text-sm md:text-base">Email Address</label>
                    <Input 
                      name="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      className="h-12 text-base bg-secondary border-border" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-foreground font-medium mb-2 block text-sm md:text-base">Subject</label>
                  <Input 
                    name="subject" 
                    placeholder="How can we help?" 
                    className="h-12 text-base bg-secondary border-border" 
                    required 
                  />
                </div>

                <div>
                  <label className="text-foreground font-medium mb-2 block text-sm md:text-base">Message</label>
                  <Textarea 
                    name="message" 
                    placeholder="Please share your questions or feedback..." 
                    className="min-h-32 resize-none text-base bg-secondary border-border" 
                    required 
                  />
                </div>

                <div className="flex justify-center pt-2">
                  <Button 
                    type="button" 
                    onClick={handleMailTo} 
                    className="h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-6 md:px-8 text-sm md:text-base min-w-[200px]"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Open Email Client
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Success Overlay */}
          {showSuccessOverlay && (
            <div className={`${isMobile ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10'} bg-background/95 backdrop-blur-sm ${isMobile ? '' : 'rounded-xl border-0 shadow-xl'} flex items-center justify-center p-4`}>
              <div className="text-center p-6 md:p-8 max-w-md w-full">
                <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Email Client Opened</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
                  Your default email client should open with the pre-filled message. It may not open if you do not have a default email client set up, you can always reach out to us directly at hello@ventuscard.com.
                </p>
                <Button 
                  onClick={handleCloseOverlay}
                  className="h-12 px-6 text-base min-w-[120px]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;
