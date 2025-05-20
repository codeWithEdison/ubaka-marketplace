
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewList from '@/components/product/ReviewList';
import AddReviewForm from '@/components/product/AddReviewForm';
import { useCart } from '@/contexts/CartContext';
import { fetchProductById } from '@/services/ProductService';
import { useApiQuery } from '@/hooks/useApi';
import { Product } from '@/lib/data';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const { data: product, isLoading } = useApiQuery<Product>(
    ['product', productId as string],
    () => fetchProductById(productId as string),
    { enabled: !!productId }
  );
  
  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [productId]);
  
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };
  
  // Format price with discount
  const formatPrice = (price: number, discount?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price - (price * ((discount || 0) / 100)));
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="w-full aspect-square rounded-lg" />
              
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/3" />
                <Separator />
                <Skeleton className="h-24 w-full" />
                <div className="flex space-x-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          ) : product ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="bg-gray-100 dark:bg-ubaka-950/20 rounded-lg overflow-hidden">
                  <img
                    src={product.image || 'https://via.placeholder.com/600x600?text=Product+Image'}
                    alt={product.name}
                    className="w-full object-cover"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
                
                {/* Product Info */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    {typeof product.category === 'object' && product.category ? (
                      <Link to={`/categories/${product.category.id || '#'}`}>
                        {product.category.name}
                      </Link>
                    ) : (
                      <span>{typeof product.category === 'string' ? product.category : 'Uncategorized'}</span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <div className="text-3xl font-bold">
                      {formatPrice(product.price, product.discount)}
                    </div>
                    
                    {product.discount && product.discount > 0 && (
                      <div className="ml-3 flex flex-col">
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-red-500 font-medium">
                          {product.discount}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="prose prose-stone dark:prose-invert">
                    <p>{product.description}</p>
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-r-none"
                        onClick={decrementQuantity}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-12 text-center">{quantity}</span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-l-none"
                        onClick={incrementQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center"
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-2">
                      Availability:
                      <span className={`ml-2 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Product Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                  <div className="bg-card rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Product Reviews */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                <ReviewList productId={product.id} />
                <div className="mt-8">
                  <AddReviewForm productId={product.id} onReviewAdded={() => {}} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold">Product not found</h2>
              <p className="mt-2 text-muted-foreground">
                Sorry, the product you're looking for doesn't exist or has been removed.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/products">Back to Products</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ProductDetail;
