
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatCurrency } from '../utils/formatters';

const Cart = () => {
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();
  
  // Handle empty cart
  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="page-container pt-24">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-medium mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/shop"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover inline-flex items-center"
            >
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Calculate summary
  const shipping = cartTotal >= 50 ? 0 : 5.99;
  const orderTotal = cartTotal + shipping;

  return (
    <>
      <Navbar />
      <main className="page-container pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif">Shopping Cart</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Continue Shopping
          </button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg p-6">
              {cartItems.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                
                {shipping === 0 && (
                  <div className="text-green-600 text-xs py-1">
                    You've qualified for free shipping!
                  </div>
                )}
                
                <div className="border-t pt-3 mt-3 flex justify-between text-base">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{formatCurrency(orderTotal)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link
                  to="/checkout"
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium flex items-center justify-center transition-all hover:bg-primary/90 btn-hover"
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              
              {/* Secure payment note */}
              <div className="mt-6 text-xs text-center text-muted-foreground">
                <p>Secure Checkout • 100% Money Back Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
