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

export interface CartItem {
  product: Product;
  quantity: number;
}
