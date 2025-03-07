
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const benefits = [
    "Premium materials, trusted by professionals",
    "Fast, reliable delivery",
    "Expert product advice",
    "Satisfaction guaranteed"
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-background to-secondary opacity-80"
        />
        <div
          className="absolute bg-[url('https://i.pinimg.com/736x/11/d7/12/11d7123128c96ef744e21c737c1c923d.jpg')] bg-cover bg-center inset-0 opacity-10"
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 pt-16 flex flex-col md:flex-row items-center">
        {/* Hero content */}
        <div 
          className={`md:w-1/2 text-center md:text-left space-y-6 transition-all duration-700 transform ${
            loaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2 animate-fadeIn">
            Building the future together
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight md:leading-tight">
            Quality Construction <br />
            <span className="text-primary">Materials</span> Delivered
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
            Premium construction supplies for professionals and DIY enthusiasts. 
            Building excellence, one project at a time.
          </p>
          
          <div className="pt-2 space-y-3">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 transition-all duration-500 delay-${index * 200} ${
                  loaded ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0'
                }`}
              >
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Button asChild size="lg" className="group">
              <Link to="/products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
        
        {/* Hero image */}
        <div 
          className={`md:w-1/2 mt-12 md:mt-0 transition-all duration-700 delay-200 transform ${
            loaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}
        >
          <div className="relative">
            <div className="aspect-video md:aspect-square max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="https://i.pinimg.com/736x/f4/6d/88/f46d880e6a785cf68d325665ae41c643.jpg" 
                alt="Construction professional reviewing blueprints with materials" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary rounded-xl opacity-20 animate-float" />
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-ubaka-400 rounded-xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
