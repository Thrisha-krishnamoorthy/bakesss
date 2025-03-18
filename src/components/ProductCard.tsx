
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../utils/types';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';
import { PlusCircle, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product, 1);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
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
        <div className="mt-2 font-semibold">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
};

export default ProductCard;
