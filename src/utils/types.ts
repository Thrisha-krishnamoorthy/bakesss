
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
  id: string; // Will map to order_id in database
  items: CartItem[];
  customer: Customer;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number; // Will map to total_price in database
  date: string;
  deliveryMethod: 'delivery' | 'pickup'; // Will map to delivery_type in database
  deliveryAddress?: string; // Will map to delivery_address in database
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
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
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
