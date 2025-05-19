
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/lib/data';

// Sync local cart with server cart when user logs in
export const syncCartWithServer = async (localCart: CartItem[]) => {
  if (!localCart.length) return [];
  
  // Get the current server cart
  const { data: serverCart, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      products:product_id (*)
    `);
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Merge local and server carts
  const mergedCart: {product_id: string, quantity: number}[] = [];
  const serverCartMap = new Map();
  
  // Map server cart items
  serverCart?.forEach(item => {
    serverCartMap.set(item.product_id, item);
  });
  
  // Process local cart items
  for (const item of localCart) {
    const productId = item.product.id;
    const serverItem = serverCartMap.get(productId);
    
    if (serverItem) {
      // Update quantity if product exists in both carts
      await supabase
        .from('cart_items')
        .update({ quantity: serverItem.quantity + item.quantity })
        .eq('id', serverItem.id);
    } else {
      // Add new item to server cart
      mergedCart.push({
        product_id: productId,
        quantity: item.quantity
      });
    }
  }
  
  // Insert new items
  if (mergedCart.length > 0) {
    await supabase
      .from('cart_items')
      .insert(mergedCart);
  }
  
  // Return the updated cart
  return await fetchCart();
};

// Fetch cart items from server
export const fetchCart = async () => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      products:product_id (*)
    `);
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Format data to match CartItem type
  return data?.map(item => ({
    product: item.products as Product,
    quantity: item.quantity
  })) || [];
};

// Add item to cart
export const addToCart = async (productId: string, quantity: number = 1) => {
  // Check if the item already exists in the cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select()
    .eq('product_id', productId)
    .maybeSingle();
  
  if (existingItem) {
    // Update quantity if the item exists
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  } else {
    // Add new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ product_id: productId, quantity })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (productId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('product_id', productId)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

// Remove item from cart
export const removeFromCart = async (productId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('product_id', productId);
    
  if (error) throw new Error(error.message);
  return true;
};

// Clear the entire cart
export const clearCart = async () => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .is('user_id', supabase.auth.getUser().data.user?.id);
    
  if (error) throw new Error(error.message);
  return true;
};
