import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, CreditCard, Truck, Store, AlertCircle, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../utils/types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { placeOrder } from '../utils/api';
import { useToast } from '../hooks/use-toast';
import { formatCurrency } from '../utils/formatters';
import MapAddress from '../components/GoogleMapAddress';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { calculateShippingCharge } from '../utils/shipping';

// Remove or comment out the Google Maps API key section
// const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// if (!GOOGLE_MAPS_API_KEY) {
//   console.error('Google Maps API key is not configured');
// }

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance'>('cod');
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      lat: number;
      lng: number;
      mapLink: string;
    };
  }>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      lat: 0,
      lng: 0,
      mapLink: '',
    },
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const isOrderOver1000 = cartTotal >= 1000;
  const [shippingInfo, setShippingInfo] = useState<{ charge: number; zoneName: string }>({ charge: 0, zoneName: '' });

  useEffect(() => {
    // Prepopulate form with user data if available
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }));
    }
  }, [user]);

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Set payment method based on order total
  useEffect(() => {
    if (isOrderOver1000) {
      setPaymentMethod('advance');
    } else {
      setPaymentMethod('cod');
    }
  }, [isOrderOver1000]);

  // Calculate shipping whenever delivery method or address changes
  useEffect(() => {
    if (deliveryMethod === 'delivery' && customerInfo.address.postalCode) {
      const { charge, zoneName } = calculateShippingCharge(
        customerInfo.address.postalCode,
        cartTotal,
        deliveryMethod
      );
      setShippingInfo({ charge, zoneName });
    } else {
      setShippingInfo({ charge: 0, zoneName: 'Store Pickup' });
    }
  }, [deliveryMethod, customerInfo.address.postalCode, cartTotal]);

  // Update order total calculation
  const shipping = deliveryMethod === 'pickup' ? 0 : cartTotal >= 50 ? 0 : 5.99;
  const orderTotal = cartTotal + shippingInfo.charge;
  const advancePaymentAmount = isOrderOver1000 ? orderTotal * 0.5 : 0;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to place an order.',
        variant: 'destructive',
      });
      return;
    }

    // Validate address if delivery method is selected
    if (deliveryMethod === 'delivery') {
      if (!customerInfo.address.street || !customerInfo.address.city || !customerInfo.address.state || !customerInfo.address.postalCode) {
        toast({
          title: 'Address Required',
          description: 'Please provide a complete delivery address',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setIsProcessing(true);

      // Format delivery address for database storage
      const deliveryAddress = deliveryMethod === 'delivery' && customerInfo.address
        ? `${customerInfo.address.street}, ${customerInfo.address.city}, ${customerInfo.address.state} ${customerInfo.address.postalCode}`
        : '';

      // Format items for the API
      const formattedItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Create order object with the email instead of user_id as per updated backend
      const orderData = {
        email: user.email,
        items: formattedItems,
        total_price: orderTotal,
        delivery_type: deliveryMethod,
        delivery_address: deliveryAddress,
        map_link: customerInfo.address.mapLink,
        payment_method: paymentMethod,
        advance_payment: isOrderOver1000 ? advancePaymentAmount : 0,
      };

      console.log('Submitting order:', orderData);

      // Send order to API
      const response = await placeOrder(orderData);

      console.log('Order placed successfully:', response);

      // Show success message
      toast({
        title: 'Order Placed Successfully',
        description: `Your order #${response.order_id} has been placed successfully.`,
      });

      // Clear cart
      clearCart();

      // Navigate to confirmation page
      navigate(`/order-confirmation/${response.order_id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: error instanceof Error ? error.message : 'There was a problem placing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Return early while redirecting
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="page-container">
          <div className="content-container">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-muted-foreground hover:text-foreground mb-10 text-lg"
            >
              <ChevronLeft className="h-6 w-6 mr-2" />
              Back to Cart
            </button>

            <h1 className="text-5xl font-serif mb-12">Checkout</h1>

            {isOrderOver1000 && (
              <Alert className="mb-8 bg-amber-50 border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800 font-medium text-lg">Advance Payment Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  For orders over ₹1000, a 50% advance payment is required before we start baking your order.
                </AlertDescription>
              </Alert>
            )}

            {/* Add shipping information display */}
            {deliveryMethod === 'delivery' && customerInfo.address.postalCode && (
              <Alert className="mb-6">
                <Info className="h-5 w-5" />
                <AlertTitle>Delivery Zone: {shippingInfo.zoneName}</AlertTitle>
                <AlertDescription>
                  Shipping charge: {formatCurrency(shippingInfo.charge)}
                  {shippingInfo.charge === 0 && ' (Free Shipping)'}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-12 md:grid-cols-[1fr,400px]">
              <div className="space-y-10">
                {/* Delivery Method */}
                <div className="bg-card p-8 rounded-xl shadow-md">
                  <h2 className="text-3xl font-serif font-semibold mb-6">Delivery Method</h2>
                  <div className="grid gap-6">
                    <button
                      className={`flex items-center justify-between p-6 rounded-lg border-2 ${
                        deliveryMethod === 'delivery'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setDeliveryMethod('delivery')}
                    >
                      <div className="flex items-center">
                        <Truck className="h-7 w-7 mr-4" />
                        <div className="text-left">
                          <div className="font-medium text-xl">Home Delivery</div>
                          <div className="text-lg text-muted-foreground">
                            Delivered to your address
                          </div>
                        </div>
                      </div>
                      {deliveryMethod === 'delivery' && (
                        <Check className="h-7 w-7 text-primary" />
                      )}
                    </button>

                    <button
                      className={`flex items-center justify-between p-6 rounded-lg border-2 ${
                        deliveryMethod === 'pickup'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setDeliveryMethod('pickup')}
                    >
                      <div className="flex items-center">
                        <Store className="h-7 w-7 mr-4" />
                        <div className="text-left">
                          <div className="font-medium text-xl">Store Pickup</div>
                          <div className="text-lg text-muted-foreground">
                            Collect from our store
                          </div>
                        </div>
                      </div>
                      {deliveryMethod === 'pickup' && (
                        <Check className="h-7 w-7 text-primary" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-card p-8 rounded-xl shadow-md">
                  <h2 className="text-3xl font-serif font-semibold mb-6">Customer Information</h2>
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-lg font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full p-4 rounded-lg border border-border text-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full p-4 rounded-lg border border-border text-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full p-4 rounded-lg border border-border text-lg"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                {deliveryMethod === 'delivery' && (
                  <div className="bg-card p-8 rounded-xl shadow-md">
                    <h2 className="text-3xl font-serif font-semibold mb-6">Delivery Address</h2>
                    <MapAddress
                      initialAddress={customerInfo.address}
                      onAddressSelect={(address) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          address: {
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            postalCode: address.postalCode,
                            lat: address.lat,
                            lng: address.lng,
                            mapLink: address.mapLink,
                          },
                        }))
                      }
                    />
                    <div className="mt-6 grid gap-6">
                      <div>
                        <label className="block text-lg font-medium mb-2">Street Address</label>
                        <input
                          type="text"
                          value={customerInfo.address.street}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({
                              ...prev,
                              address: { ...prev.address, street: e.target.value },
                            }))
                          }
                          className="w-full p-4 rounded-lg border border-border text-lg"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-lg font-medium mb-2">City</label>
                          <input
                            type="text"
                            value={customerInfo.address.city}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({
                                ...prev,
                                address: { ...prev.address, city: e.target.value },
                              }))
                            }
                            className="w-full p-4 rounded-lg border border-border text-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-lg font-medium mb-2">State</label>
                          <input
                            type="text"
                            value={customerInfo.address.state}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({
                                ...prev,
                                address: { ...prev.address, state: e.target.value },
                              }))
                            }
                            className="w-full p-4 rounded-lg border border-border text-lg"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-lg font-medium mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={customerInfo.address.postalCode}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({
                              ...prev,
                              address: { ...prev.address, postalCode: e.target.value },
                            }))
                          }
                          className="w-full p-4 rounded-lg border border-border text-lg"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment information */}
                <div className="bg-card p-8 rounded-xl shadow-md">
                  <h2 className="text-3xl font-serif font-semibold mb-6">Payment Information</h2>
                  
                  {isOrderOver1000 ? (
                    <>
                      <div className="flex items-center mb-6 text-lg">
                        <Info className="h-6 w-6 mr-3 text-amber-600" />
                        <span className="text-amber-700 font-medium">
                          For orders over ₹1000, a 50% advance payment (₹{advancePaymentAmount.toFixed(2)}) is required before we start baking.
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-6 text-lg">
                        <CreditCard className="h-6 w-6 mr-3" />
                        <span>
                          Please complete the advance payment to proceed with your order. The remaining balance will be collected upon {deliveryMethod === 'delivery' ? 'delivery' : 'pickup'}.
                        </span>
                      </div>
                      
                      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <h3 className="font-medium text-xl mb-3">Payment Options</h3>
                        <p className="text-lg mb-4">Please contact us at +91 9876543210 to complete your advance payment via UPI, bank transfer, or credit/debit card.</p>
                        <p className="text-lg text-muted-foreground">Your order will be processed once we confirm your payment.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center mb-6 text-lg text-muted-foreground">
                        <CreditCard className="h-6 w-6 mr-3" />
                        <span>Payment will be collected upon {deliveryMethod === 'delivery' ? 'delivery' : 'pickup'}</span>
                      </div>

                      <div className="flex items-center text-green-600 text-lg">
                        <Check className="h-6 w-6 mr-3" />
                        <span>Pay with cash or card</span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full bg-primary text-primary-foreground px-8 py-6 rounded-lg text-xl font-medium transition-all hover:bg-primary/90 relative ${
                    isProcessing ? 'opacity-70 cursor-not-allowed' : 'btn-hover'
                  }`}
                  onClick={handleSubmit}
                >
                  {isProcessing ? 'Processing Order...' : 'Complete Order'}
                </button>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-border rounded-xl p-8 sticky top-24 shadow-md">
                  <h2 className="text-2xl font-medium mb-6">Order Summary</h2>

                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="py-4 flex items-center">
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted mr-4 flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="object-cover h-full w-full"
                          />
                          <div className="absolute top-0 right-0 bg-primary/90 w-6 h-6 flex items-center justify-center text-sm text-primary-foreground font-medium">
                            {item.quantity}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-medium truncate">{item.product.name}</h4>
                          <p className="text-base text-muted-foreground mt-1">
                            {formatCurrency(item.product.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-lg font-medium">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4 text-lg border-t pt-6">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(cartTotal)}</span>
                    </div>

                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shippingInfo.charge === 0 ? 'Free' : formatCurrency(shippingInfo.charge)}
                      </span>
                    </div>

                    {shippingInfo.charge === 0 && deliveryMethod === 'delivery' && (
                      <div className="text-green-600 text-sm py-1">
                        You've qualified for free shipping in {shippingInfo.zoneName}!
                      </div>
                    )}

                    {isOrderOver1000 && (
                      <>
                        <div className="flex justify-between py-2 text-amber-700">
                          <span>Advance Payment (50%)</span>
                          <span className="font-medium">{formatCurrency(advancePaymentAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-muted-foreground">
                          <span>Remaining Balance</span>
                          <span className="font-medium">{formatCurrency(orderTotal - advancePaymentAmount)}</span>
                        </div>
                      </>
                    )}

                    <div className="border-t pt-4 mt-4 flex justify-between text-xl">
                      <span className="font-medium">Total</span>
                      <span className="font-semibold">{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;
