
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h2 className="text-2xl font-medium mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The page you are looking for doesn't exist in the admin panel.
      </p>
      <button
        onClick={() => navigate('/dashboard/products')}
        className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </button>
    </div>
  );
};

export default AdminNotFound;
