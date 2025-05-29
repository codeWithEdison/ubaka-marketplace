import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Product } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  // Calculate the animation delay based on index
  const animDelay = `${index * 0.1}s`;

  // Format price with discount
  const formatPrice = (price: number, discount?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
    }).format(price - (price * ((discount || 0) / 100)));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent navigation to product detail
    addItem(product, 1);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: animDelay }}
    >
      <div className="bg-white dark:bg-ubaka-900/20 rounded-xl overflow-hidden shadow-subtle transition-all duration-300 hover:shadow-md relative h-full flex flex-col">
        {/* Discount tag */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {product.discount}% OFF
          </div>
        )}

        {/* New tag */}
        {product.new && (
          <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            NEW
          </div>
        )}

        {/* Product Image */}
        <div className={`relative pt-[75%] overflow-hidden bg-gray-100 dark:bg-ubaka-950/20`}>
          <img
            src={product.image || 'https://via.placeholder.com/400x300?text=Product+Image'}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />

          {/* Quick add button */}
          <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} flex justify-center`}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              {typeof product.category === 'string' ? product.category :
                (product.category && typeof product.category === 'object' ? product.category.name : 'Uncategorized')}
            </div>

            <h3 className="font-medium text-lg mb-1 line-clamp-2">{product.name}</h3>

            <div className="flex items-center mb-2">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.floor(product.rating || 0)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.rating || 0})
              </span>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <div className="text-lg font-semibold">
                {formatPrice(product.price, product.discount)}
              </div>

              {product.discount && product.discount > 0 && (
                <div className="text-sm text-muted-foreground line-through ml-2">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>

            <div className="text-sm mt-2 text-muted-foreground">
              {!product.inStock ? (
                <span className="text-red-500">Out of Stock</span>
              ) : (
                <span className="text-green-500">In Stock</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
