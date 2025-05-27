import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { CartItem } from '@/lib/data.ts';
import { OrderStatus } from '@/types/database';
import { Order, DbOrder, RawOrder } from '@/lib/utils';
import { Json } from '@/integrations/supabase/types';

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

interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
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
export const fetchOrderById = async (orderId: string): Promise<Order> => {
  const { data, error } = await supabase
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
      user:user_id (
        id,
        first_name,
        last_name,
        email
      ),
      payment:payment_intent_id (
        id,
        payment_method,
        status
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Order;
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
  const updateData: Partial<DbOrder> = {
    status,
    updated_at: new Date().toISOString()
  };

  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create notification for the user
  const { data: order } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .single();

  if (order) {
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

    await supabase
      .from('notifications')
      .insert({
        user_id: order.user_id,
        type: 'order_status',
        title: 'Order Status Updated',
        message: notificationMessage,
        data: { order_id: orderId }
      });
  }

  return data as Order;
};

// Cancel an order - can be done by the user or an admin
export const cancelOrder = async (orderId: string) => {
  return updateOrderStatus(orderId, OrderStatus.CANCELLED);
};

// Fetch all orders (admin only)
export const fetchAllOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total,
        shipping_address,
        payment_method,
        status,
        payment_intent_id,
        tracking_number,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error(error.message);
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format received:', data);
      return [];
    }

    return data.map(order => {
      try {
        // Extract user info from shipping address
        const shippingAddress = order.shipping_address as {
          fullName: string;
          email?: string;
          phone: string;
          addressLine1: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
        };

        // Split fullName into first and last name
        const nameParts = shippingAddress.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
          id: order.id,
          user_id: order.user_id,
          total: order.total,
          total_amount: order.total,
          status: order.status,
          shipping_address: order.shipping_address,
          tracking_number: order.tracking_number,
          payment_intent_id: order.payment_intent_id,
          payment_method: order.payment_method,
          notes: null,
          estimated_delivery: null,
          created_at: order.created_at,
          updated_at: order.updated_at,
          order_items: order.order_items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            products: {
              id: item.products[0].id,
              name: item.products[0].name
            }
          })),
          user: {
            id: order.user_id,
            email: shippingAddress.email || '',
            first_name: firstName,
            last_name: lastName
          },
          payment: order.payment_intent_id ? {
            id: order.payment_intent_id,
            payment_method: order.payment_method || '',
            status: order.status
          } : null
        };
      } catch (err) {
        console.error('Error processing order:', order.id, err);
        // Return a minimal valid order object to prevent complete failure
        return {
          id: order.id,
          user_id: order.user_id,
          total: order.total,
          total_amount: order.total,
          status: order.status,
          shipping_address: order.shipping_address,
          tracking_number: order.tracking_number,
          payment_intent_id: order.payment_intent_id,
          payment_method: order.payment_method,
          notes: null,
          estimated_delivery: null,
          created_at: order.created_at,
          updated_at: order.updated_at,
          order_items: [],
          user: {
            id: order.user_id,
            email: '',
            first_name: '',
            last_name: ''
          },
          payment: null
        };
      }
    });
  } catch (err) {
    console.error('Error in fetchAllOrders:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to fetch orders');
  }
};
