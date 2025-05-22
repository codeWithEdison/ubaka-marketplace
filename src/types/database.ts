// Database Types

// Enums
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    SELLER = 'seller'
}

export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SOLD = 'sold'
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    BANK_TRANSFER = 'bank_transfer',
    PAYPAL = 'paypal'
}

// Base Interfaces
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

// User related interfaces
export interface User extends BaseEntity {
    email: string;
    password_hash: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    address: string | null;
    profile_image: string | null;
    is_verified: boolean;
    verification_token: string | null;
    reset_password_token: string | null;
    reset_password_expires: string | null;
}

export interface UserProfile extends BaseEntity {
    user_id: string;
    bio: string | null;
    company_name: string | null;
    website: string | null;
    social_media_links: Record<string, string> | null;
    user: User;
}

// Product related interfaces
export interface Product extends BaseEntity {
    seller_id: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    status: ProductStatus;
    stock_quantity: number;
    images: string[];
    specifications: Record<string, any>;
    seller: User;
    category: Category;
}

export interface Category extends BaseEntity {
    name: string;
    description: string | null;
    parent_id: string | null;
    parent?: Category;
    image: string;
    count: number;
}

export interface ProductReview extends BaseEntity {
    product_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    product: Product;
    user: User;
}

// Order related interfaces
export interface Order extends BaseEntity {
    user_id: string;
    total_amount: number;
    status: OrderStatus;
    shipping_address: string;
    tracking_number: string | null;
    user: User;
    order_items: OrderItem[];
    payment: Payment;
}

export interface OrderItem extends BaseEntity {
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    order: Order;
    product: Product;
}

export interface Payment extends BaseEntity {
    order_id: string;
    amount: number;
    status: PaymentStatus;
    payment_method: PaymentMethod;
    transaction_id: string | null;
    order: Order;
}

// Cart related interfaces
export interface Cart extends BaseEntity {
    user_id: string;
    user: User;
    cart_items: CartItem[];
}

export interface CartItem extends BaseEntity {
    cart_id: string;
    product_id: string;
    quantity: number;
    cart: Cart;
    product: Product;
}

// Wishlist related interfaces
export interface Wishlist extends BaseEntity {
    user_id: string;
    user: User;
    wishlist_items: WishlistItem[];
}

export interface WishlistItem extends BaseEntity {
    wishlist_id: string;
    product_id: string;
    wishlist: Wishlist;
    product: Product;
}

// Notification related interfaces
export interface Notification extends BaseEntity {
    user_id: string;
    title: string;
    message: string;
    is_read: boolean;
    type: string;
    related_entity_id: string | null;
    user: User;
}

// Database Schema Type
export interface Database {
    users: User;
    user_profiles: UserProfile;
    products: Product;
    categories: Category;
    product_reviews: ProductReview;
    orders: Order;
    order_items: OrderItem;
    payments: Payment;
    carts: Cart;
    cart_items: CartItem;
    wishlists: Wishlist;
    wishlist_items: WishlistItem;
    notifications: Notification;
} 