import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/seoSchema";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Cal, { getCalApi } from "@calcom/embed-react";

const CalEmbed = () => {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", { hideEventTypeDetails: false, layout: "column_view" });
    })();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute -inset-x-0 -top-0 -bottom-12">
        <Cal
          namespace="30min"
          calLink="ventusai/30min"
          style={{ width: "100%", height: "100%" }}
          config={{ theme: "light", layout: "column_view", useSlotsViewOnSmallScreen: "true" }}
        />
      </div>
    </div>
  );
};

const ContactUs = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"booking" | "message">("booking");

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      company: String(formData.get('company') ?? '').trim(),
      subject: String(formData.get('subject') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    };
    if (!payload.name) {
      toast.error('Please enter your name.');
      return;
    }
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      toast.error('Please enter a valid work email.');
      return;
    }
    if (!payload.subject) {
      toast.error('Please choose a subject.');
      return;
    }
    if (!payload.message) {
      toast.error('Please add a message.');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact', { body: payload });
      if (error || (data && (data as any).error)) {
        throw new Error(error?.message ?? 'Failed to send');
      }
      form.reset();
      setShowSuccess(true);
    } catch (err) {
      toast.error("We couldn't send your message. Please email info@ventusai.com directly.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <SEO title="Contact Ventus AI — Schedule a Demo" description="Get in touch with the Ventus AI team to explore behavioral intelligence and personalization for your bank or credit union." path="/contact" jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <main className="pt-32 md:pt-36">
        {/* Hero with tabs */}
        <section className="py-6 md:py-8 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left: text */}
              <div className="lg:pt-4">
                <p
                  className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3 animate-fade-in-down"
                  style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}
                >
                  Get In Touch
                </p>
                <h1
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in-down"
                  style={{ animationDelay: '80ms', animationFillMode: 'backwards' }}
                >
                  Let's talk.
                </h1>
                <p
                  className="text-base md:text-lg text-gray-500 max-w-md leading-relaxed mb-8 animate-fade-in-down"
                  style={{ animationDelay: '160ms', animationFillMode: 'backwards' }}
                >
                  Whether you're exploring a partnership or ready to see a demo, we'd love to hear from you.
                </p>

                <div
                  className="mb-8 animate-fade-in-down"
                  style={{ animationDelay: '240ms', animationFillMode: 'backwards' }}
                >
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">What to expect</h2>
                  <ul className="space-y-3 text-gray-600 text-sm leading-relaxed max-w-md">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      A live walkthrough of the product
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      How we'd read your own transaction data, and what we'd expect to find in it.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      What integration actually involves and what we'd need from your team.
                    </li>
                  </ul>
                </div>

                <div
                  className="animate-fade-in-down"
                  style={{ animationDelay: '320ms', animationFillMode: 'backwards' }}
                >
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Prefer email?</h2>
                  <a
                    href="mailto:info@ventusai.com"
                    className="text-base text-blue-600 hover:text-blue-700 font-medium"
                  >
                    info@ventusai.com
                  </a>
                </div>
              </div>

              {/* Right: tabbed card */}
              <div
                className="animate-fade-in-down"
                style={{ animationDelay: '240ms', animationFillMode: 'backwards' }}
              >
                <div className="flex justify-center mb-4">
                  <div
                    role="tablist"
                    aria-label="Contact options"
                    className="inline-flex w-full sm:w-auto items-center rounded-lg border border-slate-200 bg-slate-50 p-1"
                  >
                    <Button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "booking"}
                      onClick={() => setActiveTab("booking")}
                      variant="ghost"
                      className={`h-10 flex-1 sm:flex-none rounded-md px-5 gap-2 font-semibold ${activeTab === "booking" ? "bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-white" : "text-slate-500 hover:text-slate-900 hover:bg-white/70"}`}
                    >
                      <Calendar className="w-4 h-4" />
                      Book Meeting
                    </Button>
                    <Button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "message"}
                      onClick={() => setActiveTab("message")}
                      variant="ghost"
                      className={`h-10 flex-1 sm:flex-none rounded-md px-5 gap-2 font-semibold ${activeTab === "message" ? "bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-white" : "text-slate-500 hover:text-slate-900 hover:bg-white/70"}`}
                    >
                      <Mail className="w-4 h-4" />
                      Contact Form
                    </Button>
                  </div>
                </div>

                {activeTab === "booking" ? (
                  <div role="tabpanel" aria-label="Book Meeting">
                    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden min-h-[560px] h-[600px] md:h-[660px]">
                      <CalEmbed />
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white to-transparent" />
                    </div>
                  </div>
                ) : (
                  <div role="tabpanel" aria-label="Contact Form">
                    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-6">
                      {showSuccess &&
                        <div className="absolute inset-0 z-10 bg-white rounded-2xl flex items-center justify-center p-6">
                          <div className="text-center max-w-sm">
                            <CheckCircle className="w-14 h-14 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Message sent!</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                              Thanks for reaching out — we'll get back to you within one business day. You can also email us directly at info@ventusai.com.
                            </p>
                            <Button onClick={() => setShowSuccess(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11">
                              Close
                            </Button>
                          </div>
                        </div>
                      }

                      <form className="space-y-4" onSubmit={handleSend}>
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
                          type="submit"
                          disabled={sending}
                          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base">
                          {sending ? "Sending…" : "Send Message"}
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactUs;
