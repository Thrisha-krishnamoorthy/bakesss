
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Order } from '@/utils/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/utils/formatters';

const AdminOrders = () => {
  // Get orders from localStorage or use empty array if none exist
  const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const [orders, setOrders] = useState<Order[]>(savedOrders);
  const { toast } = useToast();

  const updateOrderStatus = (orderId: string, newStatus: 'order confirmation' | 'baked' | 'shipped' | 'delivered') => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    toast({
      title: "Status updated",
      description: `Order ${orderId} is now ${newStatus}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'order confirmation': return 'bg-blue-100 text-blue-800';
      case 'baked': return 'bg-amber-100 text-amber-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-serif mb-6">Orders</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <img src="/placeholder.svg" alt="No orders" className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground">
            When customers place orders, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Delivery Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={`px-2 inline-flex items-center space-x-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              <span>{order.status}</span>
                              <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-0">
                            <div className="py-1">
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'order confirmation')}
                                className="px-4 py-2 text-sm w-full text-left hover:bg-muted flex items-center space-x-2"
                              >
                                <span className={`h-2 w-2 rounded-full ${getStatusColor('order confirmation').split(' ')[0]}`}></span>
                                <span>Order Confirmation</span>
                              </button>
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'baked')}
                                className="px-4 py-2 text-sm w-full text-left hover:bg-muted flex items-center space-x-2"
                              >
                                <span className={`h-2 w-2 rounded-full ${getStatusColor('baked').split(' ')[0]}`}></span>
                                <span>Baked</span>
                              </button>
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="px-4 py-2 text-sm w-full text-left hover:bg-muted flex items-center space-x-2"
                              >
                                <span className={`h-2 w-2 rounded-full ${getStatusColor('shipped').split(' ')[0]}`}></span>
                                <span>Shipped</span>
                              </button>
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="px-4 py-2 text-sm w-full text-left hover:bg-muted flex items-center space-x-2"
                              >
                                <span className={`h-2 w-2 rounded-full ${getStatusColor('delivered').split(' ')[0]}`}></span>
                                <span>Delivered</span>
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
