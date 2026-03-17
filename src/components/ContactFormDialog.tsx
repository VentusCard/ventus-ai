import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import ventusLogo from "@/assets/ventus-logo-blue.png";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMailTo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form") as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const company = fd.get("company") as string;
    const subject = fd.get("subject") as string;
    const message = fd.get("message") as string;
    const mailtoLink = `mailto:info@ventusai.com?subject=${encodeURIComponent(`Contact Form: ${subject}`)}&body=${encodeURIComponent(
      `Hello Ventus AI Team,\n\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\nBest regards,\n${name}`
    )}`;
    const link = document.createElement("a");
    link.href = mailtoLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl bg-white p-0 overflow-hidden">
        {showSuccess ? (
          <div className="text-center py-12 px-6">
            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Message prepared!</h3>
            <p className="text-gray-500 text-sm mb-4">Your email client should open with the pre-filled message.</p>
            <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10">Close</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-slate-50 p-8 md:p-10 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
              <img src={ventusLogo} alt="Ventus AI" className="w-24 mb-10" />
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Right now</p>
                  <p className="text-sm text-slate-500 leading-relaxed">Generic. Static. The same for everyone.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">With VentusAI</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">Personalized. Intelligent. Built for each customer.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-1">What's next</p>
                  <p className="text-sm font-semibold leading-relaxed bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Autonomous. A bank that doesn't wait to be told — it already knows.
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Contact Form */}
            <div className="md:col-span-3 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Get in Touch</h2>
              <p className="text-gray-500 text-sm mb-5">We'd love to hear from you. We'll get back within one business day.</p>
              <form className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-900 font-medium mb-1 block text-sm">Full Name</label>
                    <Input name="name" placeholder="Your name" className="h-10 bg-white border-gray-300 text-gray-900" required />
                  </div>
                  <div>
                    <label className="text-gray-900 font-medium mb-1 block text-sm">Company</label>
                    <Input name="company" placeholder="Your company" className="h-10 bg-white border-gray-300 text-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-900 font-medium mb-1 block text-sm">Work Email</label>
                  <Input name="email" type="email" placeholder="you@company.com" className="h-10 bg-white border-gray-300 text-gray-900" required />
                </div>
                <div>
                  <label className="text-gray-900 font-medium mb-1 block text-sm">Subject</label>
                  <select name="subject" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" required>
                    <option value="">Select a topic...</option>
                    <option value="Schedule a Demo">Schedule a Demo</option>
                    <option value="Partnership Inquiry">Partnership Inquiry</option>
                    <option value="Technical Question">Technical Question</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-900 font-medium mb-1 block text-sm">Message</label>
                  <Textarea name="message" placeholder="Tell us about your needs..." className="min-h-[80px] resize-none bg-white border-gray-300 text-gray-900" required />
                </div>
                <Button type="button" onClick={handleMailTo} className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}