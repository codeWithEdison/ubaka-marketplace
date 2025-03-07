
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryGrid from '@/components/CategoryGrid';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Set page title
    document.title = "Ubaka - Premium Construction Materials";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <Hero />
        <FeaturedProducts />
        <CategoryGrid />
        
        {/* Trust Indicators Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Ubaka</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We're committed to providing the highest quality materials and exceptional service.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Quality Promise */}
              <div className="bg-white dark:bg-ubaka-900/50 rounded-xl p-6 text-center shadow-subtle transition-transform hover:translate-y-[-5px]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15L8.5 18.5L6 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 10.5L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 10.5L12 7L15.5 10.5L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.5 10.5L18 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.5 18.5L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">
                  We source only the highest quality materials from trusted manufacturers.
                </p>
              </div>
              
              {/* Expertise */}
              <div className="bg-white dark:bg-ubaka-900/50 rounded-xl p-6 text-center shadow-subtle transition-transform hover:translate-y-[-5px]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7.05029 16.9497L5.63608 18.3639" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.364 5.63599L16.9498 7.05021" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.9498 16.9497L18.364 18.3639" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.63608 5.63599L7.05029 7.05021" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Advice</h3>
                <p className="text-muted-foreground">
                  Our team of construction experts is available to guide your project.
                </p>
              </div>
              
              {/* Fast Delivery */}
              <div className="bg-white dark:bg-ubaka-900/50 rounded-xl p-6 text-center shadow-subtle transition-transform hover:translate-y-[-5px]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 16V8C16 6.89543 15.1046 6 14 6H6C4.89543 6 4 6.89543 4 8V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 10H18C19.1046 10 20 10.8954 20 12V18C20 19.1046 19.1046 20 18 20H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 14C10 14 11 14 12 14C13 14 14 14 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 12C10 12 11 12 12 12C13 12 14 12 14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick and reliable delivery to your project site when you need it.
                </p>
              </div>
              
              {/* Customer Support */}
              <div className="bg-white dark:bg-ubaka-900/50 rounded-xl p-6 text-center shadow-subtle transition-transform hover:translate-y-[-5px]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8.4C18 6.70261 17.3679 5.07475 16.2426 3.87452C15.1174 2.67428 13.5913 2 12 2C10.4087 2 8.88258 2.67428 7.75736 3.87452C6.63214 5.07475 6 6.70261 6 8.4C6 15.8667 3 18 3 18H21C21 18 18 15.8667 18 8.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Our customer service team is available around the clock to assist you.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-ubaka-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
              <p className="text-white/80 text-lg md:text-xl mb-8">
                Join thousands of satisfied customers who trust Ubaka for their construction material needs.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <a 
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-ubaka-900 font-medium hover:bg-white/90 transition-colors"
                >
                  Shop Materials
                </a>
                
                <a 
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-transparent border border-white text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
