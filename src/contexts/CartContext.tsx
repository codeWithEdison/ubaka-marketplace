
import React, { createContext, useState, useEffect, useContext } from 'react';
import { CartItem, Product } from '@/lib/data';
import { useAuth } from './AuthContext';
import { fetchCart, addToCart, updateCartItemQuantity, removeFromCart, syncCartWithServer } from '@/services/CartService';
import { toast } from '@/components/ui/use-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  
  // Load cart from localStorage or Supabase based on authentication status
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        
        if (user) {
          // User is authenticated, load cart from Supabase
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
          
          if (localCart.length > 0) {
            // Sync local cart with server cart when user logs in
            const serverCart = await syncCartWithServer(localCart);
            setItems(serverCart);
            // Clear local cart after sync
            localStorage.setItem('cart', JSON.stringify([]));
          } else {
            // Just fetch server cart
            const serverCart = await fetchCart();
            setItems(serverCart);
          }
        } else {
          // User is not authenticated, load cart from localStorage
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
          setItems(localCart);
        }
      } catch (error: any) {
        toast({
          title: "Error loading cart",
          description: error.message || "Could not load your cart",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) {
      loadCart();
    }
  }, [user, authLoading]);
  
  const addItem = async (product: Product, quantity = 1) => {
    try {
      if (user) {
        // User is authenticated, add item to Supabase
        await addToCart(product.id, quantity);
        // Refresh cart
        const updatedCart = await fetchCart();
        setItems(updatedCart);
      } else {
        // User is not authenticated, add item to localStorage
        const existingItem = items.find(item => item.product.id === product.id);
        
        if (existingItem) {
          const updatedItems = items.map(item => 
            item.product.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          setItems(updatedItems);
          localStorage.setItem('cart', JSON.stringify(updatedItems));
        } else {
          const updatedItems = [...items, { product, quantity }];
          setItems(updatedItems);
          localStorage.setItem('cart', JSON.stringify(updatedItems));
        }
      }
      
      toast({
        title: "Added to cart",
        description: `${product.name} (x${quantity}) added to your cart`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding item",
        description: error.message || "Could not add item to cart",
        variant: "destructive"
      });
    }
  };
  
  const removeItem = async (productId: string) => {
    try {
      if (user) {
        // User is authenticated, remove item from Supabase
        await removeFromCart(productId);
        // Refresh cart
        const updatedCart = await fetchCart();
        setItems(updatedCart);
      } else {
        // User is not authenticated, remove item from localStorage
        const updatedItems = items.filter(item => item.product.id !== productId);
        setItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
      
      toast({
        title: "Removed from cart",
        description: "Item removed from your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error removing item",
        description: error.message || "Could not remove item from cart",
        variant: "destructive"
      });
    }
  };
  
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }
      
      if (user) {
        // User is authenticated, update item in Supabase
        await updateCartItemQuantity(productId, quantity);
        // Refresh cart
        const updatedCart = await fetchCart();
        setItems(updatedCart);
      } else {
        // User is not authenticated, update item in localStorage
        const updatedItems = items.map(item => 
          item.product.id === productId 
            ? { ...item, quantity }
            : item
        );
        setItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error: any) {
      toast({
        title: "Error updating quantity",
        description: error.message || "Could not update item quantity",
        variant: "destructive"
      });
    }
  };
  
  const clearCart = async () => {
    try {
      if (user) {
        // User is authenticated, clear cart in Supabase
        await removeFromCart('all');
        setItems([]);
      } else {
        // User is not authenticated, clear cart in localStorage
        setItems([]);
        localStorage.setItem('cart', JSON.stringify([]));
      }
    } catch (error: any) {
      toast({
        title: "Error clearing cart",
        description: error.message || "Could not clear your cart",
        variant: "destructive"
      });
    }
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart,
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
