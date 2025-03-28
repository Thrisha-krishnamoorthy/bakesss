
import { Product, Order, Customer, RegistrationData, LoginCredentials, AuthUser } from './types';

const API_URL = 'http://localhost:5000';

// Authentication-related API calls
export const login = async (credentials: LoginCredentials): Promise<{ message: string; user?: AuthUser }> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Product-related API calls
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    // Transform the data to match our Product type
    return data.map((item: any) => ({
      id: item.product_id.toString(),
      name: item.name,
      price: parseFloat(item.price),
      description: item.description || "",
      longDescription: item.description || "",
      image: item.image_url || "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
      category: item.category,
      ingredients: [],
      allergens: [],
      inStock: item.status === 'in_stock',
      quantity: item.quantity
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image,
        category: product.category,
        quantity: product.quantity
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add product');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// User-related API calls
export const registerUser = async (userData: RegistrationData): Promise<{ message: string; user?: AuthUser }> => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Order-related API calls
export const placeOrder = async (
  orderData: {
    email: string; // Changed from user_id to email as per updated backend
    items: { product_id: string; quantity: number; price: number }[];
    total_price: number;
    delivery_type: 'delivery' | 'pickup';
    delivery_address?: string;
  }
): Promise<{ message: string; order_id: number }> => {
  try {
    console.log('Sending order data to backend:', orderData);
    
    // Check if email is provided
    if (!orderData.email) {
      throw new Error('Missing required fields: email is required');
    }
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: orderData.email,
        items: orderData.items,
        total_price: orderData.total_price,
        delivery_type: orderData.delivery_type,
        delivery_address: orderData.delivery_address || ''
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to place order');
    }
    
    const result = await response.json();
    console.log('Order placed successfully:', result);
    return result;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Contact form submission
export const submitContactForm = async (formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit form');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};
