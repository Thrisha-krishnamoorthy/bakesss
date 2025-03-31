import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ArrowRight, Truck, CalendarCheck, CakeSlice, PackageCheck, ShoppingBag, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { fetchOrderDetails } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

interface OrderProduct {
  product_id: number;
  product_name: string;
  product_status: string;
  image_url: string;
  quantity: number;
  price: number;
}

interface OrderDetail {
  order_id: number;
  order_status: 'order confirmation' | 'baked' | 'shipped' | 'delivered';
  total_price: number;
  payment_status: 'not paid' | 'advance paid' | 'full paid';
  date: string;
  products: OrderProduct[];
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchOrderDetails(parseInt(id));
        setOrderDetails(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrderDetails();
  }, [id, toast]);
  
  // Get status number for progress visualization
  const getStatusNumber = (status: string): number => {
    const statusMap: Record<string, number> = {
      'order confirmation': 1,
      'baked': 2,
      'shipped': 3,
      'delivered': 4
    };
    return statusMap[status] || 0;
  };

  // Payment status badge
  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { color: string, text: string }> = {
      'not paid': { color: 'bg-red-100 text-red-700', text: 'Not Paid' },
      'advance paid': { color: 'bg-yellow-100 text-yellow-700', text: 'Advance Paid' },
      'full paid': { color: 'bg-green-100 text-green-700', text: 'Paid' },
    };
    
    const { color, text } = statusMap[status] || { color: 'bg-gray-100 text-gray-700', text: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="page-container pt-24">
          <div className="max-w-4xl mx-auto bg-white border border-border rounded-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-32 bg-muted rounded w-full"></div>
              <div className="h-24 bg-muted rounded w-full"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Order not found
  if (!orderDetails) {
    return (
      <>
        <Navbar />
        <main className="page-container pt-24">
          <div className="max-w-2xl mx-auto bg-white border border-border rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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

  const currentStatusNum = getStatusNumber(orderDetails.order_status);

  return (
    <>
      <Navbar />
      <main className="page-container pt-24">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/my-orders"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to My Orders
          </Link>
          
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-serif mb-1">Order #{orderDetails.order_id}</h1>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(orderDetails.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">{formatCurrency(Number(orderDetails.total_price))}</p>
                </div>
                {getPaymentBadge(orderDetails.payment_status)}
              </div>
            </div>
            
            {/* Order status tracker - Vertical */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 w-1 h-full bg-muted" />
                
                {/* Status steps */}
                <div className="space-y-8">
                  {/* Order Confirmation */}
                  <div className="flex items-start relative">
                    <div className={`rounded-full p-2 z-10 ${
                      currentStatusNum >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div className="ml-6">
                      <h3 className="font-medium">Order Confirmation</h3>
                      <p className="text-sm text-muted-foreground">
                        Your order has been received and is being processed
                      </p>
                    </div>
                  </div>
                  
                  {/* Baked */}
                  <div className="flex items-start relative">
                    <div className={`rounded-full p-2 z-10 ${
                      currentStatusNum >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <CakeSlice className="h-6 w-6" />
                    </div>
                    <div className="ml-6">
                      <h3 className="font-medium">Baked</h3>
                      <p className="text-sm text-muted-foreground">
                        Your order has been freshly baked and prepared
                      </p>
                    </div>
                  </div>
                  
                  {/* Shipped */}
                  <div className="flex items-start relative">
                    <div className={`rounded-full p-2 z-10 ${
                      currentStatusNum >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="ml-6">
                      <h3 className="font-medium">Shipped</h3>
                      <p className="text-sm text-muted-foreground">
                        Your order is on its way to you
                      </p>
                    </div>
                  </div>
                  
                  {/* Delivered */}
                  <div className="flex items-start relative">
                    <div className={`rounded-full p-2 z-10 ${
                      currentStatusNum >= 4 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <PackageCheck className="h-6 w-6" />
                    </div>
                    <div className="ml-6">
                      <h3 className="font-medium">Delivered</h3>
                      <p className="text-sm text-muted-foreground">
                        Your order has been delivered successfully
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order items */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Order Items</h3>
              {orderDetails?.products && orderDetails.products.length > 0 ? (
                <div className="space-y-4">
                  {orderDetails.products.map((product) => (
                    <div key={product.product_id} className="flex items-center border-b pb-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                        <img 
                          src={product.image_url || '/placeholder-product.jpg'} 
                          alt={product.product_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{product.product_name}</h4>
                        <p className="text-gray-600">Status: {product.product_status}</p>
                        <div className="flex justify-between mt-2">
                          <span>Quantity: {product.quantity}</span>
                          <span className="font-medium">{formatCurrency(product.price * product.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items found for this order.</p>
              )}
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
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderDetails;
