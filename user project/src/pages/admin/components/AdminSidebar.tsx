
import { useLocation, Link } from 'react-router-dom';
import { Package, ShoppingBag, LogOut } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('adminIsLoggedIn');
    window.location.href = '/';
  };

  return (
    <div className="w-64 bg-white border-r border-border hidden md:block">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/dashboard/orders"
            className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
              location.pathname.includes('/orders') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <Package className="h-5 w-5 mr-3" />
            Orders
          </Link>
          
          <Link
            to="/dashboard/products"
            className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
              location.pathname.includes('/products') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Products
          </Link>
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
  );
};

export default AdminSidebar;
