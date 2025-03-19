
import { Product } from './data';

export interface Coupon {
  code: string;
  discount: number; // percentage discount
  minOrderValue?: number;
  expiryDate?: Date;
  isActive: boolean;
  appliesTo?: string[]; // product categories this coupon applies to
}

// Mock coupons for demo purposes
export const mockCoupons: Coupon[] = [
  {
    code: "WELCOME10",
    discount: 10,
    minOrderValue: 50,
    isActive: true
  },
  {
    code: "SUMMER20",
    discount: 20,
    minOrderValue: 100,
    expiryDate: new Date(2024, 8, 30), // September 30, 2024
    isActive: true
  },
  {
    code: "FLOORS15",
    discount: 15,
    appliesTo: ["Flooring"],
    isActive: true
  }
];

export function validateCoupon(code: string): Coupon | null {
  const coupon = mockCoupons.find(
    c => c.code.toLowerCase() === code.toLowerCase() && c.isActive
  );
  
  if (!coupon) return null;
  
  // Check if coupon is expired
  if (coupon.expiryDate && new Date() > coupon.expiryDate) {
    return null;
  }
  
  return coupon;
}

export function calculateDiscountAmount(coupon: Coupon, subtotal: number, products: Product[]): number {
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return 0;
  }
  
  // If coupon applies to specific categories
  if (coupon.appliesTo && coupon.appliesTo.length > 0) {
    const eligibleProductsTotal = products.reduce((total, product) => {
      if (coupon.appliesTo?.includes(product.category)) {
        return total + product.price;
      }
      return total;
    }, 0);
    
    return (eligibleProductsTotal * coupon.discount) / 100;
  }
  
  // General discount on entire order
  return (subtotal * coupon.discount) / 100;
}
