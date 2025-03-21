
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, CreditCard, Truck, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Customer } from '../utils/types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });
  
  // If cart is empty, redirect to cart page
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  
  // Calculate summary
  const shipping = deliveryMethod === 'pickup' ? 0 : (cartTotal >= 50 ? 0 : 5.99);
  const orderTotal = cartTotal + shipping;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCustomerInfo({
        ...customerInfo,
        [parent]: {
          ...customerInfo[parent as keyof Customer] as Record<string, string>,
          [child]: value,
        },
      });
    } else {
      setCustomerInfo({
        ...customerInfo,
        [name]: value,
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a fake order ID
    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Format delivery address for database storage
    const deliveryAddress = deliveryMethod === 'delivery' && customerInfo.address
      ? `${customerInfo.address.street}, ${customerInfo.address.city}, ${customerInfo.address.state} ${customerInfo.address.postalCode}`
      : '';

    // Create order object
    const order = {
      id: orderId,
      items: cartItems,
      customer: customerInfo,
      status: 'pending' as const,
      total: orderTotal,
      date: new Date().toISOString(),
      deliveryMethod,
      deliveryAddress,
    };
    
    // Store order in local storage (this would normally go to a backend)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    clearCart();
    
    // Navigate to confirmation page
    navigate(`/order-confirmation/${orderId}`);
  };
  
  return (
    <>
      <Navbar />
      <main className="page-container pt-24">
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Cart
        </button>
        
        <h1 className="text-3xl font-serif mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
            {/* Contact information */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            
            {/* Delivery method */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Delivery Method</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label 
                  className={`flex items-start p-4 border rounded-md cursor-pointer transition-all ${
                    deliveryMethod === 'delivery' 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10' 
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={() => setDeliveryMethod('delivery')}
                    className="sr-only"
                  />
                  <div className="mr-4 mt-0.5">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      deliveryMethod === 'delivery' ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {deliveryMethod === 'delivery' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      <span className="font-medium">Home Delivery</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Delivery within 2-3 days
                    </p>
                  </div>
                </label>
                
                <label 
                  className={`flex items-start p-4 border rounded-md cursor-pointer transition-all ${
                    deliveryMethod === 'pickup' 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10' 
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="sr-only"
                  />
                  <div className="mr-4 mt-0.5">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      deliveryMethod === 'pickup' ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {deliveryMethod === 'pickup' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Store className="h-4 w-4 mr-2" />
                      <span className="font-medium">Store Pickup</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ready in 1-2 hours
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Shipping address (only shown for delivery) */}
            {deliveryMethod === 'delivery' && (
              <div className="bg-white border border-border rounded-lg p-6 animate-fade-in">
                <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="address.street"
                      value={customerInfo.address?.street || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="city" className="block text-sm font-medium">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="address.city"
                      value={customerInfo.address?.city || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="state" className="block text-sm font-medium">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="address.state"
                      value={customerInfo.address?.state || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="postalCode" className="block text-sm font-medium">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="address.postalCode"
                      value={customerInfo.address?.postalCode || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment information */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Payment Information</h2>
              <div className="flex items-center mb-4 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Payment will be collected upon {deliveryMethod === 'delivery' ? 'delivery' : 'pickup'}</span>
              </div>
              
              <div className="flex items-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-2" />
                <span>Pay with cash or card</span>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover"
            >
              Complete Order
            </button>
          </form>
          
          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted mr-3 flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="object-cover h-full w-full"
                      />
                      <div className="absolute top-0 right-0 bg-primary/90 w-5 h-5 flex items-center justify-center text-xs text-primary-foreground font-medium">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${item.product.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="border-t pt-3 mt-3 flex justify-between text-base">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
