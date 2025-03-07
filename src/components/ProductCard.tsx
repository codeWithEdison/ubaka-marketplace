
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Product } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsAddingToCart(false);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }, 600);
  };
  
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };
  
  // Calculate animation delay based on index
  const animationDelay = `${index * 0.05}s`;

  return (
    <Link 
      to={`/products/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay }}
    >
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-ubaka-900 shadow-subtle hover:shadow-glass transition-all duration-300 h-full flex flex-col animate-fadeIn">
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.new && (
              <span className="px-2 py-1 bg-primary text-xs font-medium text-primary-foreground rounded-md">
                New
              </span>
            )}
            {product.discount && (
              <span className="px-2 py-1 bg-destructive text-xs font-medium text-destructive-foreground rounded-md">
                -{product.discount}%
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div 
            className={`absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
            }`}
          >
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
              onClick={handleWishlist}
            >
              <Heart 
                className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} 
              />
            </Button>
          </div>
        </div>
        
        {/* Product details */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">{product.category}</span>
          </div>
          
          <h3 className="font-medium text-lg group-hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating) 
                    ? 'text-primary fill-primary' 
                    : 'text-muted-foreground'
                }`} 
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
          </div>
          
          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col">
              {product.discount ? (
                <>
                  <span className="text-lg font-semibold">
                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
              )}
            </div>
            
            <Button
              size="sm"
              className="rounded-full h-9 transition-all duration-300 ease-in-out"
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.inStock}
            >
              {isAddingToCart ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-1" />
              )}
              {!product.inStock ? 'Out of stock' : isAddingToCart ? 'Added' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
