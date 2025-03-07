
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Truck, Clock, Tools, Headset, Building, Ruler, HardHat } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Fast Delivery",
      description: "Same-day delivery within city limits, or 1-3 business days nationwide with real-time tracking."
    },
    {
      icon: <Tools className="h-10 w-10 text-primary" />,
      title: "Installation Services",
      description: "Professional installation of materials and systems by certified technicians."
    },
    {
      icon: <Ruler className="h-10 w-10 text-primary" />,
      title: "Custom Cutting & Sizing",
      description: "Custom cutting and sizing for wood, glass, metal, and other materials to your exact specifications."
    },
    {
      icon: <HardHat className="h-10 w-10 text-primary" />,
      title: "Contractor Support",
      description: "Special pricing, dedicated account managers, and bulk ordering options for professional contractors."
    },
    {
      icon: <Building className="h-10 w-10 text-primary" />,
      title: "Project Consultation",
      description: "Expert advice on material selection, quantity estimation, and project planning."
    },
    {
      icon: <Headset className="h-10 w-10 text-primary" />,
      title: "Technical Support",
      description: "24/7 technical support for product inquiries, troubleshooting, and application guidance."
    }
  ];
  
  const testimonials = [
    {
      quote: "Ubaka has transformed how we source materials. Their delivery speed and quality are unmatched in the industry.",
      author: "James Wilson",
      position: "General Contractor",
      company: "Wilson Construction"
    },
    {
      quote: "The custom cutting service saved us countless hours on our renovation project. Professional and precise every time.",
      author: "Sarah Miller",
      position: "Interior Designer",
      company: "Modern Spaces Design"
    },
    {
      quote: "Their technical support team helped us solve a complex installation issue at 9 PM on a Sunday. That's dedication!",
      author: "Robert Chen",
      position: "Project Manager",
      company: "Urban Development Co."
    }
  ];

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional services to support your construction projects from start to finish.
            </p>
          </div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {services.map((service, index) => (
              <Card key={index} className="h-full transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Value Proposition */}
          <div className="bg-secondary rounded-lg p-8 md:p-12 mb-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Why Choose Our Services</h2>
              <div className="space-y-4">
                {[
                  "Professional teams with industry certifications",
                  "Transparent pricing with no hidden fees",
                  "Guaranteed quality and workmanship",
                  "Insured and licensed service providers",
                  "Flexible scheduling to meet your timeline",
                  "Comprehensive post-service support"
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-lg">{item}</p>
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <Button size="lg" className="mt-4">Schedule a Service</Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">What Our Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-secondary/50">
                  <CardContent className="pt-6">
                    <p className="italic mb-4">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.position}, {testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Contact our service team today to discuss your project requirements and get a free quote.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg">Request a Quote</Button>
              <Button variant="outline" size="lg">Contact Support</Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Services;
