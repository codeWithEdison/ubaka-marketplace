
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface ReviewInput {
  productId: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase?: boolean;
}

export interface ReviewVote {
  reviewId: string;
  isHelpful: boolean;
}

export const fetchReviewsForProduct = async (
  productId: string,
  { page = 1, limit = 10, sortBy = 'latest' } = {}
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from('reviews')
    .select(`
      *,
      user:user_id (id, first_name, last_name, avatar_url),
      votes:review_votes (is_helpful)
    `, { count: 'exact' })
    .eq('product_id', productId)
    .eq('is_approved', true);
  
  // Apply sorting
  switch (sortBy) {
    case 'highest_rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest_rating':
      query = query.order('rating', { ascending: true });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }
  
  // Apply pagination
  query = query.range(from, to);
  
  const { data, error, count } = await query;
  
  if (error) throw new Error(error.message);
  
  // Transform the data to include helpful/not helpful counts
  const reviews = data?.map(review => {
    const helpfulVotes = review.votes?.filter((vote: any) => vote.is_helpful)?.length || 0;
    const notHelpfulVotes = review.votes?.filter((vote: any) => !vote.is_helpful)?.length || 0;
    
    return {
      ...review,
      helpfulCount: helpfulVotes,
      notHelpfulCount: notHelpfulVotes,
      // Format the user data
      user: review.user ? {
        id: review.user.id,
        name: `${review.user.first_name || ''} ${review.user.last_name || ''}`.trim(),
        avatar: review.user.avatar_url
      } : null
    };
  }) || [];
  
  return {
    reviews,
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const submitReview = async (reviewInput: ReviewInput) => {
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to submit a review');
  }
  
  // Check if user has already reviewed this product
  const { data: existingReview } = await supabase
    .from('reviews')
    .select()
    .eq('user_id', user.id)
    .eq('product_id', reviewInput.productId)
    .maybeSingle();
  
  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }
  
  // Submit the review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: reviewInput.productId,
      user_id: user.id,
      rating: reviewInput.rating,
      title: reviewInput.title || null,
      content: reviewInput.content,
      is_verified_purchase: reviewInput.isVerifiedPurchase || false,
      is_approved: true // Auto-approve for now, can be changed for moderation
    })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  // Update the product rating average
  await updateProductRating(reviewInput.productId);
  
  return data;
};

export const voteOnReview = async (vote: ReviewVote) => {
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to vote on reviews');
  }
  
  // Check if user has already voted on this review
  const { data: existingVote } = await supabase
    .from('review_votes')
    .select()
    .eq('user_id', user.id)
    .eq('review_id', vote.reviewId)
    .maybeSingle();
  
  if (existingVote) {
    // Update existing vote
    await supabase
      .from('review_votes')
      .update({
        is_helpful: vote.isHelpful
      })
      .eq('id', existingVote.id);
  } else {
    // Create new vote
    await supabase
      .from('review_votes')
      .insert({
        review_id: vote.reviewId,
        user_id: user.id,
        is_helpful: vote.isHelpful
      });
  }
  
  return { success: true };
};

// Helper function to update product rating
async function updateProductRating(productId: string) {
  const { data, error } = await supabase
    .rpc('calculate_product_rating', { product_id_param: productId });
  
  if (error) {
    console.error('Error updating product rating:', error);
  }
  
  return data;
}
