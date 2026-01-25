import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const Privacy = () => {
  const sections = [{
    icon: Shield,
    title: "Information We Collect",
    content: {
      personal: ["Name and email address when you create an account", "Preferences and interests you select (sports, activities, lifestyle categories)", "Location information (city, state, zip code - manually entered by you for local deals)"],
      usage: ["Search queries you enter in our AI chatbot", "Deals you view, save, or interact with", "Categories you browse", "Wishlist items you save", "App usage patterns and features you use"],
      device: ["Device type, operating system, and app version", "IP address and general location data", "Mobile device identifiers"]
    }
  }, {
    icon: Eye,
    title: "How We Use Your Information",
    content: ["Provide personalized deal recommendations based on your interests", "Process your AI chatbot search queries to find relevant deals", "Show you deals from categories matching your preferences", "Display location-specific deals from your area", "Improve our AI chatbot responses and deal matching", "Send you notifications about new deals (if you enable notifications)", "Analyze app usage to improve our services", "Maintain account security"]
  }, {
    icon: Lock,
    title: "How We Share Your Information",
    content: {
      serviceProviders: ["Database and authentication services (Supabase)", "AI and natural language processing", "Analytics and app performance monitoring"],
      merchants: "When you click on deals, you are directed to external merchant websites to view products and complete purchases. These merchant websites have their own privacy policies which govern how they collect and use your information. We are not responsible for merchant privacy practices.\n\nWe do NOT share your personal information with merchants. When you visit merchant sites, they may collect their own data about your visit.",
      legal: "We may disclose information when required by law, to protect our rights and safety, or in connection with legal proceedings."
    }
  }, {
    icon: Users,
    title: "Your Rights and Choices",
    content: ["Access the personal information we have about you", "Correct any inaccurate information", "Request deletion of your account and data", "Opt out of marketing communications", "Request a copy of your data in a portable format"]
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-28 md:pt-32 pb-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-xs text-slate-500 mt-4">Last updated: November 5, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 space-y-3 text-base leading-relaxed pt-0">
              <p>
                Ventus Financial Technologies Inc. ("Ventus," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application or services.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not use our services.
              </p>
            </CardContent>
          </Card>

          {/* About Ventus Section */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">About Ventus</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 space-y-3 text-base leading-relaxed pt-0">
              <p>
                Ventus is a shopping assistant mobile application that helps you discover personalized deals and discounts from retailers. Our AI-powered chatbot allows you to search for deals using natural language, and we provide daily curated recommendations based on your interests.
              </p>
            </CardContent>
          </Card>

          {/* Mobile Application Section */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">Mobile Application</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 space-y-3 text-base leading-relaxed pt-0">
              <p>
                This privacy policy applies to the Ventus mobile application available on iOS and Android.
              </p>
              <p className="font-semibold">The mobile app collects:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Account information (name, email address)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Location data (city, state, zip code - manually entered by users)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Interests and activity preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Offer interaction data (views, clicks, wishlist items, redemptions)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Device and usage information</span>
                </li>
              </ul>
              <p>
                We use secure third-party service providers for data storage, authentication, and AI-powered deal discovery. These providers process data in accordance with their own privacy policies and industry-standard security practices.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {sections.map((section, index) => <Card key={index} className="border-0 shadow-lg bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <section.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-900">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {section.title === "Information We Collect" && typeof section.content === 'object' && 'personal' in section.content ? <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Personal Information:</p>
                        <ul className="space-y-2">
                          {section.content.personal.map((item, itemIndex) => <li key={itemIndex} className="text-slate-600 leading-relaxed flex items-start ml-4">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span>{item}</span>
                            </li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Usage Information:</p>
                        <ul className="space-y-2">
                          {section.content.usage.map((item, itemIndex) => <li key={itemIndex} className="text-slate-600 leading-relaxed flex items-start ml-4">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span>{item}</span>
                            </li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Device Information:</p>
                        <ul className="space-y-2">
                          {section.content.device.map((item, itemIndex) => <li key={itemIndex} className="text-slate-600 leading-relaxed flex items-start ml-4">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span>{item}</span>
                            </li>)}
                        </ul>
                      </div>
                    </div> : section.title === "How We Use Your Information" && Array.isArray(section.content) ? <div className="space-y-4">
                      <p className="text-slate-600 leading-relaxed mb-3">We use your information to:</p>
                      <ul className="space-y-2">
                        {section.content.map((item, itemIndex) => <li key={itemIndex} className="text-slate-600 leading-relaxed flex items-start">
                            <span className="text-blue-600 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>)}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="font-semibold text-slate-700 mb-2">AI Chatbot:</p>
                        <p className="text-slate-600 leading-relaxed">
                          Our AI chatbot processes your natural language queries to search our deal database. Your search queries are stored to improve our service and provide better recommendations, but are not shared with third parties for marketing purposes.
                        </p>
                      </div>
                    </div> : section.title === "How We Share Your Information" && typeof section.content === 'object' && 'serviceProviders' in section.content ? <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Service Providers:</p>
                        <p className="text-slate-600 leading-relaxed mb-2">We use trusted third-party service providers for:</p>
                        <ul className="space-y-2">
                          {section.content.serviceProviders.map((item, itemIndex) => <li key={itemIndex} className="text-slate-600 leading-relaxed flex items-start ml-4">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span>{item}</span>
                            </li>)}
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-2">
                          These providers process data in accordance with their own privacy policies and industry-standard security practices.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">External Merchant Websites:</p>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                          {section.content.merchants}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Legal Requirements:</p>
                        <p className="text-slate-600 leading-relaxed">
                          {section.content.legal}
                        </p>
                      </div>
                    </div> : section.title === "Your Rights and Choices" && Array.isArray(section.content) ? <div className="space-y-4">
                      <p className="text-slate-600 leading-relaxed mb-3">You have the right to:</p>
                      <ul className="space-y-2">
                        {section.content.map((item, itemIndex) => <li key={itemIndex} className="text-slate-600 leading-relaxed flex items-start">
                            <span className="text-blue-600 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>)}
                      </ul>
                      <p className="text-slate-600 leading-relaxed mt-4">
                        To exercise these rights, contact us at hello@ventuscard.com. We will process deletion requests within 30 days, subject to legal retention requirements.
                      </p>
                    </div> : null}
                </CardContent>
              </Card>)}
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Data Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Our services are intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Third-Party Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Our app contains links to external merchant websites. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read their privacy policies before providing any information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy with an updated "Last updated" date. For significant changes, we may also notify you via email or in-app notification.
                </p>
                <p className="text-slate-600 leading-relaxed mt-3">
                  Your continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Account Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed mb-3">
                  Users can delete their account in two ways:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="text-slate-600 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 font-semibold">1.</span>
                    <span><strong>In the app:</strong> Profile → Account Management → Delete Account</span>
                  </li>
                  <li className="text-slate-600 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 font-semibold">2.</span>
                    <span><strong>Contact us:</strong> Submit a deletion request via our <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">contact form</Link></span>
                  </li>
                </ul>
                
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 text-center">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 mb-6">
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
        </div>
      </div>

      {/* Seamless gradient transition to footer */}
      <div className="h-16 bg-gradient-to-b from-slate-50 to-slate-900"></div>

      <Footer />
    </div>;
};
export default Privacy;