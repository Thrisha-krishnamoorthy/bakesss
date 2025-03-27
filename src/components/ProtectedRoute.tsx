
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // If authentication is still being determined, show nothing
  if (loading) {
    return null;
  }

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    // Show a toast notification explaining the redirect
    toast({
      title: "Authentication required",
      description: "Please login to access this page",
      variant: "destructive"
    });
    
    // Redirect to login and remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
