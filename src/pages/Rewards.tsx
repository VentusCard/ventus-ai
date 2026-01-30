
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award, Gift, Star } from "lucide-react";
import CTA from "@/components/CTA";

const RewardsPage = () => {
  const rewardCategories = [
    {
      name: "Travel",
      icon: <Star className="h-12 w-12 text-blue-500" />,
      description: "Earn 5x points on flights, hotels, car rentals and all travel expenses. Points never expire and can be redeemed for statement credits, travel bookings, or transfer to partner airlines and hotels.",
      benefits: [
        "5x points on all travel bookings",
        "Complimentary airport lounge access",
        "No foreign transaction fees",
        "Trip cancellation/interruption insurance"
      ]
    },
    {
      name: "Dining",
      icon: <Award className="h-12 w-12 text-blue-500" />,
      description: "3x points at restaurants, cafes, and food delivery services worldwide. Enjoy special access to exclusive restaurant reservations and chef's tables at select partner restaurants.",
      benefits: [
        "3x points at restaurants worldwide",
        "Priority reservations at partner restaurants",
        "Annual dining credit up to $120",
        "Special events with celebrity chefs"
      ]
    },
    {
      name: "Entertainment",
      icon: <Trophy className="h-12 w-12 text-blue-500" />,
      description: "2x points on streaming services, movie theaters, and event tickets. Get early access to concert tickets, exclusive movie premieres, and VIP experiences at major events.",
      benefits: [
        "2x points on entertainment expenses",
        "Presale ticket access for concerts and events",
        "Complimentary streaming service subscriptions",
        "VIP event experiences"
      ]
    },
    {
      name: "Shopping",
      icon: <Gift className="h-12 w-12 text-blue-500" />,
      description: "Exclusive discounts and bonus points at selected retail partners. Enjoy extended warranties, purchase protection, and special access to limited-edition products.",
      benefits: [
        "2x points at select retail partners",
        "Extended warranty protection",
        "Purchase protection against damage or theft",
        "Return protection up to 90 days"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Rewards, Unleashed</h1>
          <p className="text-lg md:text-xl max-w-2xl">
            Join the rewards revolution: Ventus Card champions your goal-driven life by rewarding your true passions, not predefined banking categories.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-xl">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <span className="font-display font-bold text-2xl text-blue-700">1</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-4">Earn Points</h3>
              <p className="text-slate-600">
                Earn points on every purchase. Get enhanced points in categories that match your lifestyle such as travel, dining, entertainment, and shopping.
              </p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-xl">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <span className="font-display font-bold text-2xl text-blue-700">2</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-4">Redeem Rewards</h3>
              <p className="text-slate-600">
                Redeem your points for statement credits, travel bookings, gift cards, merchandise, or transfer to partner programs for even more value.
              </p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-xl">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <span className="font-display font-bold text-2xl text-blue-700">3</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-4">Enjoy Benefits</h3>
              <p className="text-slate-600">
                Access exclusive benefits and experiences based on your membership tier. The more you use your Ventus Card, the more benefits you unlock.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold mb-6">Reward Categories</h2>
          <p className="text-lg text-slate-600 mb-8">
            The Ventus Card rewards program is designed to match your lifestyle with enhanced earning potential in these key categories:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {rewardCategories.map((category, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold mb-3">{category.name}</h3>
                      <p className="text-slate-600 mb-6">{category.description}</p>
                      <div>
                        <h4 className="font-semibold mb-2">Benefits include:</h4>
                        <ul className="space-y-2">
                          {category.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span className="text-slate-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-xl mb-16">
          <h2 className="font-display text-3xl font-bold mb-6">Point Value & Redemption</h2>
          <p className="text-lg text-slate-600 mb-6">
            Ventus Card points are designed to provide exceptional value. Here's what you need to know about maximizing your rewards:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Point Value</h3>
              <ul className="space-y-4">
                <li className="flex justify-between">
                  <span className="text-slate-600">Statement Credit</span>
                  <span className="font-semibold">1 cent per point</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-600">Travel Portal Bookings</span>
                  <span className="font-semibold">1.25 cents per point</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-600">Transfer Partners</span>
                  <span className="font-semibold">Up to 2 cents per point</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-600">Gift Cards</span>
                  <span className="font-semibold">1 cent per point</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Redemption Options</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Direct statement credits to offset purchases</li>
                <li>• Book flights, hotels, and car rentals through our travel portal</li>
                <li>• Transfer to airline and hotel partners</li>
                <li>• Redeem for gift cards at major retailers</li>
                <li>• Purchase merchandise from our rewards catalog</li>
                <li>• Exclusive experiences and event access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <CTA />
      <Footer />
    </div>
  );
};

export default RewardsPage;
