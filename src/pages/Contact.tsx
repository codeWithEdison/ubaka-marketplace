
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };
  
  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5 text-primary" />,
      title: "Phone",
      details: ["+1 (800) 555-UBAKA", "Monday-Friday, 8am-8pm EST"]
    },
    {
      icon: <Mail className="h-5 w-5 text-primary" />,
      title: "Email",
      details: ["support@ubaka.com", "sales@ubaka.com"]
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: "Headquarters",
      details: ["1234 Construction Ave", "New York, NY 10001"]
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Hours",
      details: ["Mon-Fri: 8am-8pm EST", "Sat: 9am-5pm EST"]
    }
  ];
  
  const faqs = [
    {
      question: "How quickly can you deliver materials?",
      answer: "Delivery times vary by location and product availability. For in-stock items, we offer same-day delivery within city limits and 1-3 business days nationwide. Custom or special order items may take longer."
    },
    {
      question: "Do you offer installation services?",
      answer: "Yes, we provide professional installation services for many of our products. You can request installation during checkout or contact our service team for a custom quote."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns on most unused items within 30 days of delivery. Custom cut materials, special orders, and certain product categories are non-returnable. Please check the product page for specific return policy information."
    },
    {
      question: "Do you offer discounts for contractors?",
      answer: "Yes, we offer contractor pricing for qualified professionals. Contact our contractor support team to set up an account and access special pricing and bulk order options."
    }
  ];

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help you with all your construction material needs.
            </p>
          </div>
          
          {/* Contact Form and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <MessageSquare className="h-6 w-6 mr-2 text-primary" />
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Your Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">{info.icon}</div>
                        <div>
                          <h3 className="font-semibold mb-2">{info.title}</h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-muted-foreground">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Our Locations</h3>
                  <div className="aspect-video w-full rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                      alt="Map of Ubaka locations"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* FAQs */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">Don't see your question here?</p>
              <Button variant="outline">View All FAQs</Button>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="bg-secondary rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest product updates, special offers, and helpful building tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="w-full"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Contact;
