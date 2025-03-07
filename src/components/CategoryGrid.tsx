
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/data';

const CategoryGrid = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById('category-grid');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our wide range of construction materials and supplies organized by category.
          </p>
        </div>
        
        <div 
          id="category-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className={`group relative overflow-hidden rounded-xl h-72 transition-all duration-500 transform ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-20 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              {/* Background image */}
              <div className="absolute inset-0 bg-ubaka-900/40 group-hover:bg-ubaka-900/30 transition-all duration-300 z-10" />
              
              <img 
                src={category.image} 
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
                <h3 className="text-xl font-semibold text-white mb-1">{category.name}</h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">{category.description}</p>
                
                <div className="flex items-center text-sm text-white space-x-2 transition-all transform group-hover:translate-x-2">
                  <span>{category.count} Products</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
