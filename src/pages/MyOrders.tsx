
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Package, CalendarCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { fetchUserOrders } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

interface Order {
  order_id: number;
  order_status: 'order confirmation' | 'baked' | 'shipped' | 'delivered';
  total_price: number;
  payment_status: 'not paid' | 'advance paid' | 'full paid';
  date: string;
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
        const data = await fetchUserOrders(user.email);
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
        icon: <Package className="h-4 w-4" />, 
        color: 'bg-purple-500' 
      },
      'delivered': { 
        icon: <ArrowRight className="h-4 w-4" />, 
        color: 'bg-green-500' 
      }
    };
    
    return statusMap[status] || { icon: <ShoppingBag className="h-4 w-4" />, color: 'bg-gray-500' };
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
            <div className="space-y-4">
              {orders.map((order) => {
                const { icon, color } = getStatusIcon(order.order_status);
                
                return (
                  <Link
                    key={order.order_id}
                    to={`/order/${order.order_id}`}
                    className="block bg-white border border-border rounded-lg p-4 transition-all hover:border-primary hover:shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Order #{order.order_id}
                        </div>
                        <div className="text-lg font-medium mt-1">
                          {formatCurrency(order.total_price)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <div className={`${color} p-1 rounded-full text-white mr-2`}>
                            {icon}
                          </div>
                          <span className="text-sm capitalize">{order.order_status.replace('_', ' ')}</span>
                        </div>
                        
                        {getPaymentBadge(order.payment_status)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 text-sm">
                      <div className="text-muted-foreground">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </div>
                      <div className="text-primary font-medium flex items-center">
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </Link>
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
