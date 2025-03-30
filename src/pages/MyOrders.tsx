
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Package, CalendarCheck, Truck, CheckCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { fetchUserOrders } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

interface OrderProduct {
  product_id: number;
  product_name: string;
  product_status: string;
}

interface Order {
  order_id: number;
  order_status: 'order confirmation' | 'baked' | 'shipped' | 'delivered';
  total_price: number;
  payment_status: 'not paid' | 'advance paid' | 'full paid';
  date: string;
  products?: OrderProduct[];
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log('Fetching orders for user:', user.email);
        const data = await fetchUserOrders(user.email);
        console.log("Fetched orders data:", data);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load your orders. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [user, toast]);
  
  // Payment status badge
  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { color: string, text: string }> = {
      'not paid': { color: 'bg-red-100 text-red-700', text: 'Not Paid' },
      'advance paid': { color: 'bg-yellow-100 text-yellow-700', text: 'Advance Paid' },
      'full paid': { color: 'bg-green-100 text-green-700', text: 'Paid' },
    };
    
    const { color, text } = statusMap[status] || { color: 'bg-gray-100 text-gray-700', text: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };
  
  // Get order status progress percentage
  const getStatusProgress = (status: string): number => {
    const statusMap: Record<string, number> = {
      'order confirmation': 25,
      'baked': 50,
      'shipped': 75,
      'delivered': 100
    };
    
    return statusMap[status] || 0;
  };
  
  // Order status icon and color
  const getStatusIcon = (status: string) => {
    const statusMap: Record<string, { icon: React.ReactNode, color: string }> = {
      'order confirmation': { 
        icon: <ShoppingBag className="h-4 w-4" />, 
        color: 'bg-blue-500' 
      },
      'baked': { 
        icon: <CalendarCheck className="h-4 w-4" />, 
        color: 'bg-amber-500' 
      },
      'shipped': { 
        icon: <Truck className="h-4 w-4" />, 
        color: 'bg-purple-500' 
      },
      'delivered': { 
        icon: <CheckCheck className="h-4 w-4" />, 
        color: 'bg-green-500' 
      }
    };
    
    return statusMap[status] || { icon: <ShoppingBag className="h-4 w-4" />, color: 'bg-gray-500' };
  };

  // Get all status steps and mark current one
  const renderOrderStatusTracker = (currentStatus: string) => {
    const allStatuses = [
      { key: 'order confirmation', label: 'Order Received', icon: <ShoppingBag className="h-4 w-4" /> },
      { key: 'baked', label: 'Baked', icon: <CalendarCheck className="h-4 w-4" /> },
      { key: 'shipped', label: 'Shipped', icon: <Truck className="h-4 w-4" /> },
      { key: 'delivered', label: 'Delivered', icon: <CheckCheck className="h-4 w-4" /> }
    ];
    
    const currentIndex = allStatuses.findIndex(s => s.key === currentStatus);
    
    return (
      <div className="relative mt-3">
        <div className="w-full bg-muted h-1 absolute top-2.5 left-0 z-0"></div>
        <div className="flex justify-between relative z-10">
          {allStatuses.map((status, index) => {
            const isComplete = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={status.key} className="flex flex-col items-center">
                <div className={`rounded-full p-1 ${
                  isComplete ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  {status.icon}
                </div>
                <span className={`text-xs mt-1 ${isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Function to show product names when available
  const renderProductList = (products?: OrderProduct[]) => {
    if (!products || products.length === 0) return null;
    
    return (
      <div className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium">Products: </span>
        {products.map((product, index) => (
          <span key={product.product_id}>
            {product.product_name}
            {index < products.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="page-container pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif mb-8">My Orders</h1>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-1/5"></div>
                    <div className="h-4 bg-muted rounded w-1/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to place your first order.
              </p>
              <Link
                to="/shop"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover inline-flex items-center"
              >
                Browse Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const { icon, color } = getStatusIcon(order.order_status);
                const statusProgress = getStatusProgress(order.order_status);
                
                return (
                  <div
                    key={order.order_id}
                    className="bg-white border border-border rounded-lg p-6 transition-all hover:border-primary hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Order #{order.order_id}
                        </div>
                        <div className="text-lg font-medium mt-1">
                          {formatCurrency(order.total_price)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {order.date ? `Placed on ${new Date(order.date).toLocaleDateString()}` : ''}
                        </div>
                        
                        {/* Display product list */}
                        {renderProductList(order.products)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getPaymentBadge(order.payment_status)}
                      </div>
                    </div>
                    
                    {/* Status tracker */}
                    {renderOrderStatusTracker(order.order_status)}
                    
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center text-sm">
                        <span className={`${color} p-1 rounded-full text-white mr-2`}>
                          {icon}
                        </span>
                        <span className="capitalize">
                          {order.order_status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <Link to={`/order/${order.order_id}`} className="text-primary font-medium text-sm flex items-center">
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
};

export default MyOrders;
