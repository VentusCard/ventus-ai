import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/seoSchema";
import { useState, useEffect, useRef } from 'react';
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
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <Cal
      namespace="30min"
      calLink="ventusai/30min"
      style={{ width: "100%", height: "100%" }}
      config={{ theme: "light", layout: "month_view", useSlotsViewOnSmallScreen: "true" }}
    />
  );
};

const ContactUs = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        {/* Hero */}
        <section className="py-10 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
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
              className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8 animate-fade-in-down"
              style={{ animationDelay: '160ms', animationFillMode: 'backwards' }}
            >
              Whether you're exploring a partnership or ready to see a demo, we'd love to hear from you.
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-down"
              style={{ animationDelay: '240ms', animationFillMode: 'backwards' }}
            >
              <Button
                onClick={() => scrollTo(bookRef)}
                className="h-12 px-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Meeting
              </Button>
              <Button
                onClick={() => scrollTo(formRef)}
                variant="outline"
                className="h-12 px-7 rounded-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold text-base gap-2"
              >
                <Mail className="w-4 h-4" />
                Contact Form
              </Button>
            </div>
          </div>
        </section>

        {/* Book Meeting — Cal.com */}
        <section ref={bookRef} className="py-10 md:py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Book a Meeting</h2>
              <p className="text-base text-gray-500">Select a time for our 30-minute discovery call.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden min-h-[520px] h-[600px] md:h-[640px]">
              <CalEmbed />
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section ref={formRef} className="py-10 md:py-16 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 md:px-8">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">Send a message</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Prefer email?</h2>
              <p className="text-base text-gray-500">Fill out the form below and we'll get back within one business day.</p>
            </div>

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
        </section>
      </main>
    </div>);

};

export default ContactUs;
