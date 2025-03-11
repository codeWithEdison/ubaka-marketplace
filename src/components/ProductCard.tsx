
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isImageError, setIsImageError] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };
  
  const handleImageError = () => {
    setIsImageError(true);
  };
  
  const imageUrl = isImageError 
    ? "https://placehold.co/600x600/EEE/31343C?text=Image+Not+Available" 
    : product.image;
  
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;
  
  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      }
    })
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={variants}
      whileHover={{ y: -5 }}
    >
      <Link to={`/products/${product.id}`} className="block h-full">
        <div className="group bg-card rounded-xl overflow-hidden border border-border h-full flex flex-col">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={handleImageError}
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {!product.inStock && (
                <Badge variant="outline" className="bg-background/80">Out of Stock</Badge>
              )}
              {product.new && (
                <Badge variant="secondary">New</Badge>
              )}
              {product.discount && (
                <Badge variant="destructive">{product.discount}% OFF</Badge>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex-1">
              <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
              
              <div className="flex items-center mt-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  ({Math.floor(product.rating * 10)})
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{formatCurrency(discountedPrice)}</div>
                  {product.discount && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatCurrency(product.price)}
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full h-8 w-8 p-0"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Add to cart</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
