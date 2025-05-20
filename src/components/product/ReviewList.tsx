
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchReviewsForProduct, Review, voteReview } from '@/services/ReviewService';
import { useApiQuery } from '@/hooks/useApi';

interface ReviewListProps {
  productId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [filter, setFilter] = useState<number | null>(null);
  
  const { data: reviews = [] } = useApiQuery<Review[]>(
    ['product-reviews', productId],
    () => fetchReviewsForProduct(productId),
    { enabled: !!productId }
  );
  
  const filteredReviews = filter 
    ? reviews.filter(review => review.rating === filter)
    : reviews;
  
  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      await voteReview(reviewId, isHelpful);
      // We could refetch the reviews here to update the UI, but that would require extra API calls
      // For now, we'll just show the action was taken
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };
  
  const ratings = [5, 4, 3, 2, 1];
  
  if (reviews.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No reviews for this product yet. Be the first to leave a review!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filter === null ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter(null)}
        >
          All Reviews
        </Button>
        
        {ratings.map(rating => {
          const count = reviews.filter(r => r.rating === rating).length;
          if (count === 0) return null;
          
          return (
            <Button
              key={rating}
              variant={filter === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(rating === filter ? null : rating)}
            >
              {rating} Stars ({count})
            </Button>
          );
        })}
      </div>
      
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.userName}</span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs flex items-center text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-medium mt-2">{review.title}</h4>
              )}
              
              <p className="my-3">{review.content}</p>
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleHelpful(review.id, true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful ({review.helpfulCount || 0})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleHelpful(review.id, false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Not Helpful ({review.notHelpfulCount || 0})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
