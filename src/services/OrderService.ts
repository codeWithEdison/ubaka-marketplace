import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { CartItem } from '@/lib/data.ts';
import { Order as DatabaseOrder, OrderStatus } from '@/types/database';

export interface Order {
  id: string;
  user_id: string;
  total: number;
  total_amount: number;
  status: OrderStatus;
  shipping_address: string;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
    };
  }[];
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  payment: {
    id: string;
    payment_method: string;
    status: string;
  };
}

// Define ShippingAddress interface if it's not already defined in data.ts
export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

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

// Create a new order from cart items and return the created order
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
      console.error('Coupon validation error:', couponError);
      throw handleSupabaseError(couponError);
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

  try {
    console.log('Creating order with data:', {
      user_id: user.id,
      total: finalTotal,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status: 'pending'
    });

    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: finalTotal,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw handleSupabaseError(orderError);
    }

    if (!order) {
      throw new Error('Failed to create order - no order data returned');
    }

    console.log('Order created successfully:', order);

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price - (item.product.price * (item.product.discount || 0) / 100)
    }));

    console.log('Creating order items:', orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order creation if order items fail
      console.error('Error adding order items, attempting to delete order:', itemsError);
      await supabase.from('orders').delete().eq('id', order.id);
      throw handleSupabaseError(itemsError);
    }

    console.log('Order items created successfully');

    return order;
  } catch (error) {
    console.error('Error in createOrder:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while creating the order');
  }
};

// Finalize order payment after successful transaction
export const finalizeOrderPayment = async (orderId: string, paymentMethod: string, transactionId?: string, transactionHash?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to finalize order');
  }

  // Note: Server-side payment verification is CRUCIAL here in a real app.
  // You would call Flutterwave's API or check the blockchain here.
  // For this example, we'll assume verification passed and update the order status.

  const updateData: any = {
    status: 'processing' as OrderStatus, // Update status to processing
    payment_method: paymentMethod,
    updated_at: new Date().toISOString(),
  };

  if (transactionId) {
    updateData.payment_intent_id = transactionId; // Store Flutterwave transaction ID
  }

  if (transactionHash) {
    // You might need a separate field for crypto hash or use payment_intent_id
    updateData.payment_intent_id = transactionHash; // Storing crypto hash in payment_intent_id for simplicity
  }

  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .eq('user_id', user.id) // Ensure only the order owner can finalize
    .select()
    .single();

  if (error) {
    throw new Error(`Error finalizing order payment: ${error.message}`);
  }

  // Create notification for successful payment
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type: 'order_status',
      title: 'Payment Successful',
      message: `Payment for order #${orderId.substring(0, 8)} received successfully.`, // Message updated
      data: { order_id: orderId }
    });

  if (notificationError) {
    console.error('Error creating payment success notification:', notificationError);
  }

  // Clear the cart after successful payment finalization
  const { error: cartError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (cartError) {
    console.error('Error clearing cart after order finalization:', cartError);
  }

  return updatedOrder; // Return the updated order object
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
  return updateOrderStatus(orderId, OrderStatus.CANCELLED);
};

// Fetch all orders (admin only)
export const fetchAllOrders = async (): Promise<Order[]> => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price,
        products (
          id,
          name
        )
      ),
      user (
        id,
        first_name,
        last_name,
        email
      ),
      payment (
        id,
        payment_method,
        status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (orders.map(order => ({
    ...order,
    total_amount: order.total,
    status: order.status as OrderStatus,
    shipping_address: JSON.stringify(order.shipping_address)
  })) as unknown) as Order[];
};
