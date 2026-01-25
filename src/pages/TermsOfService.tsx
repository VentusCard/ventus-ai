import { Shield, UserPlus, Ban, Store, Copyright, AlertTriangle, XCircle, Eye, Scale, FileEdit, Zap, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const sections = [
    {
      title: "Eligibility",
      icon: Shield,
      content: [
        "You must be at least 13 years old to use Ventus",
        "You must provide accurate information when creating an account",
        "Our services are available to users in the United States",
        "You may not use our services if previously banned for violations"
      ]
    },
    {
      title: "Account Registration",
      icon: UserPlus,
      content: [
        "You must provide accurate, current, and complete information during registration",
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You agree to notify us immediately of any unauthorized access to your account",
        "You are responsible for all activities that occur under your account",
        "We reserve the right to suspend or terminate accounts that provide false information"
      ]
    },
    {
      title: "Acceptable Use",
      icon: Ban,
      content: [
        "You agree to use our services only for lawful purposes. You will NOT:",
        "• Post illegal, harmful, or inappropriate content",
        "• Abuse or spam the AI chatbot",
        "• Attempt to gain unauthorized access to our systems",
        "• Use automated systems or bots without permission",
        "• Reverse engineer or decompile our application",
        "• Interfere with or disrupt our services",
        "• Violate any applicable laws or regulations"
      ]
    },
    {
      title: "AI Chatbot Service",
      icon: Zap,
      content: [
        "Our AI chatbot processes your queries to search for relevant deals",
        "Chatbot responses are automated and may not always be perfect",
        "We continuously improve our AI based on usage patterns",
        "You should verify deal details on merchant websites before purchasing",
        "The chatbot provides deal discovery, not purchase advice"
      ]
    },
    {
      title: "Content and Accuracy",
      icon: FileText,
      content: [
        "Deal information is aggregated from public merchant websites",
        "We strive for accuracy but cannot guarantee all information is current",
        "Prices, availability, and terms are subject to change by merchants",
        "Always verify deal details on the merchant's website before purchasing",
        "We are not responsible for inaccurate or outdated deal information"
      ]
    },
    {
      title: "Intellectual Property",
      icon: Copyright,
      content: [
        "All content, trademarks, and intellectual property in our app are owned by Ventus or our licensors",
        "You may not use our logos, trademarks, or branding without permission",
        "Our mobile application is protected by copyright laws",
        "You grant us a license to use any content you submit (reviews, feedback, etc.)"
      ]
    },
    {
      title: "User-Generated Content",
      icon: FileEdit,
      content: [
        "If we add features for user reviews or comments in the future:",
        "• You are responsible for content you post",
        "• Content must not violate laws or third-party rights",
        "• We reserve the right to remove inappropriate content",
        "• You grant us a license to use, display, and distribute your content"
      ]
    },
    {
      title: "Indemnification",
      icon: AlertTriangle,
      content: [
        "You agree to indemnify and hold harmless Ventus, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:",
        "• Your violation of these Terms",
        "• Your use or misuse of our services",
        "• Any content you submit",
        "• Your interactions with merchants",
        "• Your violation of any third-party rights"
      ]
    },
    {
      title: "Termination",
      icon: XCircle,
      content: [
        "We reserve the right to suspend or terminate your account at any time for violations of these Terms",
        "You may close your account at any time by contacting hello@ventuscard.com",
        "Upon termination, you will lose access to your account and saved wishlist items",
        "Certain provisions of these Terms survive termination, including disclaimers and limitations of liability"
      ]
    },
    {
      title: "Changes to Terms",
      icon: FileEdit,
      content: [
        "We may update these Terms at any time",
        "Changes will be posted with a new 'Last updated' date",
        "We may notify you via email or in-app notification",
        "Continued use after changes constitutes acceptance",
        "If you don't agree to modified Terms, you must stop using our services"
      ]
    },
    {
      title: "Dispute Resolution",
      icon: Scale,
      content: [
        "These Terms are governed by the laws of the State of Delaware",
        "Disputes shall be resolved through binding arbitration in accordance with American Arbitration Association rules",
        "You waive your right to participate in class action lawsuits",
        "You may opt out of arbitration within 30 days by written notice",
        "Either party may seek injunctive relief in court for intellectual property violations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 md:pt-32 pb-16 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600">
            Please read these Terms of Service carefully before using our mobile application.
          </p>
          <p className="text-xs text-slate-500 mt-4">Last updated: November 5, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Introduction</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 space-y-4 text-base leading-relaxed pt-0">
            <p>
              Welcome to Ventus Financial Technologies Inc. ("Ventus," "we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the Ventus mobile application and services (collectively, "Services").
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our Services.
            </p>
          </CardContent>
        </Card>

        {/* About Ventus */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">About Ventus</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 space-y-3 text-base leading-relaxed pt-0">
            <p>
              Ventus is a shopping assistant application that aggregates deals and discounts from external retailers. We provide AI-powered search functionality and personalized recommendations to help you discover savings. We are a deal aggregator and discovery platform - we do not sell products or process transactions.
            </p>
          </CardContent>
        </Card>

        {/* External Merchant Links - Special Section */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-8 border-l-4 border-l-blue-600">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-900">External Merchant Links</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-slate-600 space-y-4 text-base leading-relaxed pt-0">
            <p className="font-semibold text-slate-900">
              IMPORTANT: Ventus is a deal aggregator and discovery platform. When you click on deals, you are directed to external merchant websites where you can view products and complete purchases.
            </p>
            <ul className="space-y-2 list-none">
              <li>• We are NOT affiliated with the merchants listed in our app</li>
              <li>• We do NOT process any transactions or payments</li>
              <li>• We do NOT control merchant pricing, inventory, or policies</li>
              <li>• Purchases are made directly with merchants on their websites</li>
              <li>• Merchant terms and conditions apply to all purchases</li>
              <li>• We are not responsible for product quality, delivery, or merchant customer service</li>
              <li>• Deal availability and pricing are subject to change by merchants</li>
            </ul>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="font-semibold text-slate-900 mb-2">By using Ventus, you acknowledge that:</p>
              <ul className="space-y-2 list-none">
                <li>• Links to merchant sites are provided for your convenience</li>
                <li>• You are leaving our app when clicking on deals</li>
                <li>• Merchant websites have their own privacy policies and terms</li>
                <li>• We have no control over merchant operations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections Grid */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-xl font-bold text-slate-900">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-slate-600 text-base leading-relaxed">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className={item.startsWith('•') ? 'ml-4' : ''}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Privacy Section */}
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-900">Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-base leading-relaxed">
              Your use of our services is governed by our Privacy Policy. By using Ventus, you consent to our collection, use, and sharing of your information as described in our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitations of Liability */}
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-xl font-bold text-slate-900">Disclaimers and Limitations of Liability</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-600 text-base leading-relaxed">
            <p className="font-semibold text-slate-900">
              OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
            
            <div>
              <p className="font-semibold text-slate-900 mb-2">WE DO NOT GUARANTEE:</p>
              <ul className="space-y-2 list-none">
                <li>• Uninterrupted, secure, or error-free operation</li>
                <li>• Accuracy or completeness of deal information</li>
                <li>• Availability of any specific deals or merchants</li>
                <li>• Results from AI chatbot queries</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">WE ARE NOT LIABLE FOR:</p>
              <ul className="space-y-2 list-none">
                <li>• Merchant actions, product quality, or service delivery</li>
                <li>• Transactions made on merchant websites</li>
                <li>• Indirect, incidental, special, or consequential damages</li>
                <li>• Loss of profits, data, or business opportunities</li>
                <li>• Issues arising from external merchant websites</li>
              </ul>
            </div>

            <p className="font-semibold text-slate-900">
              OUR TOTAL LIABILITY SHALL NOT EXCEED $100 OR THE AMOUNT YOU PAID TO US IN THE PAST 12 MONTHS (CURRENTLY $0 AS THE APP IS FREE).
            </p>

            <p className="text-sm">
              Some jurisdictions do not allow limitations on implied warranties, so some limitations may not apply to you.
            </p>
          </CardContent>
        </Card>

        {/* Miscellaneous */}
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Miscellaneous</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-slate-600 text-base leading-relaxed">
              <li>
                <strong className="text-slate-900">Severability:</strong> If any provision is found unenforceable, it will be limited to the minimum extent necessary
              </li>
              <li>
                <strong className="text-slate-900">Entire Agreement:</strong> These Terms and our Privacy Policy constitute the entire agreement between you and Ventus
              </li>
              <li>
                <strong className="text-slate-900">Waiver:</strong> Our failure to enforce any right is not a waiver of that right
              </li>
              <li>
                <strong className="text-slate-900">Contact:</strong> Contact us at hello@ventuscard.com with questions
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-0 bg-white mt-12">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 text-center">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 mb-4">
              <p className="text-slate-700 font-semibold text-base">
                Email: <a href="mailto:hello@ventuscard.com" className="text-primary hover:text-primary/80 underline">hello@ventuscard.com</a>
              </p>
              <p className="text-slate-700 font-semibold text-base">
                Website: <a href="https://www.ventuscard.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">https://www.ventuscard.com</a>
              </p>
            </div>
            <p className="text-slate-500 text-xs mt-4">
              Ventus<br />
              Smart shopping with AI-powered deal discovery
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Seamless gradient transition to footer */}
      <div className="h-16 bg-gradient-to-b from-purple-50 to-slate-900"></div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
