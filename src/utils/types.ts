
export interface Product {
  id: string; // Will map to product_id in database
  name: string;
  price: number;
  description: string;
  longDescription?: string;
  image: string; // Will map to image_url in database
  category: string;
  featured?: boolean;
  ingredients?: string[];
  allergens?: string[];
  inStock: boolean; // Will map to status in database
  quantity: number; // Added to match the quantity column in database
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  status: "order confirmation" | "baked" | "shipped" | "delivered";
  items: CartItem[];
  customer: Customer;
  total: number;
  date: string;
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress?: string;
  paymentStatus?: "not paid" | "advance paid" | "full paid";
}

export interface Customer {
  id?: number; // Will map to user_id in database
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface User {
  id: number; // user_id in database
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'user' | 'admin';
}

export interface Admin {
  id: number; // admin_id in database
  name: string;
  email: string;
}

export interface AuthUser {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  address?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}
