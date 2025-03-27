
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Truck, Calendar, Store } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    // For now, create a mock order since we don't have an endpoint to fetch a specific order
    const createMockOrder = () => {
      setIsLoading(true);
      
      setTimeout(() => {
        // Create a mock order using the order ID from the URL
        if (id) {
          const mockOrder = {
            id: id,
            status: 'pending',
            date: new Date().toISOString(),
            deliveryMethod: Math.random() > 0.5 ? 'delivery' : 'pickup',
            customer: {
              name: user?.name || 'Guest User',
              email: user?.email || 'guest@example.com',
              phone: user?.phone || '555-123-4567',
              address: {
                street: '123 Baker Street',
                city: 'San Francisco',
                state: 'CA',
                postalCode: '94110'
              }
            },
            items: [],
            total: 0
          };
          
          setOrder(mockOrder);
        } else {
          setOrder(null);
        }
        
        setIsLoading(false);
      }, 500);
    };
    
    createMockOrder();
    
    // Display a success toast notification
    if (id) {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${id} has been received and is being processed.`,
      });
    }
  }, [id, user, toast]);
  
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
                  Placed on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Processing
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
