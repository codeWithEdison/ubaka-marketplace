
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Order, ShippingAddress } from '@/lib/data';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Fetch all orders for the current user
export const fetchOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to fetch orders');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_items(
        id,
        quantity,
        price,
        products:product_id(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
};

// Fetch a specific order by ID
export const fetchOrderById = async (orderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to fetch order');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_items(
        id,
        quantity,
        price,
        products:product_id(*)
      )
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .maybeSingle();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

// Create a new order from cart items
export const createOrder = async (cartItems: CartItem[], shippingAddress: ShippingAddress, paymentMethod: string, couponCode?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to create order');
  }
  
  // Calculate total price
  const total = cartItems.reduce((sum, item) => {
    const price = item.product.price;
    const discount = item.product.discount || 0;
    const discountedPrice = price - (price * discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);
  
  // Check for valid coupon if provided
  let couponDiscount = 0;
  let couponData = null;
  
  if (couponCode) {
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select()
      .eq('code', couponCode)
      .eq('is_active', true)
      .maybeSingle();
      
    if (couponError) {
      throw new Error('Error validating coupon');
    }
    
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }
    
    // Validate coupon
    const now = new Date();
    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      throw new Error('Coupon has expired');
    }
    
    if (total < coupon.min_purchase_amount) {
      throw new Error(`Order total must be at least $${coupon.min_purchase_amount} to use this coupon`);
    }
    
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      throw new Error('Coupon has reached maximum usage limit');
    }
    
    // Calculate discount
    if (coupon.type === 'percentage') {
      couponDiscount = (total * coupon.discount_value) / 100;
    } else if (coupon.type === 'fixed_amount') {
      couponDiscount = coupon.discount_value;
    }
    
    // Apply max discount if specified
    if (coupon.max_discount_amount && couponDiscount > coupon.max_discount_amount) {
      couponDiscount = coupon.max_discount_amount;
    }
    
    couponData = coupon;
  }
  
  // Final total after discount
  const finalTotal = total - couponDiscount;
  
  // Start a transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total: finalTotal,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status: 'pending'
    })
    .select()
    .single();
  
  if (orderError) {
    throw new Error(`Error creating order: ${orderError.message}`);
  }
  
  // Create order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price - (item.product.price * (item.product.discount || 0) / 100)
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
    
  if (itemsError) {
    throw new Error(`Error adding order items: ${itemsError.message}`);
  }
  
  // Add coupon use if applicable
  if (couponData) {
    const { error: couponUseError } = await supabase
      .from('coupon_uses')
      .insert({
        coupon_id: couponData.id,
        order_id: order.id,
        user_id: user.id,
        discount_amount: couponDiscount
      });
      
    if (couponUseError) {
      console.error('Error recording coupon use:', couponUseError);
    }
    
    // Update coupon current uses
    const { error: couponUpdateError } = await supabase
      .from('coupons')
      .update({ current_uses: couponData.current_uses + 1 })
      .eq('id', couponData.id);
      
    if (couponUpdateError) {
      console.error('Error updating coupon uses:', couponUpdateError);
    }
  }
  
  // Create notification for order
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type: 'order_status',
      title: 'Order Placed Successfully',
      message: `Your order #${order.id.substring(0, 8)} has been placed successfully`,
      data: { order_id: order.id }
    });
    
  if (notificationError) {
    console.error('Error creating notification:', notificationError);
  }
  
  // Clear the cart after successful order
  const { error: cartError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);
    
  if (cartError) {
    console.error('Error clearing cart:', cartError);
  }
  
  return order;
};

// Update an order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to update order');
  }
  
  // Check if user is admin (only admins should update order status)
  const { data: userRole } = await supabase
    .from('user_roles')
    .select()
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
  
  if (!userRole) {
    throw new Error('Admin privileges required to update order status');
  }
  
  // Fetch the current order to get the user_id
  const { data: order } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .single();
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Update the order status
  const updateData: any = { status };
  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }
  
  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);
    
  if (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }
  
  // Create notification for the user
  let notificationMessage = '';
  
  switch (status) {
    case 'processing':
      notificationMessage = 'Your order is now being processed';
      break;
    case 'shipped':
      notificationMessage = trackingNumber 
        ? `Your order has been shipped with tracking number ${trackingNumber}`
        : 'Your order has been shipped';
      break;
    case 'delivered':
      notificationMessage = 'Your order has been delivered';
      break;
    case 'cancelled':
      notificationMessage = 'Your order has been cancelled';
      break;
    default:
      notificationMessage = `Your order status has been updated to ${status}`;
  }
  
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: order.user_id,
      type: 'order_status',
      title: 'Order Status Updated',
      message: notificationMessage,
      data: { order_id: orderId }
    });
    
  if (notificationError) {
    console.error('Error creating notification:', notificationError);
  }
  
  return { success: true };
};

// Cancel an order - can be done by the user or an admin
export const cancelOrder = async (orderId: string) => {
  return updateOrderStatus(orderId, 'cancelled');
};
