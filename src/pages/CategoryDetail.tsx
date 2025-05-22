import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCategoryById } from '@/services/CategoryService';
import { fetchProductsByCategory } from '@/services/ProductService';
import { Category, Product } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const CategoryDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        const [categoryData, productsData] = await Promise.all([
          fetchCategoryById(categoryId),
          fetchProductsByCategory(categoryId)
        ]);
        
        setCategory(categoryData);
        setCategoryProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Error</h1>
              <p className="mb-6 text-muted-foreground">{error}</p>
              <Link to="/categories">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Categories
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!category && !loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
              <p className="mb-6 text-muted-foreground">The category you're looking for doesn't exist.</p>
              <Link to="/categories">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Categories
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <Link to="/categories" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{category?.name}</h1>
                <p className="text-muted-foreground mt-2">{category?.description}</p>
              </div>
              <div className="flex-shrink-0">
                <Link to="/products">
                  <Button variant="outline">View All Products</Button>
                </Link>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="border rounded-lg p-4 h-80">
                  <div className="w-full h-40 bg-gray-200 animate-pulse rounded-md mb-4"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl mb-4">No products found in this category.</p>
              <Link to="/products">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default CategoryDetail;
