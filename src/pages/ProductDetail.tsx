
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { products } from '../utils/data';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Find the product
  const product = products.find(p => p.id === id);
  
  // Find related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => product && p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  
  useEffect(() => {
    // Scroll to top when component loads
    window.scrollTo(0, 0);
    
    // Reset quantity when product changes
    setQuantity(1);
  }, [id]);
  
  // If product not found
  if (!product) {
    return (
      <>
        <Navbar />
        <div className="page-container text-center py-16">
          <h1 className="text-2xl font-medium mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, the product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} has been added to your cart.`,
    });
  };

  return (
    <>
      <Navbar />
      <main className="page-container pt-24">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product image */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover aspect-square ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
          
          {/* Product details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-serif">{product.name}</h1>
            <p className="text-2xl font-semibold mt-2">${product.price.toFixed(2)}</p>
            
            <div className="mt-6">
              <p className="text-muted-foreground">{product.longDescription || product.description}</p>
            </div>
            
            {/* Ingredients and allergens */}
            {product.ingredients && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Ingredients</h3>
                <p className="text-sm">{product.ingredients.join(', ')}</p>
              </div>
            )}
            
            {product.allergens && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Allergens</h3>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen) => (
                    <span 
                      key={allergen} 
                      className="inline-block bg-muted px-2 py-1 text-xs rounded-md"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 space-y-4">
              {/* Quantity selector */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Quantity</h3>
                <div className="flex items-center border border-input rounded-md w-fit">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-2 hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-2 text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium flex items-center justify-center transition-all hover:bg-primary/90 btn-hover"
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
        
        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title">You Might Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
