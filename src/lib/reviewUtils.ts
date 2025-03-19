
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
}

// Mock reviews for demo
export const mockReviews: Record<string, Review[]> = {
  "p1": [
    {
      id: "r1",
      productId: "p1",
      userId: "u1",
      userName: "Jane Smith",
      rating: 5,
      comment: "Excellent quality cement! Used it for my driveway and it set perfectly.",
      date: "2023-10-15",
      helpful: 12,
      notHelpful: 2,
      verified: true
    },
    {
      id: "r2",
      productId: "p1",
      userId: "u2",
      userName: "John Doe",
      rating: 4,
      comment: "Good product, but took a bit longer to set than expected.",
      date: "2023-09-22",
      helpful: 5,
      notHelpful: 1,
      verified: true
    }
  ],
  "p3": [
    {
      id: "r3",
      productId: "p3",
      userId: "u3",
      userName: "Michael Johnson",
      rating: 5,
      comment: "These tiles look fantastic in my kitchen. Easy to clean too!",
      date: "2023-11-05",
      helpful: 8,
      notHelpful: 0,
      verified: true
    }
  ]
};

export function getReviewsForProduct(productId: string): Review[] {
  return mockReviews[productId] || [];
}

export function getAverageRating(productId: string): number {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
}

export function addReview(review: Omit<Review, 'id' | 'date' | 'helpful' | 'notHelpful'>): Review {
  const newReview: Review = {
    ...review,
    id: `r${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    helpful: 0,
    notHelpful: 0
  };
  
  if (!mockReviews[review.productId]) {
    mockReviews[review.productId] = [];
  }
  
  mockReviews[review.productId].unshift(newReview);
  return newReview;
}
