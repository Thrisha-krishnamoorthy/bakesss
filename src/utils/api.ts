import { Product, Order, Customer, RegistrationData, LoginCredentials, AuthUser } from './types';

// Use HTTP in development to avoid certificate issues
const API_URL = 'http://localhost:5000';

// Helper function to handle fetch with proper error handling
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};

// Authentication-related API calls
export const login = async (credentials: LoginCredentials): Promise<{ message: string; user?: AuthUser }> => {
  try {
    const response = await fetchWithErrorHandling(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    return {
      message: data.message,
      user: {
        user_id: data.user_id || 0,
        email: credentials.email,
        name: data.name || 'User',
        phone: data.phone || '',
        role: data.role || 'user',
      },
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Product-related API calls
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetchWithErrorHandling(`${API_URL}/products`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Failed to fetch products');
    }
    
    return data.map((product: any) => ({
      id: product.product_id.toString(),
      name: product.name,
      description: product.description || '',
      longDescription: product.description || '',
      price: parseFloat(product.price),
      category: product.category,
      image: product.image_url || "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
      quantity: product.quantity,
      inStock: product.status === 'in_stock',
      ingredients: [],
      allergens: []
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await fetchWithErrorHandling(`${API_URL}/products`, {
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
        quantity: product.quantity,
        status: product.inStock ? 'in_stock' : 'out_of_stock'
      }),
    });
    
    const data = await response.json();
    return {
      id: data.product_id.toString(),
      ...product
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// User-related API calls
export const registerUser = async (userData: RegistrationData): Promise<{ message: string }> => {
  try {
    const response = await fetchWithErrorHandling(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    return { message: data.message };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Order-related API calls
export const placeOrder = async (orderData: {
  email: string;
  items: { product_id: string; quantity: number; price: number }[];
  total_price: number;
  delivery_type: 'delivery' | 'pickup';
  delivery_address?: string;
}): Promise<{ message: string; order_id: number }> => {
  try {
    // Convert product_id strings to numbers for the backend
    const formattedItems = orderData.items.map(item => ({
      product_id: parseInt(item.product_id),
      quantity: item.quantity,
      price: item.price
    }));

    const response = await fetchWithErrorHandling(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: orderData.email,
        items: formattedItems,
        shipping_address: orderData.delivery_address || '',
        total_amount: orderData.total_price
      }),
    });
    
    const data = await response.json();
    return { 
      message: data.message,
      order_id: data.order_id
    };
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Fetch order details by ID
export const fetchOrderDetails = async (orderId: number): Promise<any> => {
  try {
    const response = await fetchWithErrorHandling(`${API_URL}/orders/details/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error || 'Failed to fetch order details');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching order details for order ${orderId}:`, error);
    throw error;
  }
};

// Fetch all orders for a user by email
export const fetchUserOrders = async (userEmail: string): Promise<any[]> => {
  try {
    console.log('Fetching orders for user:', userEmail);
    
    // Use the new email-based endpoint
    const ordersResponse = await fetchWithErrorHandling(`${API_URL}/orders/user/email/${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const ordersData = await ordersResponse.json();
    if (ordersData.error) {
      throw new Error(ordersData.error || 'Failed to fetch user orders');
    }
    
    console.log('Fetched real orders data:', ordersData);
    
    // The backend now returns data in the correct format
    return ordersData;
  } catch (error) {
    console.error(`Error fetching orders for user ${userEmail}:`, error);
    
    // Return empty array on error
    return [];
  }
};

// Contact form submission
export const submitContactForm = async (formData: any): Promise<{ message: string }> => {
  try {
    const response = await fetchWithErrorHandling(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    return { message: data.message };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};
