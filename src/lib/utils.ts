
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} RWF`;
}

/**
 * Returns a fallback image URL in case the original image fails to load
 */
export function getFallbackImageUrl(): string {
  return "https://placehold.co/600x600/EEE/31343C?text=Image+Not+Available";
}

// Define and export the OrderStatus type
export type OrderStatus = "processing" | "shipped" | "out_for_delivery" | "delivered";

// Define and export the Order interface
export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// Mock order data for the order tracking feature
export const mockOrders: Order[] = [
  {
    id: "ORD-2023-7845",
    date: "May 15, 2023",
    status: "delivered",
    items: [
      { id: "1", name: "Construction Helmet", price: 25000, quantity: 2 },
      { id: "2", name: "Safety Goggles", price: 15000, quantity: 1 },
    ],
    total: 65000,
    trackingNumber: "KGL-12345678",
    estimatedDelivery: "Delivered on May 20, 2023",
  },
  {
    id: "ORD-2023-6543",
    date: "June 10, 2023",
    status: "shipped",
    items: [
      { id: "3", name: "Power Drill", price: 120000, quantity: 1 },
      { id: "4", name: "Measuring Tape", price: 8000, quantity: 3 },
    ],
    total: 144000,
    trackingNumber: "KGL-87654321",
    estimatedDelivery: "Expected by June 18, 2023",
  },
  {
    id: "ORD-2023-9876",
    date: "July 5, 2023",
    status: "processing",
    items: [
      { id: "5", name: "Cement (50kg)", price: 12000, quantity: 10 },
      { id: "6", name: "Bricks (100 pcs)", price: 15000, quantity: 5 },
    ],
    total: 195000,
    trackingNumber: "KGL-11223344",
    estimatedDelivery: "Expected by July 15, 2023",
  }
];
