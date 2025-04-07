
import { useState, useEffect } from 'react';
import { Navigate, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminNotFound from './components/AdminNotFound';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check authentication on load
  useEffect(() => {
    const adminIsLoggedIn = localStorage.getItem('adminIsLoggedIn') === 'true';
    setIsAuthenticated(adminIsLoggedIn);
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminIsLoggedIn');
    setIsAuthenticated(false);
    navigate('/');
  };
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Default to products page if just at /dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/products');
    }
  }, [location.pathname, navigate]);
  
  return (
    <div className="min-h-screen bg-muted/10">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-border p-4 flex items-center justify-between md:hidden">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="*" element={<AdminNotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
