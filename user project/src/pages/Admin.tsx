
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, LogOut, ShoppingBag, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { products } from '../utils/data';
import { Order, Product } from '../utils/types';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [productList, setProductList] = useState<Product[]>(products);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Fetch orders from localStorage
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, []);
  
  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication (in a real app, this would be server-side)
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };
  
  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold">Admin Login</h1>
            <p className="text-muted-foreground mt-2">Sign in to access the admin panel</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all hover:bg-primary/90"
            >
              Login
            </button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Demo credentials: admin / password</p>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Admin panel
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-border hidden md:block">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <Package className="h-5 w-5 mr-3" />
                Orders
              </button>
              
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'products' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <ShoppingBag className="h-5 w-5 mr-3" />
                Products
              </button>
            </nav>
            
            <div className="p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="w-full md:hidden bg-white border-b border-border">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 text-muted-foreground hover:text-primary transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex border-t border-border">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-center ${
                activeTab === 'orders' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Package className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Orders</span>
            </button>
            
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 text-center ${
                activeTab === 'products' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Products</span>
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-serif mb-6">Orders</h2>
              
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg border border-border p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
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
                          <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                          <tr key={order.id}>
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
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-primary hover:text-primary/80 transition-colors">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Products tab */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif">Products</h2>
                <button className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Product
                </button>
              </div>
              
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {productList.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary hover:text-primary/80 transition-colors mr-2">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-500 hover:text-red-600 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
