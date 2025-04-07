import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../utils/types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { Button } from './ui/button';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { updateQuantity, removeFromCart } = useCart();
  
  const isPastry = item.product.category === 'pastries';
  
  const handleQuantityChange = (newQuantity: number) => {
    // Ensure minimum quantity and proper decimal handling for pastries
    if (isPastry) {
      // For pastries, ensure value is in increments of 0.25
      const validQuantity = parseFloat(newQuantity.toFixed(2));
      if (validQuantity < 0.25) return;
      updateQuantity(item.product.id, validQuantity);
    } else {
      if (newQuantity < 1) return;
      updateQuantity(item.product.id, Math.floor(newQuantity));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (isPastry) {
        // For pastries, ensure value is in increments of 0.25
        const roundedValue = Math.round(value * 4) / 4;
        if (roundedValue >= 0.25) {
          updateQuantity(item.product.id, roundedValue);
        }
      } else {
        // For other products, ensure whole numbers
        const wholeNumber = Math.floor(value);
        if (wholeNumber >= 1) {
          updateQuantity(item.product.id, wholeNumber);
        }
      }
    }
  };

  // Calculate item total with proper decimal handling
  const itemTotal = Math.round(item.product.price * item.quantity * 100) / 100;

  // Format quantity display for pastries
  const displayQuantity = isPastry ? item.quantity.toFixed(2) : item.quantity;

  return (
    <div className="flex items-start py-6 first:pt-0 border-b border-border last:border-b-0 animate-fade-in">
      {/* Product image */}
      <div className="relative h-24 w-24 rounded-md overflow-hidden bg-muted mr-4">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={item.product.image}
          alt={item.product.name}
          className={`object-cover h-full w-full ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <Link 
          to={`/product/${item.product.id}`}
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {item.product.name}
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{item.product.description}</p>
        
        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center border border-input rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(
                isPastry 
                  ? parseFloat((item.quantity - 0.25).toFixed(2))
                  : item.quantity - 1
              )}
              className="h-8 w-8"
              disabled={item.quantity <= (isPastry ? 0.25 : 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="relative">
              <input
                type="number"
                min={isPastry ? "0.25" : "1"}
                step={isPastry ? "0.25" : "1"}
                value={displayQuantity}
                onChange={handleInputChange}
                className="w-16 text-center text-sm font-medium py-1 border-0 focus:ring-0"
                aria-label="Quantity"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(
                isPastry 
                  ? parseFloat((item.quantity + 0.25).toFixed(2))
                  : item.quantity + 1
              )}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {isPastry && (
            <span className="text-sm text-muted-foreground">
              kg
            </span>
          )}
        </div>

        {/* Price and remove */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex flex-col">
            <span className="font-medium">{formatCurrency(itemTotal)}</span>
            {isPastry && (
              <span className="text-sm text-muted-foreground">
                {displayQuantity} kg
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.product.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
