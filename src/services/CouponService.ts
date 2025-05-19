
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/lib/data';

export interface CouponValidation {
  valid: boolean;
  code?: string;
  discountAmount?: number;
  message?: string;
}

export const validateCoupon = async (code: string, subtotal: number, items: CartItem[]): Promise<CouponValidation> => {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select()
    .eq('code', code)
    .eq('is_active', true)
    .lte('valid_from', new Date().toISOString())
    .or(`valid_to.is.null,valid_to.gt.${new Date().toISOString()}`)
    .maybeSingle();
    
  if (error || !coupon) {
    return { valid: false, message: 'Invalid or expired coupon code' };
  }
  
  // Check minimum purchase amount
  if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
    return { 
      valid: false, 
      message: `This coupon requires a minimum purchase of $${coupon.min_purchase_amount}` 
    };
  }
  
  // Check if maximum uses has been reached
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, message: 'This coupon has reached its usage limit' };
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
  
  return { 
    valid: true, 
    code: coupon.code,
    discountAmount,
    message: discountAmount > 0 ? 
      `Coupon applied! You saved $${discountAmount.toFixed(2)}` : 
      'Coupon applied'
  };
};

export const fetchCoupons = async (page = 1, limit = 20, includeInactive = false) => {
  let query = supabase
    .from('coupons')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await query.range(from, to);
    
  if (error) throw new Error(error.message);
  
  return {
    coupons: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const createCoupon = async (couponData: any) => {
  const { data, error } = await supabase
    .from('coupons')
    .insert(couponData)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  return data;
};

export const updateCoupon = async (couponId: string, couponData: any) => {
  const { data, error } = await supabase
    .from('coupons')
    .update(couponData)
    .eq('id', couponId)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  return data;
};

export const deleteCoupon = async (couponId: string) => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId);
    
  if (error) throw new Error(error.message);
  
  return true;
};
