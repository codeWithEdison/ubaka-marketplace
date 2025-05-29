import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createReview } from '@/services/ReviewService';
import { useQueryClient } from '@tanstack/react-query';

interface AddReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a review comment",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReview({
        product_id: productId,
        rating,
        title: title.trim() || null,
        content: content.trim(),
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review will be visible after approval.",
      });

      // Reset form
      setRating(0);
      setTitle('');
      setContent('');

      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });

      // Notify parent component
      onReviewAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={`h-6 w-6 ${(hoverRating ? value <= hoverRating : value <= rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
                  }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">Review Title (Optional)</label>
        <input
          id="title"
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your review"
        />
      </div>

      <div>
        <label htmlFor="review" className="block text-sm font-medium mb-2">Your Review</label>
        <Textarea
          id="review"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your review here..."
          rows={4}
        />
      </div>

      <Button type="submit">Submit Review</Button>
    </form>
  );
};

export default AddReviewForm;
