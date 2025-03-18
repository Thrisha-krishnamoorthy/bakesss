
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Truck, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Simulate API call to fetch order
    const fetchOrder = () => {
      setIsLoading(true);
      
      // Get orders from local storage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = savedOrders.find((o: any) => o.id === id);
      
      setTimeout(() => {
        setOrder(foundOrder || null);
        setIsLoading(false);
      }, 500);
    };
    
    fetchOrder();
  }, [id]);
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="page-container pt-24">
          <div className="max-w-2xl mx-auto bg-white border border-border rounded-lg p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-12 bg-muted rounded-full mx-auto"></div>
              <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-24 bg-muted rounded w-full mx-auto"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Order not found
  if (!order) {
    return (
      <>
        <Navbar />
        <main className="page-container pt-24">
          <div className="max-w-2xl mx-auto bg-white border border-border rounded-lg p-8 text-center">
            <h1 className="text-2xl font-medium mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find an order with the ID: {id}
            </p>
            <Link
              to="/"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover inline-flex items-center"
            >
              Return to Home <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Generate estimated delivery date (2-3 days from now for delivery, today for pickup)
  const today = new Date();
  const estimatedDate = order.deliveryMethod === 'delivery' 
    ? new Date(today.setDate(today.getDate() + Math.floor(Math.random() * 2) + 2)) 
    : today;
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <main className="page-container pt-24">
        <div className="max-w-2xl mx-auto bg-white border border-border rounded-lg p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-medium mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. Your order has been received and is being processed.
            </p>
          </div>
          
          <div className="border border-border rounded-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-medium">Order #{order.id}</h2>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {order.status === 'pending' ? 'Processing' : order.status}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Delivery information */}
              <div className="flex items-start">
                {order.deliveryMethod === 'delivery' ? (
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <Store className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-medium">
                    {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Store Pickup'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.deliveryMethod === 'delivery' 
                      ? `${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.state} ${order.customer.address.postalCode}`
                      : '123 Bakery Street, San Francisco, CA 94110'}
                  </p>
                </div>
              </div>
              
              {/* Estimated delivery/pickup date */}
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium">
                    Estimated {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Date
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(estimatedDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <h2 className="font-medium mb-4">Order Summary</h2>
          <div className="border-t border-border pb-4">
            {order.items.map((item: any) => (
              <div key={item.product.id} className="flex items-start py-4 border-b border-border">
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted mr-3 flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="flex flex-1 justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order totals */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${(order.total - (order.deliveryMethod === 'delivery' ? 5.99 : 0)).toFixed(2)}</span>
            </div>
            {order.deliveryMethod === 'delivery' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>$5.99</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-base pt-2 border-t">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover inline-flex items-center"
            >
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
