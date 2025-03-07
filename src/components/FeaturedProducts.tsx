
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ProductCard from './ProductCard';
import { getFeaturedProducts } from '@/lib/data';

const FeaturedProducts = () => {
  const [isVisible, setIsVisible] = useState(false);
  const featuredProducts = getFeaturedProducts();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className={`transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground max-w-md">
              Discover our handpicked selection of high-quality construction materials.
            </p>
          </div>
          
          <Button 
            asChild 
            variant="ghost" 
            className={`mt-4 md:mt-0 group transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
          >
            <Link to="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <div 
              key={product.id}
              className={`transition-all duration-500 transform ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
