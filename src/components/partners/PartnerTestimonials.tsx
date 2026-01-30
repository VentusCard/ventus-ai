import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
interface Testimonial {
  id: number;
  quote: string;
  author: string;
  company: string;
  role: string;
}

const testimonials: Testimonial[] = [{
  id: 1,
  quote: "Ventus feels like a natural fit for golf. Our members spend on tee times, gear, even dining, and this is a way to bring more of that together.",
  author: "",
  company: "Elite Golf Club",
  role: "General Manager"
}, {
  id: 2,
  quote: "We liked that Ventus looks at the full tennis lifestyle. It's not just about selling racquets, it's about connecting with players who stay engaged.",
  author: "",
  company: "Specialty Tennis Shop",
  role: "Head of Partnerships"
}, {
  id: 3,
  quote: "We added our resort because Ventus cardholders are already investing in the sport. They're the type of guest who books passes and comes back.",
  author: "",
  company: "Destination Ski Resort",
  role: "VP of Marketing"
}, {
  id: 4,
  quote: "I signed up because Ventus is focused on people who really value fitness. It makes more sense than putting money into broad ads.",
  author: "",
  company: "Boutique Fitness Chain",
  role: "Owner"
}, {
  id: 5,
  quote: "We joined the waitlist because cyclists on Ventus are exactly our customer, people who ride often and spend across gear and races.",
  author: "",
  company: "Premium Cycling Brand",
  role: "Marketing Director"
}, {
  id: 6,
  quote: "Runners are loyal and gear driven. Ventus speaks directly to that, so we wanted to be in early.",
  author: "",
  company: "Performance Hydration Brand",
  role: "Partnerships Manager"
}, {
  id: 7,
  quote: "We joined the Ventus waitlist because their audience is already investing in performance and recovery. It's the perfect fit for products like ours that support athletes beyond training.",
  author: "",
  company: "Sports Recovery Brand",
  role: "Head of Partnerships"
}, {
  id: 8,
  quote: "We're on the waitlist because Ventus is athlete first. That matches the customers we care about most.",
  author: "",
  company: "Global Snowboard Brand",
  role: "Head of Ecommerce"
}, {
  id: 9,
  quote: "We joined the Ventus waitlist because their focus on wellness spenders lines up with how our customers shop. It feels like a natural extension of our brand.",
  author: "",
  company: "Award Winning Skincare Brand",
  role: "Head of Marketing"
}, {
  id: 10,
  quote: "We signed up because Ventus attracts pet owners who already spend on quality food and toys. Those are our best customers.",
  author: "",
  company: "Regional Pet Retailer",
  role: "General Manager"
}];
const PartnerTestimonials = () => {
  return <section className="py-8 px-4 md:px-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            What Our Partners Say
          </h2>
          
        </div>

        <Carousel 
          opts={{
            align: "start",
            loop: true
          }} 
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map(testimonial => <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <Quote className="h-8 w-8 text-blue-600 mb-4 flex-shrink-0" />
                    <blockquote className="text-slate-700 mb-6 flex-grow leading-relaxed text-lg">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="mt-auto">
                      <cite className="not-italic">
                        <div className="text-sm text-slate-600">{testimonial.role}</div>
                        <div className="text-sm font-medium text-blue-600">{testimonial.company}</div>
                      </cite>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>)}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        <div className="flex justify-center mt-8 md:hidden">
          <p className="text-sm text-slate-500">Swipe to see more testimonials</p>
        </div>
      </div>
    </section>;
};
export default PartnerTestimonials;