import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is Ventus AI?",
      answer: "Ventus AI is a transaction intelligence platform designed for financial institutions. We go beyond basic enrichment, using advanced AI to interpret transaction data and reveal consumer intent, behavior, and life events. This helps banks, credit unions, and wealth managers create more personalized, proactive customer experiences."
    },
    {
      question: "How does Ventus AI work with banks?",
      answer: "We work directly with financial institutions as technology partners. Ventus AI integrates seamlessly into existing banking infrastructure through flexible API integration or in-app deployment options. Our platform enhances customer engagement without disrupting established workflows."
    },
    {
      question: "Is Ventus AI a credit card company or a fintech startup?",
      answer: "Neither. Ventus AI is a B2B technology platform that partners with financial institutions. We don't issue credit cards or compete with banks—we empower them with AI-driven transaction intelligence to better serve their customers."
    },
    {
      question: "How secure is the platform?",
      answer: "Security is paramount. Ventus AI maintains SOC 2 Type II compliance and adheres to PCI DSS standards. We employ bank-grade encryption, secure data handling practices, and undergo regular third-party security audits to ensure your data remains protected."
    },
    {
      question: "How do customers access Ventus AI features?",
      answer: "End customers access Ventus AI features through their existing banking apps and platforms. We integrate directly with your institution's mobile and web experiences, so customers enjoy enhanced personalization without needing to download a separate app or create new accounts."
    },
    {
      question: "What outcomes can we expect?",
      answer: "Financial institutions partnering with Ventus AI typically see increased customer engagement, higher reward redemption rates, improved cross-sell opportunities, and enhanced customer satisfaction scores. Our transaction intelligence enables more relevant, timely interactions that drive measurable business outcomes."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-400">
              Everything you need to know about Ventus AI
            </p>
          </div>
          
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-white/10 rounded-xl px-6 bg-white/5 
                  data-[state=open]:border-l-blue-500 data-[state=open]:border-l-2 data-[state=open]:bg-white/[0.07]
                  hover:bg-white/[0.07] 
                  transition-all duration-300"
              >
                <AccordionTrigger className="text-left text-lg font-medium text-white hover:no-underline py-6 transition-colors duration-300">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
