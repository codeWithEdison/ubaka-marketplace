import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiQuery } from '@/hooks/useApi';
import { fetchReviewsForProduct, Review, updateReviewHelpful } from '@/services/ReviewService';
import { StarIcon, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReviewListProps {
  productId: string;
}

const ReviewList = ({ productId }: ReviewListProps) => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const { toast } = useToast();

  const { data, isLoading, refetch } = useApiQuery<Review[]>(
    ['reviews', productId],
    () => fetchReviewsForProduct(productId),
    { enabled: !!productId }
  );

  const reviews = data || [];

  const filteredReviews = reviews.filter(review => {
    if (filter === 'positive') return review.rating >= 4;
    if (filter === 'negative') return review.rating < 4;
    return true;
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    try {
      await updateReviewHelpful(reviewId, isHelpful);
      refetch(); // Refresh the reviews to update vote counts
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update vote",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center mb-1">
            <div className="flex text-amber-400 mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'stroke-current fill-none'}`}
                />
              ))}
            </div>
            <span className="font-semibold">{averageRating.toFixed(1)} out of 5</span>
          </div>
          <p className="text-sm text-muted-foreground">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
        </div>

        <div className="flex space-x-2 text-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full ${filter === 'all' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('positive')}
            className={`px-3 py-1 rounded-full ${filter === 'positive' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
          >
            Positive
          </button>
          <button
            onClick={() => setFilter('negative')}
            className={`px-3 py-1 rounded-full ${filter === 'negative' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
          >
            Negative
          </button>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p>No {filter !== 'all' ? filter : ''} reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start">
                <div className="mr-3">
                  {review.user.avatar ? (
                    <img src={review.user.avatar} alt={review.user.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {review.user.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{review.user.name}</h4>
                      <div className="flex text-amber-400 my-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'stroke-current fill-none'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {review.title && <h5 className="font-medium mt-2">{review.title}</h5>}
                  <p className="mt-1 text-muted-foreground">{review.content}</p>

                  <div className="mt-4 flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => handleVote(review.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Helpful ({review.helpful_count || 0})</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => handleVote(review.id, false)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>Not Helpful ({review.not_helpful_count || 0})</span>
                    </Button>
                  </div>

                  {review.is_verified_purchase && (
                    <div className="mt-2 text-xs inline-block px-2 py-1 bg-green-50 text-green-700 rounded">
                      Verified Purchase
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
