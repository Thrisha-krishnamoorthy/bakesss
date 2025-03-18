
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  longDescription?: string;
  image: string;
  category: string;
  featured?: boolean;
  ingredients?: string[];
  allergens?: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: Customer;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  date: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryDate?: string;
}

export interface Customer {
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
