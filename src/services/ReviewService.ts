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
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch reviews for a specific product
export const fetchReviewsForProduct = async (productId: string): Promise<Review[]> => {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  try {
    // First get the reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false });

    if (reviewsError) throw new Error(reviewsError.message);
    if (!reviews) return [];

    // Then get the profiles for all users in the reviews
    const userIds = reviews.map(review => review.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) throw new Error(profilesError.message);

    // Create a map of user profiles for easy lookup
    const profileMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

    // Combine the data
    return reviews.map(review => {
      const profile = profileMap.get(review.user_id) || {};

      return {
        ...review,
        user: {
          name: profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : 'Anonymous User',
          avatar: profile.avatar
        }
      };
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Add a new review
export const createReview = async (reviewData: {
  product_id: string;
  rating: number;
  title?: string;
  content?: string;
}): Promise<Review> => {
  if (!reviewData.product_id) {
    throw new Error('Product ID is required');
  }

  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  try {
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
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        user_id: userData.user.id,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: false // Reviews need approval by default
      })
      .select()
      .single();

    if (reviewError) throw new Error(reviewError.message);
    if (!review) throw new Error('Failed to create review');

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    return {
      ...review,
      user: {
        name: profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : 'Anonymous User',
        avatar: profile?.avatar || null
      }
    };
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Mark review as helpful or not helpful
export const updateReviewHelpful = async (
  reviewId: string,
  isHelpful: boolean
): Promise<{ success: boolean }> => {
  try {
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
  } catch (error) {
    console.error('Error updating review vote:', error);
    throw error;
  }
};
