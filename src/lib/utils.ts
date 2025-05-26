import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    currencyDisplay: 'code',
  }).format(amount);
};

export const getFallbackImageUrl = () => {
  return "https://placehold.co/600x600/EEE/31343C?text=Image+Not+Available";
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

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


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
  };
  rating: number;
  discount: number;
  new: boolean;
  featured: boolean;
  inStock: boolean;
  specifications: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
}


export interface CartItem {
  product: Product;
  quantity: number;
}
