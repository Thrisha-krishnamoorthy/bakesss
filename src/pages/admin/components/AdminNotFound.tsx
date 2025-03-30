
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

const AdminNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h2 className="text-3xl font-serif mb-2">404</h2>
      <h3 className="text-xl font-medium mb-2">Page Not Found</h3>
      <p className="text-muted-foreground mb-6">
        The page you are looking for doesn't exist in the admin panel.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard/products')}
          className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </button>
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="inline-flex items-center border border-primary text-primary px-4 py-2 rounded-md text-sm font-medium"
        >
          <Package className="mr-2 h-4 w-4" />
          View Orders
        </button>
      </div>
    </div>
  );
};

export default AdminNotFound;
