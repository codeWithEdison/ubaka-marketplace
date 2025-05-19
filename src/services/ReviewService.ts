
import { supabase } from '@/integrations/supabase/client';

export interface ReviewInput {
  productId: string;
  rating: number;
  title?: string;
  content?: string;
}

export const fetchProductReviews = async (productId: string, page = 1, limit = 5) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      user:user_id (
        profiles:profiles (first_name, last_name, avatar_url)
      ),
      helpful_count:review_votes!is_helpful(count),
      not_helpful_count:review_votes!not.is_helpful(count)
    `, { count: 'exact' })
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw new Error(error.message);
  
  return {
    reviews: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const fetchUserReviews = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      product:product_id (id, name, image_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw new Error(error.message);
  
  return {
    reviews: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const createReview = async (reviewData: ReviewInput) => {
  // Check if user has already reviewed this product
  const { data: existingReview, error: checkError } = await supabase
    .from('reviews')
    .select()
    .eq('product_id', reviewData.productId)
    .maybeSingle();
    
  if (checkError) throw new Error(checkError.message);
  
  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }
  
  // Check if user has purchased the product
  const { data: hasPurchased } = await supabase
    .from('order_items')
    .select(`
      id,
      order:order_id (status)
    `)
    .eq('product_id', reviewData.productId)
    .eq('order.status', 'delivered')
    .maybeSingle();
  
  // Create the review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: reviewData.productId,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      is_verified_purchase: !!hasPurchased,
      is_approved: true // Auto-approve for now
    })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  return data;
};

export const updateReview = async (reviewId: string, reviewData: Partial<ReviewInput>) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  return data;
};

export const deleteReview = async (reviewId: string) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);
    
  if (error) throw new Error(error.message);
  
  return true;
};

export const voteReview = async (reviewId: string, isHelpful: boolean) => {
  // Check if user has already voted on this review
  const { data: existingVote, error: checkError } = await supabase
    .from('review_votes')
    .select()
    .eq('review_id', reviewId)
    .maybeSingle();
    
  if (checkError) throw new Error(checkError.message);
  
  if (existingVote) {
    // Update existing vote
    const { error } = await supabase
      .from('review_votes')
      .update({ is_helpful: isHelpful })
      .eq('id', existingVote.id);
      
    if (error) throw new Error(error.message);
  } else {
    // Create new vote
    const { error } = await supabase
      .from('review_votes')
      .insert({
        review_id: reviewId,
        is_helpful: isHelpful
      });
      
    if (error) throw new Error(error.message);
  }
  
  return true;
};
