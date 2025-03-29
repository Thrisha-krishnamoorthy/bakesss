import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  const product = products.find(p => p.id === id);
  
  const relatedProducts = products
    .filter(p => product && p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
  }, [id]);
  
  if (isProductsLoading) {
    return (
      <>
        <Navbar />
        <div className="page-container py-16 mt-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-muted animate-pulse rounded-lg aspect-square" />
            <div className="space-y-4">
              <div className="bg-muted animate-pulse h-8 w-2/3 rounded" />
              <div className="bg-muted animate-pulse h-6 w-1/4 rounded" />
              <div className="bg-muted animate-pulse h-24 w-full rounded mt-6" />
              <div className="bg-muted animate-pulse h-10 w-full rounded mt-8" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!product) {
    return (
      <>
        <Navbar />
        <div className="page-container text-center py-16 mt-16">
          <h1 className="text-2xl font-medium mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, the product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
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

  const fallbackImage = "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2787&q=80";

  return (
    <>
      <Navbar />
      <main className="page-container pt-24">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
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
              onError={(e) => {
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = fallbackImage;
                setIsImageLoaded(true);
              }}
            />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-3xl font-serif">{product.name}</h1>
            <p className="text-2xl font-semibold mt-2">{formatCurrency(product.price)}</p>
            
            <div className="mt-6">
              <p className="text-muted-foreground">{product.longDescription || product.description}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Category</h3>
              <p className="text-sm">{product.category}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Availability</h3>
              <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
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
              
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium flex items-center justify-center transition-all hover:bg-primary/90 btn-hover"
                disabled={!product.inStock}
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> 
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
        
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
