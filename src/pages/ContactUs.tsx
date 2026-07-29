import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/seoSchema";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, CheckCircle, ClipboardList, Calendar, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
{
  icon: ClipboardList,
  title: "We review your message",
  desc: "We read every inquiry personally, usually within a few hours."
},
{
  icon: Calendar,
  title: "We'll reach out to schedule time",
  desc: "A member of our team will follow up to learn more about your needs."
},
{
  icon: Sparkles,
  title: "We prepare something custom",
  desc: "Before any demo, we build a sample analysis tailored to your institution."
}];


const ContactUs = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMailTo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form') as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const emailSubject = `Contact Form: ${subject}`;
    const emailBody = `
Hello Ventus AI Team,

I'm reaching out through your contact form with the following information:

Name: ${name}
Company: ${company}
Email: ${email}
Subject: ${subject}

Message:
${message}

Best regards,
${name}
    `.trim();
    const mailtoLink = `mailto:info@ventusai.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSuccess(true);
  };

  return (
    <div>
      <SEO title="Contact Ventus AI — Schedule a Demo" description="Get in touch with the Ventus AI team to explore behavioral intelligence and personalization for your bank or credit union." path="/contact" jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <main className="pt-36">
        {/* Two-column: Trust + Form */}
        <section className="py-8 md:py-14 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid md:grid-cols-[42%_58%] gap-8 md:gap-12">

              {/* LEFT — Trust & Context */}
              <ScrollReveal>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">Get In Touch</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Let's talk.</h2>
                  <p className="text-base text-gray-500 max-w-md leading-relaxed mb-7">
                    Whether you're exploring a partnership or ready to see a demo, we'd love to hear from you. We'll get back within one business day.
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">What happens next</h3>
                  <div className="space-y-4 mb-6">
                    {steps.map((step, i) =>
                    <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f0f6ff" }}>
                          <step.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600">{String(i + 1).padStart(2, '0')}</span>
                            <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#f0f6ff" }}>
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email us directly</p>
                        <a href="mailto:info@ventusai.com" className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          info@ventusai.com
                        </a>
                      </div>
                    </div>
                  </div>

                  

                  
                </div>
              </ScrollReveal>

              {/* RIGHT — Form */}
              <ScrollReveal delay={0.15}>
                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-6">
                  {showSuccess &&
                  <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6">
                      <div className="text-center max-w-sm">
                        <CheckCircle className="w-14 h-14 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Message prepared!</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                          Your default email client should open with the pre-filled message. You can also email us directly at info@ventusai.com.
                        </p>
                        <Button onClick={() => setShowSuccess(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11">
                          Close
                        </Button>
                      </div>
                    </div>
                  }

                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-900 font-medium mb-1.5 block text-sm">Full Name</label>
                        <Input name="name" placeholder="Your name" className="h-11 bg-white border-gray-300 text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-gray-300" required />
                      </div>
                      <div>
                        <label className="text-gray-900 font-medium mb-1.5 block text-sm">Company Name</label>
                        <Input name="company" placeholder="Your company" className="h-11 bg-white border-gray-300 text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-gray-300" />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-900 font-medium mb-1.5 block text-sm">Work Email</label>
                      <Input name="email" type="email" placeholder="you@company.com" className="h-11 bg-white border-gray-300 text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-gray-300" required />
                    </div>
                    <div>
                      <label className="text-gray-900 font-medium mb-1.5 block text-sm">Subject</label>
                      <select
                        name="subject"
                        className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus:outline-none focus:ring-0"
                        required>
                        
                        <option value="">Select a topic...</option>
                        <option value="Schedule a Demo">Schedule a Demo</option>
                        <option value="Partnership Inquiry">Partnership Inquiry</option>
                        <option value="Technical Question">Technical Question</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-900 font-medium mb-1.5 block text-sm">Message</label>
                      <Textarea name="message" placeholder="Tell us about your needs..." className="min-h-[100px] resize-none bg-white border-gray-300 text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-gray-300" required />
                    </div>
                    <Button
                      type="button"
                      onClick={handleMailTo}
                      className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base">
                      
                      Send Message
                    </Button>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </div>);

};

export default ContactUs;