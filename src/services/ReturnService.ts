
import { supabase } from '@/integrations/supabase/client';

// Update this to match what's in the database schema
export type ReturnReason = 'damaged' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';

export interface ReturnRequestInput {
  orderId: string;
  productId: string;
  quantity: number;
  reason: ReturnReason;
  description?: string;
}

export const createReturnRequest = async (returnData: ReturnRequestInput) => {
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to create return request');
  }

  // Validate the return (check order status, return window, etc.)
  const { data: order } = await supabase
    .from('orders')
    .select('status, created_at')
    .eq('id', returnData.orderId)
    .single();
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.status !== 'delivered') {
    throw new Error('Only delivered orders can be returned');
  }
  
  // Check if within return window (30 days)
  const orderDate = new Date(order.created_at);
  const today = new Date();
  const daysDifference = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference > 30) {
    throw new Error('Return period has expired (30 days)');
  }
  
  // Create return request
  const { data, error } = await supabase
    .from('return_requests')
    .insert({
      order_id: returnData.orderId,
      product_id: returnData.productId,
      quantity: returnData.quantity,
      reason: returnData.reason,
      description: returnData.description,
      status: 'pending',
      user_id: user.id
    })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  // Create notification for return request
  await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type: 'return_status',
      title: 'Return Request Submitted',
      message: `Your return request for order #${returnData.orderId.substring(0, 8)} has been submitted and is pending review.`,
      data: { 
        return_id: data.id,
        order_id: returnData.orderId
      }
    });
  
  return data;
};

export const fetchUserReturns = async (page = 1, limit = 10) => {
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to view returns');
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('return_requests')
    .select(`
      *,
      order:order_id (id, created_at),
      product:product_id (id, name, image_url, price)
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw new Error(error.message);
  
  return {
    returns: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const fetchReturnById = async (returnId: string) => {
  const { data, error } = await supabase
    .from('return_requests')
    .select(`
      *,
      order:order_id (*),
      product:product_id (*)
    `)
    .eq('id', returnId)
    .single();
    
  if (error) throw new Error(error.message);
  
  return data;
};

export const updateReturnStatus = async (returnId: string, status: string, adminNotes?: string, refundAmount?: number) => {
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to update return status');
  }

  const updateData: any = { status };
  
  if (adminNotes) {
    updateData.admin_notes = adminNotes;
  }
  
  if (refundAmount) {
    updateData.refund_amount = refundAmount;
  }
  
  const { data, error } = await supabase
    .from('return_requests')
    .update(updateData)
    .eq('id', returnId)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  // Get the return request to get the user_id
  const { data: returnRequest } = await supabase
    .from('return_requests')
    .select('user_id')
    .eq('id', returnId)
    .single();

  if (!returnRequest) throw new Error('Return request not found');
  
  // Create notification for status change
  await supabase
    .from('notifications')
    .insert({
      user_id: returnRequest.user_id,
      type: 'return_status',
      title: `Return ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your return request #${returnId.substring(0, 8)} has been ${status}.`,
      data: { return_id: returnId }
    });
  
  return data;
};
