
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content?: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount?: number;
  notHelpfulCount?: number;
}

// Fetch reviews for a specific product
export const fetchReviewsForProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user_id (
        id,
        first_name,
        last_name,
        avatar_url
      ),
      helpful_votes:review_votes(id, is_helpful)
    `)
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Format the response to match our Review type
  const reviews: Review[] = data.map(review => {
    const helpfulVotes = review.helpful_votes?.filter((vote: any) => vote.is_helpful) || [];
    const notHelpfulVotes = review.helpful_votes?.filter((vote: any) => !vote.is_helpful) || [];
    
    // Safely access the nested user data
    const userData = review.user_id || {};
    const userId = typeof userData === 'object' ? userData.id : review.user_id;
    const firstName = typeof userData === 'object' ? userData.first_name || '' : '';
    const lastName = typeof userData === 'object' ? userData.last_name || '' : '';
    const avatarUrl = typeof userData === 'object' ? userData.avatar_url : null;
    
    return {
      id: review.id,
      productId: review.product_id,
      userId: userId,
      userName: `${firstName} ${lastName}`.trim() || 'Anonymous',
      userAvatar: avatarUrl || '',
      rating: review.rating,
      title: review.title || '',
      content: review.content || '',
      createdAt: review.created_at,
      isVerifiedPurchase: review.is_verified_purchase || false,
      isApproved: review.is_approved,
      helpfulCount: helpfulVotes.length,
      notHelpfulCount: notHelpfulVotes.length
    };
  });
  
  return reviews;
};

// Add a new review
export const addReview = async (productId: string, rating: number, title: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to submit a review');
  }
  
  // Check if user has purchased the product
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      id,
      orders!inner(id, status, user_id)
    `)
    .eq('product_id', productId)
    .eq('orders.user_id', user.id)
    .eq('orders.status', 'delivered');
    
  const isVerifiedPurchase = orderItems && orderItems.length > 0;
  
  // Check if user already reviewed this product
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id);
    
  if (existingReviews && existingReviews.length > 0) {
    throw new Error('You have already reviewed this product');
  }
  
  // Insert the review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title,
      content,
      is_verified_purchase: isVerifiedPurchase,
      is_approved: true // Auto-approve for now
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  // Recalculate product rating
  await updateProductRating(productId);
  
  return data;
};

// Mark review as helpful or not helpful
export const voteReview = async (reviewId: string, isHelpful: boolean) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to vote on a review');
  }
  
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('review_votes')
    .select()
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .maybeSingle();
    
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
        user_id: user.id,
        is_helpful: isHelpful 
      });
      
    if (error) throw new Error(error.message);
  }
  
  return true;
};

// Update product rating based on reviews
export const updateProductRating = async (productId: string) => {
  const { data, error } = await supabase
    .rpc('calculate_product_rating', { product_id: productId });
    
  if (error) {
    console.error('Error calculating product rating:', error);
  }
  
  return data;
};
