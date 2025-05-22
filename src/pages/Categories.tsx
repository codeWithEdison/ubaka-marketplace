import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '@/services/CategoryService';
import { Category } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">Product Categories</h1>
            <p className="text-muted-foreground max-w-2xl">
              Browse our extensive range of construction materials categorized to help you find exactly what you need for your project.
            </p>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="overflow-hidden h-full">
                    <div className="aspect-video w-full bg-muted animate-pulse" />
                    <CardContent className="p-5">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {categories.map((category) => (
                  <Link key={category.id} to={`/categories/${category.id}`}>
                    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md group">
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{category.description}</p>
                            <p className="text-sm text-primary">{category.count} Products</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Categories;
