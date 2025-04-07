import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../utils/types';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';
import { PlusCircle, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Input } from './ui/input';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(product.category === 'pastries' ? 0.25 : 1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product, quantity);
    
    toast({
      title: "Added to cart",
      description: `${product.name} (${quantity}${product.category === 'pastries' ? ' kg' : ''}) has been added to your cart.`,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (product.category === 'pastries') {
        // For pastries, ensure value is in increments of 0.25
        const roundedValue = Math.round(value * 4) / 4;
        if (roundedValue >= 0.25) {
          setQuantity(roundedValue);
        }
      } else {
        // For other products, ensure whole numbers
        const wholeNumber = Math.floor(value);
        if (wholeNumber >= 1) {
          setQuantity(wholeNumber);
        }
      }
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group relative flex flex-col bg-white border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in"
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 text-xs font-medium rounded">
            Featured
          </div>
        )}
        
        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-2 right-2 rounded-full p-2 shadow-md transition-all transform duration-300 ${
            isAdded 
              ? 'bg-green-500 text-white scale-110' 
              : 'bg-white text-primary hover:scale-110'
          }`}
          aria-label="Add to cart"
        >
          {isAdded ? (
            <Check className="h-5 w-5" />
          ) : (
            <PlusCircle className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Product info */}
      <div className="flex flex-col p-4">
        <h3 className="font-medium text-lg text-balance">{product.name}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-2 font-semibold">{formatCurrency(product.price)}</div>
        
        {/* Quantity input */}
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            min={product.category === 'pastries' ? "0.25" : "1"}
            step={product.category === 'pastries' ? "0.25" : "1"}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-20 text-center"
            aria-label="Quantity"
          />
          {product.category === 'pastries' && (
            <span className="text-sm text-muted-foreground">kg</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
