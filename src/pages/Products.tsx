
import { useState } from 'react';
import { products, Product } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Filter, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'newest'>('featured');
  
  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'newest':
        return a.new ? -1 : b.new ? 1 : 0;
      case 'featured':
      default:
        return a.featured ? -1 : b.featured ? 1 : 0;
    }
  });

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
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Products */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-muted-foreground">
                    Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
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
                
                {sortedProducts.length === 0 ? (
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
                    {sortedProducts.map((product, index) => (
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
