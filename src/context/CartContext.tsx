import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../utils/types';
import { useToast } from '../hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isValidQuantity: (product: Product, quantity: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage if available
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const { toast } = useToast();

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Check if quantity is valid for the product category
  const isValidQuantity = (product: Product, quantity: number): boolean => {
    // Only pastries can have decimal quantities
    if (product.category !== 'pastries' && !Number.isInteger(quantity)) {
      return false;
    }
    
    // All products must have a minimum quantity of at least 1 for non-pastries or 0.25 for pastries
    return product.category === 'pastries' ? quantity >= 0.25 : quantity >= 1;
  };

  const addToCart = (product: Product, quantity: number) => {
    // Ensure quantity is a valid number with 2 decimal places
    const validQuantity = Math.round(quantity * 100) / 100;
    
    // Check if the quantity is valid for this product category
    if (!isValidQuantity(product, validQuantity)) {
      toast({
        title: "Invalid quantity",
        description: product.category === 'pastries' 
          ? "Minimum quantity is 0.25" 
          : "Please enter a whole number quantity for this product",
        variant: "destructive"
      });
      return;
    }
    
    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const updatedItems = [...prevItems];
        const newQuantity = Math.round((updatedItems[existingItemIndex].quantity + validQuantity) * 100) / 100;
        
        // Validate the new quantity
        if (!isValidQuantity(product, newQuantity)) {
          toast({
            title: "Invalid quantity",
            description: product.category === 'pastries' 
              ? "Quantity must be at least 0.25" 
              : "Quantity must be a whole number for this product",
            variant: "destructive"
          });
          return prevItems;
        }
        
        updatedItems[existingItemIndex].quantity = newQuantity;
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { product, quantity: validQuantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // Ensure quantity is a valid number with 2 decimal places
    const validQuantity = Math.round(quantity * 100) / 100;
    
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex(item => item.product.id === productId);
      if (itemIndex === -1) return prevItems;
      
      const product = prevItems[itemIndex].product;
      
      // Check if the quantity is valid for this product category
      if (!isValidQuantity(product, validQuantity)) {
        toast({
          title: "Invalid quantity",
          description: product.category === 'pastries' 
            ? "Minimum quantity is 0.25" 
            : "Please enter a whole number quantity for this product",
          variant: "destructive"
        });
        return prevItems;
      }
      
      return prevItems.map((item) => 
        item.product.id === productId 
          ? { ...item, quantity: validQuantity } 
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        isValidQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
