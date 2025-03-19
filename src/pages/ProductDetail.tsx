import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, Clock, Check, Info, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewList from '@/components/product/ReviewList';
import AddReviewForm from '@/components/product/AddReviewForm';
import { useCart } from '@/contexts/CartContext';
import { getProductById, Product } from '@/lib/data';
import { formatCurrency, getFallbackImageUrl } from '@/lib/utils';
import { getReviewsForProduct } from '@/lib/reviewUtils';
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isImageError, setIsImageError] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  const product = getProductById(productId || '');

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
              <p className="mb-6 text-muted-foreground">The product you're looking for doesn't exist.</p>
              <Link to="/products">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const handleImageError = () => {
    setIsImageError(true);
  };

  const imageUrl = isImageError 
    ? getFallbackImageUrl() 
    : product!.image;

  const discountedPrice = product!.discount
    ? product!.price * (1 - product!.discount / 100)
    : product!.price;

  const reviewCount = getReviewsForProduct(productId || '').length;

  const handleReviewAdded = () => {
    setShowAddReview(false);
    setReviewsKey(prev => prev + 1);
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-card rounded-xl overflow-hidden">
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover aspect-square"
                onError={handleImageError}
              />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={product.inStock ? "default" : "outline"} className="mb-2">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.new && (
                    <Badge variant="secondary" className="mb-2">New</Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {product.rating.toFixed(1)} ({Math.floor(product.rating * 10)} reviews)
                  </span>
                </div>
                
                <p className="text-muted-foreground mt-4">{product.category}</p>
              </div>
              
              <div>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold">
                    {formatCurrency(discountedPrice)}
                  </span>
                  
                  {product.discount && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  
                  {product.discount && (
                    <Badge variant="destructive" className="ml-2">
                      {product.discount}% OFF
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground">{product.description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decreaseQuantity}
                      className="h-10 w-10 rounded-r-none"
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={increaseQuantity}
                      className="h-10 w-10 rounded-l-none"
                    >
                      +
                    </Button>
                  </div>
                  
                  <Button 
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Free shipping on orders over 50,000 RWF</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Usually ships within 2-3 business days</span>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="details" className="mt-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviewCount})
              </TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-6 bg-card rounded-xl mt-4">
              <h3 className="text-lg font-semibold mb-3">Product Details</h3>
              <p className="text-muted-foreground">{product.description}</p>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Premium quality materials</li>
                  <li>Engineered for durability</li>
                  <li>Professional-grade performance</li>
                  <li>Industry-standard certifications</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6 bg-card rounded-xl mt-4">
              <h3 className="text-lg font-semibold mb-3">Technical Specifications</h3>
              
              {product.specifications ? (
                <div className="divide-y">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 py-3">
                      <span className="font-medium">{key}</span>
                      <span className="col-span-2 text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specifications available for this product.</p>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6 bg-card rounded-xl mt-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                
                {!showAddReview && (
                  <Button onClick={() => setShowAddReview(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Write a Review
                  </Button>
                )}
              </div>
              
              {showAddReview ? (
                <div className="mb-8 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-4">Write Your Review</h4>
                  <AddReviewForm 
                    productId={productId || ''} 
                    onReviewAdded={handleReviewAdded} 
                  />
                  <div className="mt-4 text-right">
                    <Button variant="ghost" onClick={() => setShowAddReview(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
              
              <ReviewList key={reviewsKey} productId={productId || ''} />
            </TabsContent>
            
            <TabsContent value="shipping" className="p-6 bg-card rounded-xl mt-4">
              <h3 className="text-lg font-semibold mb-3">Shipping & Returns Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Delivery:</h4>
                  <p className="text-muted-foreground">Orders are typically processed and shipped within 2-3 business days.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Free Shipping:</h4>
                  <p className="text-muted-foreground">Free shipping is available on all orders over 50,000 RWF.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Returns:</h4>
                  <p className="text-muted-foreground">Products can be returned within 30 days of delivery for a full refund or exchange. Visit your account page to initiate a return.</p>
                  <ul className="list-disc list-inside mt-2 text-muted-foreground text-sm">
                    <li>Items must be in original condition</li>
                    <li>Include original packaging and accessories</li>
                    <li>Provide proof of purchase</li>
                    <li>Return shipping fees may apply</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ProductDetail;
