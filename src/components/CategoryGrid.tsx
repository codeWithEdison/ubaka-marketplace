import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchCategories } from '@/services/CategoryService';
import { Category, getFallbackImageUrl } from '@/lib/utils';

const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        console.log('Fetched categories:', data);
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Loading categories...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our wide range of construction materials and supplies organized by category.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories && categories.length > 0 ? (
            categories.map((category) => {
              console.log('Rendering category:', category);
              return (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="group relative overflow-hidden rounded-xl h-72"
                >
                  {/* Background image */}
                  <div className="absolute inset-0 bg-ubaka-900/40 group-hover:bg-ubaka-900/30 transition-all duration-300 z-10" />

                  <img
                    src={category.image || getFallbackImageUrl()}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
                    <h3 className="text-xl font-semibold text-white mb-1">{category.name}</h3>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">{category.description || 'No description available'}</p>

                    <div className="flex items-center text-sm text-white space-x-2 transition-all transform group-hover:translate-x-2">
                      <span>
                        {category.count || 0} Products
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;