import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Json } from "@/integrations/supabase/types";
import { OrderStatus as DbOrderStatus } from "@/types/database";

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

export type OrderStatus = DbOrderStatus;

export interface Order {
  id: string;
  user_id: string;
  total: number;
  total_amount: number;
  status: OrderStatus;
  shipping_address: Json;
  tracking_number: string | null;
  payment_intent_id: string | null;
  payment_method: string | null;
  notes: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
    };
  }[];
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  payment: {
    id: string;
    payment_method: string;
    status: string;
  } | null;
}

export interface RawOrder {
  id: string;
  user_id: string;
  total: number;
  shipping_address: Json;
  payment_method: string | null;
  status: OrderStatus;
  payment_intent_id: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
    };
  }[];
  user: {
    id: string;
    email: string;
    raw_user_meta_data: {
      first_name?: string;
      last_name?: string;
    };
  };
}

export interface DbOrder {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  shipping_address: Json;
  tracking_number: string | null;
  payment_intent_id: string | null;
  payment_method: string | null;
  notes: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  discount: number;
  new: boolean;
  featured: boolean;
  in_stock: boolean;
  specifications: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  categories?: {
    id: string;
    name: string;
  } | null;
  ratings?: {
    average_rating: number | null;
    review_count: number | null;
  }[] | null;
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
  description: string | null;
  image: string | null;
  created_at?: string;
  updated_at?: string;
  count?: number;
}

export interface DbCategory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
