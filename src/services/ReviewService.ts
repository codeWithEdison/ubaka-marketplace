import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  is_verified_purchase: boolean;
  created_at: string;
  user: {
    name: string;
    avatar: string | null;
  };
  helpful_count?: number;
  not_helpful_count?: number;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

// Fetch reviews for a specific product
export const fetchReviewsForProduct = async (productId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (first_name, last_name, avatar_url)
    `)
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // Transform the data
  return (data || []).map((review: any) => {
    const profile = review.profiles || {};

    return {
      ...review,
      user: {
        name: profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : 'Anonymous User',
        avatar: profile.avatar_url
      }
    };
  });
};

// Add a new review
export const createReview = async (reviewData: {
  product_id: string;
  rating: number;
  title?: string;
  content?: string;
}): Promise<Review> => {
  // First get the user ID
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('You must be logged in to submit a review.');
  }

  // Check if user has made a verified purchase
  const { data: orderData, error: orderError } = await supabase
    .from('order_items')
    .select('orders!inner(user_id)')
    .eq('product_id', reviewData.product_id)
    .eq('orders.user_id', userData.user.id)
    .limit(1);

  const isVerifiedPurchase = !orderError && orderData && orderData.length > 0;

  // Create the review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...reviewData,
      user_id: userData.user.id,
      is_verified_purchase: isVerifiedPurchase,
      is_approved: false // Reviews need approval by default
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (!data) throw new Error('Failed to create review');

  // Get user profile for the response
  const { data: profileData } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('id', userData.user.id)
    .single();

  const profile = (profileData || {}) as Profile;

  return {
    ...data,
    user: {
      name: profile.first_name && profile.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : 'Anonymous User',
      avatar: profile.avatar_url
    }
  };
};

// Mark review as helpful or not helpful
export const updateReviewHelpful = async (
  reviewId: string,
  isHelpful: boolean
): Promise<{ success: boolean }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('You must be logged in to vote on reviews.');
  }

  // Check if user already voted
  const { data: existingVote, error: voteError } = await supabase
    .from('review_votes')
    .select('*')
    .eq('review_id', reviewId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (voteError) throw new Error(voteError.message);

  // If vote exists, update it
  if (existingVote) {
    const { error: updateError } = await supabase
      .from('review_votes')
      .update({ is_helpful: isHelpful })
      .eq('id', existingVote.id);

    if (updateError) throw new Error(updateError.message);
  }
  // Otherwise create a new vote
  else {
    const { error: insertError } = await supabase
      .from('review_votes')
      .insert({
        review_id: reviewId,
        user_id: userData.user.id,
        is_helpful: isHelpful
      });

    if (insertError) throw new Error(insertError.message);
  }

  return { success: true };
};
