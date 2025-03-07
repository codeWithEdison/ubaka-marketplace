
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProductCard from './ProductCard';
import { getFeaturedProducts, getNewProducts, getDiscountedProducts, Product } from '@/lib/data';

const FeaturedProducts = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<'featured' | 'new' | 'discounted'>('featured');
  
  useEffect(() => {
    // Fetch the right products based on filter
    switch (filterType) {
      case 'new':
        setProducts(getNewProducts());
        break;
      case 'discounted':
        setProducts(getDiscountedProducts());
        break;
      case 'featured':
      default:
        setProducts(getFeaturedProducts());
        break;
    }
  }, [filterType]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const getFilterLabel = () => {
    switch (filterType) {
      case 'new': return 'New Arrivals';
      case 'discounted': return 'Special Offers';
      case 'featured': return 'Featured Products';
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className={`transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{getFilterLabel()}</h2>
            <p className="text-muted-foreground max-w-md">
              Discover our handpicked selection of high-quality construction materials.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex items-center transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                  style={{ transitionDelay: '0.1s' }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('featured')} className="flex items-center justify-between">
                  Featured Products
                  {filterType === 'featured' && <Check className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('new')} className="flex items-center justify-between">
                  New Arrivals
                  {filterType === 'new' && <Check className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('discounted')} className="flex items-center justify-between">
                  Special Offers
                  {filterType === 'discounted' && <Check className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              asChild 
              variant="ghost" 
              className={`group transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
              style={{ transitionDelay: '0.2s' }}
            >
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          ) : (
            products.map((product, index) => (
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
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
