
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const [couponCode, setCouponCode] = useState('');
  
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would validate the coupon code here
    alert(`Coupon ${couponCode} applied!`);
  };
  
  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 0 ? 4.99 : 0;
  const orderTotal = totalPrice + shipping;

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>
          
          {items.length === 0 ? (
            <div className="bg-background rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
              <Link to="/products">
                <Button>
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Cart Items ({items.length})</h2>
                    
                    <div className="space-y-6">
                      {items.map((item) => {
                        const { product, quantity } = item;
                        const price = product.discount
                          ? product.price * (1 - product.discount / 100)
                          : product.price;
                        const itemTotal = price * quantity;
                        
                        return (
                          <div key={product.id} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-shrink-0 w-full sm:w-24 h-24">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://placehold.co/600x600/EEE/31343C?text=Image+Not+Available";
                                }}
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <div>
                                  <h3 className="font-medium">
                                    <Link to={`/products/${product.id}`} className="hover:text-primary">
                                      {product.name}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{product.category}</p>
                                </div>
                                
                                <div className="mt-2 sm:mt-0 text-right">
                                  <span className="font-medium">{formatCurrency(itemTotal)}</span>
                                  
                                  {product.discount && (
                                    <div className="text-sm text-muted-foreground line-through">
                                      {formatCurrency(product.price * quantity)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center border rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-r-none"
                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  
                                  <span className="w-10 text-center">{quantity}</span>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-l-none"
                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeFromCart(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{shipping > 0 ? formatCurrency(shipping) : 'Free'}</span>
                      </div>
                      
                      <form onSubmit={handleCouponSubmit} className="flex gap-2">
                        <Input
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" variant="outline" disabled={!couponCode}>
                          Apply
                        </Button>
                      </form>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(orderTotal)}</span>
                      </div>
                      
                      <Link to="/checkout" className="block w-full">
                        <Button className="w-full">
                          Proceed to Checkout
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link to="/products" className="block w-full">
                        <Button variant="outline" className="w-full">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Cart;
