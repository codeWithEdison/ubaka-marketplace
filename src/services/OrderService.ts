
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/lib/data';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderCreationData {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethodId: string;
  couponCode?: string;
  notes?: string;
}

export const createOrder = async (orderData: OrderCreationData) => {
  // Calculate order total
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );
  
  // Apply coupon discount if provided
  let discount = 0;
  let couponId = null;
  
  if (orderData.couponCode) {
    const { coupon, discountAmount } = await validateCoupon(
      orderData.couponCode, 
      subtotal, 
      orderData.items
    );
    
    if (coupon) {
      discount = discountAmount;
      couponId = coupon.id;
    }
  }
  
  const total = subtotal - discount;
  
  // Create the order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      shipping_address: orderData.shippingAddress,
      total,
      payment_intent_id: orderData.paymentMethodId,
      notes: orderData.notes,
      status: 'pending',
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price
  }));
  
  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
    
  if (orderItemsError) throw new Error(orderItemsError.message);
  
  // Record coupon usage if applicable
  if (couponId) {
    await supabase
      .from('coupon_uses')
      .insert({
        coupon_id: couponId,
        order_id: order.id,
        discount_amount: discount
      });
      
    // Increment coupon usage count
    await supabase
      .from('coupons')
      .update({ current_uses: 1 }) // Use raw SQL for increment
      .eq('id', couponId);
  }
  
  // Clear the cart
  await clearCart();
  
  // Create notification for order
  await supabase
    .from('notifications')
    .insert({
      type: 'order_status',
      title: 'Order Placed',
      message: `Your order #${order.id.substring(0, 8)} has been placed successfully.`,
      data: { order_id: order.id }
    });
  
  return order;
};

export const fetchOrders = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_items (
        id,
        quantity,
        price,
        product:product_id (id, name, image_url)
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw new Error(error.message);
  
  return {
    orders: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const fetchOrderById = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_items (
        id,
        quantity,
        price,
        product:product_id (
          id, name, description, image_url, price
        )
      ),
      coupon_uses:coupon_uses (
        id,
        discount_amount,
        coupon:coupon_id (code, type)
      )
    `)
    .eq('id', orderId)
    .single();
    
  if (error) throw new Error(error.message);
  
  return data;
};

export const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
  const updateData: any = { status };
  
  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  // Create notification for status change
  await supabase
    .from('notifications')
    .insert({
      type: 'order_status',
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order #${orderId.substring(0, 8)} has been updated to ${status}.`,
      data: { order_id: orderId }
    });
  
  return data;
};

// Helper function to validate coupon
const validateCoupon = async (code: string, subtotal: number, items: CartItem[]) => {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select()
    .eq('code', code)
    .eq('is_active', true)
    .lte('valid_from', new Date().toISOString())
    .or(`valid_to.is.null,valid_to.gt.${new Date().toISOString()}`)
    .maybeSingle();
    
  if (error || !coupon) {
    return { coupon: null, discountAmount: 0 };
  }
  
  // Check minimum purchase amount
  if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
    return { coupon: null, discountAmount: 0 };
  }
  
  // Check if maximum uses has been reached
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return { coupon: null, discountAmount: 0 };
  }
  
  // Calculate discount
  let discountAmount = 0;
  
  switch (coupon.type) {
    case 'percentage':
      discountAmount = (subtotal * coupon.discount_value) / 100;
      break;
    case 'fixed_amount':
      discountAmount = coupon.discount_value;
      break;
    case 'free_shipping':
      // Assume shipping cost is a fixed value
      discountAmount = 10; // Example shipping cost
      break;
  }
  
  // Apply maximum discount if set
  if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
    discountAmount = coupon.max_discount_amount;
  }
  
  return { coupon, discountAmount };
};

// Helper function imported from CartService
const clearCart = async () => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .is('user_id', supabase.auth.getUser().data.user?.id);
    
  if (error) throw new Error(error.message);
  return true;
};
