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
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Ensure quantities are properly formatted
        return parsedCart.map((item: CartItem) => ({
          ...item,
          quantity: item.product.category === 'pastries'
            ? parseFloat(item.quantity.toFixed(2)) // Keep decimal places for pastries
            : Math.floor(item.quantity)
        }));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  });
  
  const { toast } = useToast();

  // Calculate cart total with proper decimal handling
  const cartTotal = cartItems.reduce((total, item) => {
    const quantity = item.product.category === 'pastries'
      ? parseFloat(item.quantity.toFixed(2)) // Keep decimal places for pastries
      : Math.floor(item.quantity);
    
    const itemPrice = Math.round(item.product.price * quantity * 100) / 100;
    return Math.round((total + itemPrice) * 100) / 100;
  }, 0);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Check if quantity is valid for the product category
  const isValidQuantity = (product: Product, quantity: number): boolean => {
    if (isNaN(quantity) || quantity <= 0) return false;

    if (product.category === 'pastries') {
      // For pastries, allow any decimal value >= 0.25
      return quantity >= 0.25;
    }
    
    return Number.isInteger(quantity) && quantity >= 1;
  };

  const addToCart = (product: Product, quantity: number) => {
    const validQuantity = product.category === 'pastries'
      ? parseFloat(quantity.toFixed(2)) // Keep decimal places for pastries
      : Math.floor(quantity);
    
    if (!isValidQuantity(product, validQuantity)) {
      toast({
        title: "Invalid quantity",
        description: product.category === 'pastries'
          ? "Quantity must be at least 0.25"
          : "Please enter a whole number quantity (minimum 1)",
        variant: "destructive"
      });
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = product.category === 'pastries'
          ? parseFloat((existingItem.quantity + validQuantity).toFixed(2))
          : Math.floor(existingItem.quantity + validQuantity);

        if (!isValidQuantity(product, newQuantity)) {
          toast({
            title: "Invalid quantity",
            description: product.category === 'pastries'
              ? "Total quantity must be at least 0.25"
              : "Total quantity must be a whole number (minimum 1)",
            variant: "destructive"
          });
          return prevItems;
        }

        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...prevItems, { product, quantity: validQuantity }];
    });

    toast({
      title: "Added to cart",
      description: `${product.name} (${validQuantity}${product.category === 'pastries' ? ' kg' : ''}) has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems => {
      const itemIndex = prevItems.findIndex(item => item.product.id === productId);
      if (itemIndex === -1) return prevItems;

      const product = prevItems[itemIndex].product;
      const validQuantity = product.category === 'pastries'
        ? parseFloat(quantity.toFixed(2)) // Keep decimal places for pastries
        : Math.floor(quantity);

      if (!isValidQuantity(product, validQuantity)) {
        toast({
          title: "Invalid quantity",
          description: product.category === 'pastries'
            ? "Quantity must be at least 0.25"
            : "Please enter a whole number quantity (minimum 1)",
          variant: "destructive"
        });
        return prevItems;
      }

      return prevItems.map(item =>
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
