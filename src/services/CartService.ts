import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/lib/utils';

// Fetch the user's cart from Supabase
export const fetchCart = async (): Promise<CartItem[]> => {
  // First get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to access cart');
  }
  
  // Fetch cart items with joined product data
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      products:product_id (*)
    `)
    .eq('user_id', user.id);
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Transform the data to match CartItem structure
  return (data || []).map(item => {
    // Convert the Supabase product data to our Product type
    const product = {
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      description: item.products.description || '',
      image: item.products.image_url || '',
      category: item.products.category_id || '', // Using string for category
      inStock: item.products.in_stock || true,
      featured: item.products.featured || false,
      discount: item.products.discount || 0,
      rating: 0, // We'll need to calculate this from reviews if needed
      new: item.products.is_new || false, // Changed from isNew to new to match Product interface
      specifications: item.products.specifications || {}
    } as Product;
    
    return {
      product,
      quantity: item.quantity
    } as CartItem;
  });
};

// Sync the local cart with the server cart
export const syncCartWithServer = async (localCart: CartItem[]): Promise<CartItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to sync cart');
  }
  
  // First, clear the server cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);
  
  // If there are no items in the local cart, just return an empty array
  if (localCart.length === 0) {
    return [];
  }
  
  // Add each item from the local cart to the server cart
  const cartItems = localCart.map(item => ({
    user_id: user.id,
    product_id: item.product.id,
    quantity: item.quantity
  }));
  
  // Insert all items into the cart
  const { error } = await supabase
    .from('cart_items')
    .insert(cartItems);
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Return the updated cart
  return fetchCart();
};

// Add an item to the user's cart
export const addToCart = async (productId: string, quantity: number = 1): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to add to cart');
  }
  
  // Check if the item is already in the cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select()
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();
  
  if (existingItem) {
    // Update the quantity
    await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id);
  } else {
    // Add the item to the cart
    await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity
      });
  }
};

// Update the quantity of an item in the cart
export const updateCartItemQuantity = async (productId: string, quantity: number): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to update cart');
  }
  
  await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', user.id)
    .eq('product_id', productId);
};

// Remove an item from the cart
export const removeFromCart = async (productId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to remove from cart');
  }
  
  // If productId is 'all', remove all items from the cart
  if (productId === 'all') {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);
  } else {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
  }
};
