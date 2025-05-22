import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Filter, Check, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useApiQuery } from '@/hooks/useApi';
import { fetchProducts } from '@/services/ProductService';
import { supabase } from '@/integrations/supabase/client';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'newest'>('featured');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery(
    ['categories'],
    async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  );
  
  // Fetch products with filters
  const { data: productsData, isLoading: productsLoading } = useApiQuery(
    ['products', debouncedSearch, selectedCategory, sortBy],
    async () => {
      const sortMapping = {
        featured: { sortBy: 'featured', sortOrder: 'desc' as const },
        price_low: { sortBy: 'price', sortOrder: 'asc' as const },
        price_high: { sortBy: 'price', sortOrder: 'desc' as const },
        newest: { sortBy: 'created_at', sortOrder: 'desc' as const }
      };
      
      const { sortBy: dbSortBy, sortOrder } = sortMapping[sortBy];
      
      return fetchProducts({
        category: selectedCategory || '',
        search: debouncedSearch,
        sortBy: dbSortBy,
        sortOrder: sortOrder,
        limit: 24
      });
    },
    { keepPreviousData: true }
  );
  
  const categories = categoriesData || [];
  const products = productsData?.products || [];
  const isLoading = categoriesLoading || productsLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">All Products</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters */}
              <div className="w-full lg:w-64 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Search</h3>
                  <form onSubmit={handleSearch}>
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </form>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Loading categories...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Categories
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Products */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-muted-foreground">
                    {isLoading ? 'Loading products...' : 
                      `Showing ${products.length} ${products.length === 1 ? 'product' : 'products'}`
                    }
                  </p>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        Sort By
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy('featured')} className="flex items-center justify-between">
                        Featured
                        {sortBy === 'featured' && <Check className="ml-2 h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('price_low')} className="flex items-center justify-between">
                        Price: Low to High
                        {sortBy === 'price_low' && <Check className="ml-2 h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('price_high')} className="flex items-center justify-between">
                        Price: High to Low
                        {sortBy === 'price_high' && <Check className="ml-2 h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('newest')} className="flex items-center justify-between">
                        Newest First
                        {sortBy === 'newest' && <Check className="ml-2 h-4 w-4" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="border rounded-lg p-4 h-80">
                        <div className="w-full h-40 bg-gray-200 rounded animate-pulse mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found matching your criteria.</p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        index={index} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Products;
